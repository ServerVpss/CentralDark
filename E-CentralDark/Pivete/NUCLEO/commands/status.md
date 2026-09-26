# COMANDO - status.js
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_aiox-core\aiox-core\.aios-core\cli\commands\qa\status.js
**SHA:** bc993858504617a2
**Timestamp:** 2026-08-26T19:43:46.973336
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const lastRun = new Date(status.lastRun);
- console.log(`Last Run: ${lastRun.toLocaleString()} (${ago})`);
- console.log('Last Run: Never');

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * QA Status Command
 *
 * Display current quality gate status.
 *
 * @module cli/commands/qa/status
 * @version 1.0.0
 * @story 2.10 - Quality Gate Manager
 */

const { Command } = require('commander');
const { QualityGateManager } = require('../../../core/quality-gates/quality-gate-manager');

/**
 * Create the status subcommand
 * @returns {Command} Commander command instance
 */
function createStatusCommand() {
  const status = new Command('status');

  status
    .description('Show current quality gate status')
    .option('-v, --verbose', 'Show detailed status', false)
    .option('--json', 'Output as JSON', false)
    .action(async (options) => {
      try {
        const manager = await QualityGateManager.load();
        const currentStatus = await manager.getStatus();

        if (options.json) {
          console.log(JSON.stringify(currentStatus, null, 2));
          return;
        }

        printStatus(currentStatus, options.verbose);
      } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        if (options.verbose) {
          console.error(error.stack);
        }
        process.exit(1);
      }
    });

  return status;
}

/**
 * Print status in human-readable format
 * @param {Object} status - Current status
 * @param {boolean} verbose - Verbose mode
 */
function printStatus(status, verbose = false) {
  console.log('\n📊 Quality Gate Status');
  console.log('━'.repeat(50));

  // Overall status
  const overallIcon = getStatusIcon(status.overall);
  console.log(`\nOverall: ${overallIcon} ${formatOverallStatus(status.overall)}`);

  if (status.lastRun) {
    const lastRun = new Date(status.lastRun);
    const ago = formatTimeAgo(lastRun);
    console.log(`Last Run: ${lastRun.toLocaleString()} (${ago})`);
  } else {
    console.log('Last Run: Never');
  }

  console.log('');

  // Layer statuses
  printLayerStatus('Layer 1', status.layer1, 'Pre-commit');
  printLayerStatus('Layer 2', status.layer2, 'PR Automation');
  printLayerStatus('Layer 3', status.layer3, 'Human Review');

  // Verbose: Show details
  if (verbose && status.layer1) {
    console.log('\n--- Details ---');

    if (status.layer1?.results) {
      console.log('\nLayer 1 Checks:');
      status.layer1.results.forEach((r) => {
        const icon = r.pass ? '✓' : '✗';
        console.log(`  ${icon} ${r.check}: ${r.message}`);
      });
    }

    if (status.layer2?.results) {
      console.log('\nLayer 2 Checks:');
      status.layer2.results.forEach((r) => {
        const icon = r.pass ? '✓' : '✗';
        console.log(`  ${icon} ${r.check}: ${r.message}`);
      });
    }
  }

  // Signoffs
  if (Object.keys(status.signoffs || {}).length > 0) {
    console.log('\n--- Recent Sign-offs ---');
    Object.entries(status.signoffs).forEach(([storyId, signoff]) => {
      const date = new Date(signoff.timestamp);
      console.log(`  ${storyId}: ${signoff.reviewer} (${date.toLocaleDateString()})`);
    });
  }

  console.log('');
}

/**
 * Print individual layer status
 * @param {string} name - Layer name
 * @param {Object} layer - Layer status
 * @param {string} description - Layer description
 */
function printLayerStatus(name, layer, description) {
  if (!layer) {
    console.log(`${name}: ⚪ Not run yet (${description})`);
    return;
  }

  const icon = layer.pass ? '✅' : '❌';
  const status = layer.pass ? 'Passed' : 'Failed';
  const duration = layer.duration ? ` (${formatDuration(layer.duration)})` : '';

  console.log(`${name}: ${icon} ${status}${duration} (${description})`);
}

/**
 * Get status icon
 * @param {string} status - Overall status
 * @returns {string} Status icon
 */
function getStatusIcon(status) {
  const icons = {
    'not-started': '⚪',
    'layer1-failed': '❌',
    'layer1-complete': '🟡',
    'layer2-blocked': '🟠',
    'layer2-complete': '🟡',
    'layer3-pending': '⏳',
    'passed': '✅',
    'unknown': '❓',
  };
  return icons[status] || '❓';
}

/**
 * Format overall status for display
 * @param {string} status - Status code
 * @returns {string} Human-readable status
 */
function formatOverallStatus(status) {
  const statusMap = {
    'not-started': 'Not Started',
    'layer1-failed': 'Layer 1 Failed',
    'layer1-complete': 'Layer 1 Complete',
    'layer2-blocked': 'Layer 2 Blocked',
    'layer2-complete': 'Layer 2 Complete',
    'layer3-pending': 'Awaiting Human Review',
    'passed': 'All Gates Passed',
    'unknown': 'Unknown',
  };
  return statusMap[status] || status;
}

/**
 * Format duration for display
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (!ms) return '0ms';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * Format time ago
 * @param {Date} date - Date to format
 * @returns {string} Time ago string
 */
function formatTimeAgo(date) {
  const now = Date.now();
  const diff = now - date.getTime();

  
```

---

# COMANDO - status.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\http-1.5.0\src\status.rs
**SHA:** d01b4288900f9418
**Timestamp:** 2026-08-28T02:34:16.883396
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // Invariant: self has checked range [100, 999] and CODE_DIGITS is

### Principios
- // Invariant: self has checked range [100, 999] and CODE_DIGITS is

### Ouro Bruto (primeiros 5000 chars)
```
//! HTTP status codes
//!
//! This module contains HTTP-status code related structs and errors. The main
//! type in this module is `StatusCode` which is not intended to be used through
//! this module but rather the `http::StatusCode` type.
//!
//! # Examples
//!
//! ```
//! use http::StatusCode;
//!
//! assert_eq!(StatusCode::from_u16(200).unwrap(), StatusCode::OK);
//! assert_eq!(StatusCode::NOT_FOUND, 404);
//! assert!(StatusCode::OK.is_success());
//! ```

use std::convert::TryFrom;
use std::error::Error;
use std::fmt;
use std::num::NonZeroU16;
use std::str::FromStr;

/// An HTTP status code (`status-code` in RFC 9110 et al.).
///
/// Constants are provided for known status codes, including those in the IANA
/// [HTTP Status Code Registry](
/// https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml).
///
/// Status code values in the range 100-999 (inclusive) are supported by this
/// type. Values in the range 100-599 are semantically classified by the most
/// significant digit. See [`StatusCode::is_success`], etc. Values above 599
/// are unclassified but allowed for legacy compatibility, though their use is
/// discouraged. Applications may interpret such values as protocol errors.
///
/// # Examples
///
/// ```
/// use http::StatusCode;
///
/// assert_eq!(StatusCode::from_u16(200).unwrap(), StatusCode::OK);
/// assert_eq!(StatusCode::NOT_FOUND.as_u16(), 404);
/// assert!(StatusCode::OK.is_success());
/// ```
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct StatusCode(NonZeroU16);

/// A possible error value when converting a `StatusCode` from a `u16` or `&str`.
///
/// This error indicates that the supplied input was not a valid number, was less
/// than 100, or was greater than 999.
pub struct InvalidStatusCode {
    _priv: (),
}

impl StatusCode {
    /// Converts a u16 to a status code.
    ///
    /// The function validates the correctness of the supplied u16. It must be
    /// greater or equal to 100 and less than 1000.
    ///
    /// # Example
    ///
    /// ```
    /// use http::StatusCode;
    ///
    /// let ok = StatusCode::from_u16(200).unwrap();
    /// assert_eq!(ok, StatusCode::OK);
    ///
    /// let err = StatusCode::from_u16(99);
    /// assert!(err.is_err());
    /// ```
    #[inline]
    pub const fn from_u16(src: u16) -> Result<StatusCode, InvalidStatusCode> {
        if let 100..=999 = src {
            if let Some(code) = NonZeroU16::new(src) {
                return Ok(StatusCode(code));
            }
        }
        Err(InvalidStatusCode::new())
    }

    /// Converts a `&[u8]` to a status code.
    pub fn from_bytes(src: &[u8]) -> Result<StatusCode, InvalidStatusCode> {
        if src.len() != 3 {
            return Err(InvalidStatusCode::new());
        }

        let a = src[0].wrapping_sub(b'0') as u16;
        let b = src[1].wrapping_sub(b'0') as u16;
        let c = src[2].wrapping_sub(b'0') as u16;

        if a == 0 || a > 9 || b > 9 || c > 9 {
            return Err(InvalidStatusCode::new());
        }

        let status = (a * 100) + (b * 10) + c;
        NonZeroU16::new(status)
            .map(StatusCode)
            .ok_or_else(InvalidStatusCode::new)
    }

    /// Returns the `u16` corresponding to this `StatusCode`.
    ///
    /// # Note
    ///
    /// This is the same as the `From<StatusCode>` implementation, but
    /// included as an inherent method because that implementation doesn't
    /// appear in rustdocs, as well as a way to force the type instead of
    /// relying on inference.
    ///
    /// # Example
    ///
    /// ```
    /// let status = http::StatusCode::OK;
    /// assert_eq!(status.as_u16(), 200);
    /// ```
    #[inline]
    pub const fn as_u16(&self) -> u16 {
        self.0.get()
    }

    /// Returns a &str representation of the `StatusCode`
    ///
    /// The return value only includes a numerical representation of the
    /// status code. The canonical reason is not included.
    ///
    /// # Example
    ///
    /// ```
    /// let status = http::StatusCode::OK;
    /// assert_eq!(status.as_str(), "200");
    /// ```
    #[inline]
    pub fn as_str(&self) -> &str {
        let offset = (self.0.get() - 100) as usize;
        let offset = offset * 3;

        // Invariant: self has checked range [100, 999] and CODE_DIGITS is
        // ASCII-only, of length 900 * 3 = 2700 bytes

        #[cfg(debug_assertions)]
        {
            &CODE_DIGITS[offset..offset + 3]
        }

        #[cfg(not(debug_assertions))]
        unsafe {
            CODE_DIGITS.get_unchecked(offset..offset + 3)
        }
    }

    /// Get the standardised `reason-phrase` for this status code.
    ///
    /// This is mostly here for servers writing responses, but could potentially have application
    /// at other times.
    ///
    /// The reason phrase is defined as being exclusively for human readers. You should avoid
    /// deriving any meaning from it at all costs.
    ///
    /// Bear in mind also
```