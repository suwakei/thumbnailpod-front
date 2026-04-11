"use client";

import { Loader2 } from "lucide-react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "icon";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${loading ? styles.loading : ""} ${className || ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className={styles.spinner} />}
      {children}
    </button>
  );
}
