import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getReportsApi } from '../api/problemReports';
import type { ProblemReport } from '../types';
import Layout from '../components/Layout';
import InfoBanner from '../components/InfoBanner';
import styles from './ProblemReportsPage.module.scss';

const urgencyLabels: Record<string, string> = {
  low: 'Нисък', medium: 'Среден', high: 'Висок', critical: 'Критичен',
};
const statusLabels: Record<string, string> = {
  open: 'Отворен', booked: 'Записан', closed: 'Затворен',
};

export default function ProblemReportsPage() {
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getReportsApi().then(setReports).finally(() => setIsLoading(false));
  }, []);

  return (
    <Layout>
      <div className={styles['header']}>
        <div>
          <h1 className={styles['header__title']}>Проблеми</h1>
          <p className={styles['header__subtitle']}>Описани проблеми и AI анализи</p>
        </div>
        <Link to="/problem-reports/new" className={styles['header__btn']}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Нов проблем
        </Link>
      </div>

      <InfoBanner
        text="Опиши проблем със свои думи — изкуственият интелект разпознава вероятната причина, спешността и подходящите услуги, и предлага сервизи. После можеш да запазиш час."
        steps={['Избери кола и опиши симптомите', 'Прегледай AI анализа', 'Запази час при препоръчан сервиз']}
      />

      {isLoading ? (
        <div className={styles['loading']}>
          <div className={styles['loading__spinner']} />
        </div>
      ) : reports.length === 0 ? (
        <div className={styles['empty']}>
          <div className={styles['empty__icon-box']}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <h3 className={styles['empty__title']}>Нямаш описани проблеми</h3>
          <p className={styles['empty__subtitle']}>Опиши проблем и AI ще го анализира</p>
          <Link to="/problem-reports/new" className={styles['empty__btn']}>Нов проблем</Link>
        </div>
      ) : (
        <div className={styles['list']}>
          {reports.map((r) => {
            const vehicle = r.vehicleId as any;
            const urgencyClass = r.aiUrgency ? styles[`urgency--${r.aiUrgency}`] : null;
            const statusClass = styles[`status--${r.status}`] ?? styles['status--open'];
            return (
              <Link key={r._id} to={`/problem-reports/${r._id}`} className={styles['card-link']}>
                <div className={styles['card']}>
                  <div className={styles['card__icon-box']}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1d4ed8" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </div>
                  <div className={styles['card__body']}>
                    <p className={styles['card__title']}>{r.title}</p>
                    <p className={styles['card__vehicle']}>{vehicle?.brand} {vehicle?.model} · {vehicle?.year}</p>
                  </div>
                  <div className={styles['card__right']}>
                    {urgencyClass && (
                      <span className={urgencyClass}>{urgencyLabels[r.aiUrgency!]}</span>
                    )}
                    <span className={statusClass}>{statusLabels[r.status]}</span>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
