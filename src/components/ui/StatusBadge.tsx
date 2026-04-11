import styles from "./StatusBadge.module.css";

interface StatusBadgeProps {
  status: string;
}

const labels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  training: "Training",
  ready: "Ready",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status] || ""}`}>
      <span className={styles.dot} />
      {labels[status] || status}
    </span>
  );
}
