'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Shield,
  Activity,
  BarChart3,
  RefreshCw,
  Users,
  Briefcase,
  Palette,
  Wrench,
  Loader2,
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { getMe, getAdminHealth, getAdminStats, toggleMaintenance } from '@/lib/api';
import { ROUTES, DATE_LOCALE } from '@/consts';
import styles from './page.module.css';

const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  backend: 'Backend API',
  database: 'Database',
  ai_service: 'AI Service',
  redis: 'Redis',
};

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
  });

  const isAdmin = me?.role === 'admin';

  const {
    data: health,
    isLoading: healthLoading,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['adminHealth'],
    queryFn: getAdminHealth,
    refetchInterval: 30_000,
    enabled: isAdmin,
  });

  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
    enabled: isAdmin,
  });

  const maintenanceMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      toggleMaintenance(enabled, maintenanceMessage),
    onSuccess: (data) => {
      toast.success(
        data.maintenance
          ? 'メンテナンスモードを有効にしました'
          : 'メンテナンスモードを解除しました',
      );
      queryClient.invalidateQueries({ queryKey: ['adminHealth'] });
    },
    onError: () => {
      toast.error('メンテナンスモードの切り替えに失敗しました');
    },
  });

  // 未ログイン → /login、admin以外 → /
  useEffect(() => {
    if (meLoading) return;
    if (!me) {
      router.replace(ROUTES.login);
    } else if (me.role !== 'admin') {
      router.replace(ROUTES.dashboard);
    }
  }, [me, meLoading, router]);

  // ローディング中 or 権限なし → ローダー表示
  if (meLoading || !isAdmin) {
    return (
      <AppShell>
        <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader2 size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--text-tertiary)' }} />
        </div>
      </AppShell>
    );
  }

  const isMaintenanceOn = health?.status === 'maintenance';

  const jobTotal = stats?.jobs.total || 0;
  const getBarPercent = (count: number) =>
    jobTotal > 0 ? (count / jobTotal) * 100 : 0;

  return (
    <AppShell>
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>システム管理・ヘルスチェック</p>
          </div>
        </header>

        {/* Service Health */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Activity size={18} />
              Service Health
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchHealth()}
              loading={healthLoading}
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>

          {healthLoading ? (
            <div className={styles.healthGrid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} padding="md">
                  <div className={styles.healthCard}>
                    <Skeleton width={10} height={10} borderRadius="50%" />
                    <div className={styles.healthInfo}>
                      <Skeleton height={14} width="60%" />
                      <Skeleton height={12} width="40%" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : health ? (
            <>
              <div className={styles.healthGrid}>
                {Object.entries(health.services).map(([key, service]) => {
                  const isOk = service.status === 'ok';
                  const dotClass = isOk
                    ? styles.healthDotOk
                    : service.status === 'error'
                      ? styles.healthDotError
                      : styles.healthDotUnknown;
                  const statusClass = isOk
                    ? styles.healthStatusOk
                    : styles.healthStatusError;

                  return (
                    <Card key={key} padding="md">
                      <div className={styles.healthCard}>
                        <div className={dotClass} />
                        <div className={styles.healthInfo}>
                          <span className={styles.healthName}>
                            {SERVICE_DISPLAY_NAMES[key] || key}
                          </span>
                          <div className={styles.healthMeta}>
                            <span className={statusClass}>
                              {service.status}
                            </span>
                            {service.latencyMs !== undefined && (
                              <span className={styles.healthLatency}>
                                {service.latencyMs}ms
                              </span>
                            )}
                            {service.version && (
                              <span className={styles.healthLatency}>
                                v{service.version}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              <span className={styles.checkedAt}>
                Last checked: {new Date(health.checkedAt).toLocaleString(DATE_LOCALE)}
              </span>
            </>
          ) : null}
        </section>

        {/* System Stats */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <BarChart3 size={18} />
            System Stats
          </h2>

          {statsLoading ? (
            <div className={styles.statsGrid}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} padding="md">
                  <div className={styles.statCard}>
                    <Skeleton height={12} width="50%" />
                    <Skeleton height={32} width="40%" />
                  </div>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <>
              <div className={styles.statsGrid}>
                <Card padding="md">
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>
                      <Users size={12} /> Total Users
                    </span>
                    <span className={styles.statValueAccent}>
                      {stats.users.total.toLocaleString()}
                    </span>
                  </div>
                </Card>
                <Card padding="md">
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>
                      <Briefcase size={12} /> Total Jobs
                    </span>
                    <span className={styles.statValue}>
                      {stats.jobs.total.toLocaleString()}
                    </span>
                  </div>
                </Card>
                <Card padding="md">
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>
                      <Palette size={12} /> Style Models
                    </span>
                    <span className={styles.statValue}>
                      {stats.styleModels.total.toLocaleString()}
                    </span>
                  </div>
                </Card>
              </div>

              {/* Job Status Breakdown */}
              <Card padding="lg">
                <div className={styles.jobBreakdown}>
                  <span className={styles.sectionTitle}>Job Status Breakdown</span>

                  <div className={styles.barContainer}>
                    <div
                      className={styles.barCompleted}
                      style={{ width: `${getBarPercent(stats.jobs.completed)}%` }}
                    />
                    <div
                      className={styles.barProcessing}
                      style={{ width: `${getBarPercent(stats.jobs.processing)}%` }}
                    />
                    <div
                      className={styles.barPending}
                      style={{ width: `${getBarPercent(stats.jobs.pending)}%` }}
                    />
                    <div
                      className={styles.barFailed}
                      style={{ width: `${getBarPercent(stats.jobs.failed)}%` }}
                    />
                  </div>

                  <div className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel}>
                      <span className={styles.breakdownDotCompleted} />
                      Completed
                    </span>
                    <span className={styles.breakdownCount}>
                      {stats.jobs.completed.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel}>
                      <span className={styles.breakdownDotProcessing} />
                      Processing
                    </span>
                    <span className={styles.breakdownCount}>
                      {stats.jobs.processing.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel}>
                      <span className={styles.breakdownDotPending} />
                      Pending
                    </span>
                    <span className={styles.breakdownCount}>
                      {stats.jobs.pending.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span className={styles.breakdownLabel}>
                      <span className={styles.breakdownDotFailed} />
                      Failed
                    </span>
                    <span className={styles.breakdownCount}>
                      {stats.jobs.failed.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>
            </>
          ) : null}
        </section>

        {/* Maintenance Mode */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Wrench size={18} />
            Maintenance Mode
          </h2>

          <Card padding="lg">
            <div className={styles.maintenanceSection}>
              <div className={styles.maintenanceStatus}>
                <span>Current status:</span>
                {isMaintenanceOn ? (
                  <span className={styles.maintenanceOn}>Maintenance On</span>
                ) : (
                  <span className={styles.maintenanceOff}>Operational</span>
                )}
              </div>

              {health?.status === 'maintenance' && (
                <p className={styles.maintenanceMessage}>
                  &ldquo;{maintenanceMessage || 'メンテナンス中です'}&rdquo;
                </p>
              )}

              <div className={styles.maintenanceForm}>
                <Input
                  label="Maintenance Message"
                  placeholder="メンテナンスメッセージを入力..."
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                />
                <div className={styles.maintenanceActions}>
                  {isMaintenanceOn ? (
                    <Button
                      variant="secondary"
                      onClick={() => maintenanceMutation.mutate(false)}
                      loading={maintenanceMutation.isPending}
                    >
                      <Shield size={16} />
                      メンテナンス解除
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      onClick={() => maintenanceMutation.mutate(true)}
                      loading={maintenanceMutation.isPending}
                    >
                      <Wrench size={16} />
                      メンテナンスモード有効化
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
