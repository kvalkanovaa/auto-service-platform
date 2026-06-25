import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../api/axios';
import Logo from '../components/Logo';
import { registerSchema, type RegisterForm } from '../validation/schemas';
import styles from './RegisterPage.module.scss';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocked = !!(location.state as { fromLocked?: boolean } | null)?.fromLocked;
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser(data);
      navigate('/dashboard', { state: { welcome: 'register' } });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError && err.message
          ? err.message
          : 'Грешка при регистрация. Опитай отново.';
      setError('root', { message });
    }
  };

  return (
    <div className={styles['register']}>
      <div className={styles['register__container']}>

        {/* Logo */}
        <div className={styles['register__logo']}>
          <Logo size={40} gid="lgRegister" />
          <span className={styles['register__logo-name']}>Diagn<span style={{ color: '#f97316' }}>aut</span></span>
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
