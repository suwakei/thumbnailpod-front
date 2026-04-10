'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { postOAuthCallback } from '@/lib/api';
import { ROUTES } from '@/consts';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      setError('認証パラメータが不足しています');
      return;
    }

    postOAuthCallback(code, state)
      .then(() => {
        router.replace(ROUTES.dashboard);
      })
      .catch((err) => {
        console.error('OAuth callback failed:', err, err?.body);
        setError('認証に失敗しました。もう一度お試しください。');
      });
  }, [searchParams, router]);

  if (error) {
    return (
      <div className={styles.card}>
        <AlertCircle size={32} className={styles.errorIcon} />
        <h2 className={styles.title}>認証エラー</h2>
        <p className={styles.message}>{error}</p>
        <Button onClick={() => router.push(ROUTES.login)}>ログイン画面に戻る</Button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <Loader2 size={32} className={styles.spinner} />
      <h2 className={styles.title}>認証中...</h2>
      <p className={styles.message}>YouTubeアカウントを連携しています</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className={styles.page}>
      <Suspense
        fallback={
          <div className={styles.card}>
            <Loader2 size={32} className={styles.spinner} />
            <h2 className={styles.title}>読み込み中...</h2>
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
