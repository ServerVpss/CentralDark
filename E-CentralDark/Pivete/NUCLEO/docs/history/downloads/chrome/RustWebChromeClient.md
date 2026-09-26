# CHROME - RustWebChromeClient.kt
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\wry-0.55.1\src\android\kotlin\RustWebChromeClient.kt
**SHA:** 651701cbaeee1d88
**Timestamp:** 2026-08-28T02:37:43.170798
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Logger.debug("onGeolocationPermissionsShowPrompt: DOING IT HERE FOR ORIGIN: $origin")
- Logger.debug("onGeolocationPermissionsShowPrompt: has required permission")

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2020-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

@file:Suppress("ObsoleteSdkInt", "RedundantOverride", "QueryPermissionsNeeded", "SimpleDateFormat")

package {{package}}

// taken from https://github.com/ionic-team/capacitor/blob/6658bca41e78239347e458175b14ca8bd5c1d6e8/android/capacitor/src/main/java/com/getcapacitor/BridgeWebChromeClient.java

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.ActivityNotFoundException
import android.content.DialogInterface
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.view.View
import android.webkit.*
import android.widget.EditText
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

class RustWebChromeClient(appActivity: WryActivity) : WebChromeClient() {
  private interface PermissionListener {
    fun onPermissionSelect(isGranted: Boolean?)
  }

  private interface ActivityResultListener {
    fun onActivityResult(result: ActivityResult?)
  }

  private val activity: WryActivity
  private var permissionLauncher: ActivityResultLauncher<Array<String>>
  private var activityLauncher: ActivityResultLauncher<Intent>
  private var permissionListener: PermissionListener? = null
  private var activityListener: ActivityResultListener? = null

  init {
    activity = appActivity
    val permissionCallback =
      ActivityResultCallback { isGranted: Map<String, Boolean> ->
        if (permissionListener != null) {
          var granted = true
          for ((_, value) in isGranted) {
            if (!value) granted = false
          }
          permissionListener!!.onPermissionSelect(granted)
        }
      }
    permissionLauncher =
      activity.registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions(), permissionCallback)
    activityLauncher = activity.registerForActivityResult(
      ActivityResultContracts.StartActivityForResult()
    ) { result ->
      if (activityListener != null) {
        activityListener!!.onActivityResult(result)
      }
    }
  }

  /**
   * Render web content in `view`.
   *
   * Both this method and [.onHideCustomView] are required for
   * rendering web content in full screen.
   *
   * @see [](https://developer.android.com/reference/android/webkit/WebChromeClient.onShowCustomView
  ) */
  override fun onShowCustomView(view: View, callback: CustomViewCallback) {
    callback.onCustomViewHidden()
    super.onShowCustomView(view, callback)
  }

  /**
   * Render web content in the original Web View again.
   *
   * Do not remove this method--@see #onShowCustomView(View, CustomViewCallback).
   */
  override fun onHideCustomView() {
    super.onHideCustomView()
  }

  override fun onPermissionRequest(request: PermissionRequest) {
    val isRequestPermissionRequired = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
    val permissionList: MutableList<String> = ArrayList()
    if (listOf(*request.resources).contains("android.webkit.resource.VIDEO_CAPTURE")) {
      permissionList.add(Manifest.permission.CAMERA)
    }
    if (listOf(*request.resources).contains("android.webkit.resource.AUDIO_CAPTURE")) {
      permissionList.add(Manifest.permission.MODIFY_AUDIO_SETTINGS)
      permissionList.add(Manifest.permission.RECORD_AUDIO)
    }
    if (permissionList.isNotEmpty() && isRequestPermissionRequired) {
      val permissions = permissionList.toTypedArray()
      permissionListener = object : PermissionListener {
        override fun onPermissionSelect(isGranted: Boolean?) {
          if (isGranted == true) {
            request.grant(request.resources)
          } else {
            request.deny()
          }
        }
      }
      permissionLauncher.launch(permissions)
    } else {
      request.grant(request.resources)
    }
  }

  /**
   * Show the browser alert modal
   * @param view
   * @param url
   * @param message
   * @param result
   * @return
   */
  override fun onJsAlert(view: WebView, url: String, message: String, result: JsResult): Boolean {
    if (activity.isFinishing) {
      return true
    }
    val builder = AlertDialog.Builder(view.context)
    builder
      .setMessage(message)
      .setPositiveButton(
        "OK"
      ) { dialog: DialogInterface, _: Int ->
        dialog.dismiss()
        result.confirm()
      }
      .setOnCancelListener { dialog: DialogInterface ->
        dialog.dismiss()
        result.cancel()
      }
    val dialog = builder.create()
    dialog.show()
    return true
  }

  /**
   * Show the browser confirm modal
   *
```