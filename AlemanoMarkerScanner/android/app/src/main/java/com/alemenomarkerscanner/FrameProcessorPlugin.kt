package com.alemenomarkerscanner

import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin

class MarkerFrameProcessorPlugin : FrameProcessorPlugin() {
  override fun callback(frame: Frame, params: MutableMap<String, Any>?): Any {
    val image = frame.image
    val yPlane = image.planes.firstOrNull()
      ?: return mapOf("detected" to false, "corners" to emptyList<List<Double>>(), "orientation" to 0)

    val result = MarkerDetector.detectYPlane(
      yPlane.buffer,
      image.width,
      image.height,
      yPlane.rowStride,
    )

    return mapOf(
      "detected" to result.detected,
      "corners" to result.corners.map { point -> listOf(point.x, point.y) },
      "orientation" to result.orientation,
    )
  }
}
