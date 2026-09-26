# COMANDO - download.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\wry-0.55.1\src\wkwebview\download.rs
**SHA:** 3b67113c3d13a208
**Timestamp:** 2026-08-28T02:37:43.362581
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- wry_download_delegate::WryDownloadDelegate, wry_navigation_delegate::WryNavigationDelegate,
- let proto_delegate = ProtocolObject::from_ref(&**delegate);
- let proto_delegate = ProtocolObject::from_ref(&**delegate);

### Ouro Bruto (primeiros 5000 chars)
```
use std::{env::current_dir, ptr::null_mut};

use objc2::{rc::Retained, runtime::ProtocolObject, DeclaredClass};
use objc2_foundation::{NSData, NSError, NSString, NSURLResponse, NSURL};
use objc2_web_kit::{WKDownload, WKNavigationAction, WKNavigationResponse};

#[cfg(target_os = "ios")]
use crate::wkwebview::ios::WKWebView::WKWebView;
#[cfg(target_os = "macos")]
use objc2_web_kit::WKWebView;

use super::class::{
  wry_download_delegate::WryDownloadDelegate, wry_navigation_delegate::WryNavigationDelegate,
};

// Download action handler
pub(crate) fn navigation_download_action(
  this: &WryNavigationDelegate,
  _webview: &WKWebView,
  _action: &WKNavigationAction,
  download: &WKDownload,
) {
  unsafe {
    if let Some(delegate) = &this.ivars().download_delegate {
      let proto_delegate = ProtocolObject::from_ref(&**delegate);
      download.setDelegate(Some(proto_delegate));
    }
  }
}

// Download response handler
pub(crate) fn navigation_download_response(
  this: &WryNavigationDelegate,
  _webview: &WKWebView,
  _response: &WKNavigationResponse,
  download: &WKDownload,
) {
  unsafe {
    if let Some(delegate) = &this.ivars().download_delegate {
      let proto_delegate = ProtocolObject::from_ref(&**delegate);
      download.setDelegate(Some(proto_delegate));
    }
  }
}

pub(crate) fn download_policy(
  this: &WryDownloadDelegate,
  download: &WKDownload,
  _response: &NSURLResponse,
  suggested_filename: &NSString,
  completion_handler: &block2::Block<dyn Fn(*const NSURL)>,
) {
  unsafe {
    let request = download.originalRequest().unwrap();
    let url = request.URL().unwrap().absoluteString().unwrap();
    let suggested_filename = suggested_filename.to_string();
    let mut download_destination =
      dirs::download_dir().unwrap_or_else(|| current_dir().unwrap_or_default());

    download_destination.push(&suggested_filename);

    let (suggested_filename, ext) = suggested_filename
      .split_once('.')
      .map(|(base, ext)| (base, format!(".{ext}")))
      .unwrap_or((&suggested_filename, "".to_string()));

    // WebView2 does not overwrite files but appends numbers
    let mut counter = 1;
    while download_destination.exists() {
      download_destination.set_file_name(format!("{suggested_filename} ({counter}){ext}"));
      counter += 1;
    }

    let started_fn = &this.ivars().started;
    if let Some(started_fn) = started_fn {
      let mut started_fn = started_fn.borrow_mut();
      match started_fn(url.to_string(), &mut download_destination) {
        true => {
          let path = NSString::from_str(&download_destination.display().to_string());
          let ns_url = NSURL::fileURLWithPath_isDirectory(&path, false);
          (*completion_handler).call((Retained::as_ptr(&ns_url),))
        }
        false => (*completion_handler).call((null_mut(),)),
      };
    } else {
      #[cfg(feature = "tracing")]
      tracing::warn!("WebView instance is dropped! This navigation handler shouldn't be called.");
      (*completion_handler).call((null_mut(),));
    }
  }
}

pub(crate) fn download_did_finish(this: &WryDownloadDelegate, download: &WKDownload) {
  unsafe {
    let original_request = download.originalRequest().unwrap();
    let url = original_request.URL().unwrap().absoluteString().unwrap();
    if let Some(completed_fn) = this.ivars().completed.clone() {
      completed_fn(url.to_string(), None, true);
    }
  }
}

pub(crate) fn download_did_fail(
  this: &WryDownloadDelegate,
  download: &WKDownload,
  error: &NSError,
  _resume_data: &NSData,
) {
  unsafe {
    #[cfg(debug_assertions)]
    {
      let description = error.localizedDescription().to_string();
      eprintln!("Download failed with error: {description}");
    }

    let original_request = download.originalRequest().unwrap();
    let url = original_request.URL().unwrap().absoluteString().unwrap();
    if let Some(completed_fn) = this.ivars().completed.clone() {
      completed_fn(url.to_string(), None, false);
    }
  }
}

```

---

# COMANDO - Download.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\wrapper-shared\org\gradle\wrapper\Download.java
**SHA:** cf28efeabfd5416d
**Timestamp:** 2026-08-28T02:52:15.168226
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this.delegate = delegate;
- if (contentLength > 0 && delegate == null) {

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2007-2009 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.gradle.wrapper;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Method;
import java.net.Authenticator;
import java.net.HttpURLConnection;
import java.net.PasswordAuthentication;
import java.net.SocketTimeoutException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class Download implements IDownload {
    public static final String UNKNOWN_VERSION = "0";
    public static final int DEFAULT_NETWORK_TIMEOUT_MILLISECONDS = 10 * 1000;

    private static final int BUFFER_SIZE = 10 * 1024;
    private static final int PROGRESS_CHUNK = 1024 * 1024;
    private final Logger logger;
    private final String appName;
    private final String appVersion;
    private final DownloadProgressListener progressListener;
    private final Map<String, String> systemProperties;
    private final int networkTimeout;

    public Download(Logger logger, String appName, String appVersion) {
        this(logger, null, appName, appVersion, convertSystemProperties(System.getProperties()));
    }

    public Download(Logger logger, String appName, String appVersion, int networkTimeout) {
        this(logger, null, appName, appVersion, convertSystemProperties(System.getProperties()), networkTimeout);
    }

    private static Map<String, String> convertSystemProperties(Properties properties) {
        Map<String, String> result = new HashMap<String, String>();
        for (Map.Entry<Object, Object> entry : properties.entrySet()) {
            result.put(entry.getKey().toString(), entry.getValue() == null ? null : entry.getValue().toString());
        }
        return result;
    }

    public Download(Logger logger, DownloadProgressListener progressListener, String appName, String appVersion, Map<String, String> systemProperties) {
        this(logger, progressListener, appName, appVersion, systemProperties, DEFAULT_NETWORK_TIMEOUT_MILLISECONDS);
    }

    public Download(Logger logger, DownloadProgressListener progressListener, String appName, String appVersion, Map<String, String> systemProperties, int networkTimeout) {
        this.logger = logger;
        this.appName = appName;
        this.appVersion = appVersion;
        this.systemProperties = systemProperties;
        this.progressListener = new DefaultDownloadProgressListener(logger, progressListener);
        this.networkTimeout = networkTimeout;
        configureProxyAuthentication();
    }

    private void configureProxyAuthentication() {
        if (systemProperties.get("http.proxyUser") != null || systemProperties.get("https.proxyUser") != null) {
            // Only an authenticator for proxies needs to be set. Basic authentication is supported by directly setting the request header field.
            Authenticator.setDefault(new ProxyAuthenticator(systemProperties));
        }
    }

    public void sendHeadRequest(URI uri) throws Exception {
        URL safeUrl = safeUri(uri).toURL();
        int responseCode = -1;
        try {
            HttpURLConnection conn = (HttpURLConnection)safeUrl.openConnection();
            conn.setRequestMethod("HEAD");
            addBasicAuthentication(uri, conn);
            conn.setRequestProperty("User-Agent", calculateUserAgent());
            conn.setConnectTimeout(networkTimeout);
            conn.connect();
            responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                throw new RuntimeException("HEAD request to " + safeUrl + " failed: response code (" + responseCode + ")");
            }
        } catch (IOException e) {
            throw new RuntimeException("HEAD request to " + safeUrl + " failed: response code (" + responseCode + "), timeout (" + networkTimeout + "ms)", e);
        }
    }

    @Override
    public void download(URI address, File destination) throws Exception {
        destination.getParentFile().mkdirs();
        downloadInternal(address, destination);
    }

    private void downloadInternal(URI address, File destination)
        throws Exception {
        OutputStream out = null;
        URLConnection conn;
        InputStream in = null;
    
```