import {
  ActivityLogEntity,
  ActivityLogType,
  SystemLogEntity,
  SystemLogStatus,
} from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LogsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async logSystem(i: {
    type: string;
    status: SystemLogStatus;
    payload?: any;
    message?: string;
    stackTrace?: string;
  }) {
    const repository = this.dataSource.getRepository(SystemLogEntity);

    await repository.save(i);
  }

  async logActivity(i: {
    type: ActivityLogType;
    payload?: any;
    userId: string;
  }) {
    const repository = this.dataSource.getRepository(ActivityLogEntity);

    await repository.save(i);
  }
}
