// src/utils/email.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class Email {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async send(options: EmailOptions) {
    const mailOptions = {
      from: `Wanderlust Travel <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    await this.send({
      to: email,
      subject: '請驗證您的電子郵件',
      html: `
        <h1>歡迎加入 Wanderlust Travel</h1>
        <p>請點擊下方連結驗證您的電子郵件：</p>
        <a href="${verificationUrl}" target="_blank">驗證電子郵件</a>
        <p>此連結將在 24 小時後失效。</p>
        <p>如果您沒有註冊 Wanderlust Travel 帳號，請忽略此郵件。</p>
      `
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    await this.send({
      to: email,
      subject: '密碼重置請求',
      html: `
        <h1>密碼重置</h1>
        <p>您收到此郵件是因為您（或其他人）請求重置密碼。</p>
        <p>請點擊下方連結重置您的密碼：</p>
        <a href="${resetUrl}" target="_blank">重置密碼</a>
        <p>此連結將在 1 小時後失效。</p>
        <p>如果您沒有請求重置密碼，請忽略此郵件。</p>
      `
    });
  }
}

export default new Email();