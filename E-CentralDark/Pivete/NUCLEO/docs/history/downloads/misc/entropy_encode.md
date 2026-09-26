# OUTRO - entropy_encode.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\brotli-8.0.4\src\enc\entropy_encode.rs
**SHA:** 1427f28f08179241
**Timestamp:** 2026-08-28T02:33:02.729795
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- fn Reverse(v: &mut [u8], mut start: usize, mut end: usize) {
- start = start.wrapping_add(1);
- let start: usize = *tree_size;
- let start: usize = *tree_size;

### Gaps
- let gap: usize = gaps[g as usize];

### Ouro Bruto (primeiros 5000 chars)
```
/* Copyright 2010 Google Inc. All Rights Reserved.

   Distributed under MIT license.
   See file LICENSE for detail or copy at https://opensource.org/licenses/MIT
*/

/* Entropy encoding (Huffman) utilities. */
use core::cmp::max;

#[derive(Clone, Copy, Default)]
pub struct HuffmanTree {
    pub total_count_: u32,
    pub index_left_: i16,
    pub index_right_or_value_: i16,
}

impl HuffmanTree {
    pub fn new(count: u32, left: i16, right: i16) -> Self {
        Self {
            total_count_: count,
            index_left_: left,
            index_right_or_value_: right,
        }
    }
}

pub fn BrotliSetDepth(p0: i32, pool: &mut [HuffmanTree], depth: &mut [u8], max_depth: i32) -> bool {
    let mut stack: [i32; 16] = [0; 16];
    let mut level: i32 = 0i32;
    let mut p: i32 = p0;
    stack[0] = -1i32;
    loop {
        if (pool[(p as usize)]).index_left_ as i32 >= 0i32 {
            level += 1;
            if level > max_depth {
                return false;
            }
            stack[level as usize] = (pool[(p as usize)]).index_right_or_value_ as i32;
            p = (pool[(p as usize)]).index_left_ as i32;
            {
                continue;
            }
        } else {
            let pp = pool[(p as usize)];
            depth[((pp).index_right_or_value_ as usize)] = level as u8;
        }
        while level >= 0i32 && (stack[level as usize] == -1i32) {
            level -= 1;
        }
        if level < 0i32 {
            return true;
        }
        p = stack[level as usize];
        stack[level as usize] = -1i32;
    }
}

pub trait HuffmanComparator {
    fn Cmp(&self, a: &HuffmanTree, b: &HuffmanTree) -> bool;
}
pub struct SortHuffmanTree {}
impl HuffmanComparator for SortHuffmanTree {
    fn Cmp(&self, v0: &HuffmanTree, v1: &HuffmanTree) -> bool {
        if v0.total_count_ != v1.total_count_ {
            v0.total_count_ < v1.total_count_
        } else {
            v0.index_right_or_value_ > v1.index_right_or_value_
        }
    }
}
pub fn SortHuffmanTreeItems<Comparator: HuffmanComparator>(
    items: &mut [HuffmanTree],
    n: usize,
    comparator: Comparator,
) {
    static gaps: [usize; 6] = [132, 57, 23, 10, 4, 1];
    if n < 13 {
        for i in 1..n {
            let mut tmp: HuffmanTree = items[i];
            let mut k: usize = i;
            let mut j: usize = i.wrapping_sub(1);
            while comparator.Cmp(&mut tmp, &mut items[j]) {
                items[k] = items[j];
                k = j;
                if {
                    let _old = j;
                    j = j.wrapping_sub(1);
                    _old
                } == 0
                {
                    break;
                }
            }
            items[k] = tmp;
        }
    } else {
        let mut g: i32 = if n < 57usize { 2i32 } else { 0i32 };
        while g < 6i32 {
            {
                let gap: usize = gaps[g as usize];
                for i in gap..n {
                    let mut j: usize = i;
                    let mut tmp: HuffmanTree = items[i];
                    while j >= gap && (comparator.Cmp(&mut tmp, &mut items[j.wrapping_sub(gap)])) {
                        {
                            items[j] = items[j.wrapping_sub(gap)];
                        }
                        j = j.wrapping_sub(gap);
                    }
                    items[j] = tmp;
                }
            }
            g += 1;
        }
    }
}

/* This function will create a Huffman tree.

The catch here is that the tree cannot be arbitrarily deep.
Brotli specifies a maximum depth of 15 bits for "code trees"
and 7 bits for "code length code trees."

count_limit is the value that is to be faked as the minimum value
and this minimum value is raised until the tree matches the
maximum length requirement.

This algorithm is not of excellent performance for very long data blocks,
especially when population counts are longer than 2**tree_limit, but
we are not planning to use this with extremely long blocks.

See https://en.wikipedia.org/wiki/Huffman_coding */
pub fn BrotliCreateHuffmanTree(
    data: &[u32],
    length: usize,
    tree_limit: i32,
    tree: &mut [HuffmanTree],
    depth: &mut [u8],
) {
    let sentinel = HuffmanTree::new(u32::MAX, -1, -1);
    let mut count_limit = 1u32;
    'break1: loop {
        {
            let mut n: usize = 0usize;
            let mut i: usize;
            let mut j: usize;
            let mut k: usize;
            i = length;
            while i != 0usize {
                i = i.wrapping_sub(1);
                if data[i] != 0 {
                    let count: u32 = max(data[i], count_limit);
                    tree[n] = HuffmanTree::new(count, -1, i as i16);
                    n = n.wrapping_add(1);
                }
            }
            if n == 1 {
                depth[((tree[0]).index_right_or_value_ as usize)] = 1u8;
                {
                    break 'break1;
                }
            }
            SortHuffmanT
```