import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { createVehicleApi } from '../api/vehicles';
import Layout from '../components/Layout';
import ImageUpload from '../components/ImageUpload';
import styles from './VehicleNewPage.module.scss';

const currentYear = new Date().getFullYear();

const schema = z.object({
  brand: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символа'),
  model: z.string().min(1, 'Задължително').max(50, 'Максимум 50 символа'),
  year: z.number({ error: 'Невалидна година' })
    .min(1900, 'Минимална година: 1900')
    .max(currentYear + 1, `Максимална година: ${currentYear + 1}`),
  engine: z.string().min(2, 'Минимум 2 символа').max(30, 'Максимум 30 символа'),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'lpg'], { error: 'Избери гориво' }),
  transmission: z.enum(['manual', 'automatic'], { error: 'Избери скоростна кутия' }),
  registrationNumber: z.string().max(12, 'Максимум 12 символа').optional(),
  vin: z.string().optional().refine((v) => !v || v.length === 17, 'VIN е точно 17 символа'),
  mileage: z.number().min(0, 'Не може да е отрицателен').max(2_000_000, 'Максимум 2 000 000 км').optional(),
});
type FormData = z.infer<typeof schema>;

export default function VehicleNewPage() {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await createVehicleApi({ ...data, mileage: data.mileage || undefined, imageUrl: imageUrl || undefined });
      navigate('/vehicles', {
        state: { added: `${data.brand} ${data.model} (${data.year})` },
      });
    } catch {
      setError('root', { message: 'Грешка при запазване' });
    }
  };

  return (
    <Layout>
      <div className={styles['page']}>
        {/* Back + title */}
        <div className={styles['header']}>
          <Link to="/vehicles" className={styles['header__back']}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className={styles['header__title']}>Добави кола</h1>
            <p className={styles['header__subtitle']}>Попълни информацията за автомобила</p>
          </div>
        </div>

        <div className={styles['layout']}>
          <div className={styles['card']}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles['image-upload']}>
              <ImageUpload value={imageUrl} onChange={setImageUrl} />
            </div>

            <div className={styles['form-grid']}>
              <div>
                <label className={styles['field__label']}>Марка <span className={styles['req']}>*</span></label>
                <input {...register('brand')} placeholder="BMW" className={`${styles['field__input']}${errors.brand ? ` ${styles['field__input--error']}` : ''}`} />
                {errors.brand && <p className={styles['field__error']}>{errors.brand.message}</p>}
              </div>
              <div>
                <label className={styles['field__label']}>Модел <span className={styles['req']}>*</span></label>
                <input {...register('model')} placeholder="320d" className={`${styles['field__input']}${errors.model ? ` ${styles['field__input--error']}` : ''}`} />
                {errors.model && <p className={styles['field__error']}>{errors.model.message}</p>}
              </div>
            </div>

            <div className={styles['form-grid']}>
              <div>
                <label className={styles['field__label']}>Година <span className={styles['req']}>*</span></label>
                <input {...register('year', { valueAsNumber: true })} type="number" placeholder="2020" className={`${styles['field__input']}${errors.year ? ` ${styles['field__input--error']}` : ''}`} />
                {errors.year && <p className={styles['field__error']}>{errors.year.message}</p>}
              </div>
              <div>
                <label className={styles['field__label']}>Двигател <span className={styles['req']}>*</span></label>
                <input {...register('engine')} placeholder="2.0 TDI" className={`${styles['field__input']}${errors.engine ? ` ${styles['field__input--error']}` : ''}`} />
                {errors.engine && <p className={styles['field__error']}>{errors.engine.message}</p>}
              </div>
            </div>

            <div className={styles['form-grid']}>
              <div>
                <label className={styles['field__label']}>Гориво <span className={styles['req']}>*</span></label>
                <select {...register('fuelType')} className={`${styles['field__select']}${errors.fuelType ? ` ${styles['field__select--error']}` : ''}`}>
                  <option value="">Избери...</option>
                  <option value="petrol">Бензин</option>
                  <option value="diesel">Дизел</option>
                  <option value="electric">Електрически</option>
                  <option value="hybrid">Хибрид</option>
                  <option value="lpg">Газ (LPG)</option>
                </select>
                {errors.fuelType && <p className={styles['field__error']}>{errors.fuelType.message}</p>}
              </div>
              <div>
                <label className={styles['field__label']}>Скоростна кутия <span className={styles['req']}>*</span></label>
                <select {...register('transmission')} className={`${styles['field__select']}${errors.transmission ? ` ${styles['field__select--error']}` : ''}`}>
                  <option value="">Избери...</option>
                  <option value="manual">Ръчна</option>
                  <option value="automatic">Автоматична</option>
                </select>
                {errors.transmission && <p className={styles['field__error']}>{errors.transmission.message}</p>}
              </div>
            </div>

            <div className={styles['optional']}>
              <span className={styles['optional__label']}>Незадължителни полета</span>
              <div className={styles['optional__grid']}>
                <div>
                  <label className={styles['field__label']}>Регистрационен номер</label>
                  <input {...register('registrationNumber')} placeholder="СО 1234 АБ" className={styles['field__input']} />
                </div>
                <div>
                  <label className={styles['field__label']}>Пробег (км)</label>
                  <input {...register('mileage', { valueAsNumber: true })} type="number" placeholder="150000" className={styles['field__input']} />
                </div>
              </div>
              <div>
                <label className={styles['field__label']}>VIN номер</label>
                <input {...register('vin')} placeholder="WBA3A5G59DNP26082" className={`${styles['field__input']}${errors.vin ? ` ${styles['field__input--error']}` : ''}`} />
                {errors.vin && <p className={styles['field__error']}>{errors.vin.message}</p>}
              </div>
            </div>

            {errors.root && (
              <div className={styles['root-error']}>{errors.root.message}</div>
            )}

            <div className={styles['actions']}>
              <Link to="/vehicles" className={styles['actions__cancel']}>
                Откажи
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className={styles['actions__submit']}
              >
                {isSubmitting ? 'Запазване...' : 'Запази колата'}
              </button>
            </div>
          </form>
          </div>

          <aside className={styles['info']}>
            <h3 className={styles['info__title']}>Защо да добавиш кола?</h3>
            <ul className={styles['info__list']}>
              <li className={styles['info__item']}>По-точна AI диагностика според марката, двигателя и годината</li>
              <li className={styles['info__item']}>Бързи онлайн резервации — данните се попълват автоматично</li>
              <li className={styles['info__item']}>История на проблемите и сервизирането на едно място</li>
            </ul>
            <div className={styles['info__note']}>
              Полетата със <span className={styles['req']}>*</span> са задължителни. Останалите можеш да допълниш по-късно.
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
