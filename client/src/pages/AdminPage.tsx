import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getServiceCentersApi,
  createServiceCenterApi,
  updateServiceCenterApi,
  deleteServiceCenterApi,
  refreshAllSlotsApi,
  getPendingServiceCentersApi,
  approveServiceCenterApi,
} from '../api/serviceCenters';
import type { ServiceCenter } from '../types';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import ServiceCenterForm, { type ServiceCenterFormData } from '../components/ServiceCenterForm';
import styles from './AdminPage.module.scss';

const sectionTitle: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' };

function toFormData(c: ServiceCenter): ServiceCenterFormData {
  return {
    name: c.name, description: c.description, address: c.address,
    city: c.city, region: c.region, phone: c.phone, email: c.email,
    servicesOffered: c.servicesOffered,
    workingHours: c.workingHours,
  };
}

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pending, setPending] = useState<ServiceCenter[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [editingCenter, setEditingCenter] = useState<ServiceCenter | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/vehicles');
  }, [user, navigate]);

  useEffect(() => {
    getServiceCentersApi({}).then(setCenters).catch((e) => console.error('Сервизи:', e));
    getPendingServiceCentersApi().then(setPending).catch((e) => console.error('Чакащи заявки:', e));
  }, []);

  const handleRefreshSlots = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllSlotsApi();
      alert('Слотовете са регенерирани за всички сервизи (следващи 14 дни)');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreate = async (d: ServiceCenterFormData) => {
    const created = await createServiceCenterApi({
      name: d.name, description: d.description, address: d.address,
      city: d.city, region: d.region, phone: d.phone, email: d.email,
      servicesOffered: d.servicesOffered,
      workingHours: d.workingHours,
    });
    setCenters((prev) => [created, ...prev]);
    setShowForm(false);
  };

  const handleUpdate = async (d: ServiceCenterFormData) => {
    if (!editingCenter) return;
    const updated = await updateServiceCenterApi(editingCenter._id, {
      name: d.name, description: d.description, address: d.address,
      city: d.city, region: d.region, phone: d.phone, email: d.email,
      servicesOffered: d.servicesOffered, workingHours: d.workingHours,
    });
    setCenters((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    setEditingCenter(null);
  };

  const startEdit = (c: ServiceCenter) => {
    setShowForm(false);
    setEditingCenter(c);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleApprove = async (id: string) => {
    setActioningId(id);
    try {
      const approved = await approveServiceCenterApi(id);
      setPending((prev) => prev.filter((c) => c._id !== id));
      setCenters((prev) => [approved, ...prev]);
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectPending = async (id: string) => {
    if (!confirm('Да отхвърля ли тази заявка за сервиз?')) return;
    setActioningId(id);
    try {
      await deleteServiceCenterApi(id);
      setPending((prev) => prev.filter((c) => c._id !== id));
    } finally {
      setActioningId(null);
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
            onClick={() => {
              if (editingCenter) setEditingCenter(null);
              else setShowForm((v) => !v);
            }}
            className={(showForm || editingCenter) ? styles['admin__toggle-btn--open'] : styles['admin__toggle-btn']}
          >
            {!(showForm || editingCenter) && (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
            {(showForm || editingCenter) ? 'Затвори' : 'Нов сервиз'}
          </button>
        </div>
      </div>

      {/* Create / edit form (shared component) */}
      {(showForm || editingCenter) && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={sectionTitle}>{editingCenter ? `Редактирай сервиз — ${editingCenter.name}` : 'Нов сервиз'}</h2>
          <ServiceCenterForm
            key={editingCenter?._id ?? 'new'}
            initial={editingCenter ? toFormData(editingCenter) : undefined}
            onSubmit={editingCenter ? handleUpdate : handleCreate}
            submitLabel={editingCenter ? 'Запази промените' : 'Създай сервиз'}
          />
        </div>
      )}

      {/* Pending applications */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={sectionTitle}>Чакащи заявки за одобрение ({pending.length})</h2>
        {pending.length === 0 ? (
          <div className={styles['admin__list-empty']}>
            Няма чакащи заявки. Когато сервиз кандидатства през формата „Регистрирай сервиз", заявката се появява тук за преглед и одобрение.
          </div>
        ) : (
          <div className={styles['admin__list']}>
            {pending.map((c) => (
              <div key={c._id} className={styles['admin__list-item']}>
                <div className={styles['admin__item-left']}>
                  <p className={styles['admin__item-name']}>{c.name}</p>
                  <p className={styles['admin__item-location']}>{c.city} · {c.address}</p>
                  <div className={styles['admin__item-meta']}>
                    <span className={styles['admin__item-services']}>{c.servicesOffered.length} услуги</span>
                    <span className={styles['admin__item-services']}>{c.phone}</span>
                    <span className={styles['admin__item-services']}>{c.email}</span>
                  </div>
                  {c.applicationNote && (
                    <p style={{ fontSize: 13, color: '#475569', marginTop: 6, fontStyle: 'italic' }}>
                      „{c.applicationNote}“
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleApprove(c._id)}
                    disabled={actioningId === c._id}
                    className={styles['admin__toggle-btn']}
                  >
                    {actioningId === c._id ? '...' : 'Одобри'}
                  </button>
                  <button
                    onClick={() => handleRejectPending(c._id)}
                    disabled={actioningId === c._id}
                    className={styles['admin__delete-btn']}
                  >
                    Откажи
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Centers list */}
      <h2 style={sectionTitle}>Активни сервизи ({centers.length})</h2>
      <div className={styles['admin__list']}>
        {centers.length === 0 ? (
          <div className={styles['admin__list-empty']}>Няма добавени сервизи</div>
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
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => startEdit(c)}
                className={styles['admin__toggle-btn']}
              >
                Редактирай
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                disabled={deletingId === c._id}
                className={styles['admin__delete-btn']}
                style={{ opacity: deletingId === c._id ? 0.5 : undefined }}
              >
                {deletingId === c._id ? '...' : 'Изтрий'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
