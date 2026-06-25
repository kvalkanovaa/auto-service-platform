import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../api/axios';
import Logo from '../components/Logo';
import { loginSchema, type LoginForm } from '../validation/schemas';
import styles from './LoginPage.module.scss';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const passwordReset = (location.state as { passwordReset?: boolean } | null)?.passwordReset;
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard';

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      navigate(redirectTo, { replace: true, state: { welcome: 'login' } });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError && err.status === 429
          ? 'Твърде много опити за вход. Опитай отново след минута.'
          : 'Невалиден имейл или парола.';
      setError('root', { message });
    }
  };

  return (
    <div className={styles['login']}>
      <div className={styles['login__container']}>

        {/* Logo */}
        <div className={styles['login__logo']}>
          <Logo size={40} gid="lgLogin" />
          <span className={styles['login__logo-name']}>Diagn<span style={{ color: '#f97316' }}>aut</span></span>
        </div>

        {/* Card */}
        <div className={styles['login__card']}>
          <h1 className={styles['login__title']}>Добре дошли</h1>
          <p className={styles['login__subtitle']}>Влезте в акаунта си, за да продължите</p>

          {passwordReset && (
            <div className={styles['login__success']}>
              Паролата е сменена успешно. Влез с новата си парола.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles['login__field']}>
              <label className={styles['login__label']}>Email адрес</label>
              <input {...register('email')} type="email" placeholder="ivan@example.com" className={styles['login__input']} />
              {errors.email && <p className={styles['login__error']}>{errors.email.message}</p>}
            </div>

            <div className={styles['login__field']}>
              <div className={styles['login__label-row']}>
                <label className={styles['login__label']}>Парола</label>
                <Link to="/forgot-password" className={styles['login__forgot']}>Забравена парола?</Link>
              </div>
              <input {...register('password')} type="password" placeholder="••••••••" className={styles['login__input']} />
              {errors.password && <p className={styles['login__error']}>{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div className={styles['login__alert']}>
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${styles['login__submit']}${isSubmitting ? ` ${styles['login__submit--loading']}` : ''}`}
            >
              {isSubmitting ? 'Зареждане...' : 'Влез в акаунта'}
            </button>
          </form>

          <p className={styles['login__footer']}>
            Нямаш акаунт?{' '}
            <Link to="/register" className={styles['login__link']}>Регистрирай се</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
