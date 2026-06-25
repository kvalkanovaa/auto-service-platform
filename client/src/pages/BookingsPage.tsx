import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getMyBookingsApi,
  cancelBookingApi,
  completeBookingApi,
} from '../api/bookings';
import { createReviewApi, getMyReviewsApi } from '../api/reviews';
import { ApiError } from '../api/axios';
import type { Booking, Review } from '../types';
import Layout from '../components/Layout';
import BookingChoiceModal from '../components/BookingChoiceModal';
import InfoBanner from '../components/InfoBanner';
import styles from './BookingsPage.module.scss';

const statusMap: Record<string, { label: string; modifier: string }> = {
  pending: { label: 'Изчакване', modifier: 'pending' },
  confirmed: { label: 'Приета', modifier: 'confirmed' },
  cancelled: { label: 'Отменена', modifier: 'cancelled' },
  completed: { label: 'Завършена', modifier: 'completed' },
};

// Резервация може да се маркира като завършена само след настъпване на часа.
const isPastBooking = (b: Booking) => {
  const iso = b.bookedDate.includes('T')
    ? b.bookedDate
    : `${b.bookedDate}T${b.bookedTime || '23:59'}`;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? true : t <= Date.now();
};

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [reviewFor, setReviewFor] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [choiceOpen, setChoiceOpen] = useState(false);

  useEffect(() => {
    getMyBookingsApi()
      .then(setBookings)
      .finally(() => setIsLoading(false));
    getMyReviewsApi()
      .then((list) =>
        setReviews(Object.fromEntries(list.map((r) => [r.bookingId, r]))),
      )
      .catch(() => {});
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Сигурен ли си, че искаш да отмениш резервацията?')) return;
    setCancelling(id);
    try {
      const updated = await cancelBookingApi(id);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: updated.status } : b)),
      );
    } finally {
      setCancelling(null);
    }
  };

  const handleComplete = async (id: string) => {
    setCompleting(id);
    try {
      const updated = await completeBookingApi(id);
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: updated.status } : b)),
      );
    } finally {
      setCompleting(null);
    }
  };

  const openReview = (id: string) => {
    setReviewFor(id);
    setRating(5);
    setComment('');
    setReviewError('');
  };

  const handleSubmitReview = async (bookingId: string) => {
    setSubmittingReview(true);
    setReviewError('');
    try {
      const created = await createReviewApi({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      setReviews((prev) => ({ ...prev, [bookingId]: created }));
      setReviewFor(null);
    } catch (err: unknown) {
      setReviewError(
        err instanceof ApiError
          ? err.message
          : 'Грешка при изпращане на отзива',
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <Layout>
      <div
        className={styles['bookings__header']}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className={styles['bookings__title']}>Моите резервации</h1>
          <p className={styles['bookings__subtitle']}>
            Всички твои часове при сервизи
          </p>
        </div>
        <button
          onClick={() => setChoiceOpen(true)}
          className={styles['bookings__new-btn']}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Запази час
        </button>
      </div>

      <InfoBanner
        text="Всичките ти записани часове на едно място. Запази нов час директно или след AI анализ; можеш да отмениш, а след часа — да отбележиш резервацията като завършена и да оставиш отзив."
        steps={[
          'Запази час (със или без AI анализ)',
          'Посети сервиза',
          'Завърши и оцени обслужването',
        ]}
      />

      {isLoading ? (
        <div className={styles['bookings__loading']}>
          <div className={styles['bookings__spinner']} />
        </div>
      ) : bookings.length === 0 ? (
        <div className={styles['bookings__empty']}>
          <div className={styles['bookings__empty-icon']}>
            <svg
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#94a3b8"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </div>
          <h3 className={styles['bookings__empty-title']}>Нямаш резервации</h3>
          <p className={styles['bookings__empty-text']}>
            Намери сервиз и запази час
          </p>
          <Link
            to="/service-centers"
            className={styles['bookings__empty-link']}
          >
            Виж сервизи
          </Link>
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
                      <span
                        className={`${styles['bookings__status-badge']} ${styles[`bookings__status-badge--${st.modifier}`]}`}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p className={styles['bookings__service-name']}>
                      {center?.name ?? '—'}
                    </p>
                    <p className={styles['bookings__location']}>
                      {center?.city} · {center?.address}
                    </p>
                    <div className={styles['bookings__meta-row']}>
                      <span className={styles['bookings__meta-time']}>
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="#64748b"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {b.bookedDate} в {b.bookedTime}
                      </span>
                      <span className={styles['bookings__meta-separator']}>
                        ·
                      </span>
                      <span>
                        {vehicle?.brand} {vehicle?.model} ({vehicle?.year})
                      </span>
                    </div>
                    {b.note && (
                      <p className={styles['bookings__note']}>Бел.: {b.note}</p>
                    )}
                  </div>
                  <div className={styles['bookings__actions']}>
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <>
                        <button
                          onClick={() => handleComplete(b._id)}
                          disabled={completing === b._id || !isPastBooking(b)}
                          title={
                            !isPastBooking(b)
                              ? 'Можеш да отбележиш като завършена след часа на резервацията'
                              : undefined
                          }
                          className={styles['bookings__complete-btn']}
                        >
                          {completing === b._id ? '...' : 'Завърши'}
                        </button>
                        {!isPastBooking(b) && (
                          <button
                            onClick={() => handleCancel(b._id)}
                            disabled={cancelling === b._id}
                            className={styles['bookings__cancel-btn']}
                          >
                            {cancelling === b._id ? '...' : 'Откажи'}
                          </button>
                        )}
                      </>
                    )}
                    {b.status === 'completed' && !reviews[b._id] && (
                      <button
                        onClick={() => openReview(b._id)}
                        className={styles['bookings__review-btn']}
                      >
                        Остави отзив
                      </button>
                    )}
                    {b.status === 'completed' && reviews[b._id] && (
                      <span className={styles['bookings__reviewed']}>
                        ✓ Оценено
                      </span>
                    )}
                  </div>
                </div>

                {b.status === 'completed' &&
                  reviews[b._id] &&
                  reviewFor !== b._id && (
                    <div className={styles['bookings__myreview']}>
                      <span className={styles['bookings__myreview-stars']}>
                        {'★'.repeat(reviews[b._id].rating)}
                        {'☆'.repeat(5 - reviews[b._id].rating)}
                      </span>
                      <span className={styles['bookings__myreview-label']}>
                        Вашата оценка
                      </span>
                      {reviews[b._id].comment && (
                        <p className={styles['bookings__myreview-comment']}>
                          „{reviews[b._id].comment}“
                        </p>
                      )}
                    </div>
                  )}

                {reviewFor === b._id && (
                  <div className={styles['bookings__review-form']}>
                    <p className={styles['bookings__review-title']}>
                      Оцени обслужването
                    </p>
                    <div className={styles['bookings__stars']}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className={styles['bookings__star']}
                          aria-label={`Оценка ${n} от 5`}
                        >
                          {n <= rating ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Коментар (по желание)"
                      rows={3}
                      className={styles['bookings__review-textarea']}
                    />
                    {reviewError && (
                      <p className={styles['bookings__review-error']}>
                        {reviewError}
                      </p>
                    )}
                    <div className={styles['bookings__review-actions']}>
                      <button
                        onClick={() => handleSubmitReview(b._id)}
                        disabled={submittingReview}
                        className={styles['bookings__review-submit']}
                      >
                        {submittingReview ? 'Изпращане...' : 'Изпрати отзив'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewFor(null)}
                        className={styles['bookings__review-cancel']}
                      >
                        Отказ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BookingChoiceModal
        open={choiceOpen}
        onClose={() => setChoiceOpen(false)}
        onAnalyze={() => navigate('/problem-reports/new')}
        onDirect={() => navigate('/service-centers')}
        directLabel="Избери сервиз и час"
      />
    </Layout>
  );
}
