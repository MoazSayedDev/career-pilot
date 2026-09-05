import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { VerificationEmailTemplate } from './templates/verification-email.template';
import { ResetPasswordEmailTemplate } from './templates/reset-password-email.template';

/**
 * EmailService handles all email operations using Nodemailer
 * Responsible for:
 * - Sending verification emails
 * - Sending password reset emails
 * - Managing SMTP configuration
 * - Error handling
 *
 * Never log OTP values or sensitive information
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  /**
   * Initialize Nodemailer transporter with SMTP configuration
   * Configuration comes from environment variables
   */
  private initializeTransporter(): void {
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT');
    const smtpUser = this.configService.get('SMTP_USER');
    // Support both documented names: SMTP_PASSWORD (.env.example) and
    // SMTP_PASS (legacy), so a correctly configured environment works.
    const smtpPassword =
      this.configService.get('SMTP_PASSWORD') ?? this.configService.get('SMTP_PASS');
    const smtpSecure = this.configService.get('SMTP_SECURE') === 'true';

    // Only initialize if SMTP config is available
    if (smtpHost && smtpPort && smtpUser && smtpPassword) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
    }
  }

  /**
   * Send verification OTP email
   * @param email - Recipient email address
   * @param userName - User's display name
   * @param otp - OTP code (should not be logged)
   * @returns Whether email was sent successfully
   */
  async sendVerificationEmail(
    email: string,
    userName: string,
    otp: string,
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn('SMTP not configured - skipping email send');
        return false;
      }

      const mailOptions = {
        from: this.configService.get('SMTP_FROM') || 'noreply@careerpilot.com',
        to: email,
        subject: 'CareerPilot - Verify Your Email Address',
        html: VerificationEmailTemplate.getHtml(userName, otp, 10),
        text: VerificationEmailTemplate.getText(userName, otp, 10),
      };

      await this.transporter.sendMail(mailOptions);

      this.logger.debug(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      // Don't throw - allow retry via resend endpoint
      return false;
    }
  }

  /**
   * Send password reset OTP email
   * @param email - Recipient email address
   * @param userName - User's display name
   * @param otp - OTP code (should not be logged)
   * @returns Whether email was sent successfully
   */
  async sendResetPasswordEmail(
    email: string,
    userName: string,
    otp: string,
  ): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn('SMTP not configured - skipping email send');
        return false;
      }

      const mailOptions = {
        from: this.configService.get('SMTP_FROM') || 'noreply@careerpilot.com',
        to: email,
        subject: 'CareerPilot - Password Reset Request',
        html: ResetPasswordEmailTemplate.getHtml(userName, otp, 10),
        text: ResetPasswordEmailTemplate.getText(userName, otp, 10),
      };

      await this.transporter.sendMail(mailOptions);

      this.logger.debug(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send reset password email to ${email}`,
        error,
      );
      // Don't throw - allow retry via resend endpoint
      return false;
    }
  }

  /**
   * Test SMTP configuration by verifying connection
   * @returns Whether SMTP connection is valid
   */
  async verifySmtpConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to verify SMTP connection', error);
      return false;
    }
  }
}
