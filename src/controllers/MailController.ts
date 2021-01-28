import MailService from '../services/MailService';
import { Route, Tags, Security, Post, Body, Header } from 'tsoa';

interface EmailInput {
  email: string;
}

@Route('/mail')
@Tags('Mail')
export class MailController {
  /**
   * Send forgot password email
   */
  @Post('forgot-password')
  public async sendResetPasswordEmail(
    @Body() input: EmailInput
  ): Promise<void> {
    await MailService.sendResetPasswordEmail(input.email);
  }

  /**
   * Send test email
   */
  @Post('test')
  public async sendTestEmailInput(
    @Body() input: EmailInput
  ): Promise<void> {
    await MailService.sendWelcomeEmail(input.email);
  }
}
