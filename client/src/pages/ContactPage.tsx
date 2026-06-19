import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendContactMessageApi } from '../api/contact';
import { ApiError } from '../api/axios';
import { contactSchema, type ContactForm } from '../validation/schemas';
import Layout from '../components/Layout';
import styles from './ContactPage.module.scss';

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onValid = async (data: ContactForm) => {
    try {
      await sendContactMessageApi(data);
      reset();
    } catch (err: unknown) {
      setError('root', {
        message:
          err instanceof ApiError
            ? err.message
            : 'Грешка при изпращане. Опитайте отново.',
      });
    }
  };

  return (
    <Layout>
      <div className={styles['contact']}>
        <div className={styles['contact__header']}>
          <h1 className={styles['contact__title']}>Свържи се с нас</h1>
          <p className={styles['contact__subtitle']}>
            Имаш въпрос или предложение? Пиши ни и ще ти отговорим възможно
            най-скоро.
          </p>
        </div>

        <div className={styles['contact__body']}>
          {/* Contact details */}
          <div className={styles['contact__info']}>
            <div className={styles['contact__info-item']}>
              <p className={styles['contact__info-label']}>Email</p>
              <a
                href="mailto:support@diagnout.bg"
                className={styles['contact__info-value']}
              >
                support@diagnout.bg
              </a>
            </div>
            <div className={styles['contact__info-item']}>
              <p className={styles['contact__info-label']}>Телефон</p>
              <a
                href="tel:+35921234567"
                className={styles['contact__info-value']}
              >
                +359 2 123 4567
              </a>
            </div>
            <div className={styles['contact__info-item']}>
              <p className={styles['contact__info-label']}>Работно време</p>
              <p className={styles['contact__info-text']}>
                Пон–Пет, 09:00 – 18:00
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            className={styles['contact__card']}
            onSubmit={handleSubmit(onValid)}
          >
            {isSubmitSuccessful ? (
              <div className={styles['contact__success']}>
                Благодарим! Съобщението е изпратено успешно. Ще се свържем с теб
                скоро.
              </div>
            ) : (
              <>
                <div className={styles['contact__field']}>
                  <label className={styles['contact__label']}>Име</label>
                  <input
                    {...register('name')}
                    placeholder="Иван Иванов"
                    className={`${styles['contact__input']}${errors.name ? ` ${styles['contact__input--error']}` : ''}`}
                  />
                  {errors.name && (
                    <p className={styles['contact__field-error']}>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className={styles['contact__field']}>
                  <label className={styles['contact__label']}>Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="ivan@primer.bg"
                    className={`${styles['contact__input']}${errors.email ? ` ${styles['contact__input--error']}` : ''}`}
                  />
                  {errors.email && (
                    <p className={styles['contact__field-error']}>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className={styles['contact__field']}>
                  <label className={styles['contact__label']}>Съобщение</label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    placeholder="Опиши въпроса или съобщението си..."
                    className={`${styles['contact__textarea']}${errors.message ? ` ${styles['contact__input--error']}` : ''}`}
                  />
                  {errors.message && (
                    <p className={styles['contact__field-error']}>
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {errors.root && (
                  <div className={styles['contact__error']}>
                    {errors.root.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles['contact__submit']}
                >
                  {isSubmitting ? 'Изпращане...' : 'Изпрати съобщение'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
}
