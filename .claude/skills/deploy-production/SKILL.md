---
name: deploy-production
description: bokitime を本番（Firebase Hosting）にデプロイする。ビルドして dist を firebase hosting に反映する。ユーザーが「本番に反映」「デプロイして」「リリースして」のように依頼したときに使う。
---

# deploy-production

bokitime を本番（Firebase Hosting / project: `bokitime`）にデプロイするスキル。

本番URL: https://bokitime.web.app

## 仕組み（前提）

- 本番は **Firebase Hosting**。配信対象は `dist/`（`firebase.json` の `public: "dist"`）。
- デプロイ = `npm run build`（`tsc -b && vite build`）で `dist/` を生成し、`firebase deploy --only hosting` で反映する。
- `git push` や PR マージだけでは本番に反映されない。**ビルド＆デプロイが別途必要**。

## 手順

1. **デプロイ対象の状態を確認する**
   - `git branch --show-current` と `git log --oneline -1` で、デプロイしたい内容（通常は最新の `main`）にいることを確認する。
   - 未コミットの変更がある場合、それを含めてデプロイするのかユーザーに確認する。
     - 注意: ビルドはあくまで **作業ツリーの内容** から行われる。コミット状態とズレていると、後で clean ビルドした人がデグレを起こす原因になる。

2. **ビルドする**
   - `npm run build`
   - **ビルドエラーが出たら修正してから進む**。デプロイは成功ビルドが前提。
     - 既知の落とし穴: import のファイル名 casing 不一致（macOS では `vite build` 単体は通るが `tsc -b` が失敗する）。

3. **デプロイする**
   - `firebase deploy --only hosting`
   - `✔ Deploy complete!` と `Hosting URL` を確認する。

4. **結果を報告する**
   - 本番URL（https://bokitime.web.app）、デプロイしたコミット、反映内容を簡潔に伝える。

## 注意

- Firestore のルール / インデックスを変更した場合は `firebase deploy --only firestore` も必要（hosting とは別）。全部まとめてなら `firebase deploy`。
- ビルドを通すためにソースを修正した場合、その修正は **未コミットのまま残る**。本番には出ているが git 履歴に無い状態になるので、別途コミット（`branch-pr-merge` スキル等）してデグレを防ぐ。
- 本番デプロイは外向きの不可逆な操作。デプロイ実行前に、対象内容をユーザーに一言確認するのが望ましい。
