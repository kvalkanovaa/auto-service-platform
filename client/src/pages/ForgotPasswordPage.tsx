import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordApi } from '../api/auth';
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
          <div className={styles['logo__icon']}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
          </div>
          <span className={styles['logo__name']}>AutoService</span>
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
