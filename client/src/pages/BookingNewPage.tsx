import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getServiceCenterApi, getServiceCenterSlotsApi } from '../api/serviceCenters';
import { getVehiclesApi } from '../api/vehicles';
import { getReportsApi } from '../api/problemReports';
import { createBookingApi } from '../api/bookings';
import type { ServiceCenter, AvailableSlot, Vehicle, ProblemReport } from '../types';
import Layout from '../components/Layout';
import styles from './BookingNewPage.module.scss';

const urgencyLabels: Record<string, string> = {
  low: 'Ниска', medium: 'Средна', high: 'Висока', critical: 'Критична',
};

export default function BookingNewPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const slotId = params.get('slotId') ?? '';
  const centerId = params.get('centerId') ?? '';
  const preselectedReportId = params.get('reportId') ?? '';

  const [center, setCenter] = useState<ServiceCenter | null>(null);
  const [slot, setSlot] = useState<AvailableSlot | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reports, setReports] = useState<ProblemReport[]>([]);

  const [vehicleId, setVehicleId] = useState('');
  const [reportId, setReportId] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!centerId || !slotId) return;
    getServiceCenterApi(centerId).then(setCenter);
    getServiceCenterSlotsApi(centerId).then((slots) => {
      const found = slots.find((s) => s._id === slotId);
      if (found) setSlot(found);
    });
    getVehiclesApi().then((v) => { setVehicles(v); if (v.length > 0) setVehicleId(v[0]._id); });
    getReportsApi().then((r) => { setReports(r); if (preselectedReportId) setReportId(preselectedReportId); });
  }, [centerId, slotId]);

  const handleSubmit = async () => {
    if (!vehicleId) { setError('Избери автомобил'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      await createBookingApi({
        vehicleId,
        serviceCenterId: centerId,
        slotId,
        problemReportId: reportId || undefined,
        note: note || undefined,
      });
      navigate('/bookings');
    } catch {
      setError('Грешка при резервацията. Опитай пак.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!center || !slot) {
    return (
      <Layout>
        <div className={styles['booking-new__loading']}>
          <div className={styles['booking-new__spinner']} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['booking-new']}>
        {/* Header */}
        <div className={styles['booking-new__header']}>
          <Link to={`/service-centers/${centerId}`} className={styles['booking-new__back-btn']}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className={styles['booking-new__header-info']}>
            <h1 className={styles['booking-new__title']}>Нова резервация</h1>
            <p className={styles['booking-new__subtitle']}>{center.name}</p>
          </div>
        </div>

        <div className={styles['booking-new__body']}>
          {/* Selected slot summary */}
          <div className={styles['booking-new__slot-card']}>
            <p className={styles['booking-new__slot-label']}>Избран час</p>
            <div className={styles['booking-new__slot-inner']}>
              <div className={styles['booking-new__slot-icon']}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className={styles['booking-new__slot-date']}>{slot.date} в {slot.time}</p>
                <p className={styles['booking-new__slot-location']}>{center.city} · {center.address}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.address}, ${center.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 13, fontWeight: 600, color: '#ea580c', textDecoration: 'none' }}
                >
                  Виж на картата →
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className={styles['booking-new__form-card']}>
            <div className={styles['booking-new__field']}>
              <label className={styles['booking-new__label']}>
                Автомобил <span className={styles['booking-new__label-required']}>*</span>
              </label>
              {vehicles.length === 0 ? (
                <p className={styles['booking-new__no-vehicles']}>
                  Нямаш добавени коли.{' '}
                  <Link to="/vehicles/new" className={styles['booking-new__add-vehicle-link']}>Добави кола</Link>
                </p>
              ) : (
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className={styles['booking-new__input']}
                >
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.brand} {v.model} ({v.year})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className={styles['booking-new__field']}>
              <label className={styles['booking-new__label']}>
                Свържи с проблем{' '}
                <span className={styles['booking-new__label-optional']}>(незадължително)</span>
              </label>
              <select
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                className={styles['booking-new__input']}
              >
                <option value="">— без проблем —</option>
                {reports.filter((r) => r.status !== 'closed').map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title}{r.aiUrgency ? ` · ${urgencyLabels[r.aiUrgency] ?? r.aiUrgency}` : ''}
                  </option>
                ))}
              </select>
              {reportId && (
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 6, marginBottom: 0 }}>
                  AI анализът на избрания проблем ще бъде споделен със сервиза.
                </p>
              )}
            </div>

            <div className={styles['booking-new__field']}>
              <label className={styles['booking-new__label']}>
                Бележка{' '}
                <span className={styles['booking-new__label-optional']}>(незадължително)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Допълнителна информация за сервиза..."
                rows={3}
                className={styles['booking-new__textarea']}
              />
            </div>
          </div>

          {error && (
            <div className={styles['booking-new__error']}>{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || vehicles.length === 0}
            className={styles['booking-new__submit-btn']}
          >
            {isSubmitting ? 'Резервиране...' : 'Потвърди резервацията'}
          </button>
        </div>
      </div>
    </Layout>
  );
}
