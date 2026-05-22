import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getVehiclesApi } from '../api/vehicles';
import { analyzeSymptomsApi, createReportApi } from '../api/problemReports';
import type { Vehicle } from '../types';
import Layout from '../components/Layout';
import styles from './ProblemReportNewPage.module.scss';

export default function ProblemReportNewPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getVehiclesApi().then((v) => { setVehicles(v); if (v.length === 1) setVehicleId(v[0]._id); });
  }, []);

  const handleAnalyze = async () => {
    if (!vehicleId || !title.trim() || !description.trim()) {
      setError('Избери кола, добави заглавие и опиши проблема');
      return;
    }
    setError('');
    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptomsApi(vehicleId, description);
      const saved = await createReportApi({
        vehicleId,
        title: title.trim(),
        description,
        aiSummary: result.summary,
        aiUrgency: result.urgency,
        aiSuggestedCategories: result.suggestedCategories,
        aiQuestions: result.questions,
        aiBriefForShop: result.briefForShop,
      });
      // Redirect to detail page — reads from DB, so back/forward always preserves AI results
      navigate(`/problem-reports/${saved._id}`);
    } catch {
      setError('Грешка при AI анализа. Опитай отново.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Layout>
      <div className={styles['page']}>
        <div className={styles['header']}>
          <Link to="/problem-reports" className={styles['header__back']}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className={styles['header__title']}>Нов проблем</h1>
            <p className={styles['header__subtitle']}>Опиши проблема и AI ще го анализира</p>
          </div>
        </div>

        <div className={styles['stack']}>
          <div className={styles['form-card']}>
            <div className={styles['form-card__field']}>
              <label className={styles['form-card__label']}>Автомобил</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className={styles['form-card__input']}
              >
                <option value="">Избери автомобил...</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>{v.brand} {v.model} ({v.year})</option>
                ))}
              </select>
            </div>

            <div className={styles['form-card__field']}>
              <label className={styles['form-card__label']}>Заглавие на проблема</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="напр. Пуши при студен старт, Чук от двигателя..."
                className={styles['form-card__input']}
              />
            </div>

            <div className={styles['form-card__field']}>
              <label className={styles['form-card__label']}>Описание на проблема</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Опиши подробно какво се случва — звуци, вибрации, светлини на таблото, при какви условия се проявява..."
                className={styles['form-card__textarea']}
              />
            </div>

            {error && <div className={styles['error']}>{error}</div>}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !vehicleId || !title.trim() || !description.trim()}
              className={styles['analyze-btn']}
            >
              {isAnalyzing ? (
                <><div className={styles['analyze-btn__spinner']} /> AI анализира...</>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Анализирай с AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
