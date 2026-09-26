# COMANDO - thumbnail-audit.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\design-studio\tasks\thumbnail-audit.md
**SHA:** f2e914a0b07f4186
**Timestamp:** 2026-08-28T13:25:10.401718
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Expected Pattern:**

### Principios
- **Core Principle:** "Impressions without clicks is just YouTube showing you what could have been."

### Ouro Bruto (primeiros 5000 chars)
```
# Audit Existing Thumbnails and Identify Improvements

> Task ID: paddy-thumbnail-audit
> Agent: Paddy Galloway (YouTube Thumbnail Strategist)
> Version: 1.0.0

## Description

Systematically audit existing YouTube channel thumbnails to identify CTR issues, pattern problems, and improvement opportunities. Uses the Glance Test Framework to score thumbnails and the Emotion Hierarchy to diagnose emotional effectiveness.

**Core Principle:** "Impressions without clicks is just YouTube showing you what could have been."

## Prerequisites

- Access to YouTube Studio analytics
- Channel with at least 10 published videos
- Permission to view CTR data
- Thumbnail files or screenshots available

## Workflow

### Interactive Elicitation

1. **Gather Channel Information**
   - What is the channel URL or name?
   - What niche/category is the channel?
   - How many videos should we audit? (recommend last 20)
   - What is the channel's average CTR?

2. **Identify Performance Tiers**
   - Which videos have the highest CTR? (top 20%)
   - Which videos have the lowest CTR? (bottom 20%)
   - What's the CTR gap between top and bottom performers?

3. **Access Confirmation**
   - Can you export CTR data per video?
   - Are thumbnail files accessible for visual analysis?

### Steps

1. **Collect Performance Data**

   **Required Data Per Video:**
   - Video title
   - Thumbnail (visual)
   - CTR percentage
   - Impressions count
   - Views count
   - Publish date

   **Export Format:**
   ```
   | Video | CTR | Impressions | Views | Date |
   |-------|-----|-------------|-------|------|
   ```

   - Validation: Data collected for all target videos

2. **Establish Channel Benchmarks**

   **Calculate:**
   - Average CTR across all videos
   - Median CTR (less affected by outliers)
   - Top 20% CTR threshold
   - Bottom 20% CTR threshold

   **Compare to Niche:**

   | Niche | Low CTR | Average | Good | Excellent |
   |-------|---------|---------|------|-----------|
   | Entertainment | <6% | 8-12% | 12-15% | 15%+ |
   | Educational | <4% | 5-8% | 8-12% | 12%+ |
   | Tech Review | <3% | 4-6% | 6-10% | 10%+ |
   | Vlog | <2% | 3-5% | 5-8% | 8%+ |

   - Validation: Channel position vs niche documented

3. **Apply Glance Test to Each Thumbnail**

   **Scoring Protocol:**
   - Show thumbnail for 0.5 seconds
   - Score Layer 1 (Recognition): 0-3 points
   - Score Layer 2 (Emotion): 0-3 points
   - Score Layer 3 (Curiosity): 0-4 points
   - Total: 0-10 points

   **Glance Test Matrix:**
   ```
   | Video | CTR | L1 | L2 | L3 | Total | Correlation |
   |-------|-----|----|----|----| ------|-------------|
   ```

   - Validation: All thumbnails scored

4. **Map Emotions to Performance**

   **Emotion Categories:**
   - Curiosidade
   - Controversia
   - Aspiracao
   - Medo/Urgencia
   - Felicidade/Neutra

   **Analysis Questions:**
   - What emotion does each thumbnail convey?
   - Does the emotion match the content type?
   - What's the CTR correlation per emotion?

   **Expected Pattern:**
   - Curiosidade: Highest CTR average
   - Controversia: High CTR average
   - Aspiracao: Medium-high CTR
   - Felicidade: Low CTR average
   - Neutra: Lowest CTR average

   - Validation: Emotion-CTR correlation documented

5. **Analyze Face Usage**

   **Face Audit Metrics:**
   - % of thumbnails WITH face
   - % of thumbnails WITHOUT face
   - Average CTR with face vs without

   **Expression Analysis:**
   ```
   | Expression Type | Count | Avg CTR | vs Channel Avg |
   |-----------------|-------|---------|----------------|
   | Surpresa/Choque | N | X% | +Y% |
   | Curiosidade | N | X% | +Y% |
   | Determinacao | N | X% | +Y% |
   | Sorriso Generico | N | X% | -Y% |
   | Neutra | N | X% | -Y% |
   ```

   **Eye Direction Analysis:**
   - Direct camera
   - Looking at object
   - Off-camera

   - Validation: Face patterns documented

6. **Analyze Text Usage**

   **Text Audit Metrics:**
   - % with text vs without
   - Average word count
   - CTR correlation with word count

   **Text Type Breakdown:**
   ```
   | Text Type | Count | Avg CTR | Example |
   |-----------|-------|---------|---------|
   | Numbers | N | X% | "$1M", "30 DIAS" |
   | Questions | N | X% | "COMO?" |
   | Negatives | N | X% | "ERRO", "NAO" |
   | Descriptive | N | X% | "Tutorial" |
   | None | N | X% | - |
   ```

   - Validation: Text patterns documented

7. **Analyze Color Patterns**

   **Color Audit:**
   - Dominant color per thumbnail
   - Contrast level (high/medium/low)
   - Consistency with channel brand

   **High-Performer Colors:**
   - Document colors used in top 20% CTR videos
   - Document colors used in bottom 20% CTR videos
   - Identify winning color combinations

   - Validation: Color patterns documented

8. **Identify Pattern Problems**

   **Common Issues to Check:**
   - [ ] Sorriso generico as default (>50% of thumbs)
   - [ ] Expressoes muito sutis (low Glance L2 scores)
   - [ ] Texto demais (>3 words average)
   - [ ] Cores sem contraste (low visib
```