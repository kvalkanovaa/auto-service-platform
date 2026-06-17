import styles from './BookingChoiceModal.module.scss';

interface Props {
  open: boolean;
  onClose: () => void;
  onAnalyze: () => void;
  onDirect: () => void;
  directLabel?: string;
}

/**
 * Питане преди резервация: дали потребителят иска първо AI анализ
 * на проблема, или да запише час директно.
 */
export default function BookingChoiceModal({
  open,
  onClose,
  onAnalyze,
  onDirect,
  directLabel = 'Запиши час директно',
}: Props) {
  if (!open) return null;

  return (
    <div className={styles['overlay']} onClick={onClose} role="presentation">
      <div
        className={styles['modal']}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className={styles['title']}>Как искаш да продължиш?</h3>
        <p className={styles['text']}>
          Можеш първо да направиш безплатен AI анализ на проблема — за по-точна заявка
          към сервиза — или да запишеш час директно.
        </p>

        <button className={styles['option']} onClick={onAnalyze}>
          <span className={styles['option__icon']}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4l1.6 5.2a2 2 0 001.2 1.2L20 12l-5.2 1.6a2 2 0 00-1.2 1.2L12 20l-1.6-5.2a2 2 0 00-1.2-1.2L4 12l5.2-1.6a2 2 0 001.2-1.2z" />
            </svg>
          </span>
          <span className={styles['option__body']}>
            <span className={styles['option__title']}>Първо AI анализ</span>
            <span className={styles['option__desc']}>Препоръчано — описваш проблема, AI предлага причина и услуги</span>
          </span>
        </button>

        <button className={styles['option']} onClick={onDirect}>
          <span className={styles['option__icon']}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </span>
          <span className={styles['option__body']}>
            <span className={styles['option__title']}>{directLabel}</span>
            <span className={styles['option__desc']}>Избираш свободен час и потвърждаваш веднага</span>
          </span>
        </button>

        <button className={styles['cancel']} onClick={onClose}>Отказ</button>
      </div>
    </div>
  );
}
