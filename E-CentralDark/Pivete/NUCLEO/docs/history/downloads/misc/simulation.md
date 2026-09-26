# OUTRO - simulation.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-audio\tests\dedup_benchmark\simulation.rs
**SHA:** 69830aa1cda672ec
**Timestamp:** 2026-08-23T14:16:26.590583
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let chunk_start = current_time;

### Ouro Bruto (primeiros 5000 chars)
```
//! Simulation engine for realistic audio transcription scenarios
//!
//! This module provides building blocks for simulating real-world audio capture
//! including timing, device characteristics, speaker behavior, and transcription noise.

use rand::{rngs::StdRng, Rng, SeedableRng};
use std::collections::HashMap;

// =============================================================================
// CONSTANTS
// =============================================================================

/// Chunk duration in seconds (matches screenpipe default)
pub const CHUNK_DURATION_SECS: f64 = 10.0;

/// Overlap between chunks in seconds (matches screenpipe default)
pub const OVERLAP_SECS: f64 = 2.0;

/// Effective new content per chunk
pub const EFFECTIVE_CHUNK_SECS: f64 = CHUNK_DURATION_SECS - OVERLAP_SECS;

// =============================================================================
// DEVICE SIMULATION
// =============================================================================

/// Simulated audio device
#[derive(Debug, Clone)]
pub struct SimDevice {
    pub name: String,
    pub device_type: SimDeviceType,
    /// Latency in milliseconds (affects timing of transcription arrival)
    pub latency_ms: u64,
    /// Quality factor 0.0-1.0 (affects transcription accuracy)
    pub quality: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum SimDeviceType {
    Input,  // Microphone
    Output, // Speaker/system audio
}

impl SimDevice {
    pub fn microphone(name: &str) -> Self {
        Self {
            name: name.to_string(),
            device_type: SimDeviceType::Input,
            latency_ms: 50,
            quality: 0.95,
        }
    }

    pub fn speaker(name: &str) -> Self {
        Self {
            name: name.to_string(),
            device_type: SimDeviceType::Output,
            latency_ms: 20,
            quality: 0.98, // Speaker output is typically cleaner
        }
    }

    pub fn with_latency(mut self, latency_ms: u64) -> Self {
        self.latency_ms = latency_ms;
        self
    }

    pub fn with_quality(mut self, quality: f64) -> Self {
        self.quality = quality.clamp(0.0, 1.0);
        self
    }
}

// =============================================================================
// SPEAKER SIMULATION
// =============================================================================

/// Simulated speaker with unique characteristics
#[derive(Debug, Clone)]
pub struct SimSpeaker {
    pub id: usize,
    pub name: String,
    /// Words per minute (affects speech duration)
    pub wpm: f64,
    /// Probability of filler words ("um", "uh", "like")
    pub filler_rate: f64,
    /// Probability of repeating words/phrases
    pub repetition_rate: f64,
}

impl SimSpeaker {
    pub fn new(id: usize, name: &str) -> Self {
        Self {
            id,
            name: name.to_string(),
            wpm: 150.0, // Average speaking rate
            filler_rate: 0.05,
            repetition_rate: 0.02,
        }
    }

    /// Create a fast speaker (200+ WPM)
    pub fn fast(id: usize, name: &str) -> Self {
        Self {
            id,
            name: name.to_string(),
            wpm: 200.0,
            filler_rate: 0.02,
            repetition_rate: 0.01,
        }
    }

    /// Create a slow, deliberate speaker (100 WPM)
    pub fn slow(id: usize, name: &str) -> Self {
        Self {
            id,
            name: name.to_string(),
            wpm: 100.0,
            filler_rate: 0.08,
            repetition_rate: 0.04,
        }
    }

    /// Estimate duration in seconds for speaking given text
    pub fn estimate_duration(&self, text: &str) -> f64 {
        let word_count = text.split_whitespace().count() as f64;
        (word_count / self.wpm) * 60.0
    }
}

// =============================================================================
// TRANSCRIPTION NOISE SIMULATION
// =============================================================================

/// Simulates Whisper transcription variations and errors
#[derive(Debug, Clone)]
pub struct TranscriptionNoise {
    rng: StdRng,
    /// Probability of word-level substitution
    pub word_error_rate: f64,
    /// Probability of punctuation variation
    pub punctuation_variation_rate: f64,
    /// Probability of capitalization variation
    pub capitalization_variation_rate: f64,
    /// Probability of number format variation (e.g., "5" vs "five")
    pub number_format_variation_rate: f64,
}

impl TranscriptionNoise {
    pub fn new(seed: u64) -> Self {
        Self {
            rng: StdRng::seed_from_u64(seed),
            word_error_rate: 0.02,
            punctuation_variation_rate: 0.10,
            capitalization_variation_rate: 0.15,
            number_format_variation_rate: 0.20,
        }
    }

    /// No noise - perfect transcription
    pub fn perfect() -> Self {
        Self {
            rng: StdRng::seed_from_u64(0),
            word_error_rate: 0.0,
            punctuation_variation_rate: 0.0,

```

---

# OUTRO - simulation.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-audio\tests\dedup_benchmark\simulation.rs
**SHA:** 69830aa1cda672ecf82655b4b8f1365dac43ad617fdf4e516bd3b323de5e1907
**Timestamp:** 2026-08-23T23:43:36.409869
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let chunk_start = current_time;

### Ouro Bruto (primeiros 5000 chars)
```
//! Simulation engine for realistic audio transcription scenarios
//!
//! This module provides building blocks for simulating real-world audio capture
//! including timing, device characteristics, speaker behavior, and transcription noise.

use rand::{rngs::StdRng, Rng, SeedableRng};
use std::collections::HashMap;

// =============================================================================
// CONSTANTS
// =============================================================================

/// Chunk duration in seconds (matches screenpipe default)
pub const CHUNK_DURATION_SECS: f64 = 10.0;

/// Overlap between chunks in seconds (matches screenpipe default)
pub const OVERLAP_SECS: f64 = 2.0;

/// Effective new content per chunk
pub const EFFECTIVE_CHUNK_SECS: f64 = CHUNK_DURATION_SECS - OVERLAP_SECS;

// =============================================================================
// DEVICE SIMULATION
// =============================================================================

/// Simulated audio device
#[derive(Debug, Clone)]
pub struct SimDevice {
    pub name: String,
    pub device_type: SimDeviceType,
    /// Latency in milliseconds (affects timing of transcription arrival)
    pub latency_ms: u64,
    /// Quality factor 0.0-1.0 (affects transcription accuracy)
    pub quality: f64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum SimDeviceType {
    Input,  // Microphone
    Output, // Speaker/system audio
}

impl SimDevice {
    pub fn microphone(name: &str) -> Self {
        Self {
            name: name.to_string(),
            device_type: SimDeviceType::Input,
            latency_ms: 50,
            quality: 0.95,
        }
    }

    pub fn speaker(name: &str) -> Self {
        Self {
            name: name.to_string(),
            device_type: SimDeviceType::Output,
            latency_ms: 20,
            quality: 0.98, // Speaker output is typically cleaner
        }
    }

    pub fn with_latency(mut self, latency_ms: u64) -> Self {
        self.latency_ms = latency_ms;
        self
    }

    pub fn with_quality(mut self, quality: f64) -> Self {
        self.quality = quality.clamp(0.0, 1.0);
        self
    }
}

// =============================================================================
// SPEAKER SIMULATION
// =============================================================================

/// Simulated speaker with unique characteristics
#[derive(Debug, Clone)]
pub struct SimSpeaker {
    pub id: usize,
    pub name: String,
    /// Words per minute (affects speech duration)
    pub wpm: f64,
    /// Probability of filler words ("um", "uh", "like")
    pub filler_rate: f64,
    /// Probability of repeating words/phrases
    pub repetition_rate: f64,
}

impl SimSpeaker {
    pub fn new(id: usize, name: &str) -> Self {
        Self {
            id,
            name: name.to_string(),
            wpm: 150.0, // Average speaking rate
            filler_rate: 0.05,
            repetition_rate: 0.02,
        }
    }

    /// Create a fast speaker (200+ WPM)
    pub fn fast(id: usize, name: &str) -> Self {
        Self {
            id,
            name: name.to_string(),
            wpm: 200.0,
            filler_rate: 0.02,
            repetition_rate: 0.01,
        }
    }

    /// Create a slow, deliberate speaker (100 WPM)
    pub fn slow(id: usize, name: &str) -> Self {
        Self {
            id,
            name: name.to_string(),
            wpm: 100.0,
            filler_rate: 0.08,
            repetition_rate: 0.04,
        }
    }

    /// Estimate duration in seconds for speaking given text
    pub fn estimate_duration(&self, text: &str) -> f64 {
        let word_count = text.split_whitespace().count() as f64;
        (word_count / self.wpm) * 60.0
    }
}

// =============================================================================
// TRANSCRIPTION NOISE SIMULATION
// =============================================================================

/// Simulates Whisper transcription variations and errors
#[derive(Debug, Clone)]
pub struct TranscriptionNoise {
    rng: StdRng,
    /// Probability of word-level substitution
    pub word_error_rate: f64,
    /// Probability of punctuation variation
    pub punctuation_variation_rate: f64,
    /// Probability of capitalization variation
    pub capitalization_variation_rate: f64,
    /// Probability of number format variation (e.g., "5" vs "five")
    pub number_format_variation_rate: f64,
}

impl TranscriptionNoise {
    pub fn new(seed: u64) -> Self {
        Self {
            rng: StdRng::seed_from_u64(seed),
            word_error_rate: 0.02,
            punctuation_variation_rate: 0.10,
            capitalization_variation_rate: 0.15,
            number_format_variation_rate: 0.20,
        }
    }

    /// No noise - perfect transcription
    pub fn perfect() -> Self {
        Self {
            rng: StdRng::seed_from_u64(0),
            word_error_rate: 0.0,
            punctuation_variation_rate: 0.0,

```