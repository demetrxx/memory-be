import { UserEntity, UserStatus } from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { Err } from '@/common/errors/app-error';
import { PaginationSortingQuery } from '@/common/utils';

@Injectable()
export class UserAdminService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getMany(query: PaginationSortingQuery & { search?: string }) {
    const { order, skip, take, search } = query;

    const userRepository = this.dataSource.getRepository(UserEntity);

    const qb = userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.status',
        'user.lastActivityAt',
        'user.createdAt',
      ])
      .orderBy(`user.createdAt`, order)
      .skip(skip)
      .take(take);

    if (search) {
    }

    const users = await qb.getMany();
    const total = await qb.getCount();

    return {
      total,
      data: users,
      skip,
      take,
    };
  }

  async getOne(id: string) {
    const userRepository = this.dataSource.getRepository(UserEntity);

    const user = await userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw Err.notFound(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: string, d: { status?: UserStatus }) {
    const userRepository = this.dataSource.getRepository(UserEntity);

    const user = await userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw Err.notFound(`User with id ${id} not found`);
    }

    await userRepository.update(id, d);
  }
}
