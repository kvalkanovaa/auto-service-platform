import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../api/auth';
import Logo from '../components/Logo';
import styles from './ForgotPasswordPage.module.scss';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError('Въведи email адрес'); return; }
    setError('');
    setIsLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      setSubmitted(true);
    } catch {
      setError('Грешка при изпращане. Опитай отново.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['page']}>
      <div className={styles['container']}>

        <div className={styles['logo']}>
          <Logo size={40} gid="lgForgot" />
          <span className={styles['logo__name']}>Diagn<span style={{ color: '#f97316' }}>aut</span></span>
        </div>

        <div className={styles['card']}>
          {submitted ? (
            <div className={styles['success']}>
              <div className={styles['success__icon']}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className={styles['success__title']}>Провери пощата си</h2>
              <p className={styles['success__text']}>
                Ако акаунт с този email съществува, ще получиш линк за смяна на паролата.
              </p>
              <Link to="/login" className={styles['back-link']}>Обратно към вход</Link>
            </div>
          ) : (
            <>
              <h1 className={styles['title']}>Забравена парола</h1>
              <p className={styles['subtitle']}>Въведи email адреса си и ще ти изпратим линк за смяна на паролата.</p>

              <form onSubmit={handleSubmit}>
                <div className={styles['field']}>
                  <label className={styles['label']}>Email адрес</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ivan@example.com"
                    className={styles['input']}
                    autoFocus
                  />
                </div>

                {error && <div className={styles['alert']}>{error}</div>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${styles['submit']}${isLoading ? ` ${styles['submit--loading']}` : ''}`}
                >
                  {isLoading ? 'Изпращане...' : 'Изпрати линк'}
                </button>
              </form>

              <p className={styles['footer']}>
                <Link to="/login" className={styles['link']}>Обратно към вход</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
