import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getVehicleApi, updateVehicleApi, deleteVehicleApi } from '../api/vehicles';
import { getVehicleBookingsApi } from '../api/bookings';
import type { Vehicle, Booking } from '../types';
import Layout from '../components/Layout';
import ImageUpload from '../components/ImageUpload';
import styles from './VehicleDetailPage.module.scss';

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  engine: z.string().min(1),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'lpg']),
  transmission: z.enum(['manual', 'automatic']),
  registrationNumber: z.string().optional(),
  vin: z.string().optional(),
  mileage: z.number().min(0).optional(),
});
type FormData = z.infer<typeof schema>;

const fuelLabels: Record<string, string> = { petrol: 'Бензин', diesel: 'Дизел', electric: 'Електрически', hybrid: 'Хибрид', lpg: 'Газ (LPG)' };
const transmissionLabels: Record<string, string> = { manual: 'Ръчна', automatic: 'Автоматична' };
const statusLabels: Record<string, string> = { pending: 'Изчакване', confirmed: 'Потвърдена', cancelled: 'Отменена', completed: 'Завършена' };

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState<Booking[]>([]);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!id) return;
    getVehicleApi(id).then((v) => {
      setVehicle(v);
      setImageUrl(v.imageUrl ?? '');
      reset({ brand: v.brand, model: v.model, year: v.year, engine: v.engine, fuelType: v.fuelType, transmission: v.transmission, registrationNumber: v.registrationNumber ?? '', vin: v.vin ?? '', mileage: v.mileage });
    });
    getVehicleBookingsApi(id).then(setHistory).catch(() => {});
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    if (!id) return;
    const updated = await updateVehicleApi(id, { ...data, mileage: data.mileage || undefined, imageUrl: imageUrl || undefined });
    setVehicle(updated);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Сигурен ли си?')) return;
    setIsDeleting(true);
    await deleteVehicleApi(id);
    navigate('/vehicles');
  };

  if (!vehicle) {
    return (
      <Layout>
        <div className={styles['loading']}>
          <div className={styles['loading__spinner']} />
        </div>
      </Layout>
    );
  }

  const fields = [
    { label: 'Марка', value: vehicle.brand },
    { label: 'Модел', value: vehicle.model },
    { label: 'Година', value: String(vehicle.year) },
    { label: 'Двигател', value: vehicle.engine },
    { label: 'Гориво', value: fuelLabels[vehicle.fuelType] },
    { label: 'Скоростна кутия', value: transmissionLabels[vehicle.transmission] },
    { label: 'Рег. номер', value: vehicle.registrationNumber ?? '—' },
    { label: 'Пробег', value: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} км` : '—' },
    { label: 'VIN', value: vehicle.vin ?? '—' },
  ];

  return (
    <Layout>
      <div className={styles['page']}>
        {/* Header */}
        <div className={styles['header']}>
          <Link to="/vehicles" className={styles['header__back']}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className={styles['header__info']}>
            <h1 className={styles['header__title']}>{vehicle.brand} {vehicle.model}</h1>
            <p className={styles['header__subtitle']}>{vehicle.year}</p>
          </div>
          {!isEditing && (
            <div className={styles['header__actions']}>
              <button
                onClick={() => setIsEditing(true)}
                className={styles['header__edit-btn']}
              >
                Редактирай
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={styles['header__delete-btn']}
              >
                Изтрий
              </button>
            </div>
          )}
        </div>

        <div className={`${styles['layout']}${isEditing ? ` ${styles['layout--editing']}` : ''}`}>
        <div className={styles['card']}>
          {!isEditing ? (
            <>
              {vehicle.imageUrl && (
                <img
                  src={vehicle.imageUrl}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className={styles['vehicle-image']}
                />
              )}
              <div className={styles['info-grid']}>
                {fields.map(({ label, value }) => (
                  <div key={label}>
                    <p className={styles['field__label']}>{label}</p>
                    <p className={styles['field__value']}>{value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className={styles['edit-form']}>
              <div className={styles['image-upload']}>
                <ImageUpload value={imageUrl} onChange={setImageUrl} />
              </div>
              <div className={styles['form-grid']}>
                <div>
                  <label className={styles['form-field__label']}>Марка</label>
                  <input {...register('brand')} className={styles['form-field__input']} />
                </div>
                <div>
                  <label className={styles['form-field__label']}>Модел</label>
                  <input {...register('model')} className={styles['form-field__input']} />
                </div>
              </div>
              <div className={styles['form-grid']}>
                <div>
                  <label className={styles['form-field__label']}>Година</label>
                  <input {...register('year', { valueAsNumber: true })} type="number" className={styles['form-field__input']} />
                </div>
                <div>
                  <label className={styles['form-field__label']}>Двигател</label>
                  <input {...register('engine')} className={styles['form-field__input']} />
                </div>
              </div>
              <div className={styles['form-grid']}>
                <div>
                  <label className={styles['form-field__label']}>Гориво</label>
                  <select {...register('fuelType')} className={styles['form-field__select']}>
                    <option value="petrol">Бензин</option>
                    <option value="diesel">Дизел</option>
                    <option value="electric">Електрически</option>
                    <option value="hybrid">Хибрид</option>
                    <option value="lpg">Газ (LPG)</option>
                  </select>
                </div>
                <div>
                  <label className={styles['form-field__label']}>Скоростна кутия</label>
                  <select {...register('transmission')} className={styles['form-field__select']}>
                    <option value="manual">Ръчна</option>
                    <option value="automatic">Автоматична</option>
                  </select>
                </div>
              </div>
              <div className={styles['form-grid']}>
                <div>
                  <label className={styles['form-field__label']}>Рег. номер</label>
                  <input {...register('registrationNumber')} className={styles['form-field__input']} />
                </div>
                <div>
                  <label className={styles['form-field__label']}>Пробег (км)</label>
                  <input {...register('mileage', { valueAsNumber: true })} type="number" className={styles['form-field__input']} />
                </div>
              </div>
              <div className={styles['vin-field']}>
                <label className={styles['form-field__label']}>VIN</label>
                <input {...register('vin')} className={styles['form-field__input']} />
              </div>
              <div className={styles['form-actions']}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className={styles['form-actions__cancel']}
                >
                  Откажи
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles['form-actions__save']}
                >
                  {isSubmitting ? 'Запазване...' : 'Запази промените'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Service history */}
        <div className={styles['history']}>
          <h2 className={styles['history__title']}>Сервизна история</h2>
          {history.length === 0 ? (
            <p className={styles['history__empty']}>Все още няма записи за тази кола.</p>
          ) : (
            <div className={styles['history__list']}>
              {history.map((b) => {
                const center = b.serviceCenterId as any;
                return (
                  <div key={b._id} className={styles['history__item']}>
                    <div className={styles['history__item-left']}>
                      <span className={`${styles['history__badge']} ${styles[`history__badge--${b.status}`]}`}>
                        {statusLabels[b.status]}
                      </span>
                      <p className={styles['history__center']}>{center?.name ?? '—'}</p>
                      <p className={styles['history__location']}>{center?.city}{center?.address ? ` · ${center.address}` : ''}</p>
                    </div>
                    <div className={styles['history__date']}>
                      <p className={styles['history__date-main']}>{b.bookedDate}</p>
                      <p className={styles['history__date-time']}>{b.bookedTime}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>

      </div>
    </Layout>
  );
}
