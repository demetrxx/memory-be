import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { EmailService } from './email.service';

const mockSesSend = jest.fn();

jest.mock('@aws-sdk/client-ses', () => ({
  SESClient: jest.fn().mockImplementation(() => ({ send: mockSesSend })),
  SendEmailCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

describe('EmailService', () => {
  let templateDir: string;
  let service: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSesSend.mockResolvedValue({ MessageId: 'message-id' });
    templateDir = mkdtempSync(join(tmpdir(), 'email-service-'));
    service = new EmailService({
      region: 'eu-central-1',
      accessKeyId: 'access-key',
      secretAccessKey: 'secret-key',
      from: 'noreply@example.com',
      templateDir,
    });
  });

  afterEach(() => {
    rmSync(templateDir, { recursive: true, force: true });
  });

  function writeTemplate(name: string, html: string) {
    writeFileSync(join(templateDir, `${name}.html`), html);
  }

  function getSentCommand(index = 0) {
    return mockSesSend.mock.calls[index][0].input;
  }

  it('sends confirm email through the shared otp template', async () => {
    writeTemplate(
      'otp',
      '<h1>{{title}}</h1><p>{{intro}}</p><strong>{{code}}</strong><span>{{recipientEmail}}</span><em>{{expiresIn}}</em><small>{{securityNote}}</small>',
    );

    await service.sendConfirmEmail({
      recipient: 'user@example.com',
      code: '123456',
      url: 'https://example.com/confirm?code=123456',
    });

    expect(SESClient).toHaveBeenCalledWith({
      region: 'eu-central-1',
      credentials: {
        accessKeyId: 'access-key',
        secretAccessKey: 'secret-key',
      },
    });
    expect(SendEmailCommand).toHaveBeenCalledTimes(1);
    expect(getSentCommand()).toMatchObject({
      Source: 'noreply@example.com',
      Destination: { ToAddresses: ['user@example.com'] },
      Message: {
        Subject: { Data: 'Confirm your email', Charset: 'UTF-8' },
        Body: {
          Html: {
            Data: '<h1>Confirm your email</h1><p>Welcome to SweetMe. Enter this code to finish setting up your account.</p><strong>123456</strong><span>user@example.com</span><em>Expires in 30 minutes</em><small>For security, do not forward or share this email.</small>',
            Charset: 'UTF-8',
          },
        },
      },
    });
  });

  it('sends reset password email through the shared otp template', async () => {
    writeTemplate(
      'otp',
      '<h1>{{title}}</h1><p>{{intro}}</p><strong>{{code}}</strong><span>{{recipientEmail}}</span><em>{{expiresIn}}</em>',
    );

    await service.sendOtpEmail({
      recipient: 'user@example.com',
      subject: 'Reset your password',
      title: 'Reset your password',
      intro: 'Use this code to reset your SweetMe password.',
      code: '654321',
      expiresInMinutes: 12,
    });

    expect(getSentCommand()).toMatchObject({
      Destination: { ToAddresses: ['user@example.com'] },
      Message: {
        Subject: { Data: 'Reset your password', Charset: 'UTF-8' },
        Body: {
          Html: {
            Data: '<h1>Reset your password</h1><p>Use this code to reset your SweetMe password.</p><strong>654321</strong><span>user@example.com</span><em>Expires in 12 minutes</em>',
            Charset: 'UTF-8',
          },
        },
      },
    });
  });

  it('uses the marketing template without a code and sends per recipient', async () => {
    writeTemplate(
      'marketing',
      '<h1>{{subject}}</h1><img src="{{imgUrl}}" /><p>{{text}}</p><a href="{{url}}">{{cta}}</a><span>{{recipientEmail}}</span>',
    );

    const result = await service.sendMarketing({
      subject: 'New update',
      recipients: ['one@example.com', 'two@example.com'],
      body: {
        text: 'Hello <friend>',
        imgUrl: 'https://cdn.example.com/image.png',
        url: 'https://example.com/open',
        cta: 'Open',
      },
    });

    expect(result).toEqual([
      { MessageId: 'message-id' },
      { MessageId: 'message-id' },
    ]);
    expect(mockSesSend).toHaveBeenCalledTimes(2);
    expect(getSentCommand(0).Destination).toEqual({
      ToAddresses: ['one@example.com'],
    });
    expect(getSentCommand(1).Destination).toEqual({
      ToAddresses: ['two@example.com'],
    });
    expect(getSentCommand(0).Message.Body.Html.Data).toContain(
      'Hello &lt;friend&gt;',
    );
    expect(getSentCommand(0).Message.Body.Html.Data).toContain(
      '<h1>New update</h1>',
    );
    expect(getSentCommand(0).Message.Body.Html.Data).toContain(
      '<span>one@example.com</span>',
    );
    expect(getSentCommand(1).Message.Body.Html.Data).toContain(
      '<span>two@example.com</span>',
    );
  });

  it('uses the marketing-with-code template when a code is provided', async () => {
    writeTemplate(
      'marketing-with-code',
      '<h1>{{subject}}</h1><img src="{{imgUrl}}" /><p>{{text}}</p><strong>{{code}}</strong><a href="{{url}}">{{cta}}</a><span>{{recipientEmail}}</span>',
    );

    await service.sendMarketing({
      subject: 'Promo',
      recipients: ['user@example.com'],
      body: {
        text: 'Use this',
        imgUrl: 'https://cdn.example.com/promo.png',
        url: 'https://example.com/promo',
        cta: 'Redeem',
        code: 'SAVE10',
      },
    });

    expect(getSentCommand().Message.Body.Html.Data).toContain(
      '<strong>SAVE10</strong>',
    );
    expect(getSentCommand().Message.Body.Html.Data).toContain('<h1>Promo</h1>');
    expect(getSentCommand().Message.Body.Html.Data).toContain(
      '<span>user@example.com</span>',
    );
  });
});
