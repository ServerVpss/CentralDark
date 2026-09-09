package main

import (
  "crypto/sha256"
  "encoding/hex"
  "encoding/json"
  "fmt"
  "os"
  "regexp"
  "strings"
)

type Plan struct {
  Schema string `json:"schema"`
  Status string `json:"status"`
  MaterialID string `json:"material_id"`
  Authority string `json:"authority"`
  UnknownIsNotPass bool `json:"unknown_is_not_pass"`
  Task string `json:"task"`
  Pipeline []string `json:"pipeline"`
  NextCursor string `json:"next_cursor"`
}

type rule struct { id string; re *regexp.Regexp; pipeline []string }

var rules = []rule{
  {"REDACT", regexp.MustCompile(`(?i)redact|reda[cç][aã]o|sigilo`), []string{"preflight","render_input","true_redaction","render_output","visual_diff","receipt"}},
  {"OCR", regexp.MustCompile(`(?i)ocr|scan|digitalizar|pesquis`), []string{"preflight","render_input","ocr","render_output","text_extract_verify","receipt"}},
  {"FORMS", regexp.MustCompile(`(?i)form|campo|acroform|preencher|flatten|checkbox`), []string{"preflight","inspect_forms","fill_or_stamp","render_output","field_value_verify","receipt"}},
  {"EXTRACT", regexp.MustCompile(`(?i)extract|extrair|tabela|imagem|anexo|texto|coordenada|layout`), []string{"preflight","render_input","extract","layout_verify","receipt"}},
  {"EDIT", regexp.MustCompile(`(?i)merge|split|rotate|crop|watermark|paginate|encrypt|repair|juntar|dividir|girar|cortar`), []string{"preflight","render_input","edit","render_output","visual_diff","receipt"}},
  {"CONVERT", regexp.MustCompile(`(?i)convert|converter|docx|pptx|html|markdown|latex`), []string{"choose_authoring_format","convert_to_pdf","render_output","glyph_layout_verify","receipt"}},
  {"CREATE", regexp.MustCompile(`(?i)create|criar|gerar|relat[oó]rio|documento`), []string{"choose_authoring_format","create_source","convert_or_render_pdf","render_output","glyph_layout_verify","receipt"}},
}

func buildPlan(intent string) Plan {
  task := "READ_REVIEW"
  pipeline := []string{"preflight","render_input","inspect_pngs","read_review","receipt"}
  for _, r := range rules { if r.re.MatchString(intent) { task = r.id; pipeline = r.pipeline; break } }
  sum := sha256.Sum256([]byte(intent))
  return Plan{"centraldark.pdf-harness-core.v1", "PLAN", hex.EncodeToString(sum[:])[:16], "SEGREDO/CHEFE", true, task, pipeline, "EXECUTE_SMALLEST_PDF_TASK_THROUGH_RENDER_VERIFY_LOOP"}
}

func main() {
  intent := strings.Join(os.Args[1:], " ")
  if intent == "" { intent = "review pdf" }
  plan := buildPlan(intent)
  out, err := json.MarshalIndent(plan, "", "  ")
  if err != nil { panic(err) }
  fmt.Println(string(out))
}
