"use client";

import { useState, useCallback, useEffect } from "react";
import { Palette, RotateCcw } from "lucide-react";
import type { ColorFilters } from "@/lib/editor-state";
import { DEFAULT_FILTERS } from "@/lib/editor-state";
import styles from "./ColorTool.module.css";

interface ColorToolProps {
  selectedLayerId: string | null;
  onFiltersChange: (layerId: string, filters: ColorFilters) => void;
}

export default function ColorTool({
  selectedLayerId,
  onFiltersChange,
}: ColorToolProps) {
  const [filters, setFilters] = useState<ColorFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    // Defer state update to avoid synchronous setState in effect
    queueMicrotask(() => setFilters(DEFAULT_FILTERS));
  }, [selectedLayerId]);

  const handleChange = useCallback(
    (key: keyof ColorFilters, value: number) => {
      if (!selectedLayerId) return;
      const next = { ...filters, [key]: value };
      setFilters(next);
      onFiltersChange(selectedLayerId, next);
    },
    [selectedLayerId, filters, onFiltersChange],
  );

  const handleReset = useCallback(() => {
    if (!selectedLayerId) return;
    setFilters(DEFAULT_FILTERS);
    onFiltersChange(selectedLayerId, DEFAULT_FILTERS);
  }, [selectedLayerId, onFiltersChange]);

  const disabled = !selectedLayerId;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Palette size={16} />
        <span>色調補正</span>
        <button
          className={styles.resetBtn}
          onClick={handleReset}
          disabled={disabled}
          title="リセット"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {disabled && <p className={styles.hint}>レイヤーを選択してください</p>}

      <div className={styles.sliderGroup}>
        <div className={styles.sliderRow}>
          <label className={styles.label}>明るさ</label>
          <input
            type="range"
            className={styles.slider}
            min={-100}
            max={100}
            value={filters.brightness}
            disabled={disabled}
            onChange={(e) => handleChange("brightness", Number(e.target.value))}
          />
          <span className={styles.value}>{filters.brightness}</span>
        </div>

        <div className={styles.sliderRow}>
          <label className={styles.label}>コントラスト</label>
          <input
            type="range"
            className={styles.slider}
            min={-100}
            max={100}
            value={filters.contrast}
            disabled={disabled}
            onChange={(e) => handleChange("contrast", Number(e.target.value))}
          />
          <span className={styles.value}>{filters.contrast}</span>
        </div>

        <div className={styles.sliderRow}>
          <label className={styles.label}>彩度</label>
          <input
            type="range"
            className={styles.slider}
            min={-100}
            max={100}
            value={filters.saturation}
            disabled={disabled}
            onChange={(e) => handleChange("saturation", Number(e.target.value))}
          />
          <span className={styles.value}>{filters.saturation}</span>
        </div>
      </div>
    </div>
  );
}
