"use client";

import { useState, useCallback } from "react";
import {
  Type,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
} from "lucide-react";
import styles from "./TextTool.module.css";

interface TextToolProps {
  onAddText: (text: string, options: TextOptions) => void;
  onUpdateText?: (options: Partial<TextOptions>) => void;
  selectedText?: TextOptions | null;
}

export interface TextOptions {
  content: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
}

const FONT_FAMILIES = [
  "Roboto",
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Impact",
  "Comic Sans MS",
];

const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 96, 128];

const PRESET_COLORS = [
  "#ffffff",
  "#000000",
  "#ff0000",
  "#ff4e45",
  "#f5a623",
  "#2ba640",
  "#3ea6ff",
  "#6bbfff",
  "#c084fc",
  "#ff69b4",
];

export default function TextTool({
  onAddText,
  onUpdateText,
  selectedText,
}: TextToolProps) {
  const [newText, setNewText] = useState("テキストを入力");
  const [fontSize, setFontSize] = useState(selectedText?.fontSize ?? 48);
  const [fontFamily, setFontFamily] = useState(
    selectedText?.fontFamily ?? "Roboto",
  );
  const [fill, setFill] = useState(selectedText?.fill ?? "#ffffff");
  const [fontWeight, setFontWeight] = useState(
    selectedText?.fontWeight ?? "bold",
  );
  const [fontStyle, setFontStyle] = useState(
    selectedText?.fontStyle ?? "normal",
  );
  const [textAlign, setTextAlign] = useState(
    selectedText?.textAlign ?? "center",
  );

  const handleAdd = useCallback(() => {
    onAddText(newText, {
      content: newText,
      fontSize,
      fontFamily,
      fill,
      fontWeight,
      fontStyle,
      textAlign,
    });
  }, [newText, fontSize, fontFamily, fill, fontWeight, fontStyle, textAlign, onAddText]);

  const handleUpdate = useCallback(
    (partial: Partial<TextOptions>) => {
      if (onUpdateText) {
        onUpdateText(partial);
      }
    },
    [onUpdateText],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Type size={16} />
        <span>テキスト</span>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>新規テキスト</label>
        <div className={styles.addRow}>
          <input
            type="text"
            className={styles.input}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="テキストを入力..."
          />
          <button className={styles.addBtn} onClick={handleAdd} title="追加">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <label className={styles.label}>フォント</label>
        <select
          className={styles.select}
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            handleUpdate({ fontFamily: e.target.value });
          }}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>サイズ</label>
        <div className={styles.sizeRow}>
          <select
            className={styles.select}
            value={fontSize}
            onChange={(e) => {
              const size = Number(e.target.value);
              setFontSize(size);
              handleUpdate({ fontSize: size });
            }}
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}px
              </option>
            ))}
          </select>
          <input
            type="number"
            className={styles.sizeInput}
            value={fontSize}
            min={8}
            max={200}
            onChange={(e) => {
              const size = Number(e.target.value);
              setFontSize(size);
              handleUpdate({ fontSize: size });
            }}
          />
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>スタイル</label>
        <div className={styles.styleRow}>
          <button
            className={`${styles.styleBtn} ${fontWeight === "bold" ? styles.styleBtnActive : ""}`}
            onClick={() => {
              const next = fontWeight === "bold" ? "normal" : "bold";
              setFontWeight(next);
              handleUpdate({ fontWeight: next });
            }}
            title="太字"
          >
            <Bold size={14} />
          </button>
          <button
            className={`${styles.styleBtn} ${fontStyle === "italic" ? styles.styleBtnActive : ""}`}
            onClick={() => {
              const next = fontStyle === "italic" ? "normal" : "italic";
              setFontStyle(next);
              handleUpdate({ fontStyle: next });
            }}
            title="斜体"
          >
            <Italic size={14} />
          </button>
          <div className={styles.alignGroup}>
            <button
              className={`${styles.styleBtn} ${textAlign === "left" ? styles.styleBtnActive : ""}`}
              onClick={() => {
                setTextAlign("left");
                handleUpdate({ textAlign: "left" });
              }}
              title="左揃え"
            >
              <AlignLeft size={14} />
            </button>
            <button
              className={`${styles.styleBtn} ${textAlign === "center" ? styles.styleBtnActive : ""}`}
              onClick={() => {
                setTextAlign("center");
                handleUpdate({ textAlign: "center" });
              }}
              title="中央揃え"
            >
              <AlignCenter size={14} />
            </button>
            <button
              className={`${styles.styleBtn} ${textAlign === "right" ? styles.styleBtnActive : ""}`}
              onClick={() => {
                setTextAlign("right");
                handleUpdate({ textAlign: "right" });
              }}
              title="右揃え"
            >
              <AlignRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>カラー</label>
        <div className={styles.colorRow}>
          <input
            type="color"
            className={styles.colorPicker}
            value={fill}
            onChange={(e) => {
              setFill(e.target.value);
              handleUpdate({ fill: e.target.value });
            }}
          />
          <div className={styles.colorPresets}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={`${styles.colorSwatch} ${fill === c ? styles.colorSwatchActive : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => {
                  setFill(c);
                  handleUpdate({ fill: c });
                }}
                title={c}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
