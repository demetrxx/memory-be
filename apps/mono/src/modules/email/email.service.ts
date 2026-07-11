import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Inject, Injectable } from '@nestjs/common';

import { EmailConfig } from '@/config';

import { renderEmailTemplate } from './email-template.renderer';

export interface MarketingEmailDto {
  subject: string;
  recipients: string[];
  body: {
    text: string;
    imgUrl: string;
    url: string;
    cta: string;
    code?: string;
  };
}

export interface ConfirmEmailDto {
  email: string;
  code: string;
  expiresIn: number;
}

export interface ResetPasswordEmailDto {
  email: string;
  code: string;
  expiresIn: number;
}

export interface OtpEmailDto {
  recipient: string;
  subject: string;
  title: string;
  intro: string;
  code: string;
  expiresInMinutes?: number;
  securityNote?: string;
}

@Injectable()
export class EmailService {
  private readonly defaultOtpExpiresInMinutes = 30;
  private readonly defaultOtpSecurityNote =
    'For security, do not forward or share this email.';

  private sesClient: SESClient;

  constructor(
    @Inject(EmailConfig.KEY)
    private readonly config: EmailConfig,
  ) {
    this.sesClient = new SESClient({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async sendMarketing(dto: MarketingEmailDto) {
    const templateName = dto.body.code ? 'marketing-with-code' : 'marketing';

    const results = [];
    for (const recipient of dto.recipients) {
      const html = this.renderTemplate(templateName, {
        subject: dto.subject,
        text: dto.body.text,
        imgUrl: dto.body.imgUrl,
        url: dto.body.url,
        cta: dto.body.cta,
        code: dto.body.code,
        recipientEmail: recipient,
      });

      results.push(await this.sendEmail([recipient], dto.subject, html));
    }

    return results;
  }

  async sendConfirmEmail(dto: ConfirmEmailDto) {
    return this.sendOtpEmail({
      recipient: dto.email,
      subject: 'Welcome to SweetMe',
      title: 'Verify your email address',
      intro: 'Welcome! You’re one step away from joining',
      code: dto.code,
      expiresInMinutes: dto.expiresIn / 60000,
    });
  }

  async sendResetPasswordEmail(dto: ResetPasswordEmailDto) {
    return this.sendOtpEmail({
      recipient: dto.email,
      subject: 'Reset your password',
      title: 'Reset your password',
      intro: 'Use this code to reset your SweetMe password.',
      code: dto.code,
      expiresInMinutes: dto.expiresIn / 60000,
    });
  }

  async sendOtpEmail(dto: OtpEmailDto) {
    const html = this.renderTemplate('otp', {
      title: dto.title,
      intro: dto.intro,
      code: dto.code,
      recipientEmail: dto.recipient,
      expiresIn: this.formatOtpExpiresIn(
        dto.expiresInMinutes ?? this.defaultOtpExpiresInMinutes,
      ),
      securityNote: dto.securityNote ?? this.defaultOtpSecurityNote,
    });

    return this.sendEmail([dto.recipient], dto.subject, html);
  }

  private formatOtpExpiresIn(minutes: number) {
    return `Expires in ${minutes} minutes`;
  }

  private renderTemplate(
    templateName: string,
    values: Record<string, string | undefined | null>,
  ) {
    return renderEmailTemplate(templateName, values, {
      templateDir: this.config.templateDir,
    });
  }

  private async sendEmail(to: string[], subject: string, html: string) {
    const command = new SendEmailCommand({
      Source: `"ai-sweet.me" <${this.config.from}>`,
      Destination: { ToAddresses: to },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: { Html: { Data: html, Charset: 'UTF-8' } },
      },
    });

    return this.sesClient.send(command);
  }
}
