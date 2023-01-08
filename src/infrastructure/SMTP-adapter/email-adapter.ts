import nodemailer from 'nodemailer';

export class EmailAdapter {
  async sendEmailRecoveryCode(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: {
        user: 'shvs1510@gmail.com',
        pass: 'cvoacomnpbqvpqju',
      },
    });

    const info = await transporter.sendMail({
      from: '"Vladislav" <shvs1510@gmail.com>',
      to: email,
      subject: 'Confirmation code',
      html:
        "<a href='https://somesite.com/password-recovery?recoveryCode=" +
        code +
        "'>recovery password</a>",
    });
  }
}
