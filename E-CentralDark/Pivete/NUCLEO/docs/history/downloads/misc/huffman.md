# OUTRO - huffman.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\fdeflate-0.3.7\src\huffman.rs
**SHA:** e248ea58bb6f20e6
**Timestamp:** 2026-08-28T02:34:07.288672
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut subtable_start = 0;
- subtable_start = secondary_table.len();

### Ouro Bruto (primeiros 5000 chars)
```
use crate::decompress::{EXCEPTIONAL_ENTRY, LITERAL_ENTRY, SECONDARY_TABLE_ENTRY};

/// Return the next code, or if the codeword is already all ones (which is the final code), return
/// the same code again.
fn next_codeword(mut codeword: u16, table_size: u16) -> u16 {
    if codeword == table_size - 1 {
        return codeword;
    }

    let adv = (u16::BITS - 1) - (codeword ^ (table_size - 1)).leading_zeros();
    let bit = 1 << adv;
    codeword &= bit - 1;
    codeword |= bit;
    codeword
}

#[allow(clippy::needless_range_loop)]
pub fn build_table(
    lengths: &[u8],
    entries: &[u32],
    codes: &mut [u16],
    primary_table: &mut [u32],
    secondary_table: &mut Vec<u16>,
    is_distance_table: bool,
    double_literal: bool,
) -> bool {
    // Count the number of symbols with each code length.
    let mut histogram = [0; 16];
    for &length in lengths {
        histogram[length as usize] += 1;
    }

    // Determine the maximum code length.
    let mut max_length = 15;
    while max_length > 1 && histogram[max_length] == 0 {
        max_length -= 1;
    }

    // Handle zero and one symbol huffman codes (which are only allowed for distance codes).
    if is_distance_table {
        if max_length == 0 {
            primary_table.fill(0);
            secondary_table.clear();
            return true;
        } else if max_length == 1 && histogram[1] == 1 {
            let symbol = lengths.iter().position(|&l| l == 1).unwrap();
            codes[symbol] = 0;
            let entry = entries
                .get(symbol)
                .cloned()
                .unwrap_or((symbol as u32) << 16)
                | 1;
            for chunk in primary_table.chunks_mut(2) {
                chunk[0] = entry;
                chunk[1] = 0;
            }
            return true;
        }
    }

    // Sort symbols by code length. Given the histogram, we can determine the starting offset
    // for each code length.
    let mut offsets = [0; 16];
    let mut codespace_used = 0;
    offsets[1] = histogram[0];
    for i in 1..max_length {
        offsets[i + 1] = offsets[i] + histogram[i];
        codespace_used = (codespace_used << 1) + histogram[i];
    }
    codespace_used = (codespace_used << 1) + histogram[max_length];

    // Check that the provided lengths form a valid Huffman tree.
    if codespace_used != (1 << max_length) {
        return false;
    }

    // Sort the symbols by code length.
    let mut next_index = offsets;
    let mut sorted_symbols = [0; 288];
    for symbol in 0..lengths.len() {
        let length = lengths[symbol];
        sorted_symbols[next_index[length as usize]] = symbol;
        next_index[length as usize] += 1;
    }

    let mut codeword = 0u16;
    let mut i = histogram[0];

    // Populate the primary decoding table
    let primary_table_bits = primary_table.len().ilog2() as usize;
    let primary_table_mask = (1 << primary_table_bits) - 1;
    for length in 1..=primary_table_bits {
        let current_table_end = 1 << length;

        // Loop over all symbols with the current code length and set their table entries.
        for _ in 0..histogram[length] {
            let symbol = sorted_symbols[i];
            i += 1;

            primary_table[codeword as usize] = entries
                .get(symbol)
                .cloned()
                .unwrap_or((symbol as u32) << 16)
                | length as u32;

            codes[symbol] = codeword;
            codeword = next_codeword(codeword, current_table_end as u16);
        }

        if double_literal {
            for len1 in 1..(length - 1) {
                let len2 = length - len1;
                for sym1_index in offsets[len1]..next_index[len1] {
                    for sym2_index in offsets[len2]..next_index[len2] {
                        let sym1 = sorted_symbols[sym1_index];
                        let sym2 = sorted_symbols[sym2_index];
                        if sym1 < 256 && sym2 < 256 {
                            let codeword1 = codes[sym1];
                            let codeword2 = codes[sym2];
                            let codeword = codeword1 | (codeword2 << len1);
                            let entry = (sym1 as u32) << 16
                                | (sym2 as u32) << 24
                                | LITERAL_ENTRY
                                | (2 << 8);
                            primary_table[codeword as usize] = entry | (length as u32);
                        }
                    }
                }
            }
        }

        // If we aren't at the maximum table size, double the size of the table.
        if length < primary_table_bits {
            primary_table.copy_within(0..current_table_end, current_table_end);
        }
    }

    // Populate the secondary decoding table.
    secondary_table.clear();
    if max_length > primary_table_bits {
        let mut subtable_start = 0;
        let mut subtable_prefix = !0;
        for length in (primary_table_bits + 1)..=max
```