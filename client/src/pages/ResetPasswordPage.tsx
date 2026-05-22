import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPasswordApi } from '../api/auth';
import styles from './ResetPasswordPage.module.scss';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Паролата трябва да е поне 6 символа'); return; }
    if (password !== confirm) { setError('Паролите не съвпадат'); return; }
    setError('');
    setIsLoading(true);
    try {
      await resetPasswordApi(token!, password);
      navigate('/login', { state: { passwordReset: true } });
    } catch {
      setError('Линкът е невалиден или изтекъл. Заяви нов.');
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
          <h1 className={styles['title']}>Нова парола</h1>
          <p className={styles['subtitle']}>Задай нова парола за акаунта си.</p>

          <form onSubmit={handleSubmit}>
            <div className={styles['field']}>
              <label className={styles['label']}>Нова парола</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символа"
                className={styles['input']}
                autoFocus
              />
            </div>

            <div className={styles['field']}>
              <label className={styles['label']}>Потвърди паролата</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={styles['input']}
              />
            </div>

            {error && <div className={styles['alert']}>{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className={`${styles['submit']}${isLoading ? ` ${styles['submit--loading']}` : ''}`}
            >
              {isLoading ? 'Запазване...' : 'Запази паролата'}
            </button>
          </form>

          <p className={styles['footer']}>
            <Link to="/login" className={styles['link']}>Обратно към вход</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
