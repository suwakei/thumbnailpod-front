# アーキテクチャ設計

## フレームワーク：Next.js App Router

Server Components をデフォルトとし、クライアント操作が必要な部分のみ `"use client"` を付与する。

```
┌─────────────────────────────────────────────────────┐
│                   Next.js App Router                  │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │           Server Components (default)         │    │
│  │  - データフェッチ（fetch + cache）              │    │
│  │  - レイアウト定義                              │    │
│  │  - 認証チェック・リダイレクト                  │    │
│  └─────────────────────────────────────────────┘    │
│                         │ props                       │
│  ┌─────────────────────────────────────────────┐    │
│  │      Client Components ("use client")         │    │
│  │  - インタラクティブ UI（フォーム・ポーリング） │    │
│  │  - ブラウザ API 使用箇所                      │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## ディレクトリ構成

```
src/
├── app/                          # ルーティング（App Router）
│   ├── (auth)/                   # 認証不要ルートグループ
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── auth/
│   │       └── callback/
│   │           └── page.tsx      # OAuth コールバック処理
│   │
│   ├── (dashboard)/              # 認証必須ルートグループ
│   │   ├── layout.tsx            # ← ここで認証チェック
│   │   ├── page.tsx              # ダッシュボード（生成フォーム）
│   │   ├── history/
│   │   │   └── page.tsx          # 生成履歴
│   │   ├── style/
│   │   │   └── page.tsx          # スタイル学習
│   │   └── settings/
│   │       └── page.tsx          # プラン・設定
│   │
│   ├── api/                      # Route Handlers（BFF 的な薄いラッパー）
│   └── layout.tsx                # ルートレイアウト
│
├── components/
│   ├── ui/                       # 汎用 UI（Button, Input, Card 等）
│   └── features/                 # 機能コンポーネント
│       ├── generation/           # サムネイル生成
│       ├── history/              # 生成履歴
│       ├── style/                # スタイル学習
│       └── youtube/              # YouTube 動画選択
│
├── hooks/                        # カスタム hooks
│   ├── useGenerationPolling.ts   # ジョブステータスのポーリング
│   ├── useAuth.ts                # 認証状態管理
│   └── ...
│
├── lib/
│   ├── api/                      # バックエンド API クライアント
│   │   ├── auth.ts
│   │   ├── generate.ts
│   │   ├── style.ts
│   │   └── youtube.ts
│   ├── auth/                     # 認証ユーティリティ（セッション取得等）
│   └── utils/                    # 日付フォーマット等の汎用ユーティリティ
│
├── types/                        # 共通型定義
│   ├── api.ts                    # API レスポンス型
│   └── domain.ts                 # ドメイン型（JobStatus 等）
│
└── constants/                    # 定数
    └── plans.ts                  # プラン上限等
```

---

## データフローの原則

### Server Component でのデータフェッチ

```tsx
// app/(dashboard)/history/page.tsx（Server Component）
import { fetchGenerationHistory } from "@/lib/api/generate";

export default async function HistoryPage() {
  const history = await fetchGenerationHistory();
  return <HistoryList items={history} />;
}
```

### Client Component でのインタラクション

```tsx
// components/features/generation/GenerationForm.tsx
"use client";

import { useState } from "react";
import { createGenerationJob } from "@/lib/api/generate";

export function GenerationForm() {
  const [jobId, setJobId] = useState<string | null>(null);

  async function handleSubmit(prompt: string) {
    const { job_id } = await createGenerationJob(prompt);
    setJobId(job_id);
  }
  // ...
}
```

---

## 認証チェックのパターン

認証チェックは `(dashboard)/layout.tsx` の Server Component で一元管理。

```tsx
// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return <>{children}</>;
}
```

個々のページで認証チェックを重複させない。

---

## API クライアントのパターン

```ts
// lib/api/generate.ts
import { ApiError } from "@/lib/api/error";

export async function createGenerationJob(
  prompt: string,
  styleModelId?: string,
): Promise<CreateJobResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/generate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, style_model_id: styleModelId }),
      credentials: "include",
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? "Unknown error");
  }

  return res.json();
}
```

---

## ポーリングパターン（生成ジョブの完了待機）

```ts
// hooks/useGenerationPolling.ts
"use client";

import { useEffect, useState } from "react";
import { getGenerationJob } from "@/lib/api/generate";

export function useGenerationPolling(jobId: string | null) {
  const [status, setStatus] = useState<JobStatus | null>(null);

  useEffect(() => {
    if (!jobId || status === "completed" || status === "failed") return;

    const intervalId = setInterval(async () => {
      const job = await getGenerationJob(jobId);
      setStatus(job.status);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [jobId, status]);

  return status;
}
```

---

## インフラ構成

```
ブラウザ
  │
  ├─ フロントエンド → Vercel（Next.js）
  │
  └─ バックエンド API → ALB → ECS Fargate（Go バックエンド）
```

- フロントエンドは **Vercel** にデプロイ（Git 連携による自動デプロイ）
- バックエンドとは CORS 設定で接続（`credentials: 'include'` + `Access-Control-Allow-Origin` 設定）
- `NEXT_PUBLIC_API_BASE_URL` にバックエンドの URL を設定する
