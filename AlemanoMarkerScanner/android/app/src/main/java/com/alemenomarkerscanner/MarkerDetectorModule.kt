package com.alemenomarkerscanner

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import java.util.concurrent.Executors
import org.opencv.core.Point

class MarkerDetectorModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {
  private val executor = Executors.newSingleThreadExecutor()

  override fun getName(): String = NAME

  @ReactMethod
  fun extractMarker(frameUri: String, corners: ReadableArray, promise: Promise) {
    val parsedCorners = parseCorners(corners)
    executor.execute {
      try {
        val result = MarkerDetector.extractMarker(reactContext, frameUri, parsedCorners)
        val map = Arguments.createMap().apply {
          putString("uri", result.uri)
          putInt("width", result.width)
          putInt("height", result.height)
          putInt("orientation", result.orientation)
          putDouble("fileSize", result.fileSize.toDouble())
        }
        promise.resolve(map)
      } catch (error: Throwable) {
        promise.reject("MARKER_EXTRACTION_FAILED", error.message, error)
      }
    }
  }

  override fun invalidate() {
    executor.shutdown()
    super.invalidate()
  }

  private fun parseCorners(corners: ReadableArray): List<Point> {
    require(corners.size() == 4) { "Expected exactly 4 corner points." }

    return (0 until corners.size()).map { index ->
      val point = corners.getArray(index)
      requireNotNull(point) { "Corner at index $index is not an array." }
      require(point.size() == 2) { "Corner at index $index must contain x and y." }
      Point(point.getDouble(0), point.getDouble(1))
    }
  }

  companion object {
    const val NAME = "MarkerDetectorModule"
  }
}
