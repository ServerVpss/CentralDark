# OUTRO - aarch64.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\sha2-0.10.9\src\sha256\aarch64.rs
**SHA:** 18121a25867a575f
**Timestamp:** 2026-08-28T02:35:41.454202
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: stdarch intrinsics: RustCrypto/hashes#257
- // TODO: Replace with https://github.com/rust-lang/rfcs/pull/2725

### Ouro Bruto (primeiros 5000 chars)
```
//! SHA-256 `aarch64` backend.

// Implementation adapted from mbedtls.

// TODO: stdarch intrinsics: RustCrypto/hashes#257

use core::arch::{aarch64::*, asm};

use crate::consts::K32;

cpufeatures::new!(sha2_hwcap, "sha2");

pub fn compress(state: &mut [u32; 8], blocks: &[[u8; 64]]) {
    // TODO: Replace with https://github.com/rust-lang/rfcs/pull/2725
    // after stabilization
    if sha2_hwcap::get() {
        unsafe { sha256_compress(state, blocks) }
    } else {
        super::soft::compress(state, blocks);
    }
}

#[target_feature(enable = "sha2")]
unsafe fn sha256_compress(state: &mut [u32; 8], blocks: &[[u8; 64]]) {
    // SAFETY: Requires the sha2 feature.

    // Load state into vectors.
    let mut abcd = vld1q_u32(state[0..4].as_ptr());
    let mut efgh = vld1q_u32(state[4..8].as_ptr());

    // Iterate through the message blocks.
    for block in blocks {
        // Keep original state values.
        let abcd_orig = abcd;
        let efgh_orig = efgh;

        // Load the message block into vectors, assuming little endianness.
        let mut s0 = vreinterpretq_u32_u8(vrev32q_u8(vld1q_u8(block[0..16].as_ptr())));
        let mut s1 = vreinterpretq_u32_u8(vrev32q_u8(vld1q_u8(block[16..32].as_ptr())));
        let mut s2 = vreinterpretq_u32_u8(vrev32q_u8(vld1q_u8(block[32..48].as_ptr())));
        let mut s3 = vreinterpretq_u32_u8(vrev32q_u8(vld1q_u8(block[48..64].as_ptr())));

        // Rounds 0 to 3
        let mut tmp = vaddq_u32(s0, vld1q_u32(&K32[0]));
        let mut abcd_prev = abcd;
        abcd = vsha256hq_u32(abcd_prev, efgh, tmp);
        efgh = vsha256h2q_u32(efgh, abcd_prev, tmp);

        // Rounds 4 to 7
        tmp = vaddq_u32(s1, vld1q_u32(&K32[4]));
        abcd_prev = abcd;
        abcd = vsha256hq_u32(abcd_prev, efgh, tmp);
        efgh = vsha256h2q_u32(efgh, abcd_prev, tmp);

        // Rounds 8 to 11
        tmp = vaddq_u32(s2, vld1q_u32(&K32[8]));
        abcd_prev = abcd;
        abcd = vsha256hq_u32(abcd_prev, efgh, tmp);
        efgh = vsha256h2q_u32(efgh, abcd_prev, tmp);

        // Rounds 12 to 15
        tmp = vaddq_u32(s3, vld1q_u32(&K32[12]));
        abcd_prev = abcd;
        abcd = vsha256hq_u32(abcd_prev, efgh, tmp);
        efgh = vsha256h2q_u32(efgh, abcd_prev, tmp);

        for t in (16..64).step_by(16) {
            // Rounds t to t + 3
            s0 = vsha256su1q_u32(vsha256su0q_u32(s0, s1), s2, s3);
            tmp = vaddq_u32(s0, vld1q_u32(&K32[t]));
            abcd_prev = abcd;
            abcd = vsha256hq_u32(abcd_prev, efgh, tmp);
            efgh = vsha256h2q_u32(efgh, abcd_prev, tmp);

            // Rounds t + 4 to t + 7
            s1 = vsha256su1q_u32(vsha256su0q_u32(s1, s2), s3, s0);
            tmp = vaddq_u32(s1, vld1q_u32(&K32[t + 4]));
            abcd_prev = abcd;
            abcd = vsha256hq_u32(abcd_prev, efgh, tmp);
            efgh = vsha256h2q_u32(efgh, abcd_prev, tmp);

            // Rounds t + 8 to t + 11
            s2 = vsha256su1q_u32(vsha256su0q_u32(s2, s3), s0, s1);
            tmp = vaddq_u32(s2, vld1q_u32(&K32[t + 8]));
            abcd_prev = abcd;
            abcd = vsha256hq_u32(abcd_prev, efgh, tmp);
            efgh = vsha256h2q_u32(efgh, abcd_prev, tmp);

            // Rounds t + 12 to t + 15
            s3 = vsha256su1q_u32(vsha256su0q_u32(s3, s0), s1, s2);
            tmp = vaddq_u32(s3, vld1q_u32(&K32[t + 12]));
            abcd_prev = abcd;
            abcd = vsha256hq_u32(abcd_prev, efgh, tmp);
            efgh = vsha256h2q_u32(efgh, abcd_prev, tmp);
        }

        // Add the block-specific state to the original state.
        abcd = vaddq_u32(abcd, abcd_orig);
        efgh = vaddq_u32(efgh, efgh_orig);
    }

    // Store vectors into state.
    vst1q_u32(state[0..4].as_mut_ptr(), abcd);
    vst1q_u32(state[4..8].as_mut_ptr(), efgh);
}

// TODO remove these polyfills once SHA2 intrinsics land

#[inline(always)]
unsafe fn vsha256hq_u32(
    mut hash_efgh: uint32x4_t,
    hash_abcd: uint32x4_t,
    wk: uint32x4_t,
) -> uint32x4_t {
    asm!(
        "SHA256H {:q}, {:q}, {:v}.4S",
        inout(vreg) hash_efgh, in(vreg) hash_abcd, in(vreg) wk,
        options(pure, nomem, nostack, preserves_flags)
    );
    hash_efgh
}

#[inline(always)]
unsafe fn vsha256h2q_u32(
    mut hash_efgh: uint32x4_t,
    hash_abcd: uint32x4_t,
    wk: uint32x4_t,
) -> uint32x4_t {
    asm!(
        "SHA256H2 {:q}, {:q}, {:v}.4S",
        inout(vreg) hash_efgh, in(vreg) hash_abcd, in(vreg) wk,
        options(pure, nomem, nostack, preserves_flags)
    );
    hash_efgh
}

#[inline(always)]
unsafe fn vsha256su0q_u32(mut w0_3: uint32x4_t, w4_7: uint32x4_t) -> uint32x4_t {
    asm!(
        "SHA256SU0 {:v}.4S, {:v}.4S",
        inout(vreg) w0_3, in(vreg) w4_7,
        options(pure, nomem, nostack, preserves_flags)
    );
    w0_3
}

#[inline(always)]
unsafe fn vsha256su1q_u32(
    mut tw0_3: uint32x4_t,
    w8_11: uint32x4_t,
    w12_15: uint32x4_t,
) -> uint32x4_t {
    asm!(
        "SHA256SU1 {:v}.4S, {:v}.4S, {:v}.4S",
        i
```

---

# OUTRO - aarch64.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\sha2-0.10.9\src\sha512\aarch64.rs
**SHA:** 2ed929329a0fa661
**Timestamp:** 2026-08-28T02:35:41.693952
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Replace with https://github.com/rust-lang/rfcs/pull/2725

### Ouro Bruto (primeiros 5000 chars)
```
// Implementation adapted from mbedtls.

use core::arch::{aarch64::*, asm};

use crate::consts::K64;

cpufeatures::new!(sha3_hwcap, "sha3");

pub fn compress(state: &mut [u64; 8], blocks: &[[u8; 128]]) {
    // TODO: Replace with https://github.com/rust-lang/rfcs/pull/2725
    // after stabilization
    if sha3_hwcap::get() {
        unsafe { sha512_compress(state, blocks) }
    } else {
        super::soft::compress(state, blocks);
    }
}

#[target_feature(enable = "sha3")]
unsafe fn sha512_compress(state: &mut [u64; 8], blocks: &[[u8; 128]]) {
    // SAFETY: Requires the sha3 feature.

    // Load state into vectors.
    let mut ab = vld1q_u64(state[0..2].as_ptr());
    let mut cd = vld1q_u64(state[2..4].as_ptr());
    let mut ef = vld1q_u64(state[4..6].as_ptr());
    let mut gh = vld1q_u64(state[6..8].as_ptr());

    // Iterate through the message blocks.
    for block in blocks {
        // Keep original state values.
        let ab_orig = ab;
        let cd_orig = cd;
        let ef_orig = ef;
        let gh_orig = gh;

        // Load the message block into vectors, assuming little endianness.
        let mut s0 = vreinterpretq_u64_u8(vrev64q_u8(vld1q_u8(block[0..16].as_ptr())));
        let mut s1 = vreinterpretq_u64_u8(vrev64q_u8(vld1q_u8(block[16..32].as_ptr())));
        let mut s2 = vreinterpretq_u64_u8(vrev64q_u8(vld1q_u8(block[32..48].as_ptr())));
        let mut s3 = vreinterpretq_u64_u8(vrev64q_u8(vld1q_u8(block[48..64].as_ptr())));
        let mut s4 = vreinterpretq_u64_u8(vrev64q_u8(vld1q_u8(block[64..80].as_ptr())));
        let mut s5 = vreinterpretq_u64_u8(vrev64q_u8(vld1q_u8(block[80..96].as_ptr())));
        let mut s6 = vreinterpretq_u64_u8(vrev64q_u8(vld1q_u8(block[96..112].as_ptr())));
        let mut s7 = vreinterpretq_u64_u8(vrev64q_u8(vld1q_u8(block[112..128].as_ptr())));

        // Rounds 0 and 1
        let mut initial_sum = vaddq_u64(s0, vld1q_u64(&K64[0]));
        let mut sum = vaddq_u64(vextq_u64(initial_sum, initial_sum, 1), gh);
        let mut intermed = vsha512hq_u64(sum, vextq_u64(ef, gh, 1), vextq_u64(cd, ef, 1));
        gh = vsha512h2q_u64(intermed, cd, ab);
        cd = vaddq_u64(cd, intermed);

        // Rounds 2 and 3
        initial_sum = vaddq_u64(s1, vld1q_u64(&K64[2]));
        sum = vaddq_u64(vextq_u64(initial_sum, initial_sum, 1), ef);
        intermed = vsha512hq_u64(sum, vextq_u64(cd, ef, 1), vextq_u64(ab, cd, 1));
        ef = vsha512h2q_u64(intermed, ab, gh);
        ab = vaddq_u64(ab, intermed);

        // Rounds 4 and 5
        initial_sum = vaddq_u64(s2, vld1q_u64(&K64[4]));
        sum = vaddq_u64(vextq_u64(initial_sum, initial_sum, 1), cd);
        intermed = vsha512hq_u64(sum, vextq_u64(ab, cd, 1), vextq_u64(gh, ab, 1));
        cd = vsha512h2q_u64(intermed, gh, ef);
        gh = vaddq_u64(gh, intermed);

        // Rounds 6 and 7
        initial_sum = vaddq_u64(s3, vld1q_u64(&K64[6]));
        sum = vaddq_u64(vextq_u64(initial_sum, initial_sum, 1), ab);
        intermed = vsha512hq_u64(sum, vextq_u64(gh, ab, 1), vextq_u64(ef, gh, 1));
        ab = vsha512h2q_u64(intermed, ef, cd);
        ef = vaddq_u64(ef, intermed);

        // Rounds 8 and 9
        initial_sum = vaddq_u64(s4, vld1q_u64(&K64[8]));
        sum = vaddq_u64(vextq_u64(initial_sum, initial_sum, 1), gh);
        intermed = vsha512hq_u64(sum, vextq_u64(ef, gh, 1), vextq_u64(cd, ef, 1));
        gh = vsha512h2q_u64(intermed, cd, ab);
        cd = vaddq_u64(cd, intermed);

        // Rounds 10 and 11
        initial_sum = vaddq_u64(s5, vld1q_u64(&K64[10]));
        sum = vaddq_u64(vextq_u64(initial_sum, initial_sum, 1), ef);
        intermed = vsha512hq_u64(sum, vextq_u64(cd, ef, 1), vextq_u64(ab, cd, 1));
        ef = vsha512h2q_u64(intermed, ab, gh);
        ab = vaddq_u64(ab, intermed);

        // Rounds 12 and 13
        initial_sum = vaddq_u64(s6, vld1q_u64(&K64[12]));
        sum = vaddq_u64(vextq_u64(initial_sum, initial_sum, 1), cd);
        intermed = vsha512hq_u64(sum, vextq_u64(ab, cd, 1), vextq_u64(gh, ab, 1));
        cd = vsha512h2q_u64(intermed, gh, ef);
        gh = vaddq_u64(gh, intermed);

        // Rounds 14 and 15
        initial_sum = vaddq_u64(s7, vld1q_u64(&K64[14]));
        sum = vaddq_u64(vextq_u64(initial_sum, initial_sum, 1), ab);
        intermed = vsha512hq_u64(sum, vextq_u64(gh, ab, 1), vextq_u64(ef, gh, 1));
        ab = vsha512h2q_u64(intermed, ef, cd);
        ef = vaddq_u64(ef, intermed);

        for t in (16..80).step_by(16) {
            // Rounds t and t + 1
            s0 = vsha512su1q_u64(vsha512su0q_u64(s0, s1), s7, vextq_u64(s4, s5, 1));
            initial_sum = vaddq_u64(s0, vld1q_u64(&K64[t]));
            sum = vaddq_u64(vextq_u64(initial_sum, initial_sum, 1), gh);
            intermed = vsha512hq_u64(sum, vextq_u64(ef, gh, 1), vextq_u64(cd, ef, 1));
            gh = vsha512h2q_u64(intermed, cd, ab);
            cd = vaddq_u64(cd, intermed);

            // Rounds t + 2 and t + 3
            s1 = vsha512su1q_u64(vsha512su0q_u64(s1, s
```