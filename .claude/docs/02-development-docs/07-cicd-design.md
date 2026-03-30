# CI/CD 設計

## ワークフロー全体像

```
PR 作成・更新
  │
  ├─ lint       ESLint によるコード品質チェック
  ├─ typecheck  tsc --noEmit による型チェック
  ├─ test       Vitest によるユニット・コンポーネントテスト
  └─ build      next build によるビルド確認
  └─ preview    Vercel によるプレビューデプロイ（自動）

PR マージ（main ブランチ）
  │
  └─ deploy  Vercel による本番デプロイ（自動）

週次スケジュール
  └─ audit   npm audit による脆弱性スキャン
```

---

## GitHub Actions ワークフロー

### PR チェック（`.github/workflows/ci.yml`）

```yaml
name: CI

on:
  pull_request:
    branches: [main, dev]

jobs:
  check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm test -- --run

      - name: Build
        run: npm run build
```

### デプロイ（Vercel 自動デプロイ）

デプロイは **Vercel の Git 連携**によって自動的に行われる。GitHub Actions で明示的なデプロイジョブは不要。

| ブランチ    | デプロイ先     | URL                                                         |
| ----------- | -------------- | ----------------------------------------------------------- |
| `main`      | 本番環境       | `https://thumbnailpod.vercel.app`（またはカスタムドメイン） |
| PR ブランチ | プレビュー環境 | `https://<branch>-thumbnailpod.vercel.app`（自動発行）      |

**設定方法：**

1. Vercel ダッシュボードでプロジェクトを作成し GitHub リポジトリを連携
2. 本番ブランチを `main` に設定
3. 環境変数を Vercel ダッシュボードの Settings > Environment Variables で設定

### 脆弱性スキャン（`.github/workflows/audit.yml`）

```yaml
name: Security Audit

on:
  schedule:
    - cron: "0 9 * * 1" # 毎週月曜 9:00 JST
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm audit --audit-level=high
```

---

## ブランチ戦略

| ブランチ    | 用途       | 保護ルール                         |
| ----------- | ---------- | ---------------------------------- |
| `main`      | 本番環境   | PR 必須・CI 通過必須・直 push 禁止 |
| `dev`       | 開発・統合 | PR 推奨                            |
| `feature/*` | 機能開発   | -                                  |
| `fix/*`     | バグ修正   | -                                  |

---

## 環境変数管理

| 変数                       | 管理場所                       | 説明                     |
| -------------------------- | ------------------------------ | ------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | Vercel > Environment Variables | バックエンド API の URL  |
| `NEXT_PUBLIC_APP_URL`      | Vercel > Environment Variables | フロントエンドアプリ URL |

- **本番・プレビュー・開発**の 3 環境ごとに Vercel で個別の値を設定できる
- GitHub Actions の CI ジョブ（lint/typecheck/test/build）で環境変数が必要な場合は GitHub Secrets にも追加する
- ローカル開発では `.env.local` を使う（`.gitignore` に含める）

---

## ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動（http://localhost:3000）
npm run dev

# 型チェック
npx tsc --noEmit

# Lint
npm run lint

# ビルド確認
npm run build
```
