import { EmailAdapter } from './email-adapter';

export class EmailManager {
  constructor(private readonly emailAdapter: EmailAdapter) {}
  async sendEmailRecoveryCode(email: string, confirmationCode: string) {
    await this.emailAdapter.sendEmailRecoveryCode(email, confirmationCode);
  }
}
