# SEO 要件

## 方針

ThumbnailPod は認証必須の SaaS アプリケーションである。ダッシュボード以下のページはクローラーにインデックスさせない。SEO 対応はログインページおよびアプリ全体のメタ情報管理に限定する。

---

## インデックス方針

| URL パターン          | インデックス | 理由                             |
| --------------------- | ------------ | -------------------------------- |
| `/login`              | 許可         | サービス入口として検索流入を狙う |
| `/`（ダッシュボード） | 禁止         | 認証必須・個人データが含まれる   |
| `/history/*`          | 禁止         | 認証必須・個人データが含まれる   |
| `/style/*`            | 禁止         | 認証必須・個人データが含まれる   |
| `/settings`           | 禁止         | 認証必須・個人データが含まれる   |
| `/auth/callback`      | 禁止         | OAuth コールバック専用           |

---

## robots.txt

```
User-agent: *
Disallow: /
Allow: /login

Sitemap: https://thumbnailpod.com/sitemap.xml
```

`public/robots.txt` に配置する。

---

## sitemap.xml

インデックス対象のページのみ記載する。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://thumbnailpod.com/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

`public/sitemap.xml` に配置する。動的なページはないため静的ファイルで管理する。

---

## メタデータ設計

### ルートレイアウト（デフォルトメタデータ）

```tsx
// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "ThumbnailPod",
    template: "%s | ThumbnailPod",
  },
  description:
    "YouTube チャンネルのサムネイルを AI で自動生成するサービスです。プロンプトを入力するだけで、あなたのチャンネルスタイルに合ったサムネイルを作成できます。",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://thumbnailpod.com",
  ),
  robots: {
    index: false, // デフォルトはインデックス禁止
    follow: false,
  },
  openGraph: {
    siteName: "ThumbnailPod",
    type: "website",
    locale: "ja_JP",
  },
};
```

### ログインページ（インデックス許可）

```tsx
// app/(auth)/login/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
  description: "ThumbnailPod にログインして、AI サムネイル生成を始めましょう。",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "ThumbnailPod にログイン",
    description: "AI でサムネイルを自動生成 — YouTube クリエイター向けツール",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ThumbnailPod",
      },
    ],
  },
};
```

### ダッシュボード以下（インデックス禁止を明示）

`(dashboard)/layout.tsx` でルートグループ全体に `noindex` を設定する。

```tsx
// app/(dashboard)/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
```

---

## OGP（Open Graph Protocol）画像

`/public/og-image.png` に 1200×630px の OGP 画像を配置する。

| ファイル              | サイズ   | 用途                     |
| --------------------- | -------- | ------------------------ |
| `public/og-image.png` | 1200×630 | デフォルト OGP 画像      |
| `public/favicon.ico`  | 32×32    | ファビコン               |
| `public/icon.png`     | 512×512  | PWA アイコン（将来対応） |

---

## アイコン・ファビコン設定

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};
```

---

## 言語・ロケール設定

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

---

## パフォーマンス指標（Core Web Vitals）

SEO と UX に影響するため、以下の指標を目標値として意識する。

| 指標                            | 目標値   |
| ------------------------------- | -------- |
| LCP（Largest Contentful Paint） | ≤ 2.5 秒 |
| FID（First Input Delay）        | ≤ 100 ms |
| CLS（Cumulative Layout Shift）  | ≤ 0.1    |

### 対策

- 画像は `next/image` を使い、`width` / `height` を指定して CLS を防ぐ
- フォントは `next/font` でサブセット化・最適化する
- サムネイル一覧は Skeleton コンポーネントでレイアウトシフトを防ぐ
- ダッシュボード以下は認証必須のため、LCP は UX 観点で管理（SEO 不要）
