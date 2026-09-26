# OUTRO - icons.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\src-tauri\src\icons.rs
**SHA:** f75e1bda1fdf8c9d
**Timestamp:** 2026-08-23T14:16:18.258675
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // Electron pattern: %LOCALAPPDATA%\<app>\app-*\<app>.exe

### Ouro Bruto (primeiros 5000 chars)
```
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppIcon {
    pub data: Vec<u8>,
    pub path: Option<String>,
}

#[cfg(target_os = "macos")]
pub(crate) fn encode_nsimage_as_small_png(icon: cocoa::base::id) -> Option<Vec<u8>> {
    use cocoa::base::{id, nil};
    use cocoa::foundation::{NSData, NSPoint, NSRect, NSSize};
    use objc::{class, msg_send, sel, sel_impl};

    unsafe {
        if icon == nil {
            return None;
        }

        let target_size = NSSize::new(32.0, 32.0);
        let target_rect = NSRect::new(NSPoint::new(0.0, 0.0), target_size);
        let zero_rect = NSRect::new(NSPoint::new(0.0, 0.0), NSSize::new(0.0, 0.0));
        let resized: id = msg_send![class!(NSImage), alloc];
        let resized: id = msg_send![resized, initWithSize: target_size];
        if resized == nil {
            return None;
        }

        let _: () = msg_send![resized, lockFocus];
        // NSCompositingOperationSourceOver = 2.
        let _: () = msg_send![
            icon,
            drawInRect: target_rect
            fromRect: zero_rect
            operation: 2usize
            fraction: 1.0f64
        ];
        let _: () = msg_send![resized, unlockFocus];

        let tiff_data: id = msg_send![resized, TIFFRepresentation];
        if tiff_data == nil {
            let _: () = msg_send![resized, release];
            return None;
        }

        let image_rep: id = msg_send![class!(NSBitmapImageRep), imageRepWithData: tiff_data];
        if image_rep == nil {
            let _: () = msg_send![resized, release];
            return None;
        }

        // NSBitmapImageFileTypePNG = 4.
        let png_data: id = msg_send![image_rep, representationUsingType: 4usize properties:nil];
        if png_data == nil {
            let _: () = msg_send![resized, release];
            return None;
        }

        let length = NSData::length(png_data);
        let bytes = NSData::bytes(png_data);
        let data = std::slice::from_raw_parts(bytes as *const u8, length as usize).to_vec();
        let _: () = msg_send![resized, release];

        Some(data)
    }
}

#[cfg(target_os = "macos")]
pub async fn get_app_icon(
    app_name: &str,
    app_path: Option<String>,
) -> Result<Option<AppIcon>, String> {
    use cocoa::base::{id, nil};
    use cocoa::foundation::{NSAutoreleasePool, NSString};
    use objc::{class, msg_send, sel, sel_impl};

    unsafe {
        let pool = NSAutoreleasePool::new(nil);

        let result = (|| {
            let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];

            let path = if let Some(path) = app_path {
                path
            } else {
                let ns_app_name = NSString::alloc(nil).init_str(app_name);
                let path: id = msg_send![workspace, fullPathForApplication: ns_app_name];
                let _: () = msg_send![ns_app_name, release];

                if path == nil {
                    return Ok(None);
                }
                let path: id = msg_send![path, UTF8String];
                std::ffi::CStr::from_ptr(path as *const _)
                    .to_string_lossy()
                    .into_owned()
            };

            let ns_path = NSString::alloc(nil).init_str(&path);
            let icon: id = msg_send![workspace, iconForFile:ns_path];
            let _: () = msg_send![ns_path, release];

            if icon == nil {
                return Ok(None);
            }

            let Some(data) = encode_nsimage_as_small_png(icon) else {
                return Ok(None);
            };

            Ok(Some(AppIcon {
                data,
                path: Some(path),
            }))
        })();

        let _: () = msg_send![pool, drain];

        result
    }
}

#[cfg(target_os = "windows")]
use lazy_static::lazy_static;
#[cfg(target_os = "windows")]
use std::sync::Arc;
#[cfg(target_os = "windows")]
use tokio::sync::Semaphore;

#[cfg(target_os = "windows")]
lazy_static! {
    static ref SEMAPHORE: Arc<Semaphore> = Arc::new(Semaphore::new(5));
}

#[cfg(target_os = "windows")]
pub async fn get_app_icon(
    app_name: &str,
    app_path: Option<String>,
) -> Result<Option<AppIcon>, String> {
    use image::codecs::png::PngEncoder;
    use image::{ExtendedColorType, ImageEncoder};
    use std::io::Cursor;
    use windows_icons::get_icon_by_path;

    async fn find_exe_path(app_name: &str) -> Option<String> {
        if let Some(path) = get_exe_by_reg_key(app_name) {
            return Some(path);
        }
        if let Some(path) = get_exe_by_appx(app_name).await {
            return Some(path);
        }
        if let Some(path) = get_exe_from_potential_path(app_name).await {
            return Some(path);
        }
        None
    }

    let path = match app_path {
        Some(p) => p,
        None => find_exe_path(app_name)
            .await
            .ok_or_else(|| "app_path is None and could not find executable path".to_string())?,
```

---

# OUTRO - icons.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\apps\screenpipe-app-tauri\src-tauri\src\icons.rs
**SHA:** f75e1bda1fdf8c9d79800b12e6a07f58939cdfe84c520e9564fb884528973904
**Timestamp:** 2026-08-23T23:43:32.536858
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // Electron pattern: %LOCALAPPDATA%\<app>\app-*\<app>.exe

### Ouro Bruto (primeiros 5000 chars)
```
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppIcon {
    pub data: Vec<u8>,
    pub path: Option<String>,
}

#[cfg(target_os = "macos")]
pub(crate) fn encode_nsimage_as_small_png(icon: cocoa::base::id) -> Option<Vec<u8>> {
    use cocoa::base::{id, nil};
    use cocoa::foundation::{NSData, NSPoint, NSRect, NSSize};
    use objc::{class, msg_send, sel, sel_impl};

    unsafe {
        if icon == nil {
            return None;
        }

        let target_size = NSSize::new(32.0, 32.0);
        let target_rect = NSRect::new(NSPoint::new(0.0, 0.0), target_size);
        let zero_rect = NSRect::new(NSPoint::new(0.0, 0.0), NSSize::new(0.0, 0.0));
        let resized: id = msg_send![class!(NSImage), alloc];
        let resized: id = msg_send![resized, initWithSize: target_size];
        if resized == nil {
            return None;
        }

        let _: () = msg_send![resized, lockFocus];
        // NSCompositingOperationSourceOver = 2.
        let _: () = msg_send![
            icon,
            drawInRect: target_rect
            fromRect: zero_rect
            operation: 2usize
            fraction: 1.0f64
        ];
        let _: () = msg_send![resized, unlockFocus];

        let tiff_data: id = msg_send![resized, TIFFRepresentation];
        if tiff_data == nil {
            let _: () = msg_send![resized, release];
            return None;
        }

        let image_rep: id = msg_send![class!(NSBitmapImageRep), imageRepWithData: tiff_data];
        if image_rep == nil {
            let _: () = msg_send![resized, release];
            return None;
        }

        // NSBitmapImageFileTypePNG = 4.
        let png_data: id = msg_send![image_rep, representationUsingType: 4usize properties:nil];
        if png_data == nil {
            let _: () = msg_send![resized, release];
            return None;
        }

        let length = NSData::length(png_data);
        let bytes = NSData::bytes(png_data);
        let data = std::slice::from_raw_parts(bytes as *const u8, length as usize).to_vec();
        let _: () = msg_send![resized, release];

        Some(data)
    }
}

#[cfg(target_os = "macos")]
pub async fn get_app_icon(
    app_name: &str,
    app_path: Option<String>,
) -> Result<Option<AppIcon>, String> {
    use cocoa::base::{id, nil};
    use cocoa::foundation::{NSAutoreleasePool, NSString};
    use objc::{class, msg_send, sel, sel_impl};

    unsafe {
        let pool = NSAutoreleasePool::new(nil);

        let result = (|| {
            let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];

            let path = if let Some(path) = app_path {
                path
            } else {
                let ns_app_name = NSString::alloc(nil).init_str(app_name);
                let path: id = msg_send![workspace, fullPathForApplication: ns_app_name];
                let _: () = msg_send![ns_app_name, release];

                if path == nil {
                    return Ok(None);
                }
                let path: id = msg_send![path, UTF8String];
                std::ffi::CStr::from_ptr(path as *const _)
                    .to_string_lossy()
                    .into_owned()
            };

            let ns_path = NSString::alloc(nil).init_str(&path);
            let icon: id = msg_send![workspace, iconForFile:ns_path];
            let _: () = msg_send![ns_path, release];

            if icon == nil {
                return Ok(None);
            }

            let Some(data) = encode_nsimage_as_small_png(icon) else {
                return Ok(None);
            };

            Ok(Some(AppIcon {
                data,
                path: Some(path),
            }))
        })();

        let _: () = msg_send![pool, drain];

        result
    }
}

#[cfg(target_os = "windows")]
use lazy_static::lazy_static;
#[cfg(target_os = "windows")]
use std::sync::Arc;
#[cfg(target_os = "windows")]
use tokio::sync::Semaphore;

#[cfg(target_os = "windows")]
lazy_static! {
    static ref SEMAPHORE: Arc<Semaphore> = Arc::new(Semaphore::new(5));
}

#[cfg(target_os = "windows")]
pub async fn get_app_icon(
    app_name: &str,
    app_path: Option<String>,
) -> Result<Option<AppIcon>, String> {
    use image::codecs::png::PngEncoder;
    use image::{ExtendedColorType, ImageEncoder};
    use std::io::Cursor;
    use windows_icons::get_icon_by_path;

    async fn find_exe_path(app_name: &str) -> Option<String> {
        if let Some(path) = get_exe_by_reg_key(app_name) {
            return Some(path);
        }
        if let Some(path) = get_exe_by_appx(app_name).await {
            return Some(path);
        }
        if let Some(path) = get_exe_from_potential_path(app_name).await {
            return Some(path);
        }
        None
    }

    let path = match app_path {
        Some(p) => p,
        None => find_exe_path(app_name)
            .await
            .ok_or_else(|| "app_path is None and could not find executable path".to_string())?,
```