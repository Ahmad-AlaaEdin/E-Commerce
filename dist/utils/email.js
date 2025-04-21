"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const html_to_text_1 = require("html-to-text");
class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Ahmad AlaaEddin <${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        return nodemailer_1.default.createTransport({
            host: process.env.BREVO_HOST,
            port: parseInt(process.env.BREVO_PORT || '587'),
            auth: {
                user: process.env.BREVO_LOGIN,
                pass: process.env.BREVO_PASSWORD,
            }
        });
    }
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1) Render HTML based on a pug template
            const html = yield ejs_1.default.renderFile(`${__dirname}/../views/email/${template}.ejs`, {
                firstName: this.firstName,
                url: this.url,
                subject,
            });
            // 2) Define email options
            const mailOptions = {
                from: "ahmadalaaeldin@gmail.com",
                to: this.to,
                subject,
                html,
                text: (0, html_to_text_1.htmlToText)(html),
            };
            // 3) Create a transport and send email
            yield this.newTransport().sendMail(mailOptions);
        });
    }
    sendWelcome() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('welcome', 'Welcome to the Natours Family!');
        });
    }
    sendPasswordReset() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
        });
    }
}
;
exports.default = Email;
