import 'dotenv/config';
import mongoose from 'mongoose';
import ServiceCenter from './models/ServiceCenter';
import AvailableSlot from './models/AvailableSlot';

const MONGODB_URI = process.env.MONGODB_URI!;

const ADMIN_ID = new mongoose.Types.ObjectId('69f8931c6f085892a9a687ad');

const centers = [
  {
    name: 'AutoFix София',
    description: 'Пълно сервизно обслужване на леки автомобили. Разполагаме с модерна диагностична техника и опитен екип.',
    address: 'бул. Цариградско шосе 45',
    city: 'София',
    region: 'Столична',
    phone: '02 123 4567',
    email: 'autofix@example.com',
    servicesOffered: ['engine', 'diagnostics', 'brakes', 'oil-service'],
    workingHours: { open: '08:00', close: '18:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
    ratingAvg: 4.7,
    reviewCount: 34,
    isApproved: true,
    createdBy: ADMIN_ID,
  },
  {
    name: 'Турбо Сервиз Пловдив',
    description: 'Специализирани в двигатели и скоростни кутии. Работим с всички марки.',
    address: 'ул. Марица 12',
    city: 'Пловдив',
    region: 'Пловдивска',
    phone: '032 987 654',
    email: 'turbo@example.com',
    servicesOffered: ['engine', 'transmission', 'diagnostics', 'electrical'],
    workingHours: { open: '09:00', close: '17:30', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
    ratingAvg: 4.2,
    reviewCount: 18,
    isApproved: true,
    createdBy: ADMIN_ID,
  },
  {
    name: 'Гума & Джанта Варна',
    description: 'Монтаж и баланс на гуми, джанти, спирачни системи. Бърза услуга без чакане.',
    address: 'ул. Сливница 7',
    city: 'Варна',
    region: 'Варненска',
    phone: '052 334 455',
    email: 'gumadjanta@example.com',
    servicesOffered: ['tires', 'brakes', 'suspension'],
    workingHours: { open: '08:30', close: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
    ratingAvg: 4.5,
    reviewCount: 22,
    isApproved: true,
    createdBy: ADMIN_ID,
  },
  {
    name: 'ElectroAuto Бургас',
    description: 'Електрически и хибридни автомобили. Климатици, стартери, генератори.',
    address: 'ул. Алеко Богориди 3',
    city: 'Бургас',
    region: 'Бургаска',
    phone: '056 221 133',
    email: 'electroauto@example.com',
    servicesOffered: ['electrical', 'air-conditioning', 'diagnostics'],
    workingHours: { open: '09:00', close: '18:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
    ratingAvg: 4.9,
    reviewCount: 41,
    isApproved: true,
    createdBy: ADMIN_ID,
  },
  {
    name: 'Каросерия Плюс София',
    description: 'Тенекеджийски и бояджийски услуги. Работим по застрахователни случаи.',
    address: 'кв. Люлин, бл. 431',
    city: 'София',
    region: 'Столична',
    phone: '02 567 8901',
    email: 'karoseriq@example.com',
    servicesOffered: ['bodywork', 'electrical'],
    workingHours: { open: '08:00', close: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
    ratingAvg: 0,
    reviewCount: 0,
    isApproved: true,
    createdBy: ADMIN_ID,
  },
];

function generateSlots(centerId: mongoose.Types.ObjectId) {
  const slots = [];
  const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
  const today = new Date();
  for (let d = 1; d <= 7; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue; // skip Sunday
    const dateStr = date.toISOString().split('T')[0];
    for (const time of times) {
      slots.push({ serviceCenterId: centerId, date: dateStr, time, isBooked: false });
    }
  }
  return slots;
}

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await ServiceCenter.deleteMany({});
  await AvailableSlot.deleteMany({});
  console.log('Cleared existing service centers and slots');

  for (const data of centers) {
    const center = await ServiceCenter.create(data);
    const slots = generateSlots(center._id as mongoose.Types.ObjectId);
    await AvailableSlot.insertMany(slots);
    console.log(`Created: ${center.name} with ${slots.length} slots`);
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
