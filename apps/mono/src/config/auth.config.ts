import { ConfigType, registerAs } from '@nestjs/config';

export const AuthConfig = registerAs('auth', () => {
  const accessTtlMinutesAdmin = parseInt(
    process.env.AUTH_ACCESS_TTL_MIN ?? '15',
    10,
  );
  const refreshTtlDaysAdmin = parseInt(
    process.env.AUTH_REFRESH_TTL_DAYS ?? '30',
    10,
  );

  const accessTtlMinutesWeb = parseInt(
    process.env.AUTH_WEB_ACCESS_TTL_MIN ?? '15',
    10,
  );
  const refreshTtlDaysWeb = parseInt(
    process.env.AUTH_WEB_REFRESH_TTL_DAYS ?? '30',
    10,
  );
  const webGoogleClientId = process.env.AUTH_WEB_GOOGLE_CLIENT_ID ?? '';

  return {
    emailAuthEnabled: process.env.AUTH_EMAIL_ENABLED === 'true',
    emailAuthEnabledWeb: process.env.AUTH_WEB_EMAIL_ENABLED === 'true',
    webGoogleClientId,
    webGoogleEnabled:
      process.env.AUTH_WEB_GOOGLE_ENABLED === 'true' ||
      (process.env.AUTH_WEB_GOOGLE_ENABLED !== 'false' &&
        webGoogleClientId.length > 0),
    accessSecretAdmin: process.env.AUTH_ACCESS_SECRET ?? '',
    refreshSecretAdmin: process.env.AUTH_REFRESH_SECRET ?? '',
    accessSecretWeb: process.env.AUTH_WEB_ACCESS_SECRET ?? '',
    refreshSecretWeb: process.env.AUTH_WEB_REFRESH_SECRET ?? '',
    accessTtlMinutesAdmin,
    refreshTtlDaysAdmin,
    accessTtlMinutesWeb,
    refreshTtlDaysWeb,
    cookieDomain: process.env.AUTH_COOKIE_DOMAIN,
    webCookieDomain: process.env.AUTH_WEB_COOKIE_DOMAIN,
    cookiePathAdmin: '/admin/auth',
    cookiePathWeb: '/web/auth',
    cookieSecure: process.env.AUTH_COOKIE_SECURE !== 'false',
    cookieSameSite: (process.env.AUTH_COOKIE_SAMESITE ?? 'lax').toLowerCase(),
  };
});

export type AuthConfig = ConfigType<typeof AuthConfig>;
