import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './RegisterPage.module.scss';

const schema = z.object({
  firstName: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символа'),
  lastName: z.string().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символа'),
  email: z.string().email('Невалиден email'),
  password: z.string().min(6, 'Минимум 6 символа').max(100, 'Максимум 100 символа'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Паролите не съвпадат',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocked = !!(location.state as { fromLocked?: boolean } | null)?.fromLocked;
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message;
      setError('root', { message: msg ?? 'Грешка при регистрация' });
    }
  };

  return (
    <div className={styles['register']}>
      <div className={styles['register__container']}>

        {/* Logo */}
        <div className={styles['register__logo']}>
          <div className={styles['register__logo-icon']}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <span className={styles['register__logo-name']}>AutoService</span>
        </div>

        {/* Card */}
        <div className={styles['register__card']}>
          {fromLocked && (
            <div className={styles['register__feature-banner']}>
              <p className={styles['register__feature-banner__title']}>
                Регистрирай се безплатно и получи достъп до:
              </p>
              <ul className={styles['register__feature-list']}>
                {[
                  'Управление на твоите автомобили',
                  'AI анализ на проблеми с колата',
                  'Онлайн резервации при сервизи',
                  'История на сервизиране',
                ].map((f) => (
                  <li key={f} className={styles['register__feature-item']}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <h1 className={styles['register__title']}>Създай акаунт</h1>
          <p className={styles['register__subtitle']}>Регистрирай се безплатно</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Two-column name row */}
            <div className={styles['register__name-grid']}>
              <div>
                <label className={styles['register__label']}>Име</label>
                <input {...register('firstName')} placeholder="Иван" className={styles['register__input']} />
                {errors.firstName && <p className={styles['register__error']}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label className={styles['register__label']}>Фамилия</label>
                <input {...register('lastName')} placeholder="Иванов" className={styles['register__input']} />
                {errors.lastName && <p className={styles['register__error']}>{errors.lastName.message}</p>}
              </div>
            </div>

            <div className={styles['register__field']}>
              <label className={styles['register__label']}>Email адрес</label>
              <input {...register('email')} type="email" placeholder="ivan@example.com" className={styles['register__input']} />
              {errors.email && <p className={styles['register__error']}>{errors.email.message}</p>}
            </div>

            <div className={styles['register__field']}>
              <label className={styles['register__label']}>Парола</label>
              <input {...register('password')} type="password" placeholder="Минимум 6 символа" className={styles['register__input']} />
              {errors.password && <p className={styles['register__error']}>{errors.password.message}</p>}
            </div>

            <div className={`${styles['register__field']} ${styles['register__field--last']}`}>
              <label className={styles['register__label']}>Потвърди паролата</label>
              <input {...register('confirmPassword')} type="password" placeholder="••••••••" className={styles['register__input']} />
              {errors.confirmPassword && <p className={styles['register__error']}>{errors.confirmPassword.message}</p>}
            </div>

            {errors.root && (
              <div className={styles['register__alert']}>
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${styles['register__submit']}${isSubmitting ? ` ${styles['register__submit--loading']}` : ''}`}
            >
              {isSubmitting ? 'Зареждане...' : 'Създай акаунт'}
            </button>
          </form>

          <p className={styles['register__footer']}>
            Вече имаш акаунт?{' '}
            <Link to="/login" className={styles['register__link']}>Влез</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
