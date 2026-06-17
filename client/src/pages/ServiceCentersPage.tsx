import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServiceCentersApi } from '../api/serviceCenters';
import type { ServiceCenter } from '../types';
import Layout from '../components/Layout';
import InfoBanner from '../components/InfoBanner';
import styles from './ServiceCentersPage.module.scss';

const categoryLabels: Record<string, string> = {
  engine: 'Двигател', diagnostics: 'Диагностика', brakes: 'Спирачки',
  suspension: 'Окачване', tires: 'Гуми', electrical: 'Електрика',
  'air-conditioning': 'Климатик', bodywork: 'Каросерия',
  transmission: 'Скоростна кутия', 'oil-service': 'Маслена смяна',
};

export default function ServiceCentersPage() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setIsLoading(true);
    getServiceCentersApi({ city: city || undefined, category: category || undefined })
      .then(setCenters)
      .finally(() => setIsLoading(false));
  }, [city, category]);

  return (
    <Layout>
      {/* Header */}
      <div className={styles['service-centers__header']}>
        <h1 className={styles['service-centers__title']}>Сервизи</h1>
        <p className={styles['service-centers__subtitle']}>Намери сервиз за твоя автомобил</p>
      </div>

      <InfoBanner
        text="Разгледай одобрените сервизи, филтрирай по град и услуга, виж рейтинг и свободни часове. Можеш да запазиш час със или без предварителен AI анализ на проблема."
        steps={['Филтрирай по град или услуга', 'Отвори сервиз и виж детайли', 'Избери свободен час']}
      />

      {/* Filters */}
      <div className={styles['service-centers__filters']}>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Филтрирай по град..."
          className={styles['service-centers__filter-city']}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles['service-centers__filter-category']}
        >
          <option value="">Всички услуги</option>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className={styles['service-centers__loading']}>
          <div className={styles['service-centers__spinner']} />
        </div>
      ) : centers.length === 0 ? (
        <div className={styles['service-centers__empty']}>
          <p className={styles['service-centers__empty-title']}>Няма намерени сервизи</p>
          <p className={styles['service-centers__empty-text']}>Опитай с различен град или категория</p>
        </div>
      ) : (
        <div className={styles['service-centers__grid']}>
          {centers.map((c) => (
            <Link key={c._id} to={`/service-centers/${c._id}`} className={styles['service-centers__card-link']}>
              <div className={styles['service-centers__card']}>
                <div className={styles['service-centers__card-header']}>
                  <div className={styles['service-centers__card-icon']}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1e3a5f" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <svg className={styles['service-centers__card-chevron']} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <p className={styles['service-centers__card-name']}>{c.name}</p>
                <p className={styles['service-centers__card-location']}>{c.city} · {c.address}</p>

                {c.ratingAvg > 0 && (
                  <div className={styles['service-centers__card-rating']}>
                    <svg width="13" height="13" fill="#facc15" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className={styles['service-centers__card-rating-value']}>{c.ratingAvg.toFixed(1)}</span>
                    <span className={styles['service-centers__card-rating-count']}>({c.reviewCount})</span>
                  </div>
                )}

                <div className={styles['service-centers__card-tags']}>
                  {c.servicesOffered.slice(0, 4).map((s) => (
                    <span key={s} className={styles['service-centers__card-tag']}>
                      {categoryLabels[s] ?? s}
                    </span>
                  ))}
                  {c.servicesOffered.length > 4 && (
                    <span className={styles['service-centers__card-tag--more']}>+{c.servicesOffered.length - 4}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
