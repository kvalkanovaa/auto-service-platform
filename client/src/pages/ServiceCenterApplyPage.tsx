import { useState } from 'react';
import { Link } from 'react-router-dom';
import { applyServiceCenterApi } from '../api/serviceCenters';
import ServiceCenterForm, { type ServiceCenterFormData } from '../components/ServiceCenterForm';
import Layout from '../components/Layout';
import styles from './ServiceCenterApplyPage.module.scss';

export default function ServiceCenterApplyPage() {
  const [success, setSuccess] = useState(false);

  const handleApply = async (d: ServiceCenterFormData) => {
    await applyServiceCenterApi({
      name: d.name, description: d.description, address: d.address,
      city: d.city, region: d.region, phone: d.phone, email: d.email,
      servicesOffered: d.servicesOffered,
      workingHours: d.workingHours,
      applicationNote: d.message,
    });
    setSuccess(true);
  };

  if (success) {
    return (
      <Layout>
        <div className={styles['apply']}>
          <div className={styles['apply__success-card']}>
            <h1 className={styles['apply__success-title']}>Благодарим за заявката!</h1>
            <p className={styles['apply__success-text']}>
              Заявката ви е получена и ще бъде прегледана от нашия екип. След одобрение
              сервизът ще се появи в платформата и ще може да приема онлайн резервации.
            </p>
            <Link to="/dashboard" className={styles['apply__success-link']}>Към началото</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles['apply']}>
        <div className={styles['apply__header']}>
          <h1 className={styles['apply__title']}>Регистрирай своя сервиз</h1>
          <p className={styles['apply__subtitle']}>
            Присъедини сервиза си към платформата и приемай онлайн резервации от клиенти,
            които вече знаят какъв е проблемът благодарение на AI диагностиката.
          </p>
        </div>

        <div className={styles['apply__info']}>
          <p className={styles['apply__info-title']}>Как работи</p>
          <ol className={styles['apply__info-steps']}>
            <li>Попълваш формата с данните за сервиза.</li>
            <li>Администратор преглежда и одобрява заявката.</li>
            <li>Сервизът става видим за клиентите и получаваш резервациите по имейл.</li>
          </ol>
        </div>

        <ServiceCenterForm onSubmit={handleApply} submitLabel="Изпрати заявка" includeMessage />
      </div>
    </Layout>
  );
}
