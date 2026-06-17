import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applySchema, type ApplyForm } from '../validation/schemas';
import { ApiError } from '../api/axios';
import styles from './ServiceCenterForm.module.scss';

const categoryOptions = [
  { value: 'engine', label: 'Двигател' },
  { value: 'diagnostics', label: 'Диагностика' },
  { value: 'brakes', label: 'Спирачки' },
  { value: 'suspension', label: 'Окачване' },
  { value: 'tires', label: 'Гуми' },
  { value: 'electrical', label: 'Електрика' },
  { value: 'air-conditioning', label: 'Климатик' },
  { value: 'bodywork', label: 'Каросерия' },
  { value: 'transmission', label: 'Скоростна кутия' },
  { value: 'oil-service', label: 'Маслена смяна' },
];

const dayOptions = [
  { value: 'monday', label: 'Пон' },
  { value: 'tuesday', label: 'Вт' },
  { value: 'wednesday', label: 'Ср' },
  { value: 'thursday', label: 'Чет' },
  { value: 'friday', label: 'Пет' },
  { value: 'saturday', label: 'Съб' },
  { value: 'sunday', label: 'Нед' },
];

const textFields: { key: 'name' | 'city' | 'region' | 'address' | 'phone' | 'email'; label: string; type?: string; placeholder?: string }[] = [
  { key: 'name', label: 'Име на сервиза', placeholder: 'Авто Сервиз ЕООД' },
  { key: 'city', label: 'Град', placeholder: 'Варна' },
  { key: 'region', label: 'Регион / Област', placeholder: 'Варна' },
  { key: 'address', label: 'Адрес', placeholder: 'ул. Лъв 1' },
  { key: 'phone', label: 'Телефон', type: 'tel', placeholder: '+359 888 123 456' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'service@primer.bg' },
];

export interface ServiceCenterFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  email: string;
  servicesOffered: string[];
  workingHours: { open: string; close: string; days: string[] };
  message?: string;
}

interface Props {
  onSubmit: (data: ServiceCenterFormData) => Promise<void>;
  submitLabel: string;
  includeMessage?: boolean;
  initial?: ServiceCenterFormData;
}

export default function ServiceCenterForm({ onSubmit, submitLabel, includeMessage = false, initial }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplyForm>({
    resolver: zodResolver(applySchema),
    defaultValues: initial
      ? {
          name: initial.name, city: initial.city, region: initial.region,
          address: initial.address, phone: initial.phone, email: initial.email,
          description: initial.description,
          open: initial.workingHours.open, close: initial.workingHours.close,
        }
      : { open: '09:00', close: '18:00' },
  });

  const [days, setDays] = useState<string[]>(initial?.workingHours.days ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [services, setServices] = useState<string[]>(initial?.servicesOffered ?? []);
  const [daysError, setDaysError] = useState('');
  const [servicesError, setServicesError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const toggleDay = (val: string) =>
    setDays((d) => {
      const next = d.includes(val) ? d.filter((x) => x !== val) : [...d, val];
      if (next.length) setDaysError('');
      return next;
    });

  const toggleService = (val: string) =>
    setServices((s) => {
      const next = s.includes(val) ? s.filter((x) => x !== val) : [...s, val];
      if (next.length) setServicesError('');
      return next;
    });

  const onValid = async (data: ApplyForm) => {
    setSubmitError('');
    let hasError = false;
    if (days.length === 0) { setDaysError('Изберете поне един работен ден'); hasError = true; }
    if (services.length === 0) { setServicesError('Изберете поне една услуга'); hasError = true; }
    if (hasError) return;
    try {
      await onSubmit({
        name: data.name, description: data.description, address: data.address,
        city: data.city, region: data.region, phone: data.phone, email: data.email,
        servicesOffered: services,
        workingHours: { open: data.open, close: data.close, days },
        message: includeMessage ? (data.message || undefined) : undefined,
      });
    } catch (e: unknown) {
      setSubmitError(e instanceof ApiError ? e.message : 'Грешка при изпращане. Опитай отново.');
    }
  };

  return (
    <form className={styles['form']} onSubmit={handleSubmit(onValid)}>
      <div className={styles['grid']}>
        {textFields.map((f) => (
          <div key={f.key} className={styles['field']}>
            <label className={styles['label']}>
              {f.label} <span className={styles['req']}>*</span>
            </label>
            <input
              {...register(f.key)}
              type={f.type ?? 'text'}
              placeholder={f.placeholder}
              className={`${styles['input']}${errors[f.key] ? ` ${styles['input--error']}` : ''}`}
            />
            {errors[f.key] && <p className={styles['field-error']}>{errors[f.key]?.message}</p>}
          </div>
        ))}
      </div>

      <div className={styles['field']}>
        <label className={styles['label']}>
          Описание <span className={styles['req']}>*</span>
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Кратко описание на сервиза и специализацията му..."
          className={`${styles['textarea']}${errors.description ? ` ${styles['input--error']}` : ''}`}
        />
        {errors.description && <p className={styles['field-error']}>{errors.description.message}</p>}
      </div>

      <div className={styles['time-grid']}>
        <div className={styles['field']}>
          <label className={styles['label']}>Отваря <span className={styles['req']}>*</span></label>
          <input type="time" {...register('open')} className={styles['input']} />
        </div>
        <div className={styles['field']}>
          <label className={styles['label']}>Затваря <span className={styles['req']}>*</span></label>
          <input type="time" {...register('close')} className={styles['input']} />
        </div>
      </div>

      <div className={styles['toggle-wrap']}>
        <label className={styles['label']}>
          Работни дни <span className={styles['req']}>*</span>
        </label>
        <div className={styles['toggle-group']}>
          {dayOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleDay(value)}
              className={`${styles['chip']}${days.includes(value) ? ` ${styles['chip--active']}` : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        {daysError && <p className={styles['field-error']}>{daysError}</p>}
      </div>

      <div className={styles['toggle-wrap']}>
        <label className={styles['label']}>
          Предлагани услуги <span className={styles['req']}>*</span>
        </label>
        <div className={styles['toggle-group']}>
          {categoryOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleService(value)}
              className={`${styles['chip']}${services.includes(value) ? ` ${styles['chip--active']}` : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        {servicesError && <p className={styles['field-error']}>{servicesError}</p>}
      </div>

      {includeMessage && (
        <div className={styles['field']}>
          <label className={styles['label']}>
            Съобщение към екипа <span className={styles['optional']}>(незадължително)</span>
          </label>
          <textarea
            {...register('message')}
            rows={2}
            placeholder="Въпрос или допълнителна информация към администратора..."
            className={styles['textarea']}
          />
          {errors.message && <p className={styles['field-error']}>{errors.message.message}</p>}
        </div>
      )}

      {submitError && <div className={styles['error']}>{submitError}</div>}

      <button type="submit" disabled={isSubmitting} className={styles['submit']}>
        {isSubmitting ? 'Изпращане...' : submitLabel}
      </button>
    </form>
  );
}
