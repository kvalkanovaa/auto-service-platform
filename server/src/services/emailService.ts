import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT) || 587,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  resetUrl: string,
) {
  await transporter.sendMail({
    from: '"AutoService" <noreply@autoservice.bg>',
    to,
    subject: 'Смяна на парола — AutoService',
    text: `Здравей, ${firstName}!\n\nЗаявихте смяна на парола. Отидете на следния линк, за да зададете нова парола:\n\n${resetUrl}\n\nЛинкът е валиден 1 час. Ако не сте правили тази заявка, просто игнорирайте това съобщение.`,
  });
}

export async function sendBookingConfirmationToCustomer(
  to: string,
  firstName: string,
  info: { centerName: string; date: string; time: string; address: string },
) {
  await transporter.sendMail({
    from: '"AutoService" <noreply@autoservice.bg>',
    to,
    subject: `Потвърждение на резервация — ${info.centerName}`,
    text: `Здравей, ${firstName}!\n\nРезервацията ти е потвърдена.\n\nСервиз: ${info.centerName}\nАдрес: ${info.address}\nДата и час: ${info.date} в ${info.time}\n\nБлагодарим, че използва AutoService!`,
  });
}

export async function sendBookingNotificationToShop(
  to: string,
  info: {
    centerName: string;
    customerName: string;
    vehicle: string;
    date: string;
    time: string;
    note?: string;
    brief?: string;
  },
) {
  const lines = [
    `Нова резервация в ${info.centerName}.`,
    ``,
    `Клиент: ${info.customerName}`,
    `Автомобил: ${info.vehicle}`,
    `Дата и час: ${info.date} в ${info.time}`,
  ];
  if (info.note) lines.push(`Бележка: ${info.note}`);
  if (info.brief)
    lines.push(``, `Технически бриф от AI диагностиката:`, info.brief);
  await transporter.sendMail({
    from: '"AutoService" <noreply@autoservice.bg>',
    to,
    subject: `Нова резервация — ${info.date} ${info.time}`,
    text: lines.join('\n'),
  });
}

export async function sendBookingCancellationToShop(
  to: string,
  info: { centerName: string; vehicle: string; date: string; time: string },
) {
  await transporter.sendMail({
    from: '"AutoService" <noreply@autoservice.bg>',
    to,
    subject: `Отменена резервация — ${info.date} ${info.time}`,
    text: `Резервация в ${info.centerName} беше отменена.\n\nАвтомобил: ${info.vehicle}\nДата и час: ${info.date} в ${info.time}\n\nЧасът е освободен отново.`,
  });
}

export async function sendContactMessage(
  name: string,
  fromEmail: string,
  message: string,
) {
  await transporter.sendMail({
    from: '"AutoService" <noreply@autoservice.bg>',
    to: process.env.CONTACT_EMAIL ?? 'support@diagnout.bg',
    replyTo: fromEmail,
    subject: `Ново съобщение от формата за контакт — ${name}`,
    text: `Име: ${name}\nEmail: ${fromEmail}\n\nСъобщение:\n${message}`,
  });
}
