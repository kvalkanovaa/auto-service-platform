import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getServiceCenterApi, getServiceCenterSlotsApi } from '../api/serviceCenters';
import { getServiceCenterReviewsApi } from '../api/reviews';
import type { ServiceCenter, AvailableSlot, Review } from '../types';
import Layout from '../components/Layout';
import BookingChoiceModal from '../components/BookingChoiceModal';
import styles from './ServiceCenterDetailPage.module.scss';

const categoryLabels: Record<string, string> = {
  engine: 'Двигател', diagnostics: 'Диагностика', brakes: 'Спирачки',
  suspension: 'Окачване', tires: 'Гуми', electrical: 'Електрика',
  'air-conditioning': 'Климатик', bodywork: 'Каросерия',
  transmission: 'Скоростна кутия', 'oil-service': 'Маслена смяна',
};

const dayLabels: Record<string, string> = {
  monday: 'Пон', tuesday: 'Вт', wednesday: 'Ср',
  thursday: 'Чет', friday: 'Пет', saturday: 'Съб', sunday: 'Нед',
};

export default function ServiceCenterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromReportId = searchParams.get('reportId') ?? '';
  const [center, setCenter] = useState<ServiceCenter | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [choiceSlot, setChoiceSlot] = useState<AvailableSlot | null>(null);

  useEffect(() => {
    if (!id) return;
    getServiceCenterApi(id).then(setCenter);
    getServiceCenterSlotsApi(id).then(setSlots);
    getServiceCenterReviewsApi(id).then(setReviews);
  }, [id]);

  const slotsByDate = slots.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  if (!center) {
    return (
      <Layout>
        <div className={styles['detail__loading']}>
          <div className={styles['detail__spinner']} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['detail']}>
        {/* Header */}
        <div className={styles['detail__header']}>
          <Link to="/service-centers" className={styles['detail__back-btn']}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className={styles['detail__header-info']}>
            <h1 className={styles['detail__title']}>{center.name}</h1>
            <p className={styles['detail__subtitle']}>{center.city} · {center.address}</p>
          </div>
        </div>

        <div className={styles['detail__body']}>
          {/* Info card */}
          <div className={styles['detail__info-card']}>
            {center.description && (
              <p className={styles['detail__description']}>{center.description}</p>
            )}

            <div className={styles['detail__info-grid']}>
              <div>
                <p className={styles['detail__field-label']}>Телефон</p>
                <p className={styles['detail__field-value']}>{center.phone}</p>
              </div>
              <div>
                <p className={styles['detail__field-label']}>Email</p>
                <p className={styles['detail__field-value']}>{center.email}</p>
              </div>
              <div>
                <p className={styles['detail__field-label']}>Работно време</p>
                <p className={styles['detail__field-value']}>{center.workingHours.open} – {center.workingHours.close}</p>
              </div>
              <div>
                <p className={styles['detail__field-label']}>Работни дни</p>
                <p className={styles['detail__field-value']}>
                  {center.workingHours.days.map((d) => dayLabels[d] ?? d).join(', ')}
                </p>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.address}, ${center.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles['detail__map-link']}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Виж на картата
            </a>

            {center.ratingAvg > 0 && (
              <div className={styles['detail__rating-row']}>
                <svg width="16" height="16" fill="#facc15" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className={styles['detail__rating-value']}>{center.ratingAvg.toFixed(1)}</span>
                <span className={styles['detail__rating-count']}>({center.reviewCount} отзива)</span>
              </div>
            )}

            <div>
              <p className={styles['detail__services-label']}>Услуги</p>
              <div className={styles['detail__services-list']}>
                {center.servicesOffered.map((s) => (
                  <span key={s} className={styles['detail__service-badge']}>
                    {categoryLabels[s] ?? s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Available slots */}
          <div className={styles['detail__slots-card']}>
            <h2 className={styles['detail__slots-title']}>Свободни часове</h2>
            {Object.keys(slotsByDate).length === 0 ? (
              <p className={styles['detail__slots-empty']}>Няма свободни часове</p>
            ) : (
              <div className={styles['detail__slots-groups']}>
                {Object.entries(slotsByDate).map(([date, dateSlots]) => (
                  <div key={date}>
                    <p className={styles['detail__date-label']}>{date}</p>
                    <div className={styles['detail__date-slots']}>
                      {dateSlots.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => {
                            if (fromReportId) {
                              navigate(`/bookings/new?slotId=${slot._id}&centerId=${center._id}&reportId=${fromReportId}`);
                            } else {
                              setChoiceSlot(slot);
                            }
                          }}
                          className={styles['detail__slot-btn']}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className={styles['detail__reviews']}>
          <h2 className={styles['detail__reviews-title']}>
            Отзиви{reviews.length > 0 ? ` (${reviews.length})` : ''}
          </h2>
          {reviews.length === 0 ? (
            <p className={styles['detail__reviews-empty']}>Все още няма отзиви за този сервиз.</p>
          ) : (
            <div className={styles['detail__reviews-list']}>
              {reviews.map((r) => (
                <div key={r._id} className={styles['detail__review']}>
                  <div className={styles['detail__review-head']}>
                    <span className={styles['detail__review-author']}>
                      {r.userId?.firstName} {r.userId?.lastName}
                    </span>
                    <span className={styles['detail__review-stars']}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.comment && <p className={styles['detail__review-comment']}>{r.comment}</p>}
                  <span className={styles['detail__review-date']}>
                    {new Date(r.createdAt).toLocaleDateString('bg-BG')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BookingChoiceModal
        open={!!choiceSlot}
        onClose={() => setChoiceSlot(null)}
        onAnalyze={() => navigate('/problem-reports/new')}
        onDirect={() => choiceSlot && navigate(`/bookings/new?slotId=${choiceSlot._id}&centerId=${center._id}`)}
        directLabel="Запиши този час директно"
      />
    </Layout>
  );
}
