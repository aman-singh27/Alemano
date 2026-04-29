package com.alemenomarkerscanner

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry

class MarkerDetectorPackage : ReactPackage {
  init {
    FrameProcessorPluginRegistry.addFrameProcessorPlugin("detectMarker") { _, _ ->
      MarkerFrameProcessorPlugin()
    }
  }

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
    listOf(MarkerDetectorModule(reactContext))

  override fun createViewManagers(
    reactContext: ReactApplicationContext,
  ): List<ViewManager<*, *>> = emptyList()
}
