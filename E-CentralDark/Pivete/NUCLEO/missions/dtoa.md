# MISSAO - dtoa.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\dtoa-1.0.11\src\dtoa.rs
**SHA:** e5df6ba43308c529
**Timestamp:** 2026-08-28T02:34:04.865200
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = buf.bytes.as_mut_ptr().cast::<u8>();

### Ouro Bruto (primeiros 5000 chars)
```
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
// ---
//
// The C++ implementation preserved here in comments is licensed as follows:
//
// Tencent is pleased to support the open source community by making RapidJSON
// available.
//
// Copyright (C) 2015 THL A29 Limited, a Tencent company, and Milo Yip. All
// rights reserved.
//
// Licensed under the MIT License (the "License"); you may not use this file
// except in compliance with the License. You may obtain a copy of the License
// at
//
// http://opensource.org/licenses/MIT
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

use core::ptr;
#[cfg(feature = "no-panic")]
use no_panic::no_panic;

/*
inline unsigned CountDecimalDigit32(uint32_t n) {
    // Simple pure C++ implementation was faster than __builtin_clz version in this situation.
    if (n < 10) return 1;
    if (n < 100) return 2;
    if (n < 1000) return 3;
    if (n < 10000) return 4;
    if (n < 100000) return 5;
    if (n < 1000000) return 6;
    if (n < 10000000) return 7;
    if (n < 100000000) return 8;
    // Will not reach 10 digits in DigitGen()
    //if (n < 1000000000) return 9;
    //return 10;
    return 9;
}
*/

#[inline]
#[cfg_attr(feature = "no-panic", no_panic)]
pub fn count_decimal_digit32(n: u32) -> usize {
    if n < 10 {
        1
    } else if n < 100 {
        2
    } else if n < 1000 {
        3
    } else if n < 10000 {
        4
    } else if n < 100000 {
        5
    } else if n < 1000000 {
        6
    } else if n < 10000000 {
        7
    } else if n < 100000000 {
        8
    }
    // Will not reach 10 digits in digit_gen()
    else {
        9
    }
}

/*
inline char* WriteExponent(int K, char* buffer) {
    if (K < 0) {
        *buffer++ = '-';
        K = -K;
    }

    if (K >= 100) {
        *buffer++ = static_cast<char>('0' + static_cast<char>(K / 100));
        K %= 100;
        const char* d = GetDigitsLut() + K * 2;
        *buffer++ = d[0];
        *buffer++ = d[1];
    }
    else if (K >= 10) {
        const char* d = GetDigitsLut() + K * 2;
        *buffer++ = d[0];
        *buffer++ = d[1];
    }
    else
        *buffer++ = static_cast<char>('0' + static_cast<char>(K));

    return buffer;
}
*/

#[inline]
#[cfg_attr(feature = "no-panic", no_panic)]
unsafe fn write_exponent(mut k: isize, mut buffer: *mut u8) -> *mut u8 {
    if k < 0 {
        *buffer = b'-';
        buffer = buffer.add(1);
        k = -k;
    }

    if k >= 100 {
        *buffer = b'0' + (k / 100) as u8;
        k %= 100;
        let d = crate::DEC_DIGITS_LUT.as_ptr().offset(k * 2);
        ptr::copy_nonoverlapping(d, buffer.add(1), 2);
        buffer.add(3)
    } else if k >= 10 {
        let d = crate::DEC_DIGITS_LUT.as_ptr().offset(k * 2);
        ptr::copy_nonoverlapping(d, buffer, 2);
        buffer.add(2)
    } else {
        *buffer = b'0' + k as u8;
        buffer.add(1)
    }
}

/*
inline char* Prettify(char* buffer, int length, int k, int maxDecimalPlaces) {
    const int kk = length + k;  // 10^(kk-1) <= v < 10^kk
*/

#[inline]
#[cfg_attr(feature = "no-panic", no_panic)]
pub unsafe fn prettify(buffer: *mut u8, length: isize, k: isize) -> *mut u8 {
    let kk = length + k; // 10^(kk-1) <= v < 10^kk

    /*
    if (0 <= k && kk <= 21) {
        // 1234e7 -> 12340000000
        for (int i = length; i < kk; i++)
            buffer[i] = '0';
        buffer[kk] = '.';
        buffer[kk + 1] = '0';
        return &buffer[kk + 2];
    }
    */
    if 0 <= k && kk <= 21 {
        // 1234e7 -> 12340000000
        for i in length..kk {
            *buffer.offset(i) = b'0';
        }
        *buffer.offset(kk) = b'.';
        *buffer.offset(kk + 1) = b'0';
        buffer.offset(kk + 2)
    }
    /*
    else if (0 < kk && kk <= 21) {
        // 1234e-2 -> 12.34
        std::memmove(&buffer[kk + 1], &buffer[kk], static_cast<size_t>(length - kk));
        buffer[kk] = '.';
        if (0 > k + maxDecimalPlaces) {
            // When maxDecimalPlaces = 2, 1.2345 -> 1.23, 1.102 -> 1.1
            // Remove extra trailing zeros (at least one) after truncation.
            for (int i = kk + maxDecimalPlaces; i > kk + 1; i--)
                if (buffer[i] != '0')
                    return &buffer[i + 1];
            return &buffer[kk + 2]; // Reserve one zero
        }
        else
            return &buffer[length + 1];
    }
    */
    else if 0 < kk && kk <= 21 {
        // 1234e-2 -> 12.34
        ptr::copy(
            buffer.offset(kk),
            buffer.offset(
```