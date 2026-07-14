import {
  DeceasedEntity,
  DeceasedMediaEntity,
  Gender,
  MediaType,
  MilitaryRoleType,
} from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PaginationSortingQuery } from '@/common/utils';
import { UserWeb } from '@/modules/auth';

export type AddMediaDto = {
  fileId: string;
  type: MediaType;
};

export type CreateDeceasedDto = {
  // step 1
  gender: Gender; // Стать
  firstName: string; // Ім'я
  lastName: string; // Прізвище
  fatherName: string; // По батькові
  dob: Date; // Дата народження
  avatarId: string; // Фото
  birthPlaceId: string; // Місце народження

  // step 2
  callSign: string; // Позивний
  deathMilitaryUnitId: string; // Останнє місце служби
  militaryRole?: MilitaryRoleType; // Армійська посада

  // step 3
  dod: Date; // Дата смерті
  deathCause: string; // Причина смерті
  deathPlaceId: string; // Місце смерті

  // step 4
  lifeRole: string; // Чим займався до війни
  bio: string; // Що треба пам'ятати про померлого
  createdByRelation: string; // Ким вам був померлий
  media: AddMediaDto[]; // Фото або відео, варті шани
};

@Injectable()
export class DeceasedService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(user: UserWeb, d: CreateDeceasedDto) {
    const { media, ...dto } = d;

    const deceased = await this.dataSource.getRepository(DeceasedEntity).save({
      ...dto,
      createdById: user.id,
    });

    const mediaEntities = await this.dataSource
      .getRepository(DeceasedMediaEntity)
      .save(
        media.map((m) => ({
          fileId: m.fileId,
          type: m.type,
          deceasedId: deceased.id,
        })),
      );

    deceased.media = mediaEntities;
    deceased.createdBy = user;

    return deceased;
  }

  async getOne(id: string) {
    const deceased = await this.dataSource
      .getRepository(DeceasedEntity)
      .findOne({
        where: { id },
        relations: ['media', 'createdBy'],
      });

    return deceased;
  }

  async getMany(
    query: PaginationSortingQuery & {
      birthPlaceId?: string;
      deathPlaceId?: string;
      militaryRole?: MilitaryRoleType;
    },
  ) {
    const repo = this.dataSource.getRepository(DeceasedEntity);

    const queryBuilder = repo
      .createQueryBuilder('deceased')
      .leftJoinAndSelect('deceased.avatar', 'avatar')
      .leftJoinAndSelect('deceased.lifePhoto', 'lifePhoto')
      .leftJoinAndSelect('deceased.birthPlace', 'birthPlace')
      .leftJoinAndSelect('deceased.deathPlace', 'deathPlace')
      .leftJoinAndSelect('deceased.deathMilitaryUnit', 'deathMilitaryUnit')
      .leftJoinAndSelect('deceased.memory', 'memory')
      .orderBy('deceased.createdAt', query.order)
      .skip(query.skip)
      .take(query.take);

    if (query.birthPlaceId) {
      queryBuilder.andWhere('deceased.birthPlaceId = :birthPlaceId', {
        birthPlaceId: query.birthPlaceId,
      });
    }

    if (query.deathPlaceId) {
      queryBuilder.andWhere('deceased.deathPlaceId = :deathPlaceId', {
        deathPlaceId: query.deathPlaceId,
      });
    }

    if (query.militaryRole) {
      queryBuilder.andWhere('deceased.militaryRole = :militaryRole', {
        militaryRole: query.militaryRole,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      skip: query.skip,
      take: query.take,
    };
  }
}
