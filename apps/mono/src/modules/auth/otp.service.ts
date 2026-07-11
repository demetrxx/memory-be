import { OtpEntity, OtpPayload, OtpPurpose } from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { customAlphabet } from 'nanoid';
import { DataSource, IsNull, MoreThan, Not } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { EmailService } from '@/modules/email';

const nanoid = customAlphabet('0123456789', 6);
const EXPIRES_IN = 30 * 60 * 1000; // 30 minutes

const SEND_BUFFER = 20 * 1000; // 20 seconds

@Injectable()
export class OtpService {
  constructor(
    @InjectDataSource()
    private readonly ds: DataSource,
    private readonly emailService: EmailService,
  ) {}

  private async create<T extends OtpPurpose>(
    userId: string,
    purpose: T,
    payload: OtpPayload,
  ) {
    const code = nanoid();
    const expiresAt = new Date(Date.now() + EXPIRES_IN);

    // todo: add retry if hit the same code
    await this.ds.getRepository(OtpEntity).save({
      userId,
      purpose,
      code,
      expiresAt,
      payload,
    });

    return { code, expiresAt };
  }

  async send<T extends OtpPurpose>(userId: string, email: string, purpose: T) {
    // trottle
    const existing = await this.ds.getRepository(OtpEntity).findOne({
      where: {
        userId,
        purpose,
        createdAt: MoreThan(new Date(Date.now() - SEND_BUFFER)),
      },
    });

    if (existing) {
      throw Err.badRequest(
        `You can only send one OTP per ${SEND_BUFFER / 1000} seconds`,
      );
    }

    // create
    const { code } = await this.create(userId, purpose, {
      email,
    });

    // send
    switch (purpose) {
      case OtpPurpose.VerifyEmail:
        await this.emailService.sendConfirmEmail({
          code,
          email,
          expiresIn: EXPIRES_IN,
        });
        break;
      case OtpPurpose.ResetPassword:
        await this.emailService.sendResetPasswordEmail({
          code,
          email,
          expiresIn: EXPIRES_IN,
        });
        break;
    }
  }

  async activate(
    userId: string,
    purpose: OtpPurpose,
    code: string,
  ): Promise<string> {
    const otp = await this.ds.getRepository(OtpEntity).findOne({
      where: {
        userId,
        code,
        purpose,
      },
    });

    if (!otp) {
      throw Err.badRequest('Invalid OTP code');
    }

    if (otp.expiresAt < new Date()) {
      throw Err.badRequest('OTP code has expired');
    }

    await this.ds.getRepository(OtpEntity).update(otp.id, {
      activatedAt: new Date(),
    });

    return otp.id;
  }

  async findOne(id: string, purpose: OtpPurpose, userId?: string) {
    return this.ds.getRepository(OtpEntity).findOne({
      where: {
        id,
        userId,
        purpose,
        activatedAt: Not(IsNull()),
        expiresAt: MoreThan(new Date()),
      },
    });
  }
}
