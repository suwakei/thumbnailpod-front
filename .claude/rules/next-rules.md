# Next.js / TypeScript コーディングルール

## TypeScript

- `any` 型の使用禁止。型が不明な場合は `unknown` を使い、型ガードで絞り込む
- 非 null アサーション（`!`）は使わない。`if` ガードまたは optional chaining（`?.`）を使う
- `type` と `interface` の使い分け：外部 API レスポンス・Props・コンポーネント間の契約は `interface`、Union 型・交差型・エイリアスは `type`
- `as` キャストは最終手段。型推論または型ガードで解決できる場合は使わない
- enum の代わりに `as const` + Union 型を使う（ツリーシェイキングに有利）

```ts
// 正
const JobStatus = {
  Pending: 'pending',
  Processing: 'processing',
  Completed: 'completed',
  Failed: 'failed',
} as const;
type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

// 避ける
enum JobStatus { Pending = 'pending', ... }
```

---

## Next.js App Router

- デフォルトは Server Component。クライアント操作が必要な場合のみ `"use client"` を付ける
- `"use client"` の境界はできるだけ末端（葉）コンポーネントに置く
- データフェッチは Server Component で行い、クライアントへは props で渡す
- `fetch` には `cache` / `next.revalidate` オプションを必ず指定する（デフォルト動作に頼らない）
- Server Actions は `"use server"` ディレクティブを付け、入力は必ず Zod でバリデーションする
- Route Handler（`route.ts`）でリクエストボディを受け取る場合も必ず Zod でバリデーションする

---

## コンポーネント設計

- Props の型定義はコンポーネントファイル内に `interface XxxProps` として定義する
- children を受け取る場合は `React.PropsWithChildren<XxxProps>` または `children: React.ReactNode` を使う
- イベントハンドラーの型は `React.MouseEvent<HTMLButtonElement>` のように具体的に指定する
- コンポーネントはデフォルトエクスポートを使う（ファイル名とコンポーネント名を一致させる）
- ユーティリティ関数・hooks は名前付きエクスポートを使う

---

## ファイル命名

| 種類           | 命名規則                        | 例                             |
| -------------- | ------------------------------- | ------------------------------ |
| コンポーネント | PascalCase                      | `ThumbnailCard.tsx`            |
| hooks          | camelCase（use プレフィックス） | `useGenerationJob.ts`          |
| ユーティリティ | camelCase                       | `formatDate.ts`                |
| 型定義         | camelCase または PascalCase     | `types.ts`, `GenerationJob.ts` |
| Route Handler  | `route.ts` (固定)               | `app/api/generate/route.ts`    |
| Server Action  | camelCase                       | `createGenerationJob.ts`       |

---

## インポート順序

1. React / Next.js
2. サードパーティライブラリ
3. 内部モジュール（`@/` エイリアス使用）
4. 型インポート（`import type`）

```ts
import { Suspense } from "react";
import { useRouter } from "next/navigation";

import { z } from "zod";

import { ThumbnailCard } from "@/components/ThumbnailCard";
import { fetchGenerationHistory } from "@/lib/api";

import type { GenerationJob } from "@/types";
```

---

## 禁止事項

- `dangerouslySetInnerHTML` の使用（XSS リスク）
- `localStorage` / `sessionStorage` への JWT・認証情報の保存（HttpOnly Cookie を使う）
- `console.log` の本番コードへの残置（`console.error` はエラーログ用途のみ許可）
- `process.env.NEXT_PUBLIC_*` にシークレット情報を入れること
