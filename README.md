<div align="center">

# ThumbnailPod — Frontend

**YouTube クリエイター向け AI サムネイル生成サービス**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](#)

</div>

---

## 概要

ThumbnailPod は、YouTube クリエイターが **プロンプトを入力するだけで AI がサムネイルを自動生成**し、そのまま YouTube に適用できるサービスです。

チャンネルの過去動画からスタイルを学習させることで、チャンネルのトーン＆マナーに合ったサムネイルを継続的に生成できます。

```
プロンプト入力
     │
     ▼
  AI 生成ジョブ（非同期）
     │
     ▼
  サムネイル完成
     │
     ├── ダウンロード
     └── YouTube へ直接適用
```

---

## 機能一覧

| 機能                  | 説明                                                   |
| --------------------- | ------------------------------------------------------ |
| **Google OAuth 認証** | YouTube アカウントでワンクリックログイン               |
| **AI サムネイル生成** | プロンプト入力 → 非同期生成 → 自動ポーリングで完了通知 |
| **スタイル学習**      | チャンネル動画を選択してオリジナルスタイルモデルを作成 |
| **生成履歴**          | 過去の生成ジョブ一覧・サムネイルのダウンロード         |
| **YouTube 直接適用**  | 生成したサムネイルを YouTube 動画に即時反映            |
| **プラン管理**        | 月次生成回数の確認・プランの表示                       |

---

## 技術スタック

### フロントエンド

| カテゴリ          | 技術                  | バージョン |
| ----------------- | --------------------- | ---------- |
| フレームワーク    | Next.js (App Router)  | 16         |
| UI ランタイム     | React                 | 19         |
| 言語              | TypeScript            | 5          |
| フォーム          | React Hook Form + Zod | -          |
| データフェッチ    | TanStack Query        | 5          |
| UI コンポーネント | shadcn/ui (Radix UI)  | -          |
| アイコン          | Lucide React          | -          |
| トースト          | Sonner                | -          |
| 日付処理          | date-fns              | -          |

### テスト

| カテゴリ                  | 技術                           |
| ------------------------- | ------------------------------ |
| ユニット / コンポーネント | Vitest + React Testing Library |
| E2E                       | Playwright                     |
| API モック                | MSW (Mock Service Worker)      |

### インフラ

| カテゴリ         | 技術                                              |
| ---------------- | ------------------------------------------------- |
| ホスティング     | Vercel                                            |
| CI               | GitHub Actions                                    |
| バックエンド API | Go (Echo) — REST API                              |
| AI 処理          | Python (FastAPI) — DALL-E 3 / Stable Diffusion XL |

---

## アーキテクチャ

```
ブラウザ
  │
  ├─── フロントエンド ──────────── Vercel（Next.js App Router）
  │         │
  │    Server Components       データフェッチ・認証チェック・レイアウト
  │         │ props
  │    Client Components       インタラクティブ UI・フォーム・ポーリング
  │
  └─── バックエンド API ─────────── ALB → ECS Fargate（Go）
                                              │
                                        AI サービス（Python FastAPI）
```

### ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/               # 認証不要ルート（/login, /auth/callback）
│   └── (dashboard)/          # 認証必須ルート（/ , /history, /style, /settings）
│       └── layout.tsx         # ← 認証チェックはここで一元管理
│
├── components/
│   ├── ui/                   # 汎用 UI（ロジックなし）
│   └── features/             # 機能コンポーネント（generation / history / style）
│
├── hooks/                    # カスタム hooks（useGenerationPolling 等）
├── lib/
│   ├── api/                  # バックエンド API クライアント
│   ├── auth/                 # 認証ユーティリティ
│   └── utils/                # 汎用ユーティリティ
│
├── types/                    # 共通型定義（API レスポンス型・ドメイン型）
└── constants/                # 定数（プラン上限・ステータス値）
```

---

## 画面構成

| 画面                           | パス               | 認証 |
| ------------------------------ | ------------------ | :--: |
| ログイン                       | `/login`           | 不要 |
| OAuth コールバック             | `/auth/callback`   | 不要 |
| ダッシュボード（生成フォーム） | `/`                | 必須 |
| 生成履歴                       | `/history`         | 必須 |
| ジョブ詳細                     | `/history/[jobId]` | 必須 |
| スタイル学習                   | `/style`           | 必須 |
| スタイル詳細                   | `/style/[modelId]` | 必須 |
| 設定・プラン                   | `/settings`        | 必須 |

---

## はじめ方

### 前提条件

- **Node.js** `>= 20`
- **npm** `>= 10`
- バックエンド API が起動していること（または `NEXT_PUBLIC_API_BASE_URL` に開発用 URL を指定）

### 1. リポジトリのクローン

```bash
git clone https://github.com/<your-org>/thumbnailpod-front.git
cd thumbnailpod-front
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` をルートに作成し、以下を設定します。

```bash
cp .env.local.example .env.local   # テンプレートがある場合
# または手動で作成
```

```env
# バックエンド API のベース URL（末尾スラッシュなし）
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# フロントエンドアプリの URL（OAuth リダイレクト先）
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **注意**: `.env.local` は `.gitignore` に含まれています。シークレット情報を `NEXT_PUBLIC_` プレフィックス付きの変数に入れないでください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開きます。

---

## スクリプト一覧

| コマンド              | 説明                                          |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | 開発サーバーを起動（ホットリロード付き）      |
| `npm run build`       | プロダクションビルドを生成                    |
| `npm run start`       | ビルド済みアプリをローカルで起動              |
| `npm run lint`        | ESLint による静的解析                         |
| `npx tsc --noEmit`    | TypeScript 型チェック                         |
| `npm test`            | Vitest でユニット・コンポーネントテストを実行 |
| `npm test -- --run`   | テストを一度だけ実行（CI 用）                 |
| `npx playwright test` | Playwright で E2E テストを実行                |

---

## テスト

### ユニット・コンポーネントテスト（Vitest）

```bash
# ウォッチモードで実行
npm test

# 一度だけ実行
npm test -- --run

# カバレッジ付きで実行
npm test -- --coverage
```

テストファイルはテスト対象と同じディレクトリに配置します。

```
src/components/features/ThumbnailCard.tsx
src/components/features/ThumbnailCard.test.tsx  ← 同階層
```

### E2E テスト（Playwright）

```bash
# ブラウザのインストール（初回のみ）
npx playwright install

# テスト実行
npx playwright test

# UI モードで実行（デバッグに便利）
npx playwright test --ui
```

E2E テストは `e2e/` ディレクトリに配置します。

---

## 認証フロー

```
1. GET /api/v1/auth/youtube/url
        │ Google OAuth 認証 URL を取得
        ▼
2. ユーザーを Google 認証ページへリダイレクト
        │
        ▼
3. Google → /auth/callback?code=...&state=...
        │
        ▼
4. POST /api/v1/auth/youtube/callback
        │ JWT（access + refresh）を HttpOnly Cookie に保存
        ▼
5. ダッシュボードへリダイレクト
        │ 以降は Cookie が自動付与される（credentials: 'include'）
```

| トークン      | 有効期限 |
| ------------- | -------- |
| Access Token  | 15 分    |
| Refresh Token | 30 日    |

401 エラー発生時は `/api/v1/auth/refresh` で自動リフレッシュします。

---

## プラン・生成上限

| プラン   | 月次生成上限 |
| -------- | ------------ |
| Free     | 10 回        |
| Creator  | 100 回       |
| Pro      | 500 回       |
| Business | 無制限       |

上限超過時はバックエンドが `429 Too Many Requests` を返します。

---

## CI/CD

### GitHub Actions（PR チェック）

`main` / `dev` ブランチへの PR 作成・更新時に以下が自動実行されます。

```
lint → typecheck → test → build
```

### デプロイ（Vercel 自動デプロイ）

| ブランチ    | デプロイ先                     |
| ----------- | ------------------------------ |
| `main`      | 本番環境                       |
| PR ブランチ | プレビュー環境（URL 自動発行） |

---

## ブランチ戦略

| ブランチ    | 用途       | 保護ルール                         |
| ----------- | ---------- | ---------------------------------- |
| `main`      | 本番環境   | PR 必須・CI 通過必須・直 push 禁止 |
| `dev`       | 開発・統合 | PR 推奨                            |
| `feature/*` | 機能開発   | —                                  |
| `fix/*`     | バグ修正   | —                                  |

### 開発フロー

```bash
# feature ブランチを dev から作成
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# 実装・コミット後、dev へ PR を作成
git push origin feature/your-feature-name
```

---

## 環境変数リファレンス

| 変数名                     | 必須 | 説明                                               |
| -------------------------- | :--: | -------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` |  ✓   | バックエンド API のベース URL                      |
| `NEXT_PUBLIC_APP_URL`      |  ✓   | フロントエンドアプリの URL（OAuth リダイレクト先） |

本番・プレビュー・開発の各環境ごとに Vercel の **Settings > Environment Variables** で設定します。

---

## 関連リポジトリ

| リポジトリ        | 説明                                     |
| ----------------- | ---------------------------------------- |
| `thumbnailpod-ai` | Go バックエンド API + Python AI サービス |

---

<div align="center">

Made with ❤️ for YouTube Creators

</div>
