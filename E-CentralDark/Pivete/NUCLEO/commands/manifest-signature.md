# COMANDO - manifest-signature.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\src\installer\manifest-signature.js
**SHA:** 394fa10a848983c3
**Timestamp:** 2026-08-28T02:19:00.047904
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Replace with actual generated public key before production

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Manifest Signature Verification
 * Implements minisign-compatible signature verification for install manifests
 *
 * @module src/installer/manifest-signature
 * @story 6.19 - Post-Installation Validation & Integrity Verification
 * @security CRITICAL - This module establishes the root of trust
 *
 * Signing workflow (offline, by maintainers):
 *   minisign -Sm install-manifest.yaml -s /path/to/secret.key
 *
 * This creates install-manifest.yaml.minisig
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');

/**
 * Security limits for signature verification
 * @constant
 */
const SignatureLimits = {
  // Maximum manifest file size (10MB) - prevents DoS via large file loading
  MAX_MANIFEST_SIZE: 10 * 1024 * 1024,
  // Maximum signature file size (10KB) - .minisig files are typically ~200 bytes
  MAX_SIGNATURE_SIZE: 10 * 1024,
};

/**
 * PINNED PUBLIC KEY - MUST BE HARDCODED
 * This is the root of trust for manifest verification.
 * Generated with: minisign -G -p aios-core.pub -s aios-core.key
 *
 * Format: base64-encoded Ed25519 public key
 * DO NOT load this from external files or environment variables.
 */
const PINNED_PUBLIC_KEY = {
  // Key ID (8 bytes, base64 encoded) - opaque identifier, not UTF-8 text
  // This is compared as raw bytes against the signature's key ID
  keyId: Buffer.from('AIOS0001').toString('base64'), // 'QUlPUzAwMDE='
  // Ed25519 public key (32 bytes, base64 encoded)
  // TODO: Replace with actual generated public key before production
  publicKey: 'REPLACE_WITH_ACTUAL_PUBLIC_KEY_BASE64_HERE',
  // Algorithm identifier
  algorithm: 'Ed25519',
};

/**
 * Placeholder key identifier - used to detect uninitialized keys
 * @constant {string}
 */
const PLACEHOLDER_KEY = 'REPLACE_WITH_ACTUAL_PUBLIC_KEY_BASE64_HERE';

/**
 * Check if the pinned public key is still the placeholder
 * @returns {boolean} True if key needs to be replaced
 */
function isPlaceholderKey() {
  return PINNED_PUBLIC_KEY.publicKey === PLACEHOLDER_KEY;
}

/**
 * Signature verification result
 * @typedef {Object} VerificationResult
 * @property {boolean} valid - True if signature is valid
 * @property {string|null} error - Error message if invalid
 * @property {string|null} keyId - Key ID used for signing
 */

/**
 * Parse a minisign signature file
 * Minisign signature format:
 *   Line 1: untrusted comment
 *   Line 2: base64-encoded signature
 *   Line 3 (optional): trusted comment
 *   Line 4 (optional): base64-encoded global signature
 *
 * @param {string} signatureContent - Content of .minisig file
 * @returns {Object} Parsed signature components
 */
function parseMinisignSignature(signatureContent) {
  const lines = signatureContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('Invalid signature format: insufficient lines');
  }

  // Line 1: untrusted comment (starts with "untrusted comment: ")
  if (!lines[0].startsWith('untrusted comment:')) {
    throw new Error('Invalid signature format: missing untrusted comment');
  }

  // Line 2: base64 signature blob
  const signatureBlob = Buffer.from(lines[1].trim(), 'base64');

  if (signatureBlob.length < 74) {
    throw new Error('Invalid signature format: signature too short');
  }

  // Parse signature blob structure:
  // bytes 0-1: algorithm (Ed = 0x45 0x64)
  // bytes 2-9: key ID (8 bytes)
  // bytes 10-73: signature (64 bytes)
  const algorithm = signatureBlob.slice(0, 2).toString('ascii');
  const keyId = signatureBlob.slice(2, 10);
  const signature = signatureBlob.slice(10, 74);

  // Optional: trusted comment and global signature
  let trustedComment = null;
  let globalSignature = null;

  if (lines.length >= 4) {
    if (lines[2].startsWith('trusted comment:')) {
      trustedComment = lines[2].substring('trusted comment:'.length).trim();
      globalSignature = Buffer.from(lines[3].trim(), 'base64');
    }
  }

  return {
    algorithm,
    keyId,
    signature,
    trustedComment,
    globalSignature,
  };
}

/**
 * Verify Ed25519 signature using Node.js crypto
 *
 * @param {Buffer} message - Message that was signed
 * @param {Buffer} signature - 64-byte Ed25519 signature
 * @param {Buffer} publicKey - 32-byte Ed25519 public key
 * @returns {boolean} True if signature is valid
 */
function verifyEd25519(message, signature, publicKey) {
  try {
    // Node.js 16+ supports Ed25519 natively
    const keyObject = crypto.createPublicKey({
      key: Buffer.concat([
        // Ed25519 public key DER prefix
        Buffer.from('302a300506032b6570032100', 'hex'),
        publicKey,
      ]),
      format: 'der',
      type: 'spki',
    });

    return crypto.verify(null, message, keyObject, signature);
  } catch (_error) {
    // Fallback error - verification failed
    return false;
  }
}

/**
 * Compute Blake2b-512 hash for prehashed signatures
 * @param {Buffer} data - Data to hash
 * @returns {Buffer} 64-byte Blake2b-512 hash
 */
function blake2b512(data) {
  // Node.js 16+ supports blake2b512 natively
```