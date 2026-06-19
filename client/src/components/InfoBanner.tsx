import styles from './InfoBanner.module.scss';

interface Props {
  text: string;
  steps?: string[];
}

export default function InfoBanner({ text, steps }: Props) {
  return (
    <div className={styles['banner']}>
      <div className={styles['icon']}>
        <svg
          width="20"
          height="20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
          />
        </svg>
      </div>
      <div className={styles['body']}>
        <p className={styles['text']}>{text}</p>
        {steps && steps.length > 0 && (
          <ol className={styles['steps']}>
            {steps.map((s, i) => (
              <li key={i} className={styles['step']}>
                <span className={styles['num']}>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
