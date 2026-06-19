import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import styles from './DashboardPage.module.scss';

const slides = [
  {
    id: 1,
    badge: 'AI ДИАГНОСТИКА',
    title: 'Опишете проблема —\nAI го анализира',
    subtitle:
      'Изкуственият интелект разпознава симптомите, определя приоритета и ви насочва към правилния сервиз.',
    cta: { label: 'Започни анализ', href: '/problem-reports/new' },
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #1e40af 60%, #1d4ed8 100%)',
    accent: 'rgba(255,255,255,0.1)',
    icon: (
      <svg
        width="56"
        height="56"
        fill="none"
        viewBox="0 0 24 24"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth={1.2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
    ),
  },
  {
    id: 2,
    badge: 'МРЕЖА ОТ СЕРВИЗИ',
    title: 'Намери сервиз\nза твоя автомобил',
    subtitle:
      'Разгледай сервизи в цялата страна, сравни ги по оценки от реални клиенти и избери най-подходящия за теб.',
    cta: { label: 'Виж сервизите', href: '/service-centers' },
    bg: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
    accent: 'rgba(255,255,255,0.1)',
    icon: (
      <svg
        width="56"
        height="56"
        fill="none"
        viewBox="0 0 24 24"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth={1.2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
  {
    id: 3,
    badge: 'ОНЛАЙН РЕЗЕРВАЦИЯ',
    title: 'Запиши час\nза минути',
    subtitle:
      'Избери удобен свободен час при избрания сервиз и запази онлайн — без обаждания и без чакане.',
    cta: { label: 'Запази час', href: '/service-centers' },
    bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
    accent: 'rgba(255,255,255,0.15)',
    icon: (
      <svg
        width="56"
        height="56"
        fill="none"
        viewBox="0 0 24 24"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth={1.2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
  },
];

const quickLinks = [
  {
    label: 'Моите коли',
    desc: 'Управлявай регистрираните автомобили',
    href: '/vehicles',
    requiresAuth: true,
    bg: '#eff6ff',
    iconColor: '#1e3a5f',
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l1.5-3.8A2 2 0 018.4 6h7.2a2 2 0 011.9 1.2L19 11" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 11h17v3a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 14z" />
        <circle cx="8" cy="15.5" r="1.6" />
        <circle cx="16" cy="15.5" r="1.6" />
      </svg>
    ),
  },
  {
    label: 'Нов проблем',
    desc: 'AI анализ на симптомите',
    href: '/problem-reports/new',
    requiresAuth: true,
    bg: '#fef3c7',
    iconColor: '#d97706',
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4l1.6 5.2a2 2 0 001.2 1.2L20 12l-5.2 1.6a2 2 0 00-1.2 1.2L12 20l-1.6-5.2a2 2 0 00-1.2-1.2L4 12l5.2-1.6a2 2 0 001.2-1.2z" />
      </svg>
    ),
  },
  {
    label: 'Сервизи',
    desc: 'Намери и резервирай час',
    href: '/service-centers',
    requiresAuth: false,
    bg: '#f0fdf4',
    iconColor: '#15803d',
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
  },
  {
    label: 'Резервации',
    desc: 'Виж всички свои часове',
    href: '/bookings',
    requiresAuth: true,
    bg: '#fdf4ff',
    iconColor: '#7c3aed',
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
        />
      </svg>
    ),
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(
      () => goTo((prev) => (prev + 1) % slides.length),
      8000,
    );
    return () => clearInterval(timer);
  }, []);

  const goTo = (indexOrUpdater: number | ((prev: number) => number)) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(indexOrUpdater as any);
      setAnimating(false);
    }, 200);
  };

  const slide = slides[current];

  return (
    <Layout>
      {/* ── CAROUSEL ── */}
      <div className={styles['carousel']}>
        {/* Slide panel — bg is a dynamic data-driven gradient, kept as inline style */}
        <div
          className={`${styles['carousel__slide']}${animating ? ` ${styles['carousel__slide--animating']}` : ''}`}
          style={{ background: slide.bg }}
        >
          {/* Decorative circles — accent color is also data-driven */}
          <div
            className={`${styles['carousel__deco']} ${styles['carousel__deco--top-right']}`}
            style={{ background: slide.accent }}
          />
          <div
            className={`${styles['carousel__deco']} ${styles['carousel__deco--bottom-mid']}`}
            style={{ background: slide.accent }}
          />

          {/* Text content */}
          <div className={styles['carousel__content']}>
            <span className={styles['carousel__badge']}>{slide.badge}</span>
            <h2 className={styles['carousel__title']}>{slide.title}</h2>
            <p className={styles['carousel__subtitle']}>{slide.subtitle}</p>
            <Link to={slide.cta.href} className={styles['carousel__cta']}>
              {slide.cta.label}
              <svg
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>

          {/* Icon */}
          <div className={styles['carousel__icon']}>{slide.icon}</div>
        </div>

        {/* Prev arrow */}
        <button
          className={`${styles['carousel__arrow']} ${styles['carousel__arrow--prev']}`}
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#fff"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Next arrow */}
        <button
          className={`${styles['carousel__arrow']} ${styles['carousel__arrow--next']}`}
          onClick={() => goTo((current + 1) % slides.length)}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#fff"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Dot indicators */}
        <div className={styles['carousel__dots']}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`${styles['carousel__dot']}${i === current ? ` ${styles['carousel__dot--active']}` : ''}`}
            />
          ))}
        </div>
      </div>

      {/* ── QUICK LINKS ── */}
      <div className={styles['quick-links']}>
        {quickLinks.map((q) => {
          const locked = q.requiresAuth && !user;
          const cardContent = (
            <div className={`${styles['quick-links__card']}${locked ? ` ${styles['quick-links__card--locked']}` : ''}`}>
              {locked && (
                <div className={styles['quick-links__lock-badge']}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Безплатно
                </div>
              )}
              <div
                className={styles['quick-links__icon-box']}
                style={{ background: q.bg, color: q.iconColor }}
              >
                {q.icon}
              </div>
              <p className={styles['quick-links__label']}>{q.label}</p>
              <p className={styles['quick-links__desc']}>{q.desc}</p>
            </div>
          );

          return locked ? (
            <button
              key={q.href}
              onClick={() => navigate('/register', { state: { fromLocked: true } })}
              className={styles['quick-links__link']}
            >
              {cardContent}
            </button>
          ) : (
            <Link key={q.href} to={q.href} className={styles['quick-links__link']}>
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* ── CTA BANNER ── */}
      <div className={styles['cta-banner']}>
        <div className={styles['cta-banner__body']}>
          <div className={styles['cta-banner__icon-box']}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#d97706" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className={styles['cta-banner__title']}>Имате проблем с автомобила?</p>
            <p className={styles['cta-banner__description']}>
              Опишете симптомите с няколко изречения — нашият AI анализира
              проблема, определя спешността и ви насочва към точния специалист.
            </p>
          </div>
        </div>
        {user ? (
          <Link to="/problem-reports/new" className={styles['cta-banner__btn']}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Опиши проблема
          </Link>
        ) : (
          <Link to="/register" state={{ fromLocked: true }} className={styles['cta-banner__btn']}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Регистрирай се безплатно
          </Link>
        )}
      </div>

      {/* ── HOW IT WORKS ── */}
      <div className={styles['how']}>
        <h2 className={styles['how__title']}>Как работи</h2>
        <div className={styles['how__steps']}>
          <div className={styles['how__step']}>
            <span className={styles['how__num']}>1</span>
            <div>
              <p className={styles['how__step-title']}>Опиши проблема</p>
              <p className={styles['how__step-text']}>Разкажи със свои думи какво усещаш — звук, вибрация или лампа на таблото.</p>
            </div>
          </div>
          <div className={styles['how__step']}>
            <span className={styles['how__num']}>2</span>
            <div>
              <p className={styles['how__step-title']}>AI анализ</p>
              <p className={styles['how__step-text']}>Изкуственият интелект разпознава причината, спешността и подходящите услуги.</p>
            </div>
          </div>
          <div className={styles['how__step']}>
            <span className={styles['how__num']}>3</span>
            <div>
              <p className={styles['how__step-title']}>Резервирай час</p>
              <p className={styles['how__step-text']}>Избери препоръчан сервиз и запази свободен час онлайн за минути.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
