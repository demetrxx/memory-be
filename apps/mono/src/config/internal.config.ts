import { ConfigType, registerAs } from '@nestjs/config';

export const InternalConfig = registerAs('internal', () => {
  return {
    cronSecret: process.env.AUTH_INTERNAL_SECRET_CRON,
  };
});

export type InternalConfig = ConfigType<typeof InternalConfig>;
