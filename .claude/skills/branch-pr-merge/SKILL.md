---
name: branch-pr-merge
description: 作業ツリーの未コミット変更を、新しいブランチ作成→コミット→push→PR作成→マージまで一気通貫で処理する。ユーザーが「新しいブランチを作ってコミットしてpushしてPR作ってマージして」のような一連の流れを依頼したときに使う。
---

# branch-pr-merge

作業ツリーの未コミット変更を、新ブランチ → コミット → push → PR → マージ まで一気に処理するスキル。

## 前提・規約

- **コミットメッセージ・PR は日本語で書く**（このリポジトリの規約）。
- PR のベースは `main`。
- `.claude/settings.local.json` は Claude のローカル設定なので **コミットに含めない**（明示的に依頼された場合を除く）。
- `gh` CLI を使用する。

## 手順

1. **変更内容を確認する**
   - `git status` と `git --no-pager diff` で、何が変わったか把握する。
   - 変更が複数の無関係なファイルにまたがる場合は、何をこのPRに含めるかユーザーに確認する。

2. **ブランチを作成する**
   - 変更内容から目的を表す kebab-case のブランチ名を決める。
     - 例: バグ修正 → `fix/...`、機能追加 → `feat/...`、雑務 → `chore/...`
   - `git checkout -b <branch-name>`

3. **コミットする**
   - 対象ファイルだけを `git add`（`.claude/settings.local.json` は除外）。
   - 変更内容を端的に説明する**日本語**のコミットメッセージでコミットする。
   - フッターに以下を付ける:
     ```
     Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
     ```

4. **push する**
   - `git push -u origin <branch-name>`

5. **PR を作成する**
   - `gh pr create --base main --head <branch-name> --title "<日本語タイトル>" --body "..."`
   - body は「## 概要」「## 変更内容」を日本語で記述し、末尾に:
     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)
     ```
   - `gh` が出す「Warning: N uncommitted change」は、除外した `settings.local.json` 等であれば問題ない。

6. **マージする**
   - `gh pr merge <PR番号> --merge --delete-branch`
   - これでリモート・ローカル両方のブランチが削除され、ローカル `main` も最新化される。

7. **結果を報告する**
   - PR番号・URL、マージ結果（コミット範囲）、残った未コミット変更があればその扱いを簡潔に伝える。

## 注意

- 本番（Firebase Hosting）への反映が必要な変更の場合、マージ後に `npm run build` → `firebase deploy --only hosting` が別途必要。マージ＝デプロイではない点をユーザーに確認する。
- マージ方式は既定で `--merge`（マージコミット）。ユーザーが squash / rebase を希望する場合は `--squash` / `--rebase` に切り替える。
