import styles from './SuccessBanner.module.scss';

interface Props {
  text: string;
  onClose: () => void;
}

export default function SuccessBanner({ text, onClose }: Props) {
  return (
    <div className={styles['banner']} role="status">
      <span className={styles['icon']}>
        <svg
          width="22"
          height="22"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75l2.25 2.25L15 9.75"
          />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </span>
      <p className={styles['text']}>{text}</p>
      <button
        type="button"
        className={styles['close']}
        onClick={onClose}
        aria-label="Затвори"
      >
        ×
      </button>
    </div>
  );
}
