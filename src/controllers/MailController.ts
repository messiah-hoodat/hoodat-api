import MailService from '../services/MailService';
import { Route, Tags, Security, Post, Body, Header } from 'tsoa';

interface ForgotPasswordEmailInput {
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
    @Body() input: ForgotPasswordEmailInput
  ): Promise<void> {
    await MailService.sendResetPasswordEmail(input.email);
  }
}
