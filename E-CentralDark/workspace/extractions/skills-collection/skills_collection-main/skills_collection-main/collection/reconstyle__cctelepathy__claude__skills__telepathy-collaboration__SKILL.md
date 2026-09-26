---
name: telepathy-collaboration
description: This skill should be used when the user asks to "collaborate with other Claude instances", "communicate with another Claude", "send telepathy message", "check messages from other agents", "set up multi-agent workflow", "work as a team", "coordinate with other agents", or mentions "telepathy", "inter-agent communication", "multi-agent", "agent coordination", "チームで作業", "他のClaudeと協業", "エージェント間通信".
version: 2.0.0
---

# Telepathy Collaboration

cctelepathy を使用した Claude Code インスタンス間の協調作業ガイド。

## チーム協調フロー（JSON定義）

```json
{
  "version": "2.0",

  "prerequisites": {
    "mcp_connection": {
      "required": true,
      "check": "telepathy_list must succeed",
      "on_failure": "スキルフロー開始不可。MCP接続を確認"
    }
  },

  "roles": {
    "leader": {
      "description": "ユーザーとの窓口。チーム調整役",
      "can_talk_to_user": true
    },
    "member": {
      "description": "リーダー指示で作業。テレパシー経由で報告",
      "can_talk_to_user": false,
      "exceptions": ["escalation", "leader_mia"]
    }
  },

  "states": {
    "before_work": {
      "description": "作業開始前",
      "leader_priority": "user_input",
      "member_priority": "telepathy_wait"
    },
    "during_work": {
      "description": "作業中",
      "leader_priority": "telepathy_wait",
      "member_priority": "telepathy_wait"
    },
    "after_work": {
      "description": "全員完了後",
      "leader_priority": "user_input",
      "member_priority": "user_input",
      "trigger": "all_claudes_completed"
    }
  },

  "startup_flow": {
    "step_1": {
      "action": "telepathy_list",
      "purpose": "MCP接続確認 + チーム状況確認",
      "on_failure": "スキル終了。MCP未接続"
    },
    "step_2": {
      "condition": "no_leader_identified",
      "action": "AskUserQuestion",
      "question": {
        "header": "リーダー",
        "question": "このセッションのリーダーは誰ですか？",
        "options": [
          {"label": "自分", "description": "このClaudeがリーダーとして調整役を担う"},
          {"label": "他のClaude", "description": "既にリーダーがいる。メンバーとして待機"},
          {"label": "単独作業", "description": "チーム協調なし。通常モード"}
        ]
      }
    },
    "step_3_leader": {
      "condition": "role == leader",
      "action": "await_user_input",
      "state": "before_work"
    },
    "step_3_member": {
      "condition": "role == member",
      "action": "telepathy_wait_loop"
    }
  },

  "member_wait_loop": {
    "timeout_seconds": 60,
    "note": "Droid has ~60s MCP timeout limit; use shorter timeout with retry loop",
    "retry_pattern": {
      "max_retries": 60,
      "effective_wait_minutes": 60,
      "description": "60回 × 60秒 = 最大60分の待機を短いタイムアウトで実現",
      "reset_total_wait_on_message": false
    },
    "on_message": "process_and_continue (total_wait does NOT reset)",
    "on_timeout": {
      "action": "increment timeout_count and total_wait, then continue loop",
      "leader_check": {
        "condition": "timeout_count % 3 == 0",
        "action": "telepathy_send",
        "content": "see escalation_messages.leader_timeout"
      },
      "user_escalation": "see escalation.user_escalation for condition and action"
    },
    "exit_conditions": [
      "END message with 'user_control'",
      "state == after_work",
      "timeout_count >= member_wait_loop.retry_pattern.max_retries (60回、60分)",
      "total_wait >= member_wait_loop.retry_pattern.effective_wait_minutes * 60 (60分)"
    ]
  },

  "escalation_messages": {
    "leader_timeout": "タイムアウト。リーダー、指示ありますか？"
  },

  "escalation_limits": {
    "max_retries": 60,
    "effective_wait_seconds": 3600
  },

  "escalation": {
    "leader_check": {
      "timeout_count_threshold": 3,
      "description": "3回タイムアウトごとにリーダーへ確認メッセージを送信",
      "message": "see escalation_messages.leader_timeout"
    },
    "user_escalation": {
      "condition": "timeout_count >= escalation_limits.max_retries OR total_wait >= escalation_limits.effective_wait_seconds",
      "action": "AskUserQuestion",
      "message": "最大待機時間に到達しました。指示をお願いします",
      "description": "timeout_count >= escalation_limits.max_retries OR total_wait >= escalation_limits.effective_wait_seconds でユーザーへエスカレーション"
    }
  },

  "leader_failover": {
    "trigger": "leader_disconnected",
    "detection": "telepathy_list でリーダー不在確認",
    "action": "AskUserQuestion で次のリーダー選択"
  },

  "session_recovery": {
    "on_restart": "telepathy_history で最後の状態確認",
    "role_check": "最後のメッセージから役割推測",
    "if_unclear": "AskUserQuestion で役割確認"
  }
}
```

## Quick Start

### Option A: `/telepathy` コマンド（推奨）

```text
/telepathy
```

コマンドが以下をガイドします：

1. 役割選択（リーダー / メンバー / カスタム）
2. 詳細設定（コンピテンス、性格、振る舞い）
3. `telepathy_start` の自動呼び出し

### Option B: 手動セットアップ

#### 1. MCP接続確認 + 名前・ロール設定

```text
telepathy_list()                              # 接続確認（必須）

# 基本的な参加
telepathy_start({ name: "your-name" })

# ロール付き参加（推奨）
telepathy_start({
  name: "Holmes",
  role: "leader",
  preferredSkills: ["pr-review-toolkit:code-reviewer"],
  profile: {
    competence: ["Architecture", "Code Review"],
    personality: "Methodical and thorough"
  }
})
```

> **重要**: `telepathy_list` が失敗する場合、MCP未接続。このスキルは使用不可。

#### 2. 役割確認

リーダーが不明な場合、`AskUserQuestion` でユーザーに確認:

- **自分がリーダー** → ユーザー入力待ち
- **他がリーダー** → `telepathy_wait()` ループ開始
- **単独作業** → 通常モード（チーム協調なし）

## ロール設定（Issue #11）

### 概要

チームメンバーにロールとプロファイルを設定し、様々な組み合わせを探求できます。

### ロール定義

| ロール | 説明 | 詳細 |
|--------|------|------|
| leader | チーム統括、タスク管理 | [leader.md](roles/leader.md) |
| member | タスク実行、報告 | [member.md](roles/member.md) |
| custom | 自由設定 | - |

### プロファイル構造

```typescript
{
  name: string;           // 名前
  role: string;           // "leader" | "member" | カスタム
  preferredSkills: [];    // 使用すべきスキル
  profile: {
    competence: [];       // 何を成し遂げられるか
    personality: string;  // 性格
    strengths: [];        // 強み
    behavior: {
      style: string;      // proactive | reactive
      communication: string;
      focus: string;
    }
  }
}
```

### コンピテンス → スキルマッピング

Claude がコンピテンスを見て、推奨スキルを判断します：

| コンピテンス | → preferredSkills |
|-------------|-------------------|
| TypeScript実装, テスト作成 | `pr-review-toolkit:code-reviewer` |
| UI/UXデザイン | `frontend-design:frontend-design` |
| 品質レビュー, セキュリティ | `pr-review-toolkit:silent-failure-hunter` |

### セッション復帰時のコンテキスト注入

コンパクト後、Hook経由でロール情報が注入されます：

```markdown
## Your Telepathy Session
- Name: Holmes
- Role: leader
- Competence: Architecture, Code Review
- Preferred skills: pr-review-toolkit:code-reviewer

Remember to embody your character.
```

## 役割別の動作

### リーダー

| 状態 | 優先 | 動作 |
|------|------|------|
| 作業前 | ユーザー入力 | タスク受付、チームへ指示出し |
| 作業中 | テレパシー | メンバー報告確認、調整 |
| 作業後 | ユーザー入力 | 結果報告、次の指示待ち |

**リーダーの責務:**

- タスクの分解・割り当て
- 進捗確認・状況把握
- 技術的アドバイスの提供
- ブロッカーの解消支援
- 最終確認・マージ判断

**やってはいけないこと:**

- **委任したタスクを自分で実装する** ← 重要
- メンバーの作業を待たずに先回り
- 確認なしでメンバーの成果物を上書き

### メンバー

| 状態 | 優先 | 動作 |
|------|------|------|
| 作業前 | テレパシー待機 | リーダー指示待ち |
| 作業中 | テレパシー待機 | 作業 → 報告 → 待機 |
| 作業後 | ユーザー入力 | 全員完了後のみ |

**メンバーの原則:**

- **起動後は即 `telepathy_wait()` でリーダー指示待ち**
- **テレパシー待機 > ユーザー入力待ち**（優先度）
- **ユーザーへの直接質問は原則禁止** → リーダー経由で確認

## 待機ループ

### メンバーの待機パターン

**注意**: Droid には約60秒の MCP タイムアウト制限があります。長時間の待機を実現するには、短いタイムアウトでリトライループを使用します。

```text
timeout_count = 0
total_wait = 0  // 総待機時間（秒）
max_retries = 60  // 60回 × 60秒 = 最大60分
max_wait_minutes = 60  // escalation.max_wait_minutes

while (作業中 && timeout_count < max_retries && total_wait < max_wait_minutes * 60) {
  telepathy_wait(timeout: 60)  // Droid MCP制限に対応した60秒待機

  if (message_received) {
    process_message()
    timeout_count = 0  // timeout_countのみリセット（total_waitはリセットしない）
    continue
  }

  if (timeout) {
    timeout_count++
    total_wait += 60  // 総待機時間更新（60秒タイムアウト × 1回）

    // Leader check: 3回タイムアウトごとに確認
    if (timeout_count % 3 == 0) {
      telepathy_send("タイムアウト。リーダー、指示ありますか？")
    }

    // User escalation: max_retries到達 OR 総待機時間超過
    if (timeout_count >= max_retries || total_wait >= max_wait_minutes * 60) {
      AskUserQuestion("最大待機時間に到達しました。指示をお願いします")
      break
    }
    continue
  }
}
```

### 待機ループ終了条件

- END メッセージで「ユーザー制御: 復帰OK」を受信
- 状態が `after_work` に遷移（全員完了）
- エスカレーション後、ユーザーが終了指示

## エスカレーション

### メンバーがユーザーに話せる例外

1. **タイムアウト60回** or **60分経過** でリーダー無応答（注: 3回ごとにリーダーチェックメッセージ送信）
2. **致命的エラー** でリーダーも対応不可
3. **リーダーから明示的に「ユーザーに確認して」と指示**

### リーダー不在時（Failover）

```text
1. telepathy_list でリーダー不在を検知
2. AskUserQuestion で次のリーダーを選択
   - 自分がリーダーになる
   - 他のClaudeを指名
   - 作業終了
```

## セッション復帰

コンパクト後やセッション再起動時:

```text
1. telepathy_list() で接続確認
2. telepathy_history() で最後の状態確認
3. 自分の役割を推測（最後のメッセージから）
4. 不明な場合 → AskUserQuestion で確認
5. 役割に応じて動作再開
```

## 未読メッセージ通知

`📬 N unread message(s)` が表示されたら、即座に確認:

```text
📬 2 unread message(s) from: Mutta, Hibito
↓
# 状況に応じて選択:
telepathy_read()      # プレビュー確認 + 既読化（推奨）
telepathy_unread()    # プレビュー確認のみ（作業中）
telepathy_history()   # 全文確認したい場合
```

**特にチーム作業中は、未読通知を見逃さないこと。**

### 使い分けの例

- **作業開始時・復帰時**: `telepathy_read()` で未読を確認して既読化
- **作業中**: `telepathy_unread()` でチラ見、重要なら後で詳細確認
- **詳細確認**: `telepathy_history()` で全文表示、検索・フィルタ利用

## 基本ツール一覧

| ツール | 用途 | どういう時に便利か |
|--------|------|-------------------|
| `telepathy_start` | 名前設定 + 参加通知 + コンテキスト取得 | チーム作業開始時。参加を宣言し、最近のコンテキストを取得 |
| `telepathy_list` | 接続中インスタンス一覧（MCP接続確認） | 誰がオンラインか確認。MCP接続確認にも使用 |
| `telepathy_send` | 全員にブロードキャスト | チーム全体への通知・報告・質問 |
| `telepathy_send_to` | 特定相手へ DM | 特定のメンバーへの個別指示・質問 |
| `telepathy_history` | メッセージ履歴取得（検索・フィルタ可） | 過去の会話確認、特定メッセージ検索、詳細確認 |
| `telepathy_wait` | メッセージ待機（イベント駆動、推奨） | リアルタイムでメッセージを待つ。メンバーの待機ループに最適 |
| `telepathy_read` | 未読プレビュー + 既読化 | 朝のキャッチアップ、未読を確認して既読にする |
| `telepathy_unread` | 未読プレビューのみ（既読化しない） | 作業中断せずにチラ見、後で詳細確認予定のメッセージ |
| `telepathy_ack` | 既読マーク更新（本文表示なし） | ブロードキャスト一括既読、重要DM以外を既読化（target: broadcast/dm/all） |
| `telepathy_project_init` | プロジェクト初期化 | ブランチ作成後、プロジェクトコンテキストを設定 |
| `telepathy_project_update` | プロジェクト状態更新 | PR番号追加、ステータス変更 |
| `telepathy_project_status` | プロジェクト状態取得 | 決定履歴、ブロッカー、マイルストーン確認 |

## プロジェクトステータス追跡（Issue #128）

チームで共有するプロジェクトコンテキストを管理する機能。

### ワークフロー

```text
1. telepathy_start          → ネットワーク参加
2. git checkout -b branch   → ブランチ作成
3. telepathy_project_init   → プロジェクト初期化（branch必須）
4. 作業中に myStatus/teamUpdate を送信
5. telepathy_project_status → コンパクト復帰時にコンテキスト確認
```

### myStatus（個人ステータス）

`telepathy_send` の `myStatus` パラメータで個人の状態を共有：

```typescript
myStatus: {
  current: "スキーマ拡張実装中",  // 現在のタスク
  assignment: "Phase 1",          // 割り当て
  stuck: ["型定義が複雑"],        // 個人的な課題
  nextTask: "typecheck 実行"      // 次のタスク
}
```

### teamUpdate（チーム共有情報）

`telepathy_send` の `teamUpdate` パラメータでチーム全体に影響する情報を共有：

```typescript
teamUpdate: {
  decisions: [{
    what: "zod バージョン",
    value: "4.1.8",
    why: "互換性のため"
  }],
  blockers: ["CodeRabbit レビュー待ち"],
  nextMilestone: "PR マージ"
}
```

### stuck vs blockers の使い分け

| 状況 | フィールド | 心理的意味 |
|------|-----------|-----------|
| 理解不足、技術的な悩み | `myStatus.stuck` | 「助けてもらえると嬉しい」 |
| 外部待ち（PR、レビュー） | `teamUpdate.blockers` | 「外部要因で止まっている」 |
| 環境問題 | `teamUpdate.blockers` | 「チーム全体に影響」 |

### いつ teamUpdate を送るか

```text
✅ 重要な技術決定をした時 → decisions
✅ ブロッカーが発生/解消した時 → blockers
✅ マイルストーンを達成/更新した時 → nextMilestone

❌ 単なる進捗報告 → myStatus.current を使用
❌ 毎回のメッセージ → 負担が大きい
```

### blockers の上書き動作

`blockers` は追加ではなく**上書き**。現在のブロッカー完全リストを送信：

```typescript
// 最初: テスト失敗のみ
blockers: ["テスト失敗調査中"]

// 解決して新しいブロッカー発生 → 前のは含めない
blockers: ["CodeRabbit レビュー待ち"]

// 解消したら空配列
blockers: []
```

## 作業モード

```json
{
  "collaboration_modes": {
    "default": "parallel_coordination",

    "parallel_coordination": {
      "description": "テレパシー並列協調（デフォルト）",
      "work": "並列（役割分担）",
      "commit": "順次（コンフリクト回避）",
      "when": "チーム協調作業（gtr不要）",
      "flow": [
        {"step": 1, "action": "リーダーがタスク・役割を割り当て"},
        {"step": 2, "action": "各自が並列作業（編集/レビュー/調査/調整）"},
        {"step": 3, "action": "テレパシーでリアルタイム確認・フィードバック"},
        {"step": 4, "action": "コミットは1人ずつ（コンフリクト回避）"}
      ],
      "roles": [
        "編集担当: コード実装",
        "レビュー担当: コードレビュー（並行可）",
        "調査担当: ドキュメント・コード調査（並行可）",
        "調整担当: ファシリテート（並行可）"
      ],
      "rules": [
        "役割分担で並列作業",
        "コミット前にチームで確認"
      ]
    },

    "parallel_branches": {
      "description": "ブランチ並列（gtr使用時）",
      "work": "並列",
      "commit": "並列（各自ブランチ）",
      "when": "独立したタスクを複数人で同時実装",
      "requires": {
        "gtr_installed": "git gtr --version"
      },
      "setup": {
        "description": "初回セットアップ（必須）",
        "command": "git gtr config set gtr.hook.postCreate \"npm install && npm run typecheck && npm run build\"",
        "note": "hookでworktree作成後に自動実行される。npm以外(yarn/pnpm等)は適宜変更"
      },
      "verification": {
        "check_hook": "git gtr config get gtr.hook.postCreate",
        "expected": "npm install && npm run typecheck && npm run build"
      },
      "flow": [
        {"step": 1, "action": "git gtr new <branch>", "note": "hookが自動でnpm install等を実行"},
        {"step": 2, "action": "cd ../<branch-sanitized>", "note": "worktreeに移動（例: feat/foo → feat-foo）"},
        {"step": 3, "action": "telepathy_send", "content": "着手: #XX 担当: <files>"},
        {"step": 4, "action": "work", "constraint": "担当ファイルのみ編集"},
        {"step": 5, "action": "git push && gh pr create"},
        {"step": 6, "action": "telepathy_send", "content": "完了: #XX PR: <url>"},
        {"step": 7, "action": "git gtr rm <branch>"}
      ],
      "common_mistakes": [
        {"wrong": "git checkout <branch>", "correct": "git gtr new <branch>", "reason": "checkoutはworktreeを作成しない"},
        {"wrong": "元ディレクトリで作業", "correct": "worktreeディレクトリに移動して作業", "reason": "同じディレクトリで複数ブランチ作業は混乱の元"},
        {"wrong": "hook未設定で作業開始", "correct": "setupコマンドで事前設定", "reason": "npm install忘れを防ぐ"}
      ],
      "rules": [
        "worktree作成時にtelepathy_sendで宣言",
        "同じファイルは先に宣言した人が優先",
        "完了時にtelepathy_sendでPR URL共有"
      ],
      "conflict_resolution": {
        "priority": "first_declaration",
        "escalation": "leader_arbitration"
      }
    }
  }
}
```

### gtr クイックリファレンス（parallel_branches用）

| コマンド | 説明 |
|----------|------|
| `git gtr list` | worktree一覧 |
| `git gtr new <branch>` | worktree作成 |
| `git gtr ai <branch>` | Claude起動（初期設定済み時） |
| `git gtr rm <branch>` | worktree削除 |

## 参照ドキュメント

- [メッセージプロトコル v1.0](references/protocol-v1.md)
- [Hook 設定ガイド](references/hook-config.md)
- [ベストプラクティス](references/best-practices.md)
- [gtr公式リポジトリ](https://github.com/coderabbitai/git-worktree-runner)

## 実践例

- [PR レビュー協業](examples/pr-review.md)
- [調査分担](examples/research-team.md)
