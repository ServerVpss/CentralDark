# CONTRATO - PluginManager.kt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\mobile\android\src\main\java\app\tauri\plugin\PluginManager.kt
**SHA:** 2b0ef3b8cc921828
**Timestamp:** 2026-08-28T02:35:52.956248
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: on destroy, we should change to a different activity

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

package app.tauri.plugin

import android.content.res.Configuration
import android.content.Context
import android.content.Intent
import android.webkit.WebView
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import app.tauri.annotation.InvokeArg
import app.tauri.FsUtils
import app.tauri.JniMethod
import app.tauri.Logger
import com.fasterxml.jackson.annotation.JsonAutoDetect
import com.fasterxml.jackson.annotation.PropertyAccessor
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.module.SimpleModule
import java.lang.reflect.InvocationTargetException

object PluginManager {
  fun interface RequestPermissionsCallback {
    fun onResult(permissions: Map<String, Boolean>)
  }

  fun interface ActivityResultCallback {
    fun onResult(result: ActivityResult)
  }

  lateinit var activity: AppCompatActivity
  private val plugins: HashMap<String, PluginHandle> = HashMap()
  private lateinit var startActivityForResultLauncher: ActivityResultLauncher<Intent>
  private lateinit var startIntentSenderForResultLauncher: ActivityResultLauncher<IntentSenderRequest>
  private lateinit var requestPermissionsLauncher: ActivityResultLauncher<Array<String>>
  private var requestPermissionsCallback: RequestPermissionsCallback? = null
  private var startActivityForResultCallback: ActivityResultCallback? = null
  private var startIntentSenderForResultCallback: ActivityResultCallback? = null
  private var jsonMapper: ObjectMapper = ObjectMapper()
    .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
    .enable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES)
    .setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY)

  init {
    val channelDeserializer = ChannelDeserializer({ channelId, payload ->
      sendChannelData(channelId, payload)
    }, jsonMapper)
    jsonMapper
      .registerModule(SimpleModule().addDeserializer(Channel::class.java, channelDeserializer))
  }

  fun onActivityCreate(activity: AppCompatActivity) {
    // TODO: on destroy, we should change to a different activity
    if (::activity.isInitialized) {
      return
    }
    this.activity = activity
    startActivityForResultLauncher =
      activity.registerForActivityResult(ActivityResultContracts.StartActivityForResult()
      ) { result ->
        if (startActivityForResultCallback != null) {
          startActivityForResultCallback!!.onResult(result)
        }
      }

    startIntentSenderForResultLauncher =
      activity.registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()
      ) { result ->
        if (startIntentSenderForResultCallback != null) {
          startIntentSenderForResultCallback!!.onResult(result)
        }
      }

    requestPermissionsLauncher =
      activity.registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()
      ) { result ->
        if (requestPermissionsCallback != null) {
          requestPermissionsCallback!!.onResult(result)
        }
      }
  }

  fun onNewIntent(intent: Intent) {
    for (plugin in plugins.values) {
      plugin.instance.onNewIntent(intent)
    }
  }

  fun onPause() {
    for (plugin in plugins.values) {
      plugin.instance.onPause()
    }
  }

  fun onResume() {
    for (plugin in plugins.values) {
      plugin.instance.onResume()
    }
  }

  fun onRestart(activity: AppCompatActivity) {
    for (plugin in plugins.values) {
      plugin.instance.triggerOnRestart(activity)
    }
  }

  fun onStop() {
    for (plugin in plugins.values) {
      plugin.instance.onStop()
    }
  }

  fun onDestroy(activity: AppCompatActivity) {
    for (plugin in plugins.values) {
      plugin.instance.triggerOnDestroy(activity)
    }
  }

  fun onConfigurationChanged(newConfig: Configuration) {
    for (plugin in plugins.values) {
      plugin.instance.onConfigurationChanged(newConfig)
    }
  }

  fun startActivityForResult(intent: Intent, callback: ActivityResultCallback) {
    startActivityForResultCallback = callback
    startActivityForResultLauncher.launch(intent)
  }

  fun startIntentSenderForResult(intent: IntentSenderRequest, callback: ActivityResultCallback) {
    startIntentSenderForResultCallback = callback
    startIntentSenderForResultLauncher.launch(intent)
  }

  fun requestPermissions(
    permissionStrings: Array<String>,
    callback: RequestPermissionsCallback
  ) {
    requestPermissionsCallback = callback
    requestPermissionsLauncher.launch(permissionStrings)
  }

  @JniMethod
  fun onWebViewCreated(webView: WebView) {
 
```