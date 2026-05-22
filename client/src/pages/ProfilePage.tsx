import { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfileApi, changePasswordApi } from '../api/auth';
import api from '../api/axios';
import Layout from '../components/Layout';
import styles from './ProfilePage.module.scss';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const result = await api.post<{ url: string }>('/upload', formData);
      setAvatarUrl(result.url);
    } catch {
      setAvatarPreview(avatarUrl);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setProfileError('Попълни всички полета');
      return;
    }
    setProfileSaving(true);
    try {
      const updated = await updateProfileApi({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), avatarUrl: avatarUrl || undefined });
      updateUser(updated);
      setProfileSuccess(true);
    } catch (err: unknown) {
      const msg = (err as Error).message;
      setProfileError(msg.includes('409') ? 'Този email вече се използва' : 'Грешка при запазване');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Попълни всички полета');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Новата парола трябва да е поне 6 символа');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Паролите не съвпадат');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePasswordApi(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = (err as Error).message;
      setPasswordError(msg.includes('400') ? 'Грешна текуща парола' : 'Грешка при смяна на паролата');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <Layout>
      <div className={styles['page']}>

        <div className={styles['header']}>
          <h1 className={styles['header__title']}>Моят профил</h1>
          <p className={styles['header__subtitle']}>Управлявай личната си информация</p>
        </div>

        {/* Avatar card */}
        <div className={styles['avatar-card']}>
          <div className={styles['avatar-wrap']}>
            <div className={styles['avatar']}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className={styles['avatar__img']} />
              ) : (
                <span className={styles['avatar__initials']}>{initials}</span>
              )}
              {avatarUploading && <div className={styles['avatar__uploading']} />}
            </div>
            <button
              type="button"
              className={styles['avatar__btn']}
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
            >
              {avatarUploading ? 'Качване...' : 'Смени снимката'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles['avatar__file-input']}
              onChange={handleAvatarChange}
            />
          </div>
          <div className={styles['avatar-info']}>
            <p className={styles['avatar-info__name']}>{user?.firstName} {user?.lastName}</p>
            <p className={styles['avatar-info__email']}>{user?.email}</p>
            {user?.role === 'admin' && <span className={styles['avatar-info__role']}>Администратор</span>}
          </div>
        </div>

        {/* Personal info */}
        <div className={styles['section-card']}>
          <h2 className={styles['section-card__title']}>Лична информация</h2>
          <form onSubmit={handleProfileSave}>
            <div className={styles['fields-grid']}>
              <div className={styles['field']}>
                <label className={styles['field__label']}>Име</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={styles['field__input']} />
              </div>
              <div className={styles['field']}>
                <label className={styles['field__label']}>Фамилия</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={styles['field__input']} />
              </div>
            </div>
            <div className={styles['field']}>
              <label className={styles['field__label']}>Email адрес</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={styles['field__input']} />
            </div>
            {profileError && <div className={styles['alert--error']}>{profileError}</div>}
            {profileSuccess && <div className={styles['alert--success']}>Промените са запазени успешно.</div>}
            <div className={styles['form-footer']}>
              <button type="submit" disabled={profileSaving} className={styles['save-btn']}>
                {profileSaving ? 'Запазване...' : 'Запази промените'}
              </button>
            </div>
          </form>
        </div>

        {/* Change password */}
        <div className={styles['section-card']}>
          <h2 className={styles['section-card__title']}>Смяна на парола</h2>
          <form onSubmit={handlePasswordSave}>
            <div className={styles['field']}>
              <label className={styles['field__label']}>Текуща парола</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className={styles['field__input']} />
            </div>
            <div className={styles['fields-grid']}>
              <div className={styles['field']}>
                <label className={styles['field__label']}>Нова парола</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Минимум 6 символа" className={styles['field__input']} />
              </div>
              <div className={styles['field']}>
                <label className={styles['field__label']}>Потвърди новата парола</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className={styles['field__input']} />
              </div>
            </div>
            {passwordError && <div className={styles['alert--error']}>{passwordError}</div>}
            {passwordSuccess && <div className={styles['alert--success']}>Паролата е сменена успешно.</div>}
            <div className={styles['form-footer']}>
              <button type="submit" disabled={passwordSaving} className={styles['save-btn']}>
                {passwordSaving ? 'Запазване...' : 'Смени паролата'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </Layout>
  );
}
