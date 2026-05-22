import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './LoginPage.module.scss';

const schema = z.object({
  email: z.string().email('Невалиден email'),
  password: z.string().min(6, 'Минимум 6 символа'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const passwordReset = (location.state as { passwordReset?: boolean } | null)?.passwordReset;
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ''}` : '/dashboard';

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      navigate(redirectTo, { replace: true });
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.message;
      setError('root', { message: msg ?? 'Грешни данни за вход' });
    }
  };

  return (
    <div className={styles['login']}>
      <div className={styles['login__container']}>

        {/* Logo */}
        <div className={styles['login__logo']}>
          <div className={styles['login__logo-icon']}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <span className={styles['login__logo-name']}>AutoService</span>
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
