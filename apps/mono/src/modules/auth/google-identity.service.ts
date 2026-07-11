import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

import { Err } from '@/common/errors/app-error';
import { AuthConfig } from '@/config';

export type GoogleIdentity = {
  sub: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

@Injectable()
export class GoogleIdentityService {
  private readonly client = new OAuth2Client();

  constructor(private readonly configService: ConfigService) {}

  async verifyCredential(credential: string): Promise<GoogleIdentity> {
    const authConfig = this.getAuthConfig();
    if (!authConfig.webGoogleEnabled || !authConfig.webGoogleClientId) {
      throw Err.badRequest('Google auth is disabled');
    }

    let payload;
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: authConfig.webGoogleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw Err.unauthorized('Invalid Google credential');
    }

    if (!payload) {
      throw Err.unauthorized('Invalid Google credential');
    }

    if (
      payload.iss !== 'accounts.google.com' &&
      payload.iss !== 'https://accounts.google.com'
    ) {
      throw Err.unauthorized('Invalid Google issuer');
    }

    if (!payload.sub || !payload.email || payload.email_verified !== true) {
      throw Err.unauthorized('Google email is not verified');
    }

    return {
      sub: payload.sub,
      email: payload.email.trim().toLowerCase(),
      firstName: payload.given_name ?? null,
      lastName: payload.family_name ?? null,
    };
  }

  private getAuthConfig(): AuthConfig {
    const config = this.configService.get<AuthConfig>('auth');
    if (!config) {
      throw Err.internal('Auth config is missing');
    }
    return config;
  }
}
