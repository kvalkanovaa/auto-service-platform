import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT) || 587,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendPasswordResetEmail(to: string, firstName: string, resetUrl: string) {
  await transporter.sendMail({
    from: '"AutoService" <noreply@autoservice.bg>',
    to,
    subject: 'Смяна на парола — AutoService',
    text: `Здравей, ${firstName}!\n\nЗаявихте смяна на парола. Отидете на следния линк, за да зададете нова парола:\n\n${resetUrl}\n\nЛинкът е валиден 1 час. Ако не сте правили тази заявка, просто игнорирайте това съобщение.`,
  });
}
