"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  CreditCard,
  LogOut,
  Crown,
  Zap,
  BarChart3,
  Palette,
  Heart,
  TrendingUp,
  Receipt,
  Trash2,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";
import {
  getMe,
  getMyPlan,
  getAnalytics,
  getBillingInfo,
  logout,
  deleteAccount,
} from "@/lib/api";
import { ROUTES, PLAN_FEATURES, DATE_LOCALE } from "@/consts";
import styles from "./page.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const { data: planInfo, isLoading: planLoading } = useQuery({
    queryKey: ["myPlan"],
    queryFn: getMyPlan,
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
  });

  const { data: billing, isLoading: billingLoading } = useQuery({
    queryKey: ["billing"],
    queryFn: getBillingInfo,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push(ROUTES.login);
    },
    onError: () => {
      toast.error("ログアウトに失敗しました");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success("アカウントを削除しました");
      router.push(ROUTES.login);
    },
    onError: () => {
      toast.error("アカウントの削除に失敗しました");
    },
  });

  const currentPlan = PLAN_FEATURES[planInfo?.plan || "free"];

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
                    {new Date(user.createdAt).toLocaleDateString(DATE_LOCALE, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
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
                  <div
                    className={styles.planBadge}
                    style={{ color: currentPlan.color }}
                  >
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
                          (planInfo.generationCountMonth /
                            planInfo.monthlyLimit) *
                            100,
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
          <h2 className={styles.sectionTitle}>
            <BarChart3 size={16} />
            アナリティクス
          </h2>
          <Card padding="lg">
            {analyticsLoading ? (
              <div className={styles.analyticsGrid}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={styles.statCard}>
                    <Skeleton height={16} width="50%" />
                    <Skeleton height={28} width="40%" />
                  </div>
                ))}
              </div>
            ) : analytics ? (
              <div className={styles.analyticsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <BarChart3 size={14} className={styles.statIcon} />
                    <span className={styles.statLabel}>総生成数</span>
                  </div>
                  <span className={styles.statValue}>
                    {analytics.totalGenerations}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <Palette size={14} className={styles.statIcon} />
                    <span className={styles.statLabel}>総スタイル数</span>
                  </div>
                  <span className={styles.statValue}>
                    {analytics.totalStyles}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <Heart size={14} className={styles.statIcon} />
                    <span className={styles.statLabel}>お気に入り</span>
                  </div>
                  <span className={styles.statValue}>
                    {analytics.totalFavorites}
                  </span>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <TrendingUp size={14} className={styles.statIcon} />
                    <span className={styles.statLabel}>今週の生成</span>
                  </div>
                  <span className={styles.statValue}>
                    {analytics.generationsThisWeek}
                  </span>
                </div>
              </div>
            ) : null}
          </Card>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Receipt size={16} />
            請求情報
          </h2>
          <Card padding="lg">
            {billingLoading ? (
              <div className={styles.skeletonRows}>
                <Skeleton height={16} width="40%" />
                <Skeleton height={16} width="50%" />
                <Skeleton height={16} width="35%" />
              </div>
            ) : billing ? (
              <div className={styles.billingInfo}>
                <dl className={styles.infoList}>
                  <div className={styles.infoRow}>
                    <dt>現在のプラン</dt>
                    <dd>
                      {PLAN_FEATURES[billing.plan]?.label ?? billing.plan}
                    </dd>
                  </div>
                  <div className={styles.infoRow}>
                    <dt>サブスクリプション</dt>
                    <dd>{billing.stripeSubscriptionId ? "有効" : "未登録"}</dd>
                  </div>
                  {billing.currentPeriodEnd && (
                    <div className={styles.infoRow}>
                      <dt>次回請求日</dt>
                      <dd>
                        {new Date(billing.currentPeriodEnd).toLocaleDateString(
                          DATE_LOCALE,
                          { year: "numeric", month: "long", day: "numeric" },
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className={styles.billingAction}>
                  <Button
                    variant="secondary"
                    onClick={() => toast.info("請求管理ポータルは準備中です")}
                  >
                    <CreditCard size={16} />
                    請求管理
                  </Button>
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
            <div className={styles.dangerDivider} />
            <div className={styles.dangerZone}>
              <div>
                <h3 className={styles.dangerTitle}>アカウント削除</h3>
                <p className={styles.dangerDesc}>
                  全てのデータが完全に削除されます
                </p>
              </div>
              <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
                <Trash2 size={16} />
                アカウント削除
              </Button>
            </div>
          </Card>
        </section>

        <Modal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="アカウントを削除"
        >
          <div className={styles.deleteModalContent}>
            <p className={styles.deleteWarning}>
              この操作は元に戻せません。全てのデータが完全に削除されます。
            </p>
            <div className={styles.deleteActions}>
              <Button
                variant="secondary"
                onClick={() => setDeleteModalOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="danger"
                loading={deleteAccountMutation.isPending}
                onClick={() => deleteAccountMutation.mutate()}
              >
                <Trash2 size={14} />
                削除する
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
