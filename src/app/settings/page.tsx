'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Settings,
  User,
  CreditCard,
  LogOut,
  Crown,
  Zap,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { getMe, getMyPlan, logout } from '@/lib/api';
import styles from './page.module.css';

const planFeatures: Record<string, { label: string; color: string; features: string[] }> = {
  free: {
    label: 'Free',
    color: 'var(--text-tertiary)',
    features: ['月5回の生成', '基本スタイル学習', 'PNG ダウンロード'],
  },
  creator: {
    label: 'Creator',
    color: 'var(--accent)',
    features: ['月50回の生成', '高度なスタイル学習', 'PSD/ZIP ダウンロード', 'YouTube直接更新'],
  },
  pro: {
    label: 'Pro',
    color: 'var(--action)',
    features: ['月200回の生成', '全スタイル機能', '優先処理', 'API アクセス'],
  },
  business: {
    label: 'Business',
    color: '#c084fc',
    features: ['無制限生成', 'チーム機能', '専用サポート', 'カスタムモデル'],
  },
};

export default function SettingsPage() {
  const router = useRouter();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const { data: planInfo, isLoading: planLoading } = useQuery({
    queryKey: ['myPlan'],
    queryFn: getMyPlan,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push('/login');
    },
    onError: () => {
      toast.error('ログアウトに失敗しました');
    },
  });

  const currentPlan = planFeatures[planInfo?.plan || 'free'];

  return (
    <AppShell>
      <div className={styles.page}>
        <header className={styles.header}>
          <Settings size={24} className={styles.headerIcon} />
          <h1 className={styles.title}>設定</h1>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <User size={16} />
            アカウント
          </h2>
          <Card padding="lg">
            {userLoading ? (
              <div className={styles.skeletonRows}>
                <Skeleton height={16} width="40%" />
                <Skeleton height={16} width="60%" />
              </div>
            ) : user ? (
              <dl className={styles.infoList}>
                <div className={styles.infoRow}>
                  <dt>チャンネル名</dt>
                  <dd>{user.channelName}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>チャンネルID</dt>
                  <dd className={styles.mono}>{user.channelId}</dd>
                </div>
                <div className={styles.infoRow}>
                  <dt>登録日</dt>
                  <dd>
                    {new Date(user.createdAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className={styles.noData}>ユーザー情報を取得できません</p>
            )}
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <CreditCard size={16} />
            プラン
          </h2>
          <Card padding="lg">
            {planLoading ? (
              <div className={styles.skeletonRows}>
                <Skeleton height={24} width="30%" />
                <Skeleton height={16} width="50%" />
              </div>
            ) : planInfo ? (
              <div className={styles.planInfo}>
                <div className={styles.planHeader}>
                  <div className={styles.planBadge} style={{ color: currentPlan.color }}>
                    <Crown size={16} />
                    {currentPlan.label}
                  </div>
                </div>
                <div className={styles.usageBar}>
                  <div className={styles.usageLabel}>
                    <span>今月の使用量</span>
                    <span>
                      {planInfo.generationCountMonth} / {planInfo.monthlyLimit}
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(
                          (planInfo.generationCountMonth / planInfo.monthlyLimit) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                  <span className={styles.remaining}>
                    残り {planInfo.remaining} 回
                  </span>
                </div>
                <div className={styles.planFeatures}>
                  {currentPlan.features.map((f) => (
                    <div key={f} className={styles.featureItem}>
                      <Zap size={12} />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        </section>

        <section className={styles.section}>
          <Card padding="lg">
            <div className={styles.dangerZone}>
              <div>
                <h3 className={styles.dangerTitle}>ログアウト</h3>
                <p className={styles.dangerDesc}>
                  このデバイスからログアウトします
                </p>
              </div>
              <Button
                variant="danger"
                loading={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut size={16} />
                ログアウト
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
