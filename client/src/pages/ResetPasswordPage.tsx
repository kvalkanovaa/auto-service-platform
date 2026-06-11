import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPasswordApi } from '../api/auth';
import Logo from '../components/Logo';
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
          <Logo size={40} gid="lgReset" />
          <span className={styles['logo__name']}>Diagn<span style={{ color: '#f97316' }}>aut</span></span>
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
