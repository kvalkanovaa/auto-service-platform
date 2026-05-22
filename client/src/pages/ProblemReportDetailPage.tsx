import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getReportApi, deleteReportApi, followupReportApi } from '../api/problemReports';
import { matchServiceCentersApi } from '../api/serviceCenters';
import type { ProblemReport, Vehicle, ServiceCenter } from '../types';
import Layout from '../components/Layout';
import styles from './ProblemReportDetailPage.module.scss';

const urgencyLabel: Record<string, string> = {
  low: 'Нисък приоритет', medium: 'Среден приоритет', high: 'Висок приоритет', critical: 'Критично',
};
const categoryLabels: Record<string, string> = {
  engine: 'Двигател', diagnostics: 'Диагностика', brakes: 'Спирачки',
  suspension: 'Окачване', tires: 'Гуми', electrical: 'Електрика',
  'air-conditioning': 'Климатик', bodywork: 'Каросерия',
  transmission: 'Скоростна кутия', 'oil-service': 'Маслена смяна',
};

export default function ProblemReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<ProblemReport | null>(null);
  const [matchedCenters, setMatchedCenters] = useState<ServiceCenter[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isFollowingUp, setIsFollowingUp] = useState(false);
  const [followupError, setFollowupError] = useState('');

  useEffect(() => {
    if (id) getReportApi(id).then((r) => {
      setReport(r);
      if (r.aiSuggestedCategories && r.aiSuggestedCategories.length > 0) {
        matchServiceCentersApi(r.aiSuggestedCategories).then(setMatchedCenters);
      }
    });
  }, [id]);

  useEffect(() => {
    if (report?.aiQuestions?.length) {
      setAnswers(Array(report.aiQuestions.length).fill(''));
    }
  }, [report?._id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Сигурен ли си?')) return;
    setIsDeleting(true);
    await deleteReportApi(id);
    navigate('/problem-reports');
  };

  const handleFollowup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setFollowupError('');
    setIsFollowingUp(true);
    try {
      const refined = await followupReportApi(id, answers);
      setReport(refined);
      if (refined.aiSuggestedCategories && refined.aiSuggestedCategories.length > 0) {
        matchServiceCentersApi(refined.aiSuggestedCategories).then(setMatchedCenters);
      }
    } catch {
      setFollowupError('Грешка при анализа. Опитай отново.');
    } finally {
      setIsFollowingUp(false);
    }
  };

  if (!report) {
    return (
      <Layout>
        <div className={styles['loading']}>
          <div className={styles['loading__spinner']} />
        </div>
      </Layout>
    );
  }

  const vehicle = report.vehicleId as unknown as Vehicle;
  const urgency = report.aiUrgency ?? null;
  const hasQuestions = (report.aiQuestions?.length ?? 0) > 0;
  const isRefined = (report.aiFollowupAnswers?.length ?? 0) > 0;

  const leftCol = (
    <>
      {/* Description */}
      <div className={styles['description-card']}>
        <p className={styles['description-card__label']}>Описание на проблема</p>
        <p className={styles['description-card__text']}>{report.description}</p>
      </div>

      {/* Matched centres */}
      {matchedCenters.length > 0 && (
        <div className={styles['centers-card']}>
          <div className={styles['centers-card__header']}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f97316" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
            <p className={styles['centers-card__title']}>Препоръчани сервизи</p>
            <span className={styles['centers-card__subtitle']}>— подбрани по твоя проблем</span>
          </div>
          <div className={styles['centers-card__list']}>
            {matchedCenters.map((c) => (
              <div key={c._id} className={styles['center-row']}>
                <div className={styles['center-row__info']}>
                  <p className={styles['center-row__name']}>{c.name}</p>
                  <p className={styles['center-row__address']}>{c.city} · {c.address}</p>
                  {c.ratingAvg > 0 && (
                    <div className={styles['center-row__rating']}>
                      <svg width="12" height="12" fill="#facc15" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className={styles['center-row__rating-value']}>{c.ratingAvg.toFixed(1)}</span>
                      <span className={styles['center-row__rating-count']}>({c.reviewCount})</span>
                    </div>
                  )}
                </div>
                <Link to={`/service-centers/${c._id}`} className={styles['center-row__book-btn']}>
                  Запази час
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const aiCard = report.aiSummary ? (
    <div className={`${styles['ai-card']}${urgency ? ` ${styles[`ai-card--${urgency}`]}` : ''}`}>
      <div className={styles['ai-card__header']}>
        <div className={styles['ai-card__title-row']}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1e3a5f" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <p className={styles['ai-card__title']}>AI Анализ</p>
          {isRefined && (
            <span className={styles['ai-card__refined-badge']}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Прецизиран
            </span>
          )}
        </div>
        {urgency && (
          <span className={styles[`ai-card__badge--${urgency}`]}>{urgencyLabel[urgency]}</span>
        )}
      </div>

      <div className={styles['ai-card__section']}>
        <p className={styles['ai-card__section-label']}>Обобщение</p>
        <p className={styles['ai-card__summary']}>{report.aiSummary}</p>
      </div>

      {report.aiSuggestedCategories && report.aiSuggestedCategories.length > 0 && (
        <div className={styles['ai-card__section']}>
          <p className={styles['ai-card__section-label']}>Засегнати области</p>
          <div className={styles['categories']}>
            {report.aiSuggestedCategories.map((cat) => (
              <span key={cat} className={styles['category-tag']}>{categoryLabels[cat] ?? cat}</span>
            ))}
          </div>
        </div>
      )}

      {hasQuestions && (
        <div className={styles['ai-card__section']}>
          <p className={styles['ai-card__section-label']}>Уточняващи въпроси</p>
          <form onSubmit={handleFollowup} className={styles['followup-form']}>
            {report.aiQuestions!.map((q, i) => (
              <div key={i} className={styles['followup-qa']}>
                <p className={styles['followup-qa__question']}>{q}</p>
                <textarea
                  value={answers[i] ?? ''}
                  onChange={(e) => {
                    const next = [...answers];
                    next[i] = e.target.value;
                    setAnswers(next);
                  }}
                  className={styles['followup-qa__input']}
                  placeholder="Вашият отговор..."
                  rows={2}
                />
              </div>
            ))}
            {followupError && (
              <p className={styles['followup-error']}>{followupError}</p>
            )}
            <button type="submit" disabled={isFollowingUp} className={styles['followup-btn']}>
              {isFollowingUp ? (
                <>
                  <div className={styles['followup-btn__spinner']} />
                  Анализира...
                </>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Получи прецизна диагноза
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  ) : null;

  return (
    <Layout>
      <div className={styles['page']}>
        {/* Header */}
        <div className={styles['header']}>
          <Link to="/problem-reports" className={styles['header__back']}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className={styles['header__info']}>
            <h1 className={styles['header__title']}>{report.title}</h1>
            <p className={styles['header__vehicle']}>{vehicle?.brand} {vehicle?.model} · {vehicle?.year}</p>
          </div>
          <button onClick={handleDelete} disabled={isDeleting} className={styles['header__delete-btn']}>
            Изтрий
          </button>
        </div>

        {aiCard ? (
          <div className={styles['grid']}>
            <div className={styles['left-col']}>{leftCol}</div>
            <div className={styles['right-col']}>{aiCard}</div>
          </div>
        ) : (
          <div className={styles['stack']}>{leftCol}</div>
        )}
      </div>
    </Layout>
  );
}
