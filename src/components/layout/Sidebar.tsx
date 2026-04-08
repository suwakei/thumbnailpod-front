'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Clock,
  Palette,
  Settings,
  MonitorPlay,
  LayoutDashboard,
  FileText,
  Heart,
  Webhook,
} from 'lucide-react';
import { ROUTES } from '@/consts';
import styles from './Sidebar.module.css';

const navItems = [
  { href: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.history, label: 'History', icon: Clock },
  { href: ROUTES.favorites, label: 'Favorites', icon: Heart },
  { href: ROUTES.templates, label: 'Templates', icon: FileText },
  { href: ROUTES.style, label: 'Style Models', icon: Palette },
  { href: ROUTES.youtube, label: 'YouTube', icon: MonitorPlay },
  { href: ROUTES.webhooks, label: 'Webhooks', icon: Webhook },
  { href: ROUTES.settings, label: 'Settings', icon: Settings },
];

interface SidebarProps {
  channelName?: string;
  plan?: string;
}

export default function Sidebar({ channelName, plan }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Sparkles size={18} />
        </div>
        <div>
          <div className={styles.logoText}>ThumbnailPod</div>
          <div className={styles.logoSub}>AI Thumbnail Studio</div>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>Main</div>
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? styles.navLinkActive : styles.navLink}
            >
              <Icon size={18} className={styles.navIcon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <Link href={ROUTES.settings} className={styles.userCard}>
          <div className={styles.avatar}>
            {(channelName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div className={styles.userName}>{channelName || 'User'}</div>
            <div className={styles.userPlan}>{plan || 'free'} plan</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
