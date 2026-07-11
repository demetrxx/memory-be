import { ConfigType, registerAs } from '@nestjs/config';

const DEFAULT_REDIS_URL = 'redis://localhost:6379';

const parseRedisUrl = (url: string) => {
  let host = 'localhost';
  let port = 6379;
  let password: string | undefined;
  let username: string | undefined;

  if (url.startsWith('redis://')) {
    try {
      const parsedUrl = new URL(url);
      host = parsedUrl.hostname;
      port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 6379;
      username = parsedUrl.username || undefined;
      password = parsedUrl.password || undefined;
    } catch {
      console.warn(`Failed to parse Redis URL "${url}", using defaults`);
    }
  }

  return {
    url,
    host,
    port,
    password,
    username,
  };
};

export const RedisConfig = registerAs('redis', () => {
  const mainUrl =
    process.env.REDIS_URL_MAIN || process.env.REDIS_URL || DEFAULT_REDIS_URL;
  const mediaUrl = process.env.REDIS_URL_MEDIA || mainUrl;

  return {
    main: parseRedisUrl(mainUrl),
    media: parseRedisUrl(mediaUrl),
  };
});

export type RedisConfig = ConfigType<typeof RedisConfig>;
