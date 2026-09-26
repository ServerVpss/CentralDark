# OUTRO - image.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\ico-0.5.0\src\image.rs
**SHA:** 2d493d22301151c3
**Timestamp:** 2026-08-28T02:34:17.698588
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut start = 0;
- let mut start = (4 * (height - row - 1) * width) as usize;
- let mut start = (4 * (height - row - 1) * width) as usize;
- let mut start = (4 * (height - row - 1) * width) as usize;
- let mut start = (4 * (height - row - 1) * width) as usize;
- let mut start = 0;

### Gaps
- // TODO: Support other bit depths.
- // TODO: Implement ColorType::Indexed conversion
- // TODO: Detect if we can use grayscale.

### Ouro Bruto (primeiros 5000 chars)
```
use crate::bmpdepth::BmpDepth;
use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
use std::collections::{BTreeSet, HashMap};
use std::io::{self, Read, Write};

//===========================================================================//

// The size of a BITMAPINFOHEADER struct, in bytes.
const BMP_HEADER_LEN: u32 = 40;

// Size limits for images in an ICO file:
const MIN_WIDTH: u32 = 1;
const MIN_HEIGHT: u32 = 1;

//===========================================================================//

/// A decoded image.
#[derive(Clone)]
pub struct IconImage {
    width: u32,
    height: u32,
    hotspot: Option<(u16, u16)>,
    rgba_data: Vec<u8>,
}

impl IconImage {
    /// Creates a new image with the given dimensions. The `width` and `height`
    /// must be nonzero. The image data is initialized to zeros. Panics if the
    /// dimensions are out of range.
    pub fn new(width: u32, height: u32) -> IconImage {
        if width < MIN_WIDTH {
            panic!(
                "Invalid width (was {}, but must be at least {})",
                width, MIN_WIDTH
            );
        }
        if height < MIN_HEIGHT {
            panic!(
                "Invalid height (was {}, but must be at least {})",
                height, MIN_HEIGHT
            );
        }

        IconImage {
            width,
            height,
            hotspot: None,
            rgba_data: vec![0u8; (width as usize) * (height as usize) * 4],
        }
    }

    /// Creates a new image with the given dimensions and RGBA data.  The
    /// `width` and `height` must be nonzero, and `rgba_data` must have `4 *
    /// width * height` bytes and be in row-major order from top to bottom.
    /// Panics if the dimensions are out of range or if `rgba_data` is the
    /// wrong length.
    pub fn from_rgba_data(
        width: u32,
        height: u32,
        rgba_data: Vec<u8>,
    ) -> IconImage {
        if width < MIN_WIDTH {
            panic!(
                "Invalid width (was {}, but must be at least {})",
                width, MIN_WIDTH
            );
        }
        if height < MIN_HEIGHT {
            panic!(
                "Invalid height (was {}, but must be at least {})",
                height, MIN_HEIGHT
            );
        }
        let expected_data_len = (width as u64) * (height as u64) * 4;
        if (rgba_data.len() as u64) != expected_data_len {
            panic!(
                "Invalid data length (was {}, but must be {} for {}x{} image)",
                rgba_data.len(),
                expected_data_len,
                width,
                height
            );
        }
        IconImage { width, height, hotspot: None, rgba_data }
    }

    pub(crate) fn read_png_info<R: Read>(
        reader: R,
    ) -> io::Result<png::Reader<R>> {
        let decoder = png::Decoder::new(reader);
        let png_reader = match decoder.read_info() {
            Ok(png_reader) => png_reader,
            Err(error) => invalid_data!("Malformed PNG data: {}", error),
        };
        IconImage::validate_png_info(png_reader.info())?;
        Ok(png_reader)
    }

    fn validate_png_info(info: &png::Info) -> io::Result<()> {
        if info.width < MIN_WIDTH {
            invalid_data!(
                "Invalid PNG width (was {}, but must be at least {}",
                info.width,
                MIN_WIDTH
            );
        }
        if info.height < MIN_HEIGHT {
            invalid_data!(
                "Invalid PNG height (was {}, but must be at least {})",
                info.height,
                MIN_HEIGHT
            );
        }
        if info.bit_depth != png::BitDepth::Eight {
            // TODO: Support other bit depths.
            invalid_data!("Unsupported PNG bit depth: {:?}", info.bit_depth);
        }
        Ok(())
    }

    /// Decodes an image from a PNG file.  Returns an error if the PNG data is
    /// malformed or can't be decoded.
    pub fn read_png<R: Read>(reader: R) -> io::Result<IconImage> {
        let mut png_reader = IconImage::read_png_info(reader)?;
        let mut buffer = vec![0u8; png_reader.output_buffer_size()];
        match png_reader.next_frame(&mut buffer) {
            Ok(_) => {}
            Err(error) => invalid_data!("Malformed PNG data: {}", error),
        }
        let rgba_data = match png_reader.info().color_type {
            png::ColorType::Rgba => buffer,
            png::ColorType::Rgb => {
                let num_pixels = buffer.len() / 3;
                let mut rgba = Vec::with_capacity(num_pixels * 4);
                for i in 0..num_pixels {
                    rgba.extend_from_slice(&buffer[(3 * i)..][..3]);
                    rgba.push(u8::MAX);
                }
                rgba
            }
            png::ColorType::GrayscaleAlpha => {
                let num_pixels = buffer.len() / 2;
                let mut rgba = Vec::with_capacity(num_pixels * 4);
                for i in 0..num_pixels {
                    let gray 
```