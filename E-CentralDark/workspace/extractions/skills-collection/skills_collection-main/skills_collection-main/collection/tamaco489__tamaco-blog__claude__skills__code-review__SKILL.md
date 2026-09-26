---
name: go-code-review
description: |
  Goコードのレビューと品質チェック。
  セキュリティ、パフォーマンス、Clean Architectureの観点から分析。PRレビュー、コード品質確認時に使用。
allowed-tools: Read, Grep, Glob, Bash, Write
---

# Go Code Review Skill

Go コードのレビューと品質チェックを行うスキルです。

## 対象

- `backend/api/` 配下の API サービス
- `backend/batch/` 配下のバッチ処理
- `.go` ファイルのみ（自動生成ファイルを除く）

## レビュー対象外

- `internal/gen/` 配下（OpenAPI 自動生成）
- `*.sql.go`（sqlc 自動生成）
- `vendor/` ディレクトリ

## レビュー観点

### 1. セキュリティ

- SQL インジェクションの検出
- コマンドインジェクションの検出
- 機密情報のハードコーディング確認
- 入力値検証の有無
- 参考: [OWASP Go-SCP](https://github.com/OWASP/Go-SCP)

### 2. パフォーマンス

- N+1 クエリの検出
- 不要なメモリ割り当て（append の多用）
- スライスの事前メモリ確保の推奨
- defer の適切な使用
- 参考: [Uber Go Style Guide - Performance](https://github.com/uber-go/guide/blob/master/style.md#performance)

### 3. Clean Architecture

- レイヤー間の依存関係（controller → usecase → repository）
- ドメイン層への外部依存の混入
- インターフェースによる依存性逆転
- 責務の分離

### 4. コーディング規約（プロジェクト固有）

- エラーメッセージは小文字で開始
- else 文の回避（早期リターン推奨）
- スライスの事前メモリ確保
- `any` の使用（`interface{}` 禁止）
- パッケージコメント必須（最大 2 行）
- ファイル末尾の改行
- 行末の空白禁止

### 5. コーディング規約（一般的な Go ベストプラクティス）

- 参考: [Effective Go](https://go.dev/doc/effective_go)
- 参考: [Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)
- 参考: [Uber Go Style Guide (JPN)](https://github.com/knsh14/uber-style-guide-ja)

### 6. エラーハンドリング

- エラーの適切なラップ（`fmt.Errorf("context: %w", err)`）
- エラーの握りつぶし検出
- センチネルエラーの適切な使用
- 参考: [Go Blog - Working with Errors](https://go.dev/blog/go1.13-errors)

## スキル構成

```
.claude/skills/code-review/
├── SKILL.md                        # このファイル
├── scripts/
│   └── get_go_diff.sh              # 差分取得スクリプト
└── templates/
    └── review-result.md            # レビュー結果テンプレート

.claude/rules/backend/
└── go-coding.md                    # プロジェクト固有の Go コーディングルール
```

## レビュー手順

1. **ベースブランチの確認（対話形式）**

   - ユーザーにベースブランチ（分岐元）を確認する
   - 例: 「レビュー対象のベースブランチを教えてください（例: main, release/v1.0）」
   - ベースブランチが指定されるまでレビューを開始しない

2. **変更範囲の特定**

   - 差分取得スクリプトを実行:
     ```bash
     .claude/skills/code-review/scripts/get_go_diff.sh {ベースブランチ}
     ```
   - スクリプトが自動で以下を実行:
     - 分岐元からの差分を取得
     - 自動生成ファイル（`internal/gen/`、`*.sql.go`、`vendor/`）を除外
     - 変更された Go ファイル一覧と統計を表示

3. **コーディング規約の確認**

   - `.claude/rules/backend/go-coding.md` を参照（プロジェクト固有ルール）
   - 上記「レビュー観点」セクションの外部リンクを参照（一般的な Go ベストプラクティス）
   - 特に以下を重視:
     - Uber Go Style Guide のエラーハンドリング・パフォーマンス指針
     - Go Code Review Comments の命名規則・コードスタイル
     - Effective Go の設計原則

4. **ファイル単位のレビュー**

   - 各ファイルの変更内容を確認
   - 上記観点でチェック

5. **レポート作成**

   - 問題点をカテゴリ別に整理
   - 重要度（Critical/Warning/Info）を付与
   - 改善提案を記載

6. **レポート出力の確認（対話形式）**

   - レビュー完了後、ユーザーに確認:
     - 「レビュー結果をファイルに出力しますか？（y/N）」
   - 「y」の場合:
     - 出力先: `backend/api/article/tmp/review/`
     - ファイル名: `{YYYYMMDD}_{ブランチ名}.md`
     - 例: `20241217_feature-add-auth.md`
   - 「N」または未指定の場合:
     - チャット上での表示のみ（ファイル出力なし）

## 出力フォーマット

テンプレートファイル: `templates/review-result.md` を参照

## 使用例

### ブランチのレビュー（対話形式）

```
ユーザー: このブランチをレビューして
Claude: レビュー対象のベースブランチを教えてください（例: main, release/v1.0）
ユーザー: main
Claude: （レビュー実行）
Claude: レビュー結果をファイルに出力しますか？（y/N）
ユーザー: y
Claude: backend/api/article/tmp/review/20241217_feature-add-auth.md に出力しました
```

### ベースブランチを指定してレビュー

```
mainブランチからの差分をレビューして
```

### 特定ファイルのレビュー

```
backend/api/article/internal/usecase/article_usecase.go をレビューして
```

## 注意事項

- このスキルはコードの変更は行いません（レビュー結果の出力のみ）
- 指摘事項は提案であり、最終判断は開発者が行ってください
- golangci-lint で検出可能な項目は `make lint` の実行を推奨します
- レビュー結果の出力先 `backend/api/article/tmp/review/` は `.gitignore` で管理外
