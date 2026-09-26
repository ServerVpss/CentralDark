# OUTRO - adam7.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\png-0.17.16\src\adam7.rs
**SHA:** 83d1343244ed4556
**Timestamp:** 2026-08-28T02:34:58.996851
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let line_start = prog_line * row_stride_in_bytes * 8;
- let start = 8 * line_no * width;
- let start = start + 4;
- let start = (8 * line_no + 4) * width;
- let start = 4 * line_no * width + 2;
- let start = (4 * line_no + 2) * width;
- let start = 2 * line_no * width + 1;
- let start = (2 * line_no + 1) * width;

### Ouro Bruto (primeiros 5000 chars)
```
//! Utility functions related to handling of
//! [the Adam7 algorithm](https://en.wikipedia.org/wiki/Adam7_algorithm).

/// Describes which stage of
/// [the Adam7 algorithm](https://en.wikipedia.org/wiki/Adam7_algorithm)
/// applies to a decoded row.
///
/// See also [Reader.next_interlaced_row](crate::decoder::Reader::next_interlaced_row).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Adam7Info {
    pub(crate) pass: u8,
    pub(crate) line: u32,
    pub(crate) width: u32,
}

impl Adam7Info {
    /// Creates a new `Adam7Info`.  May panic if the arguments are out of range (e.g. if `pass` is
    /// 0 or greater than 8).
    ///
    /// * `pass` corresponds to a pass of the
    ///   [the Adam7 algorithm](https://en.wikipedia.org/wiki/Adam7_algorithm)
    /// * `line` is the number of a line within a pass (starting with 0).  For example,
    ///   in an image of height 8, `line` can be beteween `0..4` in the 7th `pass`
    ///   (those 4 interlaced rows correspond to 2nd, 4th, 6th, and 8th row of the full image).
    /// * `width` describes how many pixels are in an interlaced row.  For example,
    ///   in the 7th `pass`, the `width` is be the same as full image width, but in
    ///   in the 1st `pass`, the `width` is be 1/8th of the image width (rounded up as
    ///   necessary).
    ///
    /// Note that in typical usage, `Adam7Info`s are returned by [Reader.next_interlaced_row]
    /// and there is no need to create them by calling `Adam7Info::new`.  `Adam7Info::new` is
    /// nevertheless exposed as a public API, because it helps to provide self-contained example
    /// usage of [expand_interlaced_row](crate::expand_interlaced_row).
    pub fn new(pass: u8, line: u32, width: u32) -> Self {
        assert!(1 <= pass && pass <= 7);
        assert!(width > 0);
        Self { pass, line, width }
    }
}

/// This iterator iterates over the different passes of an image Adam7 encoded
/// PNG image
/// The pattern is:
///     16462646
///     77777777
///     56565656
///     77777777
///     36463646
///     77777777
///     56565656
///     77777777
///
#[derive(Clone)]
pub(crate) struct Adam7Iterator {
    line: u32,
    lines: u32,
    line_width: u32,
    current_pass: u8,
    width: u32,
    height: u32,
}

impl Adam7Iterator {
    pub fn new(width: u32, height: u32) -> Adam7Iterator {
        let mut this = Adam7Iterator {
            line: 0,
            lines: 0,
            line_width: 0,
            current_pass: 1,
            width,
            height,
        };
        this.init_pass();
        this
    }

    /// Calculates the bounds of the current pass
    fn init_pass(&mut self) {
        let w = f64::from(self.width);
        let h = f64::from(self.height);
        let (line_width, lines) = match self.current_pass {
            1 => (w / 8.0, h / 8.0),
            2 => ((w - 4.0) / 8.0, h / 8.0),
            3 => (w / 4.0, (h - 4.0) / 8.0),
            4 => ((w - 2.0) / 4.0, h / 4.0),
            5 => (w / 2.0, (h - 2.0) / 4.0),
            6 => ((w - 1.0) / 2.0, h / 2.0),
            7 => (w, (h - 1.0) / 2.0),
            _ => unreachable!(),
        };
        self.line_width = line_width.ceil() as u32;
        self.lines = lines.ceil() as u32;
        self.line = 0;
    }
}

/// Iterates over `Adam7Info`s.
impl Iterator for Adam7Iterator {
    type Item = Adam7Info;
    fn next(&mut self) -> Option<Self::Item> {
        if self.line < self.lines && self.line_width > 0 {
            let this_line = self.line;
            self.line += 1;
            Some(Adam7Info {
                pass: self.current_pass,
                line: this_line,
                width: self.line_width,
            })
        } else if self.current_pass < 7 {
            self.current_pass += 1;
            self.init_pass();
            self.next()
        } else {
            None
        }
    }
}

fn subbyte_pixels(scanline: &[u8], bits_pp: usize) -> impl Iterator<Item = u8> + '_ {
    (0..scanline.len() * 8)
        .step_by(bits_pp)
        .map(move |bit_idx| {
            let byte_idx = bit_idx / 8;

            // sub-byte samples start in the high-order bits
            let rem = 8 - bit_idx % 8 - bits_pp;

            match bits_pp {
                // evenly divides bytes
                1 => (scanline[byte_idx] >> rem) & 1,
                2 => (scanline[byte_idx] >> rem) & 3,
                4 => (scanline[byte_idx] >> rem) & 15,
                _ => unreachable!(),
            }
        })
}

/// Given `row_stride`, interlace `info`, and bits-per-pixel, produce an iterator of bit positions
/// of pixels to copy from the input scanline to the image buffer.  The positions are expressed as
/// bit offsets from position (0,0) in the frame that is currently being decoded.
fn expand_adam7_bits(
    row_stride_in_bytes: usize,
    info: &Adam7Info,
    bits_pp: usize,
) -> impl Iterator<Item = usize> {
    let line_no = info.line as usize;
    let pass = info.pass;
    let interlaced_width = i
```