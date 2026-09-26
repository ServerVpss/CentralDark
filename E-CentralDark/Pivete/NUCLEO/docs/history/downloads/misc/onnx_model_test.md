# OUTRO - onnx_model_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-audio\tests\onnx_model_test.rs
**SHA:** efc34664b46de87e
**Timestamp:** 2026-08-23T14:16:26.550034
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
/// Tests for ONNX Runtime model loading and inference
/// These tests verify that the ort crate is properly configured and working
/// on the current platform (especially important for macOS Apple Silicon).
///
/// These tests are ignored by default because they require downloading large models.
/// Run them locally with: cargo test -p screenpipe-audio --test onnx_model_test -- --ignored
#[cfg(test)]
mod tests {
    use anyhow::Result;
    use log::LevelFilter;
    use screenpipe_audio::speaker::embedding::EmbeddingExtractor;
    use screenpipe_audio::speaker::models::{get_or_download_model, PyannoteModel};
    use screenpipe_audio::vad::silero::SileroVad;
    use screenpipe_audio::vad::VadEngine;
    use std::time::Instant;

    fn setup() {
        let _ = env_logger::builder()
            .filter_level(LevelFilter::Debug)
            .filter_module("tokenizers", LevelFilter::Error)
            .try_init();
    }

    /// Test that we can create an ONNX session for the embedding model
    /// This tests the core ort::Session creation which is where segfaults typically occur
    #[tokio::test]
    #[ignore = "requires model download, run locally with --ignored"]
    async fn test_onnx_embedding_model_loads() -> Result<()> {
        setup();
        println!("Testing ONNX embedding model loading...");

        let start = Instant::now();

        // Download/locate the embedding model
        let embedding_model = get_or_download_model(PyannoteModel::Embedding).await?;
        println!(
            "Model path: {:?} (downloaded in {:?})",
            embedding_model.path,
            start.elapsed()
        );

        // Create the ONNX session - this is where segfaults typically occur
        let start = Instant::now();
        let extractor = EmbeddingExtractor::new(&embedding_model.path)?;
        println!("EmbeddingExtractor created in {:?}", start.elapsed());

        // Verify we can access the extractor (it's not a null/invalid session)
        println!("EmbeddingExtractor debug: {:?}", extractor);

        println!("ONNX embedding model test PASSED");
        Ok(())
    }

    /// Test that we can create an ONNX session for the segmentation model
    #[tokio::test]
    #[ignore = "requires model download, run locally with --ignored"]
    async fn test_onnx_segmentation_model_loads() -> Result<()> {
        setup();
        println!("Testing ONNX segmentation model loading...");

        let start = Instant::now();

        // Download/locate the segmentation model
        let segmentation_model = get_or_download_model(PyannoteModel::Segmentation).await?;
        println!(
            "Model path: {:?} (downloaded in {:?})",
            segmentation_model.path,
            start.elapsed()
        );

        // Create the ONNX session directly using the speaker module's create_session
        let start = Instant::now();
        let session = screenpipe_audio::speaker::create_session(&segmentation_model.path)?;
        println!("Segmentation session created in {:?}", start.elapsed());

        // Basic validation - check session has expected inputs/outputs
        let inputs = session.inputs().len();
        let outputs = session.outputs().len();
        println!("Session has {} inputs and {} outputs", inputs, outputs);

        assert!(inputs > 0, "Session should have at least one input");
        assert!(outputs > 0, "Session should have at least one output");

        println!("ONNX segmentation model test PASSED");
        Ok(())
    }

    /// Test that SileroVad can initialize (uses ONNX via vad-rs crate)
    #[tokio::test]
    #[ignore = "requires model download, run locally with --ignored"]
    async fn test_silero_vad_initializes() -> Result<()> {
        setup();
        println!("Testing SileroVad initialization (uses ONNX via vad-rs)...");

        let start = Instant::now();
        let mut vad = SileroVad::new().await?;
        println!("SileroVad initialized in {:?}", start.elapsed());

        // Test basic inference with silence (all zeros)
        let silence: Vec<f32> = vec![0.0; 1600]; // 100ms at 16kHz
        let start = Instant::now();
        let is_speech = vad.is_voice_segment(&silence)?;
        println!(
            "VAD inference completed in {:?}, is_speech={}",
            start.elapsed(),
            is_speech
        );

        // Silence should not be detected as speech
        assert!(!is_speech, "Silence should not be detected as speech");

        println!("SileroVad test PASSED");
        Ok(())
    }

    /// Test that EmbeddingExtractor can run inference
    #[tokio::test]
    #[ignore = "requires model download, run locally with --ignored"]
    async fn test_embedding_extractor_inference() -> Result<()> {
        setup();
        println!("Testing EmbeddingExtractor inference...");

        // Download/locate the embedding model
        let embedding_model = get_or_download_model(PyannoteModel::Embedding).await?;

        // Create the extractor
        let 
```

---

# OUTRO - onnx_model_test.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-audio\tests\onnx_model_test.rs
**SHA:** efc34664b46de87e3f77b5b8f6e623f3f8f7b75f73e34bef06205ede99ccbed8
**Timestamp:** 2026-08-23T23:43:36.586022
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
/// Tests for ONNX Runtime model loading and inference
/// These tests verify that the ort crate is properly configured and working
/// on the current platform (especially important for macOS Apple Silicon).
///
/// These tests are ignored by default because they require downloading large models.
/// Run them locally with: cargo test -p screenpipe-audio --test onnx_model_test -- --ignored
#[cfg(test)]
mod tests {
    use anyhow::Result;
    use log::LevelFilter;
    use screenpipe_audio::speaker::embedding::EmbeddingExtractor;
    use screenpipe_audio::speaker::models::{get_or_download_model, PyannoteModel};
    use screenpipe_audio::vad::silero::SileroVad;
    use screenpipe_audio::vad::VadEngine;
    use std::time::Instant;

    fn setup() {
        let _ = env_logger::builder()
            .filter_level(LevelFilter::Debug)
            .filter_module("tokenizers", LevelFilter::Error)
            .try_init();
    }

    /// Test that we can create an ONNX session for the embedding model
    /// This tests the core ort::Session creation which is where segfaults typically occur
    #[tokio::test]
    #[ignore = "requires model download, run locally with --ignored"]
    async fn test_onnx_embedding_model_loads() -> Result<()> {
        setup();
        println!("Testing ONNX embedding model loading...");

        let start = Instant::now();

        // Download/locate the embedding model
        let embedding_model = get_or_download_model(PyannoteModel::Embedding).await?;
        println!(
            "Model path: {:?} (downloaded in {:?})",
            embedding_model.path,
            start.elapsed()
        );

        // Create the ONNX session - this is where segfaults typically occur
        let start = Instant::now();
        let extractor = EmbeddingExtractor::new(&embedding_model.path)?;
        println!("EmbeddingExtractor created in {:?}", start.elapsed());

        // Verify we can access the extractor (it's not a null/invalid session)
        println!("EmbeddingExtractor debug: {:?}", extractor);

        println!("ONNX embedding model test PASSED");
        Ok(())
    }

    /// Test that we can create an ONNX session for the segmentation model
    #[tokio::test]
    #[ignore = "requires model download, run locally with --ignored"]
    async fn test_onnx_segmentation_model_loads() -> Result<()> {
        setup();
        println!("Testing ONNX segmentation model loading...");

        let start = Instant::now();

        // Download/locate the segmentation model
        let segmentation_model = get_or_download_model(PyannoteModel::Segmentation).await?;
        println!(
            "Model path: {:?} (downloaded in {:?})",
            segmentation_model.path,
            start.elapsed()
        );

        // Create the ONNX session directly using the speaker module's create_session
        let start = Instant::now();
        let session = screenpipe_audio::speaker::create_session(&segmentation_model.path)?;
        println!("Segmentation session created in {:?}", start.elapsed());

        // Basic validation - check session has expected inputs/outputs
        let inputs = session.inputs().len();
        let outputs = session.outputs().len();
        println!("Session has {} inputs and {} outputs", inputs, outputs);

        assert!(inputs > 0, "Session should have at least one input");
        assert!(outputs > 0, "Session should have at least one output");

        println!("ONNX segmentation model test PASSED");
        Ok(())
    }

    /// Test that SileroVad can initialize (uses ONNX via vad-rs crate)
    #[tokio::test]
    #[ignore = "requires model download, run locally with --ignored"]
    async fn test_silero_vad_initializes() -> Result<()> {
        setup();
        println!("Testing SileroVad initialization (uses ONNX via vad-rs)...");

        let start = Instant::now();
        let mut vad = SileroVad::new().await?;
        println!("SileroVad initialized in {:?}", start.elapsed());

        // Test basic inference with silence (all zeros)
        let silence: Vec<f32> = vec![0.0; 1600]; // 100ms at 16kHz
        let start = Instant::now();
        let is_speech = vad.is_voice_segment(&silence)?;
        println!(
            "VAD inference completed in {:?}, is_speech={}",
            start.elapsed(),
            is_speech
        );

        // Silence should not be detected as speech
        assert!(!is_speech, "Silence should not be detected as speech");

        println!("SileroVad test PASSED");
        Ok(())
    }

    /// Test that EmbeddingExtractor can run inference
    #[tokio::test]
    #[ignore = "requires model download, run locally with --ignored"]
    async fn test_embedding_extractor_inference() -> Result<()> {
        setup();
        println!("Testing EmbeddingExtractor inference...");

        // Download/locate the embedding model
        let embedding_model = get_or_download_model(PyannoteModel::Embedding).await?;

        // Create the extractor
        let 
```