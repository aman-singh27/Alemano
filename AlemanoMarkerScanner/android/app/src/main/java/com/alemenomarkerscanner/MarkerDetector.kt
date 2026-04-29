package com.alemenomarkerscanner

import android.content.Context
import android.net.Uri
import android.util.Log
import java.io.File
import java.nio.ByteBuffer
import java.util.UUID
import org.opencv.core.Core
import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.core.MatOfInt
import org.opencv.core.MatOfPoint
import org.opencv.core.MatOfPoint2f
import org.opencv.core.Point
import org.opencv.core.Rect
import org.opencv.core.Size
import org.opencv.imgcodecs.Imgcodecs
import org.opencv.imgproc.Imgproc

data class MarkerDetectionResult(
  val detected: Boolean,
  val corners: List<Point> = emptyList(),
  val orientation: Int = 0,
)

data class MarkerExtractionResult(
  val uri: String,
  val width: Int,
  val height: Int,
  val orientation: Int,
  val fileSize: Long,
)

object MarkerDetector {
  private const val TAG = "MarkerDetector"
  private const val CANONICAL_SIZE = 200
  private const val OUTPUT_SIZE = 300

  init {
    System.loadLibrary("opencv_java4")
  }

  fun detectYPlane(
    yPlane: ByteBuffer,
    width: Int,
    height: Int,
    rowStride: Int,
  ): MarkerDetectionResult {
    val gray = yPlaneToMat(yPlane, width, height, rowStride)
    return try {
      detect(gray)
    } finally {
      gray.release()
    }
  }

  fun detect(gray: Mat): MarkerDetectionResult {
    val blurred = Mat()
    val thresholded = Mat()
    val contours = mutableListOf<MatOfPoint>()
    val hierarchy = Mat()

    return try {
      Imgproc.GaussianBlur(gray, blurred, Size(5.0, 5.0), 0.0)
      Imgproc.adaptiveThreshold(
        blurred,
        thresholded,
        255.0,
        Imgproc.ADAPTIVE_THRESH_GAUSSIAN_C,
        Imgproc.THRESH_BINARY_INV,
        11,
        2.0,
      )

      val contourInput = thresholded.clone()
      Imgproc.findContours(
        contourInput,
        contours,
        hierarchy,
        Imgproc.RETR_TREE,
        Imgproc.CHAIN_APPROX_SIMPLE,
      )
      contourInput.release()

      val frameWidth = gray.width().toDouble()
      val minArea = (frameWidth * 0.1) * (frameWidth * 0.1)
      val maxArea = (frameWidth * 0.9) * (frameWidth * 0.9)

      for (contour in contours) {
        val area = Imgproc.contourArea(contour)
        if (area < minArea || area > maxArea) {
          continue
        }

        val contour2f = MatOfPoint2f(*contour.toArray())
        val perimeter = Imgproc.arcLength(contour2f, true)
        val approx = MatOfPoint2f()
        Imgproc.approxPolyDP(contour2f, approx, 0.02 * perimeter, true)

        if (approx.total() != 4L) {
          contour2f.release()
          approx.release()
          continue
        }

        val points = approx.toArray()
        val boundingRect = Imgproc.boundingRect(MatOfPoint(*points))
        val aspectRatio = boundingRect.width.toDouble() / boundingRect.height.toDouble()
        if (aspectRatio < 0.8 || aspectRatio > 1.2) {
          contour2f.release()
          approx.release()
          continue
        }

        val ordered = orderPoints(points.toList())
        val normalized = warpToSquare(gray, ordered, CANONICAL_SIZE)
        val anchor = validateFingerprint(normalized)
        normalized.release()
        contour2f.release()
        approx.release()

        if (anchor != null) {
          return MarkerDetectionResult(
            detected = true,
            corners = ordered,
            orientation = orientationForAnchor(anchor),
          )
        }
      }

      MarkerDetectionResult(detected = false)
    } finally {
      blurred.release()
      thresholded.release()
      hierarchy.release()
      contours.forEach { it.release() }
    }
  }

  fun extractMarker(
    context: Context,
    frameUri: String,
    corners: List<Point>,
  ): MarkerExtractionResult {
    require(corners.size == 4) { "Marker extraction requires exactly 4 corners." }

    val source = readImage(context, frameUri)
    require(!source.empty()) { "Unable to decode frame URI: $frameUri" }

    try {
      extractFromCorners(context, source, corners)?.let { return it }

      val sourceGray = Mat()
      try {
        Imgproc.cvtColor(source, sourceGray, Imgproc.COLOR_BGR2GRAY)
        val detection = detect(sourceGray)
        require(detection.detected) { "Marker fingerprint validation failed." }

        extractFromCorners(context, source, detection.corners)?.let { return it }
      } finally {
        sourceGray.release()
      }

      throw IllegalStateException("Marker fingerprint validation failed.")
    } finally {
      source.release()
    }
  }

  private fun extractFromCorners(
    context: Context,
    source: Mat,
    corners: List<Point>,
  ): MarkerExtractionResult? {
    val ordered = orderPoints(corners)
    val warped = warpToSquare(source, ordered, OUTPUT_SIZE)
    val gray = Mat()
    var corrected: Mat? = null

    try {
      Imgproc.cvtColor(warped, gray, Imgproc.COLOR_BGR2GRAY)

      val anchor = validateFingerprint(gray) ?: return null
      val orientation = orientationForAnchor(anchor)
      corrected = rotateForOrientation(warped, orientation)

      val outputFile = File(context.cacheDir, "marker-${UUID.randomUUID()}.jpg")
      val params = MatOfInt(Imgcodecs.IMWRITE_JPEG_QUALITY, 95)
      try {
        Imgcodecs.imwrite(outputFile.absolutePath, corrected, params)
      } finally {
        params.release()
      }

      return MarkerExtractionResult(
        uri = Uri.fromFile(outputFile).toString(),
        width = OUTPUT_SIZE,
        height = OUTPUT_SIZE,
        orientation = orientation,
        fileSize = outputFile.length(),
      )
    } finally {
      warped.release()
      gray.release()
      corrected?.release()
    }
  }

  private fun yPlaneToMat(
    yPlane: ByteBuffer,
    width: Int,
    height: Int,
    rowStride: Int,
  ): Mat {
    val gray = Mat(height, width, CvType.CV_8UC1)
    val buffer = yPlane.duplicate()
    buffer.rewind()

    if (rowStride == width) {
      val bytes = ByteArray(width * height)
      buffer.get(bytes, 0, bytes.size)
      gray.put(0, 0, bytes)
      return gray
    }

    val row = ByteArray(rowStride)
    for (y in 0 until height) {
      buffer.position(y * rowStride)
      buffer.get(row, 0, rowStride)
      gray.put(y, 0, row.copyOf(width))
    }

    return gray
  }

  private fun readImage(context: Context, frameUri: String): Mat {
    val uri = Uri.parse(frameUri)
    if (uri.scheme == null || uri.scheme == "file") {
      val path = uri.path ?: frameUri.removePrefix("file://")
      return Imgcodecs.imread(path, Imgcodecs.IMREAD_COLOR)
    }

    val tempFile = File(context.cacheDir, "frame-${UUID.randomUUID()}.jpg")
    context.contentResolver.openInputStream(uri).use { input ->
      requireNotNull(input) { "Unable to open frame URI: $frameUri" }
      tempFile.outputStream().use { output -> input.copyTo(output) }
    }

    val decoded = Imgcodecs.imread(tempFile.absolutePath, Imgcodecs.IMREAD_COLOR)
    if (!tempFile.delete()) {
      Log.w(TAG, "Temporary frame file could not be deleted: ${tempFile.absolutePath}")
    }
    return decoded
  }

  private fun warpToSquare(source: Mat, corners: List<Point>, size: Int): Mat {
    val src = MatOfPoint2f(*corners.toTypedArray())
    val dst = MatOfPoint2f(
      Point(0.0, 0.0),
      Point((size - 1).toDouble(), 0.0),
      Point((size - 1).toDouble(), (size - 1).toDouble()),
      Point(0.0, (size - 1).toDouble()),
    )
    val matrix = Imgproc.getPerspectiveTransform(src, dst)
    val output = Mat()
    Imgproc.warpPerspective(source, output, matrix, Size(size.toDouble(), size.toDouble()))
    src.release()
    dst.release()
    matrix.release()
    return output
  }

  private fun orderPoints(points: List<Point>): List<Point> {
    val topLeft = points.minBy { it.x + it.y }
    val bottomRight = points.maxBy { it.x + it.y }
    val topRight = points.minBy { it.y - it.x }
    val bottomLeft = points.maxBy { it.y - it.x }
    return listOf(topLeft, topRight, bottomRight, bottomLeft)
  }

  private enum class AnchorQuadrant {
    TOP_LEFT,
    TOP_RIGHT,
    BOTTOM_RIGHT,
    BOTTOM_LEFT,
  }

  private fun validateFingerprint(gray: Mat): AnchorQuadrant? {
    if (!checkBorderUniformity(gray)) {
      return null
    }

    if (!checkInnerEmptyZone(gray)) {
      return null
    }

    return findCornerAnchor(gray)
  }

  private fun checkBorderUniformity(gray: Mat): Boolean {
    val size = gray.width()
    val ring = (size * 0.1).toInt()
    val top = Rect(0, 0, size, ring)
    val bottom = Rect(0, size - ring, size, ring)
    val left = Rect(0, ring, ring, size - (ring * 2))
    val right = Rect(size - ring, ring, ring, size - (ring * 2))

    val borderMean =
      meanIntensity(gray, top) + meanIntensity(gray, bottom) + meanIntensity(gray, left) + meanIntensity(gray, right)
    val averageBorderMean = borderMean / 4.0

    return averageBorderMean <= 120.0
  }

  private fun checkInnerEmptyZone(gray: Mat): Boolean {
    val size = gray.width()
    val start = (size * 0.2).toInt()
    val zoneSize = (size * 0.6).toInt()
    val center = Rect(start, start, zoneSize, zoneSize)
    val centerMean = meanIntensity(gray, center)
    return centerMean >= 180.0
  }

  private fun findCornerAnchor(gray: Mat): AnchorQuadrant? {
    val size = gray.width()
    val border = (size * 0.1).toInt()
    val innerSize = size - (border * 2)
    val anchorSize = (innerSize * 0.2).toInt()

    val samples = listOf(
      AnchorQuadrant.TOP_LEFT to Rect(border, border, anchorSize, anchorSize),
      AnchorQuadrant.TOP_RIGHT to Rect(size - border - anchorSize, border, anchorSize, anchorSize),
      AnchorQuadrant.BOTTOM_RIGHT to Rect(size - border - anchorSize, size - border - anchorSize, anchorSize, anchorSize),
      AnchorQuadrant.BOTTOM_LEFT to Rect(border, size - border - anchorSize, anchorSize, anchorSize),
    )

    val means = samples.map { (quadrant, rect) ->
      quadrant to meanIntensity(gray, rect)
    }
    val active = means.filter { (_, mean) -> mean <= 120.0 }
    val inactiveAreClean = means
      .filterNot { (quadrant, _) -> active.any { (activeQuadrant, _) -> activeQuadrant == quadrant } }
      .all { (_, mean) -> mean >= 180.0 }

    return if (active.size == 1 && inactiveAreClean) active.first().first else null
  }

  private fun meanIntensity(gray: Mat, rect: Rect): Double {
    val bounded = Rect(
      rect.x.coerceAtLeast(0),
      rect.y.coerceAtLeast(0),
      rect.width.coerceAtMost(gray.width() - rect.x),
      rect.height.coerceAtMost(gray.height() - rect.y),
    )
    val region = gray.submat(bounded)
    val mean = Core.mean(region).`val`[0]
    region.release()
    return mean
  }

  private fun orientationForAnchor(anchor: AnchorQuadrant): Int =
    when (anchor) {
      AnchorQuadrant.TOP_LEFT -> 0
      AnchorQuadrant.TOP_RIGHT -> 90
      AnchorQuadrant.BOTTOM_RIGHT -> 180
      AnchorQuadrant.BOTTOM_LEFT -> 270
    }

  private fun rotateForOrientation(source: Mat, orientation: Int): Mat {
    if (orientation == 0) {
      return source.clone()
    }

    val rotated = Mat()
    when (orientation) {
      90 -> Core.rotate(source, rotated, Core.ROTATE_90_CLOCKWISE)
      180 -> Core.rotate(source, rotated, Core.ROTATE_180)
      270 -> Core.rotate(source, rotated, Core.ROTATE_90_COUNTERCLOCKWISE)
      else -> return source.clone()
    }
    return rotated
  }
}
