# ThumbnailPod フロントエンド — プロジェクト概要

## サービスの目的

YouTube クリエイター向けの **AI サムネイル生成サービス** のフロントエンド。
ユーザーは YouTube アカウントで認証し、プロンプト入力やチャンネルのスタイル学習をもとに AI サムネイルを生成・YouTube へ直接適用できる。

---

## 技術スタック

| 項目           | 内容                                                         |
| -------------- | ------------------------------------------------------------ |
| フレームワーク | Next.js 16 (App Router)                                      |
| 言語           | TypeScript 5                                                 |
| UI ランタイム  | React 19                                                     |
| スタイリング   | TBD（CSS Modules 推奨）                                      |
| 状態管理       | TBD（Server Components 中心 + React state / TanStack Query） |
| テスト         | TBD（Vitest + React Testing Library + Playwright）           |
| デプロイ       | Vercel                                                       |

---

## 主要機能

| 機能              | 説明                                                      |
| ----------------- | --------------------------------------------------------- |
| Google OAuth 認証 | YouTube アカウントでログイン・JWT 取得                    |
| サムネイル生成    | プロンプト入力 → AI 生成ジョブ作成 → ポーリングで完了待機 |
| 生成履歴          | 過去の生成ジョブ一覧・サムネイルのダウンロード            |
| スタイル学習      | チャンネル動画を選択してスタイルモデルを作成              |
| YouTube 適用      | 生成したサムネイルを YouTube 動画に直接適用               |
| プラン管理        | 月次生成回数の確認・プラン表示                            |

---

## バックエンド API

バックエンドは Go (Echo) で実装された REST API。ベース URL: `/api/v1`

### 認証不要エンドポイント

| メソッド | パス                            | 説明                         |
| -------- | ------------------------------- | ---------------------------- |
| GET      | `/api/v1/auth/youtube/url`      | Google OAuth 認証 URL 取得   |
| POST     | `/api/v1/auth/youtube/callback` | OAuth コールバック・JWT 発行 |
| POST     | `/api/v1/auth/refresh`          | アクセストークン更新         |

### 認証必須エンドポイント（`Authorization: Bearer` または Cookie）

| メソッド | パス                                         | 説明                            |
| -------- | -------------------------------------------- | ------------------------------- |
| GET      | `/api/v1/users/me`                           | 自分のプロフィール取得          |
| GET      | `/api/v1/users/me/plan`                      | プラン・使用量取得              |
| POST     | `/api/v1/generate`                           | 生成ジョブ作成                  |
| GET      | `/api/v1/generate/history`                   | 生成履歴取得                    |
| GET      | `/api/v1/generate/:job_id`                   | ジョブステータス確認            |
| GET      | `/api/v1/thumbnails/:id/download`            | ダウンロード用署名付き URL 発行 |
| POST     | `/api/v1/style/learn`                        | スタイル学習ジョブ作成          |
| GET      | `/api/v1/style/models`                       | 学習済みスタイルモデル一覧      |
| GET      | `/api/v1/youtube/videos`                     | チャンネル動画一覧取得          |
| PUT      | `/api/v1/youtube/videos/:video_id/thumbnail` | YouTube サムネイル更新          |

---

## 認証フロー

```
1. GET /api/v1/auth/youtube/url → Google 認証 URL をバックエンドから取得
2. ユーザーを Google 認証ページへリダイレクト
3. Google → /auth/callback?code=...&state=...
4. POST /api/v1/auth/youtube/callback → JWT（access + refresh）を HttpOnly Cookie に保存
5. 以降のリクエストは Cookie が自動付与される（credentials: 'include'）
```

- **Access Token**: 有効期限 15 分
- **Refresh Token**: 有効期限 30 日
- トークンリフレッシュは `/api/v1/auth/refresh` で行い、401 発生時に自動再試行する

---

## サムネイル生成フロー（フロントエンド視点）

```
1. POST /api/v1/generate → { job_id, status: "pending" } を受け取る
2. GET /api/v1/generate/:job_id を 2 秒間隔でポーリング
3. status が "completed" → image_url を表示・ダウンロード可能に
4. status が "failed" → error メッセージを表示
```

---

## プランと月次生成上限

| プラン   | 上限   |
| -------- | ------ |
| free     | 10 回  |
| creator  | 100 回 |
| pro      | 500 回 |
| business | 無制限 |

上限に達した場合、バックエンドは `429 Too Many Requests` を返す。

---

## 主要環境変数

| 変数名                     | 説明                                             |
| -------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | バックエンド API のベース URL                    |
| `NEXT_PUBLIC_APP_URL`      | フロントエンドアプリ URL（OAuth リダイレクト先） |

> シークレット情報は `NEXT_PUBLIC_` プレフィックスを付けない。
