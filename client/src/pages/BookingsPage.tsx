import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookingsApi, cancelBookingApi } from '../api/bookings';
import type { Booking } from '../types';
import Layout from '../components/Layout';
import styles from './BookingsPage.module.scss';

const statusMap: Record<string, { label: string; modifier: string }> = {
  pending:   { label: 'Изчакване',  modifier: 'pending' },
  confirmed: { label: 'Приета',     modifier: 'confirmed' },
  cancelled: { label: 'Отменена',   modifier: 'cancelled' },
  completed: { label: 'Завършена',  modifier: 'completed' },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    getMyBookingsApi().then(setBookings).finally(() => setIsLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Сигурен ли си, че искаш да отмениш резервацията?')) return;
    setCancelling(id);
    try {
      const updated = await cancelBookingApi(id);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: updated.status } : b));
    } finally {
      setCancelling(null);
    }
  };

  return (
    <Layout>
      <div className={styles['bookings__header']}>
        <h1 className={styles['bookings__title']}>Моите резервации</h1>
        <p className={styles['bookings__subtitle']}>Всички твои часове при сервизи</p>
      </div>

      {isLoading ? (
        <div className={styles['bookings__loading']}>
          <div className={styles['bookings__spinner']} />
        </div>
      ) : bookings.length === 0 ? (
        <div className={styles['bookings__empty']}>
          <div className={styles['bookings__empty-icon']}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className={styles['bookings__empty-title']}>Нямаш резервации</h3>
          <p className={styles['bookings__empty-text']}>Намери сервиз и запази час</p>
          <Link to="/service-centers" className={styles['bookings__empty-link']}>Виж сервизи</Link>
        </div>
      ) : (
        <div className={styles['bookings__list']}>
          {bookings.map((b) => {
            const st = statusMap[b.status] ?? statusMap.pending;
            const vehicle = b.vehicleId as any;
            const center = b.serviceCenterId as any;
            return (
              <div key={b._id} className={styles['bookings__card']}>
                <div className={styles['bookings__card-inner']}>
                  <div className={styles['bookings__card-left']}>
                    <div className={styles['bookings__status-wrap']}>
                      <span className={`${styles['bookings__status-badge']} ${styles[`bookings__status-badge--${st.modifier}`]}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className={styles['bookings__service-name']}>{center?.name ?? '—'}</p>
                    <p className={styles['bookings__location']}>{center?.city} · {center?.address}</p>
                    <div className={styles['bookings__meta-row']}>
                      <span className={styles['bookings__meta-time']}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748b" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {b.bookedDate} в {b.bookedTime}
                      </span>
                      <span className={styles['bookings__meta-separator']}>·</span>
                      <span>{vehicle?.brand} {vehicle?.model} ({vehicle?.year})</span>
                    </div>
                    {b.note && <p className={styles['bookings__note']}>Бел.: {b.note}</p>}
                  </div>
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button
                      onClick={() => handleCancel(b._id)}
                      disabled={cancelling === b._id}
                      className={styles['bookings__cancel-btn']}
                      style={{ opacity: cancelling === b._id ? 0.5 : undefined }}
                    >
                      {cancelling === b._id ? '...' : 'Откажи'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
