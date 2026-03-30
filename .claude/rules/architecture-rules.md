# アーキテクチャ規則

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router（ページ・レイアウト・ルート）
│   ├── (auth)/             # 認証が不要なルートグループ
│   ├── (dashboard)/        # 認証必須のルートグループ
│   ├── api/                # Route Handlers
│   └── layout.tsx
│
├── components/
│   ├── ui/                 # 汎用 UI コンポーネント（Button, Input, Modal 等）
│   └── features/           # 機能単位のコンポーネント（GenerationForm, ThumbnailGallery 等）
│
├── hooks/                  # カスタム hooks（useXxx.ts）
├── lib/
│   ├── api/                # バックエンド API クライアント（fetch ラッパー）
│   ├── auth/               # 認証ユーティリティ
│   └── utils/              # 汎用ユーティリティ
│
├── types/                  # 共通型定義（API レスポンス型・ドメイン型）
└── constants/              # 定数（プラン上限・ステータス値等）
```

---

## 層の責務

| 層                         | 場所                        | 責務                                |
| -------------------------- | --------------------------- | ----------------------------------- |
| ページ（Server Component） | `app/**/(page\|layout).tsx` | データフェッチ・レイアウト定義      |
| 機能コンポーネント         | `components/features/`      | 機能単位の UI・クライアント状態管理 |
| UI コンポーネント          | `components/ui/`            | スタイルのみ。ロジックを持たない    |
| API クライアント           | `lib/api/`                  | HTTP 通信・レスポンス型変換         |
| hooks                      | `hooks/`                    | 状態・副作用のカプセル化            |

---

## 依存の方向

```
app/ → components/features/ → components/ui/
app/ → lib/api/ → types/
hooks/ → lib/api/ → types/
```

- `components/ui/` は `lib/api/` や `hooks/` に依存しない（純粋な UI）
- `lib/api/` はバックエンド API の型定義（`types/`）のみに依存する

---

## API クライアントパターン

バックエンドへの通信は `lib/api/` 配下に集約する。

```ts
// lib/api/generate.ts
export async function createGenerationJob(
  prompt: string,
  styleModelId?: string,
): Promise<{ jobId: string; status: string }> {
  const res = await fetch("/api/v1/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style_model_id: styleModelId }),
    credentials: "include",
  });
  if (!res.ok) {
    throw new ApiError(res.status, await res.json());
  }
  return res.json();
}
```

---

## ルートグループ（Route Groups）

- `(auth)/` — ログイン・コールバック（認証不要）
- `(dashboard)/` — メイン機能（認証必須。`layout.tsx` でセッション確認）

認証チェックは `(dashboard)/layout.tsx` の Server Component で行い、未認証なら `/login` へリダイレクト。
個々のページで認証を重複チェックしない。
