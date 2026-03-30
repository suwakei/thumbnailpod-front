# Next.js App Router 実装パターン集

## Server Component vs Client Component

### 判断フローチャート

```
コンポーネントを作るとき
  │
  ├─ useState / useEffect / useRef を使う？
  ├─ ブラウザ API を使う？（window, localStorage 等）
  ├─ イベントハンドラを持つ？
  ├─ サードパーティのクライアント専用ライブラリを使う？
  │
  YES → "use client" を付ける（Client Component）
  NO  → 何も付けない（Server Component・デフォルト）
```

### Server Component（デフォルト）

```tsx
// app/(dashboard)/history/page.tsx
// "use client" なし → Server Component

import { getGenerationHistory } from "@/lib/api/generate";
import { HistoryList } from "@/components/features/history/HistoryList";

export default async function HistoryPage() {
  // サーバーサイドで直接 fetch（Cookie は自動転送される）
  const data = await getGenerationHistory();
  return <HistoryList jobs={data.jobs} />;
}
```

### Client Component

```tsx
// components/features/generation/GenerationForm.tsx
"use client";

import { useState } from "react";

export function GenerationForm() {
  const [prompt, setPrompt] = useState("");
  // ...
}
```

### "use client" 境界を末端に置く

```tsx
// ❌ ページ全体を Client Component にする（Server Component の恩恵がなくなる）
"use client";
export default function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const jobs = // fetch...
  return <HistoryList jobs={jobs} filter={filter} />;
}

// ✅ フィルター部分だけ Client Component に切り出す
// app/(dashboard)/history/page.tsx（Server Component）
export default async function HistoryPage() {
  const data = await getGenerationHistory();
  return (
    <>
      <HistoryFilter />       {/* "use client" */}
      <HistoryList jobs={data.jobs} />  {/* Server Component */}
    </>
  );
}
```

---

## データフェッチングパターン

### パターン1: 直列フェッチ（Sequential）

次のフェッチが前の結果に依存する場合。

```tsx
// app/(dashboard)/generate/[jobId]/page.tsx
export default async function JobPage({
  params,
}: {
  params: { jobId: string };
}) {
  const job = await getGenerationJob(params.jobId);
  // job が completed のときだけ thumbnail を取得
  const thumbnail =
    job.status === "completed" ? await getThumbnail(job.thumbnailId!) : null;

  return <JobDetail job={job} thumbnail={thumbnail} />;
}
```

### パターン2: 並列フェッチ（Parallel）

依存関係がない複数のフェッチは `Promise.all` でまとめる。

```tsx
// app/(dashboard)/page.tsx
export default async function DashboardPage() {
  // 同時に取得（待ち時間を最小化）
  const [profile, plan, recentJobs] = await Promise.all([
    getUserProfile(),
    getUserPlan(),
    getGenerationHistory(5, 0),
  ]);

  return (
    <Dashboard profile={profile} plan={plan} recentJobs={recentJobs.jobs} />
  );
}
```

### パターン3: Suspense による段階的ローディング

重いデータを持つコンポーネントだけ遅延させ、残りを先にレンダリングする。

```tsx
// app/(dashboard)/page.tsx
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* プロフィールは軽量なので即時レンダリング */}
      <UserProfileCard />

      {/* 履歴は重いので Suspense でラップ */}
      <Suspense fallback={<HistorySkeleton />}>
        <RecentHistory /> {/* 内部で async fetch */}
      </Suspense>
    </div>
  );
}

// components/features/history/RecentHistory.tsx（Server Component）
async function RecentHistory() {
  const data = await getGenerationHistory(5, 0);
  return <HistoryList jobs={data.jobs} />;
}
```

### パターン4: loading.tsx による自動ローディング

```
app/(dashboard)/history/
├── page.tsx       ← async Server Component
└── loading.tsx    ← Suspense フォールバック（自動適用）
```

```tsx
// app/(dashboard)/history/loading.tsx
export default function HistoryLoading() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ThumbnailSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

## キャッシュ制御パターン

### fetch オプションによる制御

```ts
// 毎回サーバーからフェッチ（ジョブステータスなど）
fetch(url, { cache: "no-store" });

// ビルド時にフェッチしてキャッシュ（静的コンテンツ）
fetch(url, { cache: "force-cache" });

// 30 秒ごとに再検証（スタイルモデル一覧など）
fetch(url, { next: { revalidate: 30 } });

// タグで管理（明示的な再検証が必要なもの）
fetch(url, { next: { tags: ["generation-history", `user:${userId}`] } });
```

### Page / Layout レベルのキャッシュ設定

```ts
// page.tsx に追加すると、そのページの全 fetch に適用
export const dynamic = "force-dynamic"; // 常に動的レンダリング
export const revalidate = 30; // 30 秒キャッシュ
export const fetchCache = "force-no-store"; // 全 fetch をキャッシュなしに
```

### Server Action からの再検証

```ts
// app/actions/generate.ts
"use server";

import { revalidateTag } from "next/cache";
import { createGenerationJob } from "@/lib/api/generate";

export async function submitGenerationJob(prompt: string) {
  const job = await createGenerationJob(prompt);
  // 生成後に履歴キャッシュを無効化
  revalidateTag("generation-history");
  return job;
}
```

---

## エラーハンドリングパターン

### パターン1: error.tsx による Error Boundary

```tsx
// app/(dashboard)/error.tsx
"use client"; // error.tsx は必ず "use client"

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーロギング（将来: Sentry 等）
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <p className="text-muted-foreground">問題が発生しました。</p>
      <Button onClick={reset}>再試行</Button>
    </div>
  );
}
```

### パターン2: notFound() による 404

```tsx
// app/(dashboard)/history/[jobId]/page.tsx
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api/error";

export default async function JobPage({
  params,
}: {
  params: { jobId: string };
}) {
  try {
    const job = await getGenerationJob(params.jobId);
    return <JobDetail job={job} />;
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) notFound();
    throw e; // error.tsx に委譲
  }
}
```

```tsx
// app/(dashboard)/history/[jobId]/not-found.tsx
export default function JobNotFound() {
  return <p>ジョブが見つかりません。</p>;
}
```

### パターン3: Client Component でのエラー状態管理

```tsx
"use client";

import { useState } from "react";
import { ApiError, getErrorMessage } from "@/lib/api/error";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function GenerationForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(prompt: string) {
    setError(null);
    setIsPending(true);
    try {
      await submitGenerationJob(prompt);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? getErrorMessage(e)
          : "予期しないエラーが発生しました。",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* フォーム */}
    </>
  );
}
```

### パターン4: useTransition + Server Action のエラー

```tsx
"use client";

import { useTransition } from "react";
import { submitGenerationJob } from "@/app/actions/generate";
import { toast } from "sonner";

export function GenerationButton({ prompt }: { prompt: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await submitGenerationJob(prompt);
        toast.success("ジョブを作成しました");
      } catch (e) {
        toast.error("作成に失敗しました");
      }
    });
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? "送信中..." : "生成する"}
    </Button>
  );
}
```

---

## Server Actions パターン

### フォームと統合する（基本パターン）

```tsx
// app/actions/generate.ts
"use server";

import { z } from "zod";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const schema = z.object({
  prompt: z.string().min(1).max(500),
  styleModelId: z.string().uuid().optional(),
});

export async function createJobAction(formData: FormData) {
  const result = schema.safeParse({
    prompt: formData.get("prompt"),
    styleModelId: formData.get("styleModelId") || undefined,
  });

  if (!result.success) {
    // エラーを返す（useActionState と組み合わせる）
    return { error: result.error.flatten().fieldErrors };
  }

  const job = await createGenerationJob(
    result.data.prompt,
    result.data.styleModelId,
  );
  revalidateTag("generation-history");
  redirect(`/history/${job.job_id}`);
}
```

### useActionState でフォームエラーを表示

```tsx
"use client";

import { useActionState } from "react";
import { createJobAction } from "@/app/actions/generate";

const initialState = { error: null };

export function GenerationForm() {
  const [state, formAction, isPending] = useActionState(
    createJobAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Input name="prompt" placeholder="プロンプト" />
        {state.error?.prompt && (
          <p className="text-sm text-destructive">{state.error.prompt[0]}</p>
        )}
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "生成する"}
      </Button>
    </form>
  );
}
```

---

## 認証パターン

### Layout での認証チェック（Server Component）

```tsx
// app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  if (!token) return null;
  // トークン検証（必要であれば）
  return { token: token.value };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  return <>{children}</>;
}
```

### Middleware による認証（推奨）

```ts
// middleware.ts（プロジェクトルートに配置）
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // パブリックパスはスキップ
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
```

---

## ルーティングパターン

### 動的ルート

```
app/(dashboard)/history/[jobId]/page.tsx
→ /history/abc-123

app/(dashboard)/style/[modelId]/page.tsx
→ /style/xyz-456
```

```tsx
// generateStaticParams（静的生成する場合のみ必要）
export async function generateStaticParams() {
  // 動的なユーザーデータのため、基本的に使わない
  return [];
}

export default async function JobPage({
  params,
}: {
  params: { jobId: string };
}) {
  const job = await getGenerationJob(params.jobId);
  return <JobDetail job={job} />;
}
```

### クエリパラメータの取得

```tsx
// Server Component
export default function HistoryPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const page = Number(searchParams.page ?? "1");
  const status = searchParams.status;
  // ...
}

// Client Component
("use client");
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function HistoryFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  function updateFilter(status: string) {
    const params = new URLSearchParams(searchParams);
    params.set("status", status);
    router.replace(`${pathname}?${params.toString()}`);
  }
}
```

### プログラムナビゲーション

```tsx
"use client";

import { useRouter } from "next/navigation";

export function LoginButton() {
  const router = useRouter();

  async function handleLogin() {
    const { url } = await getOAuthUrl();
    router.push(url); // Google OAuth へリダイレクト
  }
}
```

---

## パラレルルート / インターセプトルート

### パラレルルート（複数のスロットを同時に表示）

```
app/(dashboard)/
├── @modal/
│   └── (.)history/[jobId]/
│       └── page.tsx    ← モーダル表示用
├── history/
│   └── [jobId]/
│       └── page.tsx    ← 通常のページ
└── layout.tsx          ← @modal スロットを受け取る
```

```tsx
// app/(dashboard)/layout.tsx
export default function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal} {/* モーダルのオーバーレイ */}
    </>
  );
}
```

---

## メタデータパターン

### 静的メタデータ

```tsx
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "ThumbnailPod",
    template: "%s | ThumbnailPod",
  },
  description: "AI でサムネイルを自動生成するサービス",
};
```

### 動的メタデータ

```tsx
// app/(dashboard)/history/[jobId]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: { jobId: string };
}): Promise<Metadata> {
  const job = await getGenerationJob(params.jobId).catch(() => null);
  if (!job) return { title: "Not Found" };

  return {
    title: `ジョブ詳細: ${job.job_id.slice(0, 8)}`,
  };
}
```

---

## Route Handler パターン

### 基本構造

```ts
// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";

const schema = z.object({
  prompt: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  // 認証確認
  const cookieStore = await cookies();
  if (!cookieStore.get("access_token")) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const result = schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ message: "invalid request" }, { status: 400 });
  }

  // バックエンドへのプロキシ
  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: JSON.stringify(result.data),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
```

### 動的 Route Handler（パスパラメータ）

```ts
// app/api/generate/[jobId]/route.ts
export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } },
) {
  const { jobId } = params;
  // ...
}
```

---

## Streaming / 段階的レンダリング

```tsx
// app/(dashboard)/page.tsx
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* すぐに表示 */}
      <DashboardHeader />

      {/* データが揃い次第順に表示 */}
      <Suspense fallback={<StatsSkeleton />}>
        <UsageStats />
      </Suspense>

      <Suspense fallback={<HistorySkeleton />}>
        <RecentHistory />
      </Suspense>

      <Suspense fallback={<ModelSkeleton />}>
        <StyleModelList />
      </Suspense>
    </div>
  );
}
```

---

## よくある実装パターン集

### クライアントからのページリフレッシュ（re-render）

```tsx
"use client";

import { useRouter } from "next/navigation";

export function RefreshButton() {
  const router = useRouter();
  return (
    <Button variant="ghost" onClick={() => router.refresh()}>
      更新
    </Button>
  );
}
```

### URL 同期フィルター

```tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useQueryParam(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get(key) ?? "";

  const setValue = useCallback(
    (val: string) => {
      const params = new URLSearchParams(searchParams);
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, key],
  );

  return [value, setValue] as const;
}
```

### 楽観的更新（useOptimistic）

```tsx
"use client";

import { useOptimistic } from "react";

export function HistoryList({ jobs }: { jobs: GenerationJob[] }) {
  const [optimisticJobs, addOptimisticJob] = useOptimistic(
    jobs,
    (state, newJob: GenerationJob) => [newJob, ...state],
  );

  async function handleCreate(prompt: string) {
    const tempJob: GenerationJob = {
      jobId: "temp-" + Date.now(),
      status: "pending",
      createdAt: new Date(),
    };
    addOptimisticJob(tempJob); // 即座に UI を更新
    await submitGenerationJob(prompt); // バックグラウンドで送信
  }

  return (
    <ul>
      {optimisticJobs.map((job) => (
        <li key={job.jobId}>{job.status}</li>
      ))}
    </ul>
  );
}
```
