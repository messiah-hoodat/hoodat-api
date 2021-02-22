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
      subject: 'Password Reset Request',
      text: `Hey there! We have received a request from your account to reset your password. If this was not you, please ignore this email. To reset your password, follow this link to the reset password form: ${link}`,
    };

    try {
      await this.transport.sendMail(mailOptions);
    } catch (error) {
      console.error(`Error sending reset password email: ${error}`);
    }
  }

  public async sendListSharedEmail(to: string, from: string, listName: string): Promise<void> {
    const mailOptions = {
      from: {
        name: 'Hoodat Team',
        address: 'messiah.hoodat@gmail.com',
      },
      to,
      subject: `Someone shared a list with you`,
      text: `Hi there! ${from} just shared a list with you called "${listName}". Open the "Shared With Me" tab in the Hoodat app to check it out.`,
    };

    try {
      await this.transport.sendMail(mailOptions);
    } catch (error) {
      console.error(`Error sending list shared email: ${error}`);
    }
  }
}

export default new MailService();
