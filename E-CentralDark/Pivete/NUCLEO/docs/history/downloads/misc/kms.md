# OUTRO - kms.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\softbuffer-0.4.8\src\backends\kms.rs
**SHA:** e9eeb8b177b6b9aa
**Timestamp:** 2026-08-28T02:35:44.587635
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Implement this!
- // TODO: It would be nice to not have to heap-allocate the above rectangles if we know that
- // TODO: Use atomic commits here!

### Ouro Bruto (primeiros 5000 chars)
```
//! Backend for DRM/KMS for raw rendering directly to the screen.
//!
//! This strategy uses dumb buffers for rendering.

use drm::buffer::{Buffer, DrmFourcc};
use drm::control::dumbbuffer::{DumbBuffer, DumbMapping};
use drm::control::{
    connector, crtc, framebuffer, plane, ClipRect, Device as CtrlDevice, PageFlipFlags,
};
use drm::Device;

use raw_window_handle::{HasDisplayHandle, HasWindowHandle, RawDisplayHandle, RawWindowHandle};

use std::collections::HashSet;
use std::fmt;
use std::marker::PhantomData;
use std::num::NonZeroU32;
use std::os::unix::io::{AsFd, BorrowedFd};
use std::sync::Arc;

use crate::backend_interface::*;
use crate::error::{InitError, SoftBufferError, SwResultExt};

#[derive(Debug)]
pub(crate) struct KmsDisplayImpl<D: ?Sized> {
    /// The underlying raw device file descriptor.
    fd: BorrowedFd<'static>,

    /// Holds a reference to the display.
    _display: D,
}

impl<D: ?Sized> AsFd for KmsDisplayImpl<D> {
    fn as_fd(&self) -> BorrowedFd<'_> {
        self.fd
    }
}

impl<D: ?Sized> Device for KmsDisplayImpl<D> {}
impl<D: ?Sized> CtrlDevice for KmsDisplayImpl<D> {}

impl<D: HasDisplayHandle + ?Sized> ContextInterface<D> for Arc<KmsDisplayImpl<D>> {
    fn new(display: D) -> Result<Self, InitError<D>>
    where
        D: Sized,
    {
        let RawDisplayHandle::Drm(drm) = display.display_handle()?.as_raw() else {
            return Err(InitError::Unsupported(display));
        };
        if drm.fd == -1 {
            return Err(SoftBufferError::IncompleteDisplayHandle.into());
        }

        // SAFETY: Invariants guaranteed by the user.
        let fd = unsafe { BorrowedFd::borrow_raw(drm.fd) };

        Ok(Arc::new(KmsDisplayImpl {
            fd,
            _display: display,
        }))
    }
}

/// All the necessary types for the Drm/Kms backend.
#[derive(Debug)]
pub(crate) struct KmsImpl<D: ?Sized, W: ?Sized> {
    /// The display implementation.
    display: Arc<KmsDisplayImpl<D>>,

    /// The connectors to use.
    connectors: Vec<connector::Handle>,

    /// The CRTC to render to.
    crtc: crtc::Info,

    /// The dumb buffer we're using as a buffer.
    buffer: Option<Buffers>,

    /// Window handle that we are keeping around.
    window_handle: W,
}

#[derive(Debug)]
struct Buffers {
    /// The involved set of buffers.
    buffers: [SharedBuffer; 2],

    /// Whether to use the first buffer or the second buffer as the front buffer.
    first_is_front: bool,
}

/// The buffer implementation.
pub(crate) struct BufferImpl<'a, D: ?Sized, W: ?Sized> {
    /// The mapping of the dump buffer.
    mapping: DumbMapping<'a>,

    /// The framebuffer object of the current front buffer.
    front_fb: framebuffer::Handle,

    /// The CRTC handle.
    crtc_handle: crtc::Handle,

    /// This is used to change the front buffer.
    first_is_front: &'a mut bool,

    /// The current size.
    size: (NonZeroU32, NonZeroU32),

    /// The display implementation.
    display: &'a KmsDisplayImpl<D>,

    /// Age of the front buffer.
    front_age: &'a mut u8,

    /// Age of the back buffer.
    back_age: &'a mut u8,

    /// Window reference.
    _window: PhantomData<&'a mut W>,
}

impl<D: ?Sized + fmt::Debug, W: ?Sized + fmt::Debug> fmt::Debug for BufferImpl<'_, D, W> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        // FIXME: Derive instead once `DumbMapping` impls `Debug`.
        f.debug_struct("BufferImpl").finish_non_exhaustive()
    }
}

/// The combined frame buffer and dumb buffer.
#[derive(Debug)]
struct SharedBuffer {
    /// The frame buffer.
    fb: framebuffer::Handle,

    /// The dumb buffer.
    db: DumbBuffer,

    /// The age of this buffer.
    age: u8,
}

impl<D: HasDisplayHandle + ?Sized, W: HasWindowHandle> SurfaceInterface<D, W> for KmsImpl<D, W> {
    type Context = Arc<KmsDisplayImpl<D>>;
    type Buffer<'a>
        = BufferImpl<'a, D, W>
    where
        Self: 'a;

    /// Create a new KMS backend.
    fn new(window: W, display: &Arc<KmsDisplayImpl<D>>) -> Result<Self, InitError<W>> {
        // Make sure that the window handle is valid.
        let RawWindowHandle::Drm(drm) = window.window_handle()?.as_raw() else {
            return Err(InitError::Unsupported(window));
        };
        let plane_handle =
            NonZeroU32::new(drm.plane).ok_or(SoftBufferError::IncompleteWindowHandle)?;
        let plane_handle = plane::Handle::from(plane_handle);

        let plane_info = display
            .get_plane(plane_handle)
            .swbuf_err("failed to get plane info")?;
        let handles = display
            .resource_handles()
            .swbuf_err("failed to get resource handles")?;

        // Use either the attached CRTC or the primary CRTC.
        let crtc = {
            let handle = match plane_info.crtc() {
                Some(crtc) => crtc,
                None => {
                    tracing::warn!("no CRTC attached to plane, falling back to primary CRTC");
                    handles
          
```