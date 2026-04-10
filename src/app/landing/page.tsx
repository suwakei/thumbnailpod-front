'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Palette,
  Zap,
  Layers,
  MonitorPlay,
  Download,
  Wand2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { ROUTES, PLAN_FEATURES } from '@/consts';
import { getOAuthURL } from '@/lib/api';
import styles from './page.module.css';

const features = [
  {
    icon: Palette,
    title: 'スタイル学習',
    desc: 'あなたの過去サムネイルから配色・レイアウト・雰囲気をAIが分析。唯一無二のスタイルモデルを自動構築します。',
    accent: 'cyan',
  },
  {
    icon: Wand2,
    title: 'ワンクリック生成',
    desc: 'テキストで指示するだけ。学習済みスタイルを適用した高品質サムネイルが数秒で完成。',
    accent: 'coral',
  },
  {
    icon: Layers,
    title: 'レイヤー分離出力',
    desc: '背景・人物・テキスト・エフェクトを独立レイヤーで出力。PSD / PNG / ZIP で自由に編集。',
    accent: 'cyan',
  },
  {
    icon: MonitorPlay,
    title: 'YouTube直接更新',
    desc: '生成したサムネイルをワンクリックで動画に適用。YouTube Studioを開く必要なし。',
    accent: 'coral',
  },
  {
    icon: Zap,
    title: 'サービス内エディタ',
    desc: 'テキスト変更・位置調整・色調補正をブラウザ上で完結。外部ツール不要の軽量編集。',
    accent: 'cyan',
  },
  {
    icon: Download,
    title: '柔軟なダウンロード',
    desc: 'レイヤー別プレビューから個別or一括ダウンロード。PNG / PSD / ZIP に対応。',
    accent: 'coral',
  },
];

const steps = [
  { num: '01', title: 'チャンネル連携', desc: 'YouTubeアカウントでログインするだけ' },
  { num: '02', title: 'スタイル学習', desc: '過去サムネイルからあなたの"らしさ"を抽出' },
  { num: '03', title: 'プロンプト入力', desc: '作りたいサムネイルの内容をテキストで指示' },
  { num: '04', title: '即座に完成', desc: 'レイヤー分離された高品質サムネイルを取得' },
];

export default function LandingPage() {
  const [loginLoading, setLoginLoading] = useState(false);
  const [annual, setAnnual] = useState(false);

  async function handleGoogleLogin() {
    setLoginLoading(true);
    try {
      const { url } = await getOAuthURL();
      window.location.href = url;
    } catch {
      setLoginLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ===== Background layers ===== */}
      <div className={styles.bgLayer}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
        <div className={styles.bgGrid} />
      </div>

      {/* ===== Header ===== */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href={ROUTES.landing} className={styles.logoLink}>
            <div className={styles.logoMark}>
              <Sparkles size={16} />
            </div>
            <span className={styles.logoText}>ThumbnailPod</span>
          </Link>

          <nav className={styles.headerNav}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#how" className={styles.navLink}>How it works</a>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
          </nav>

          <button
            className={styles.loginBtn}
            onClick={handleGoogleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <Loader2 size={16} className={styles.spinner} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" className={styles.googleIcon}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Googleでログイン
          </button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Sparkles size={12} />
          AI-Powered Thumbnail Studio
        </div>

        <h1 className={styles.heroTitle}>
          あなたの
          <span className={styles.heroAccent}>スタイル</span>
          で
          <br />
          サムネイルを自動生成
        </h1>

        <p className={styles.heroSub}>
          過去のサムネイルからレイアウト・配色・雰囲気をAIが学習。
          <br />
          クリック率を最大化するサムネイルを、テキスト一つで生成します。
        </p>

        <div className={styles.heroCta}>
          <button
            className={styles.ctaPrimary}
            onClick={handleGoogleLogin}
            disabled={loginLoading}
          >
            無料で始める
            <ArrowRight size={16} />
          </button>
          <a href="#features" className={styles.ctaSecondary}>
            機能を見る
            <ChevronRight size={14} />
          </a>
        </div>

        {/* Hero visual mock */}
        <div className={styles.heroVisual}>
          <div className={styles.mockEditor}>
            <div className={styles.mockToolbar}>
              <div className={styles.mockDots}>
                <span /><span /><span />
              </div>
              <span className={styles.mockTitle}>ThumbnailPod Editor</span>
            </div>
            <div className={styles.mockCanvas}>
              <div className={styles.mockLayer} data-label="background" />
              <div className={styles.mockLayer} data-label="person" />
              <div className={styles.mockLayer} data-label="text" />
              <div className={styles.mockLayerPanel}>
                <div className={styles.mockLayerItem}><Layers size={10} /> composite</div>
                <div className={styles.mockLayerItem}><Layers size={10} /> text_layer</div>
                <div className={styles.mockLayerItem}><Layers size={10} /> person_layer</div>
                <div className={styles.mockLayerItem}><Layers size={10} /> background</div>
              </div>
            </div>
          </div>
          <div className={styles.mockGlow} />
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className={styles.features} id="features">
        <div className={styles.sectionLabel}>Features</div>
        <h2 className={styles.sectionTitle}>
          プロの仕上がりを、
          <span className={styles.heroAccent}>AIの速度</span>で
        </h2>
        <p className={styles.sectionSub}>
          学習・生成・編集・公開まで、サムネイル制作の全工程をカバー
        </p>

        <div className={styles.featureGrid}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={styles.featureCard} data-accent={f.accent}>
                <div className={styles.featureIcon}>
                  <Icon size={20} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className={styles.howSection} id="how">
        <div className={styles.sectionLabel}>How it works</div>
        <h2 className={styles.sectionTitle}>
          <span className={styles.heroAccent}>4ステップ</span>で完成
        </h2>

        <div className={styles.stepsRow}>
          {steps.map((s, i) => (
            <div key={s.num} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.num}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
              {i < steps.length - 1 && (
                <div className={styles.stepArrow}>
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionLabel}>Pricing</div>
        <h2 className={styles.sectionTitle}>
          まずは<span className={styles.heroAccent}>無料</span>で
        </h2>

        {/* Billing toggle */}
        <div className={styles.billingToggle}>
          <button
            className={`${styles.billingOption} ${!annual ? styles.billingOptionActive : ''}`}
            onClick={() => setAnnual(false)}
          >
            月払い
          </button>
          <button
            className={`${styles.billingOption} ${annual ? styles.billingOptionActive : ''}`}
            onClick={() => setAnnual(true)}
          >
            年払い
            <span className={styles.billingSave}>2ヶ月分おトク</span>
          </button>
        </div>

        <div className={styles.pricingGrid}>
          {Object.entries(PLAN_FEATURES).map(([key, plan]) => {
            const displayPrice = annual ? (plan.annualPrice || plan.price) : plan.price;
            const displaySub = annual ? (plan.annualPriceSub || plan.priceSub) : plan.priceSub;
            const monthlyNote = annual ? plan.annualMonthly : undefined;

            return (
              <div
                key={key}
                className={`${styles.planCard} ${key === 'creator' ? styles.planCardFeatured : ''}`}
              >
                {key === 'creator' && <div className={styles.planBadge}>Popular</div>}
                <h3 className={styles.planName} style={{ color: plan.color }}>
                  {plan.label}
                </h3>
                <div className={styles.planPricing}>
                  <span className={styles.planPrice}>{displayPrice}</span>
                  {displaySub && (
                    <span className={styles.planPriceSub}>{displaySub}</span>
                  )}
                </div>
                {monthlyNote && (
                  <span className={styles.planMonthly}>{monthlyNote}</span>
                )}
                <ul className={styles.planFeatures}>
                  {plan.features.map((feat) => (
                    <li key={feat}>{feat}</li>
                  ))}
                </ul>
                <button
                  className={key === 'creator' ? styles.planBtnPrimary : styles.planBtn}
                  onClick={handleGoogleLogin}
                  disabled={loginLoading}
                >
                  始める
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== Footer CTA ===== */}
      <section className={styles.footerCta}>
        <h2 className={styles.footerCtaTitle}>
          サムネイル制作を、もっと速く
        </h2>
        <button
          className={styles.ctaPrimary}
          onClick={handleGoogleLogin}
          disabled={loginLoading}
        >
          無料で始める
          <ArrowRight size={16} />
        </button>
      </section>

      {/* ===== Footer ===== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <Sparkles size={14} />
            <span>ThumbnailPod</span>
          </div>
          <p className={styles.footerCopy}>&copy; 2026 ThumbnailPod. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
