"use client";

import { useState, useRef, useCallback } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import styles from "./ImageUploader.module.css";

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  s3Key: string | null;
  status: "pending" | "uploading" | "done" | "error";
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export type { UploadedImage };

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUploader({
  images,
  onImagesChange,
  maxFiles = 5,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remaining = maxFiles - images.length;
      if (remaining <= 0) return;

      const valid = fileArray
        .filter((f) => {
          if (!ACCEPTED_TYPES.includes(f.type)) return false;
          if (f.size > MAX_FILE_SIZE) return false;
          return true;
        })
        .slice(0, remaining);

      const newImages: UploadedImage[] = valid.map((file) => ({
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        s3Key: null,
        status: "pending",
      }));

      onImagesChange([...images, ...newImages]);
    },
    [images, maxFiles, onImagesChange],
  );

  const removeImage = useCallback(
    (id: string) => {
      const target = images.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      onImagesChange(images.filter((img) => img.id !== id));
    },
    [images, onImagesChange],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragOver(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      addFiles(e.dataTransfer.files);
    },
    [disabled, addFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
      }
      e.target.value = "";
    },
    [addFiles],
  );

  const canAdd = images.length < maxFiles && !disabled;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ImagePlus size={14} />
        <span>参照画像</span>
        <span className={styles.count}>
          {images.length}/{maxFiles}
        </span>
      </div>

      {images.length > 0 && (
        <div className={styles.previews}>
          {images.map((img) => (
            <div key={img.id} className={styles.previewItem}>
              <img
                src={img.previewUrl}
                alt="参照画像"
                className={styles.previewImg}
              />
              {img.status === "uploading" && (
                <div className={styles.uploadingOverlay}>
                  <Loader2 size={16} className={styles.spin} />
                </div>
              )}
              {img.status === "error" && (
                <div className={styles.errorOverlay}>!</div>
              )}
              {img.status === "done" && (
                <div className={styles.doneOverlay}>&#10003;</div>
              )}
              <button
                className={styles.removeBtn}
                onClick={() => removeImage(img.id)}
                disabled={disabled}
                title="削除"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <div
          className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus size={20} />
          <span>
            ドラッグ&ドロップ または クリックして画像を追加
          </span>
          <span className={styles.hint}>
            PNG / JPEG / WebP, 最大10MB
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple
            onChange={handleInputChange}
            className={styles.fileInput}
          />
        </div>
      )}
    </div>
  );
}
