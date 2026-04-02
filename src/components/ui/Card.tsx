import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive' | 'highlighted';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${styles[`pad${padding}`]} ${className || ''}`}
    >
      {children}
    </div>
  );
}
