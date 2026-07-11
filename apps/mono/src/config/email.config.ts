import { ConfigType, registerAs } from '@nestjs/config';

export const EmailConfig = registerAs('email', () => {
  return {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    from: process.env.EMAIL_FROM,
    templateDir: process.env.EMAIL_TEMPLATE_DIR,
  };
});

export type EmailConfig = ConfigType<typeof EmailConfig>;
