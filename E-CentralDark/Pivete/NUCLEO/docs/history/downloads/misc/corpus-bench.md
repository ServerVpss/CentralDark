# OUTRO - corpus-bench.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\png-0.17.16\examples\corpus-bench.rs
**SHA:** c1fcbf01b188b021
**Timestamp:** 2026-08-28T02:34:58.944134
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = std::time::Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
use std::{fs, path::PathBuf};

use clap::Parser;
use png::Decoder;

#[derive(clap::ValueEnum, Clone)]
enum Speed {
    Fast,
    Default,
    Best,
}

#[derive(clap::ValueEnum, Clone)]
enum Filter {
    None,
    Sub,
    Up,
    Average,
    Paeth,
    Adaptive,
}

#[derive(clap::Parser)]
struct Args {
    directory: Option<PathBuf>,
    #[clap(short, long, value_enum, default_value_t = Speed::Fast)]
    speed: Speed,
    #[clap(short, long, value_enum, default_value_t = Filter::Adaptive)]
    filter: Filter,
}

#[inline(never)]
fn run_encode(
    args: &Args,
    dimensions: (u32, u32),
    color_type: png::ColorType,
    bit_depth: png::BitDepth,
    image: &[u8],
) -> Vec<u8> {
    let mut reencoded = Vec::new();
    let mut encoder = png::Encoder::new(&mut reencoded, dimensions.0, dimensions.1);
    encoder.set_color(color_type);
    encoder.set_depth(bit_depth);
    encoder.set_compression(match args.speed {
        Speed::Fast => png::Compression::Fast,
        Speed::Default => png::Compression::Default,
        Speed::Best => png::Compression::Best,
    });
    encoder.set_filter(match args.filter {
        Filter::None => png::FilterType::NoFilter,
        Filter::Sub => png::FilterType::Sub,
        Filter::Up => png::FilterType::Up,
        Filter::Average => png::FilterType::Avg,
        Filter::Paeth => png::FilterType::Paeth,
        Filter::Adaptive => png::FilterType::Paeth,
    });
    encoder.set_adaptive_filter(match args.filter {
        Filter::Adaptive => png::AdaptiveFilterType::Adaptive,
        _ => png::AdaptiveFilterType::NonAdaptive,
    });
    let mut encoder = encoder.write_header().unwrap();
    encoder.write_image_data(image).unwrap();
    encoder.finish().unwrap();
    reencoded
}

#[inline(never)]
fn run_decode(image: &[u8], output: &mut [u8]) {
    let mut reader = Decoder::new(image).read_info().unwrap();
    reader.next_frame(output).unwrap();
}

fn main() {
    let mut total_uncompressed = 0;
    let mut total_compressed = 0;
    let mut total_pixels = 0;
    let mut total_encode_time = 0;
    let mut total_decode_time = 0;

    let args = Args::parse();

    println!(
        "{:45} Ratio             Encode                    Decode",
        "Directory"
    );
    println!(
        "{:45}-------     --------------------      --------------------",
        "---------"
    );

    let mut image2 = Vec::new();

    let mut pending = vec![args.directory.clone().unwrap_or(PathBuf::from("."))];
    while let Some(directory) = pending.pop() {
        let mut dir_uncompressed = 0;
        let mut dir_compressed = 0;
        let mut dir_pixels = 0;
        let mut dir_encode_time = 0;
        let mut dir_decode_time = 0;

        for entry in fs::read_dir(&directory).unwrap().flatten() {
            if entry.file_type().unwrap().is_dir() {
                pending.push(entry.path());
                continue;
            }

            match entry.path().extension() {
                Some(st) if st == "png" => {}
                _ => continue,
            }

            // Parse
            let data = fs::read(entry.path()).unwrap();
            let mut decoder = Decoder::new(&*data);
            if decoder.read_header_info().ok().map(|h| h.color_type)
                == Some(png::ColorType::Indexed)
            {
                decoder.set_transformations(
                    png::Transformations::EXPAND | png::Transformations::STRIP_16,
                );
            }
            let mut reader = match decoder.read_info() {
                Ok(reader) => reader,
                Err(_) => continue,
            };
            let mut image = vec![0; reader.output_buffer_size()];
            let info = match reader.next_frame(&mut image) {
                Ok(info) => info,
                Err(_) => continue,
            };
            let (width, height) = (info.width, info.height);
            let bit_depth = info.bit_depth;
            let mut color_type = info.color_type;

            // qoibench expands grayscale to RGB, so we do the same.
            if bit_depth == png::BitDepth::Eight {
                if color_type == png::ColorType::Grayscale {
                    image = image.into_iter().flat_map(|v| [v, v, v, 255]).collect();
                    color_type = png::ColorType::Rgba;
                } else if color_type == png::ColorType::GrayscaleAlpha {
                    image = image
                        .chunks_exact(2)
                        .flat_map(|v| [v[0], v[0], v[0], v[1]])
                        .collect();
                    color_type = png::ColorType::Rgba;
                }
            }

            // Re-encode
            let start = std::time::Instant::now();
            let reencoded = run_encode(&args, (width, height), color_type, bit_depth, &image);
            let elapsed = start.elapsed().as_nanos() as u64;

            // And decode again
            image2.resize(image.len(), 0);
            let start2 = std::time::Instant::now();
 
```