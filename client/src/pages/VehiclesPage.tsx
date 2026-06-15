import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVehiclesApi } from '../api/vehicles';
import type { Vehicle } from '../types';
import Layout from '../components/Layout';
import InfoBanner from '../components/InfoBanner';
import styles from './VehiclesPage.module.scss';

const formatEngine = (engine: string) => {
  const trimmed = engine.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return parseFloat(trimmed).toFixed(1);
  }
  return trimmed;
};

const fuelLabels: Record<string, string> = {
  petrol: 'Бензин', diesel: 'Дизел', electric: 'Електрически', hybrid: 'Хибрид', lpg: 'Газ (LPG)',
};
const transmissionLabels: Record<string, string> = {
  manual: 'Ръчна', automatic: 'Автоматична',
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getVehiclesApi().then(setVehicles).finally(() => setIsLoading(false));
  }, []);

  return (
    <Layout>
      {/* Page header */}
      <div className={styles['header']}>
        <div>
          <h1 className={styles['header__title']}>Моите коли</h1>
          <p className={styles['header__subtitle']}>Управлявай регистрираните си автомобили</p>
        </div>
        <Link to="/vehicles/new" className={styles['add-btn']}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Добави кола
        </Link>
      </div>

      <InfoBanner
        text="Тук управляваш автомобилите си. Добави кола веднъж и данните ѝ се използват автоматично при AI анализ на проблем и при резервация на час."
        steps={['Добави автомобил', 'Опиши проблем или запази час', 'Следи сервизната история']}
      />

      {isLoading ? (
        <div className={styles['loading']}>
          <div className={styles['loading__spinner']} />
        </div>

      ) : vehicles.length === 0 ? (
        <div className={styles['empty']}>
          <div className={styles['empty__icon-box']}>
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <h3 className={styles['empty__title']}>Нямаш добавени коли</h3>
          <p className={styles['empty__text']}>Добави първата си кола, за да можеш да описваш проблеми и да запазваш часове</p>
          <Link to="/vehicles/new" className={styles['empty__cta']}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Добави кола
          </Link>
        </div>

      ) : (
        <div className={styles['grid']}>
          {vehicles.map((v) => (
            <Link key={v._id} to={`/vehicles/${v._id}`} className={styles['card-link']}>
              <div className={styles['card']}>
                {/* Image */}
                <div className={`${styles['card__image-wrap']} ${v.imageUrl ? styles['card__image-wrap--photo'] : styles['card__image-wrap--placeholder']}`}>
                  {v.imageUrl ? (
                    <img
                      src={v.imageUrl}
                      alt={`${v.brand} ${v.model}`}
                      className={styles['card__image']}
                    />
                  ) : (
                    <div className={styles['card__placeholder']}>
                      <svg width="56" height="56" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                    </div>
                  )}
                  {/* Year badge */}
                  <div className={styles['card__year-badge']}>{v.year}</div>
                </div>

                {/* Content */}
                <div className={styles['card__content']}>
                  <div className={styles['card__meta']}>
                    <div>
                      <div className={styles['card__title']}>{v.brand} {v.model}</div>
                      {v.registrationNumber && (
                        <div className={styles['card__reg']}>{v.registrationNumber}</div>
                      )}
                    </div>
                    <div className={styles['card__chevron']}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  <div className={styles['card__tags']}>
                    <span className={`${styles['card__tag']} ${styles['card__tag--fuel']}`}>
                      {fuelLabels[v.fuelType]}
                    </span>
                    <span className={`${styles['card__tag']} ${styles['card__tag--transmission']}`}>
                      {transmissionLabels[v.transmission]}
                    </span>
                    {v.engine && (
                      <span className={`${styles['card__tag']} ${styles['card__tag--engine']}`}>
                        {formatEngine(v.engine)}
                      </span>
                    )}
                    {v.mileage != null && (
                      <span className={`${styles['card__tag']} ${styles['card__tag--mileage']}`}>
                        {v.mileage.toLocaleString()} км
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}
