import nodemailer from "nodemailer";
import pug from "pug";

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export const emailService = {
  transporter: null as nodemailer.Transporter | null,

  initialize() {
    const emailConfig: EmailConfig = {
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || "",
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  },

  async sendOTP(email: string, otpCode: string): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      console.log(`[TEST] OTP ${otpCode} sent to ${email}`);
      return;
    }

    if (!this.transporter) {
      this.initialize();
    }

    if (!this.transporter) {
      throw new Error("Email service not configured");
    }

    const template = `
doctype html
html
  head
    meta(charset="UTF-8")
    title #{subject}
  body(style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;")
    // Removed logo for better performance
    h2(style="color: #333; text-align: center;") #{heading}
    .container(style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;")
      p(style="margin: 0; font-size: 16px; color: #555;") #{message}
      h1(style="text-align: center; color: #007bff; font-size: 32px; margin: 10px 0; letter-spacing: 5px;") #{otpCode}
      p(style="margin: 0; font-size: 14px; color: #666;") This code will expire in 10 minutes.
    p(style="font-size: 14px; color: #666; text-align: center;") #{footer}
`;
    const html = pug.render(template, {
      subject: "Your OTP Code - BrgyKonek",
      heading: "BrgyKonek OTP Verification",
      message: "Your OTP code is:",
      otpCode,
      footer: "If you didn't request this code, please ignore this email.",
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code - BrgyKonek",
      html,
      // Removed attachments to improve performance
    };

    await this.transporter.sendMail(mailOptions);
  },

  async sendPasswordResetOTP(email: string, otpCode: string): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      console.log(`[TEST] Password Reset OTP ${otpCode} sent to ${email}`);
      return;
    }

    if (!this.transporter) {
      this.initialize();
    }

    if (!this.transporter) {
      throw new Error("Email service not configured");
    }

    const template = `
doctype html
html
  head
    meta(charset="UTF-8")
    title #{subject}
  body(style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;")
    // Removed logo for better performance
    h2(style="color: #333; text-align: center;") #{heading}
    .container(style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;")
      p(style="margin: 0; font-size: 16px; color: #555;") #{message}
      h1(style="text-align: center; color: #007bff; font-size: 32px; margin: 10px 0; letter-spacing: 5px;") #{otpCode}
      p(style="margin: 0; font-size: 14px; color: #666;") This code will expire in 10 minutes.
    p(style="font-size: 14px; color: #666; text-align: center;") #{footer}
`;
    const html = pug.render(template, {
      subject: "Password Reset OTP - BrgyKonek",
      heading: "BrgyKonek Password Reset",
      message: "Your password reset OTP code is:",
      otpCode,
      footer:
        "If you didn't request a password reset, please ignore this email and ensure your account is secure.",
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - BrgyKonek",
      html,
      // Removed attachments to improve performance
    };

    await this.transporter.sendMail(mailOptions);
  },
};
