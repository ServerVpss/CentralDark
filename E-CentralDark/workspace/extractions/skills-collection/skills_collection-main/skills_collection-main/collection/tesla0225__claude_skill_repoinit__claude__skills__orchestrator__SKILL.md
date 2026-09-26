---
name: orchestrator
description: Issue/要件を受けたら分解→担当割当→実装→検証→統合を回す手順。未整備なら /repo-init でbootstrap。
---

# Orchestrator Skill

## When to use
- ユーザーが Issue / 要件 / バグ修正 / 機能追加 を依頼してきたとき
- 変更が複数領域にまたがる、または複数担当（実装/テスト/ドキュメント）が必要なとき

## Inputs
- Issue / 要件（期待する挙動、制約、期限があれば）
- リポジトリ状態（構造、差分、テスト状況）
- `.claude/agents/` と `.claude/skills/` の有無

## Outputs
- 作業計画（タスク分解、担当、順序）
- 変更セット（コード・テスト・ドキュメント）
- 検証手順（コマンドと期待結果）
- レビュー観点（危険箇所、確認ポイント、Human review 必須点）

## Hard rules
- 不明点は推測で埋めない（質問 or TODO を出す）
- 大規模リファクタや破壊的変更は “人間レビュー必須” と明示して止める
- タスク分解→担当割当→実装→検証→統合 の順序を崩さない

## Procedure
### 0) Bootstrap check
- `.claude/agents/` や `.claude/skills/` が無い/不十分なら、まず `/repo-init` を実行して scaffold を生成する。
- 生成後、Subagent/Skill を “ファイルで追加した場合” は次回起動でロードされるため、指示どおり再起動を促す（/exit → `claude --continue`）。

### 1) Decompose
- 要件を「機能」「非機能（性能/セキュリティ/互換性）」「受け入れ条件」に分解
- 未確定点を列挙（質問 or TODO）

### 2) Assign
- 以下のようなsubagent を必ず使い、Todo内でアサインする
  - `implementer`: 実装
  - `test-runner`: テスト実行と失敗修正
  - `docs-updater`: ドキュメント更新
  - `skill-builder`: 新しい作業パターンを Skill 化
  - `skill-assigner`: Skills を subagent に割り当て整理
- それぞれの入出力（やって欲しいこと）を明確に渡す


### 3) Verify
- Subagentを必ず使って対応
- 最低限: build / lint / unit test（repoに合わせる）
- 期待結果も併記（成功条件、失敗時の扱い）

### 4) Integrate
- Subagentを必ず使って対応
- 変更をまとめて整合性確認
- README/設計メモ/運用手順が必要なら更新

### 5) Review notes
- Subagentを必ず使って対応
- リスク（破壊的変更、権限、課金、データ移行など）
- 人間レビュー必須ポイント
- ロールバック方針（必要なら）
