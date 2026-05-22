import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Layout.module.scss';

const navItems = [
  { to: '/dashboard',       label: 'Начало',      requiresAuth: false },
  { to: '/vehicles',        label: 'Моите коли',  requiresAuth: true  },
  { to: '/problem-reports', label: 'Проблеми',    requiresAuth: true  },
  { to: '/service-centers', label: 'Сервизи',     requiresAuth: false },
  { to: '/bookings',        label: 'Резервации',  requiresAuth: true  },
];

const LockIcon = () => (
  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles['layout']}>
      <header className={styles['header']}>
        <div className={styles['header__inner']}>
          <div className={styles['header__left']}>
            <Link
              to="/dashboard"
              className={styles['logo']}
              onClick={closeMenu}
            >
              <div className={styles['logo__icon']}>
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
              </div>
              <span className={styles['logo__text']}>AutoService</span>
            </Link>

            {/* Desktop + mobile nav */}
            <nav
              className={`${styles['nav']}${menuOpen ? ` ${styles['nav--open']}` : ''}`}
            >
              {navItems.map(({ to, label, requiresAuth }) => {
                const locked = requiresAuth && !user;
                if (locked) {
                  return (
                    <button
                      key={to}
                      onClick={() => { navigate('/register', { state: { fromLocked: true } }); closeMenu(); }}
                      className={`${styles['nav__link']} ${styles['nav__link--locked']}`}
                    >
                      {label}
                      <LockIcon />
                    </button>
                  );
                }
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `${styles['nav__link']}${isActive ? ` ${styles['nav__link--active']}` : ''}`
                    }
                  >
                    {label}
                  </NavLink>
                );
              })}
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `${styles['nav__link']} ${styles['nav__link--admin']}${isActive ? ` ${styles['nav__link--active']}` : ''}`
                  }
                >
                  Админ
                </NavLink>
              )}

              {/* Mobile-only user row at the bottom of the dropdown */}
              <div className={styles['nav__mobile-user']}>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={closeMenu}
                      className={styles['nav__mobile-user-name']}
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        navigate('/dashboard');
                        closeMenu();
                      }}
                      className={styles['nav__mobile-logout']}
                    >
                      Изход
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={closeMenu}
                      className={styles['nav__mobile-auth-link']}
                    >
                      Влез
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMenu}
                      className={styles['nav__mobile-auth-link--primary']}
                    >
                      Регистрирай се
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>

          <div className={styles['header__right']}>
            {user ? (
              <>
                {/* Desktop: user badge + logout */}
                <Link to="/profile" className={styles['user-badge']}>
                  <div className={styles['user-badge__avatar']}>
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className={styles['user-badge__avatar-img']}
                      />
                    ) : (
                      <span className={styles['user-badge__initials']}>
                        {initials}
                      </span>
                    )}
                  </div>
                  <span className={styles['user-badge__name']}>
                    {user.firstName} {user.lastName}
                  </span>
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/dashboard');
                  }}
                  className={styles['logout-btn']}
                >
                  Изход
                </button>
              </>
            ) : (
              <div className={styles['auth-links']}>
                <Link to="/login" className={styles['auth-links__login']}>
                  Влез
                </Link>
                <Link to="/register" className={styles['auth-links__register']}>
                  Регистрирай се
                </Link>
              </div>
            )}

            {/* Hamburger — visible only on mobile */}
            <button
              className={styles['hamburger']}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Меню"
            >
              {menuOpen ? (
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className={styles['main']}>{children}</main>

      <footer>
        <div className={styles['footer__inner']}>
          <div className={styles['footer__brand']}>
            <div className={styles['footer__icon']}>
              <svg
                width="15"
                height="15"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
            </div>
            <div>
              <p className={styles['footer__brand-name']}>
                AutoService Platform
              </p>
              <p className={styles['footer__tagline']}>
                Дипломна работа · 2026
              </p>
            </div>
          </div>

          <div className={styles['footer__right']}>
            <a
              href="https://github.com/kvalkanovaa"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles['footer__social-link']} ${styles['footer__social-link--github']}`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              kvalkanovaa
            </a>

            <span className={styles['footer__divider']} />

            <a
              href="https://www.linkedin.com/in/kalina-valkanova/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles['footer__social-link']} ${styles['footer__social-link--linkedin']}`}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Kalina Valkanova
            </a>

            <span className={styles['footer__divider']} />

            <p className={styles['footer__copyright']}>
              © 2026 Kalina Valkanova
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
