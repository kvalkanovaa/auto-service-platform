import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getServiceCentersApi,
  createServiceCenterApi,
  deleteServiceCenterApi,
  refreshAllSlotsApi,
} from '../api/serviceCenters';
import type { ServiceCenter } from '../types';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import styles from './AdminPage.module.scss';

const categoryOptions = [
  { value: 'engine', label: 'Двигател' },
  { value: 'diagnostics', label: 'Диагностика' },
  { value: 'brakes', label: 'Спирачки' },
  { value: 'suspension', label: 'Окачване' },
  { value: 'tires', label: 'Гуми' },
  { value: 'electrical', label: 'Електрика' },
  { value: 'air-conditioning', label: 'Климатик' },
  { value: 'bodywork', label: 'Каросерия' },
  { value: 'transmission', label: 'Скоростна кутия' },
  { value: 'oil-service', label: 'Маслена смяна' },
];

const dayOptions = [
  { value: 'monday', label: 'Пон' },
  { value: 'tuesday', label: 'Вт' },
  { value: 'wednesday', label: 'Ср' },
  { value: 'thursday', label: 'Чет' },
  { value: 'friday', label: 'Пет' },
  { value: 'saturday', label: 'Съб' },
  { value: 'sunday', label: 'Нед' },
];

const emptyForm = {
  name: '', description: '', address: '', city: '', region: '',
  phone: '', email: '', open: '09:00', close: '18:00',
  days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as string[],
  servicesOffered: [] as string[],
};

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshSlots = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllSlotsApi();
      alert('Слотовете са регенерирани за всички сервизи (следващи 14 дни)');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/vehicles');
  }, [user, navigate]);

  useEffect(() => {
    getServiceCentersApi({}).then(setCenters);
  }, []);

  const toggleCategory = (val: string) =>
    setForm((f) => ({
      ...f,
      servicesOffered: f.servicesOffered.includes(val)
        ? f.servicesOffered.filter((x) => x !== val)
        : [...f.servicesOffered, val],
    }));

  const toggleDay = (val: string) =>
    setForm((f) => ({
      ...f,
      days: f.days.includes(val) ? f.days.filter((x) => x !== val) : [...f.days, val],
    }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const created = await createServiceCenterApi({
        name: form.name, description: form.description,
        address: form.address, city: form.city, region: form.region,
        phone: form.phone, email: form.email,
        servicesOffered: form.servicesOffered,
        workingHours: { open: form.open, close: form.close, days: form.days },
      });
      setCenters((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Сигурен ли си, че искаш да изтриеш този сервиз?')) return;
    setDeletingId(id);
    try {
      await deleteServiceCenterApi(id);
      setCenters((prev) => prev.filter((c) => c._id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <div className={styles['admin__header']}>
        <div className={styles['admin__header-text']}>
          <h1 className={styles['admin__title']}>Админ панел</h1>
          <p className={styles['admin__subtitle']}>Управление на сервизи</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handleRefreshSlots}
          disabled={isRefreshing}
          className={styles['admin__toggle-btn--open']}
        >
          {isRefreshing ? 'Зареждане...' : 'Обнови слотове'}
        </button>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={showForm ? styles['admin__toggle-btn--open'] : styles['admin__toggle-btn']}
        >
          {!showForm && (
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          {showForm ? 'Затвори' : 'Нов сервиз'}
        </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className={styles['admin__form-card']}>
          <h2 className={styles['admin__form-title']}>Нов сервиз</h2>

          <div className={styles['admin__fields-grid']}>
            {[
              { key: 'name', label: 'Име' },
              { key: 'city', label: 'Град' },
              { key: 'region', label: 'Регион' },
              { key: 'address', label: 'Адрес' },
              { key: 'phone', label: 'Телефон' },
              { key: 'email', label: 'Email' },
            ].map(({ key, label }) => (
              <div key={key} className={styles['admin__field']}>
                <label className={styles['admin__label']}>{label}</label>
                <input
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={styles['admin__input']}
                />
              </div>
            ))}
          </div>

          <div className={styles['admin__textarea-wrap']}>
            <label className={styles['admin__label']}>Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className={styles['admin__textarea']}
            />
          </div>

          <div className={styles['admin__time-grid']}>
            <div className={styles['admin__field']}>
              <label className={styles['admin__label']}>Отваря</label>
              <input
                type="time"
                value={form.open}
                onChange={(e) => setForm((f) => ({ ...f, open: e.target.value }))}
                className={styles['admin__input']}
              />
            </div>
            <div className={styles['admin__field']}>
              <label className={styles['admin__label']}>Затваря</label>
              <input
                type="time"
                value={form.close}
                onChange={(e) => setForm((f) => ({ ...f, close: e.target.value }))}
                className={styles['admin__input']}
              />
            </div>
          </div>

          <div className={styles['admin__toggle-group-wrap']}>
            <label className={styles['admin__label']}>Работни дни</label>
            <div className={styles['admin__toggle-group']}>
              {dayOptions.map(({ value, label }) => {
                const active = form.days.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDay(value)}
                    className={`${styles['admin__day-btn']}${active ? ` ${styles['admin__day-btn--active']}` : ''}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles['admin__toggle-group-wrap--services']}>
            <label className={styles['admin__label']}>Услуги</label>
            <div className={styles['admin__toggle-group']}>
              {categoryOptions.map(({ value, label }) => {
                const active = form.servicesOffered.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleCategory(value)}
                    className={`${styles['admin__service-btn']}${active ? ` ${styles['admin__service-btn--active']}` : ''}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={styles['admin__submit-btn']}
          >
            {isSubmitting ? 'Запазване...' : 'Създай сервиз'}
          </button>
        </div>
      )}

      {/* Centers list */}
      <div className={styles['admin__list']}>
        {centers.length === 0 ? (
          <div className={styles['admin__list-empty']}>
            Няма добавени сервизи
          </div>
        ) : centers.map((c) => (
          <div key={c._id} className={styles['admin__list-item']}>
            <div className={styles['admin__item-left']}>
              <p className={styles['admin__item-name']}>{c.name}</p>
              <p className={styles['admin__item-location']}>{c.city} · {c.address}</p>
              <div className={styles['admin__item-meta']}>
                <span className={styles['admin__item-services']}>{c.servicesOffered.length} услуги</span>
                {c.ratingAvg > 0 && (
                  <span className={styles['admin__item-rating']}>
                    <svg width="11" height="11" fill="#facc15" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {c.ratingAvg.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(c._id)}
              disabled={deletingId === c._id}
              className={styles['admin__delete-btn']}
              style={{ opacity: deletingId === c._id ? 0.5 : undefined }}
            >
              {deletingId === c._id ? '...' : 'Изтрий'}
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
