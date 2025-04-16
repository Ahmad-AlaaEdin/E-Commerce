import nodemailer from 'nodemailer';
import { User } from "@prisma/client";
import ejs from 'ejs';
import htmlToText from 'html-to-text';

class Email {
  to: string;
  firstName: string;
  url: string;
  from: string;
  constructor(user :User, url:string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ahmad AlaaEddin <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    return nodemailer.createTransport({
      host: process.env.BREVO_HOST,
      port: parseInt(process.env.BREVO_PORT || '587'),
      auth: {
        user: process.env.BREVO_LOGIN,
        pass: process.env.BREVO_PASSWORD,
      }
    });
  }
  async send(template:string, subject:string) {
    // 1) Render HTML based on a pug template
    const html = await ejs.renderFile(`${__dirname}/../views/email/${template}.ejs`, {
        firstName: this.firstName,
        url: this.url,
        subject,
      });

    // 2) Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};


export default Email;