import { AdminEntity, AdminRole } from '@app/core';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource } from 'typeorm';

import { PaginationSortingQuery } from '@/common/utils';
import { AuthAdminService } from '@/modules/auth';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly authService: AuthAdminService,
  ) {}

  async getOne(id: string) {
    const adminRepository = this.dataSource.getRepository(AdminEntity);
    return adminRepository.findOne({
      where: { id },
    });
  }

  async updateOne(id: string, dto: { firstName?: string; lastName?: string }) {
    const adminRepository = this.dataSource.getRepository(AdminEntity);
    await adminRepository.update(id, dto);
  }

  async invite(params: {
    email: string;
    role: AdminRole;
    password: string;
    fullName: string;
    invitedById: string;
  }) {
    const { email, role, password, fullName, invitedById } = params;

    await this.authService.signUp({
      email,
      password,
      fullName,
      invitedById,
      role,
    });
  }

  async getMany(query: PaginationSortingQuery & { search?: string }) {
    const { order, skip, take, search } = query;

    const adminRepository = this.dataSource.getRepository(AdminEntity);

    const qb = adminRepository
      .createQueryBuilder('admin')
      .select([
        'admin.id',
        'admin.firstName',
        'admin.lastName',
        'admin.status',
        'admin.role',
        'admin.email',
        'admin.createdAt',
        'admin.updatedAt',
      ])
      .orderBy(`admin.createdAt`, order)
      .skip(skip)
      .take(take);

    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('admin.firstName ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('admin.lastName ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('admin.email ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    const admins = await qb.getMany();
    const total = await qb.getCount();

    return {
      total,
      data: admins,
      skip,
      take,
    };
  }
}
