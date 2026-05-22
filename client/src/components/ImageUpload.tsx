import { useRef, useState } from 'react';
import api from '../api/axios';
import styles from './ImageUpload.module.scss';

interface Props {
  value?: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: Props) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await api.post<{ url: string }>('/upload', formData);
      onChange(result.url);
    } catch {
      setError('Грешка при качване');
      setPreview(value);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={styles['image-upload']}>
      <label className={styles['image-upload__label']}>Снимка на колата</label>

      {preview ? (
        <div className={styles['image-upload__preview']}>
          <img src={preview} alt="Vehicle" className={styles['image-upload__img']} />
          {isUploading && (
            <div className={styles['image-upload__overlay']}>
              <div className={styles['image-upload__spinner']} />
            </div>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className={styles['image-upload__remove-btn']}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <label className={styles['image-upload__dropzone']}>
          <svg
            className={styles['image-upload__dropzone-icon']}
            width="32"
            height="32"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span className={styles['image-upload__dropzone-text']}>Кликни за да качиш снимка</span>
          <span className={styles['image-upload__dropzone-hint']}>PNG, JPG до 5MB</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className={styles['image-upload__file-input']}
            onChange={handleFile}
          />
        </label>
      )}

      {error && <p className={styles['image-upload__error']}>{error}</p>}
    </div>
  );
}
