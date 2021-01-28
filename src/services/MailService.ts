import nodemailer from 'nodemailer';
import AuthService from './AuthService';
import UserService from './UserService';

const { EMAIL_USER, EMAIL_PASS } = process.env;

class MailService {
  private transport: nodemailer.Transporter;

  constructor() {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    this.transport = transport;
  }

  public async sendWelcomeEmail(to: string): Promise<void> {
    const mailOptions = {
      from: {
        name: 'Hoodat Team',
        address: 'messiah.hoodat@gmail.com',
      },
      to,
      subject: 'Welcome to Hoodat!',
      text:
        'Thanks for signing up with Hoodat. You are one step closer to name remembering mastery. To get started, try adding some contacts to the app.',
    };

    try {
      await this.transport.sendMail(mailOptions);
    } catch (error) {
      console.error(`Error sending welcome email: ${error}`);
    }
  }

  public async sendResetPasswordEmail(to: string): Promise<void> {
    const user = await UserService.getUserByEmail(to);
    const token = AuthService.createToken(user.id);
    const link = `https://hoodat-api.herokuapp.com/static/reset-password.html?token=${token}`;

    const mailOptions = {
      from: {
        name: 'Hoodat Support',
        address: 'messiah.hoodat@gmail.com',
      },
      to,
      subject: 'Hoodat Password Reset Request',
      text: `To reset your password, click the link: ${link}`,
    };

    try {
      await this.transport.sendMail(mailOptions);
    } catch (error) {
      console.error(`Error sending reset password email: ${error}`);
    }
  }
}

export default new MailService();
