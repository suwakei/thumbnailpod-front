# 画面遷移設計

## 画面一覧

| 画面名             | パス               | ルートグループ | 認証要否 |
| ------------------ | ------------------ | -------------- | -------- |
| ログイン           | `/login`           | `(auth)`       | 不要     |
| OAuth コールバック | `/auth/callback`   | `(auth)`       | 不要     |
| ダッシュボード     | `/`                | `(dashboard)`  | 必須     |
| 生成履歴           | `/history`         | `(dashboard)`  | 必須     |
| ジョブ詳細         | `/history/[jobId]` | `(dashboard)`  | 必須     |
| スタイル学習       | `/style`           | `(dashboard)`  | 必須     |
| スタイル詳細       | `/style/[modelId]` | `(dashboard)`  | 必須     |
| 設定・プラン       | `/settings`        | `(dashboard)`  | 必須     |

---

## 遷移フロー図

### 認証フロー

```
未認証でダッシュボード系 URL にアクセス
  │
  ▼
(dashboard)/layout.tsx が getSession() を確認
  │
  ├─ セッションなし → redirect("/login")
  │
  └─ セッションあり → そのままページ表示

/login にアクセス
  │
  ▼
Google OAuth ボタン → getOAuthUrl() → Google 認証ページ
  │
  ▼
/auth/callback（コールバック URL）
  │
  ├─ 認証成功 → redirect("/")（ダッシュボード）
  │
  └─ 認証失敗 → redirect("/login?error=auth_failed")

ログアウト
  │
  ▼
POST /api/v1/auth/logout（Cookie クリア）→ redirect("/login")
```

### メイン遷移フロー

```
ダッシュボード（/）
  │
  ├─ プロンプト送信 → ジョブ作成 → ポーリング開始
  │     │
  │     ├─ 完了 → 生成画像表示（インライン）
  │     └─ 失敗 → エラーメッセージ表示
  │
  ├─ 「履歴を見る」→ /history
  │
  ├─ 「スタイル管理」→ /style
  │
  └─ 「設定」→ /settings

生成履歴（/history）
  │
  ├─ サムネイルカードクリック → /history/[jobId]
  │
  └─ ページネーション（URL クエリパラメータ ?page=N）

ジョブ詳細（/history/[jobId]）
  │
  ├─ 「ダウンロード」→ 画像ダウンロード（外部リンク）
  │
  ├─ 「もう一度生成」→ ダッシュボード（プロンプト引き継ぎ）
  │
  └─ ジョブが存在しない → notFound() → not-found.tsx

スタイル学習（/style）
  │
  ├─ 「新しいスタイルを追加」→ スタイル学習フォーム（モーダルまたはインライン）
  │
  └─ スタイルカードクリック → /style/[modelId]

設定（/settings）
  │
  └─ 「プランをアップグレード」→ 外部決済ページ（将来対応）
```

---

## 認証チェックの実装方針

認証チェックは `(dashboard)/layout.tsx` で一元管理する。個々のページで重複させない。

```tsx
// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return <>{children}</>;
}
```

---

## リダイレクトルール

| 条件                                    | リダイレクト先               |
| --------------------------------------- | ---------------------------- |
| 未認証でダッシュボード系 URL にアクセス | `/login`                     |
| 認証済みで `/login` にアクセス          | `/`                          |
| ジョブ ID が存在しない                  | `notFound()` → not-found.tsx |
| `401` API エラー（リフレッシュ失敗）    | `/login`                     |
| OAuth 認証失敗                          | `/login?error=auth_failed`   |

---

## URL クエリパラメータ

フィルタリングやページネーションは URL クエリパラメータで管理し、ブラウザの戻る・共有に対応する。

| パス       | パラメータ | 型     | 説明                                     |
| ---------- | ---------- | ------ | ---------------------------------------- |
| `/history` | `page`     | number | ページ番号（デフォルト: 1）              |
| `/history` | `status`   | string | ステータスフィルタ（`completed` 等）     |
| `/style`   | `status`   | string | スタイルステータスフィルタ（`ready` 等） |

クエリパラメータの読み取りは Server Component では `searchParams` props、Client Component では `useSearchParams` を使う（`02-app-router-pattern.md` 参照）。

---

## ナビゲーション構造

```
ヘッダー（全ダッシュボード画面共通）
├── ロゴ（/ へのリンク）
├── ナビゲーションリンク
│   ├── ダッシュボード（/）
│   ├── 生成履歴（/history）
│   └── スタイル（/style）
└── ユーザーメニュー
    ├── 設定（/settings）
    └── ログアウト

サイドバー（モバイルでは非表示 or ドロワー）
└── 同上のナビゲーションリンク
```

---

## 生成後の画面遷移パターン

サムネイル生成はポーリングで完了を待機するため、ページ遷移は発生しない（インラインでステータス表示）。

```
[生成する] ボタン押下
  │
  ▼
ローディング状態（スピナー + 「生成中...」）
  │
  ├─ completed → 生成画像を表示（ダウンロードボタン）
  │
  └─ failed → エラーメッセージ + 「再試行」ボタン
```

`useGenerationPolling` hook で 2 秒間隔のポーリングを行い、`completed` / `failed` で停止する。
