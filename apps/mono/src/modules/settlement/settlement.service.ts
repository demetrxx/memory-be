import { Region, SettlementEntity } from '@app/core';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { PaginationSortingQuery } from '@/common/utils';

@Injectable()
export class SettlementService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findMany(
    q: PaginationSortingQuery & {
      search?: string;
    },
  ) {
    await this.seed();

    const repo = this.dataSource.getRepository(SettlementEntity);

    const query = repo
      .createQueryBuilder('settlement')
      .skip(q.skip)
      .take(q.take);

    if (q.search) {
      query.where('settlement.name ILIKE :search', { search: `%${q.search}%` });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      skip: q.skip,
      take: q.take,
    };
  }

  async seed() {
    const repo = this.dataSource.getRepository(SettlementEntity);

    const settlements = await repo.count();

    if (settlements > 0) {
      return;
    }

    await repo.save([
      { name: 'Вінниця', region: Region.Vinnytsia },
      { name: 'Дніпро', region: Region.Dnipropetrovsk },
      { name: 'Донецьк', region: Region.Donetsk },
      { name: 'Житомир', region: Region.Zhytomyr },
      { name: 'Запоріжжя', region: Region.Zaporizhzhia },
      { name: 'Івано-Франківськ', region: Region.IvanoFrankivsk },
      { name: 'Київ', region: Region.Kyiv },
      { name: 'Кропивницький', region: Region.Kirovohrad },
      { name: 'Луганськ', region: Region.Luhansk },
      { name: 'Луцьк', region: Region.Lutsk },
      { name: 'Львів', region: Region.Lviv },
      { name: 'Миколаїв', region: Region.Mykolaiv },
      { name: 'Одеса', region: Region.Odesa },
      { name: 'Полтава', region: Region.Poltava },
      { name: 'Рівне', region: Region.Rivne },
      { name: 'Суми', region: Region.Sumy },
      { name: 'Тернопіль', region: Region.Ternopil },
      { name: 'Ужгород', region: Region.Uzhhorod },
      { name: 'Харків', region: Region.Kharkiv },
      { name: 'Херсон', region: Region.Kherson },
      { name: 'Хмельницький', region: Region.Khmelnytskyi },
      { name: 'Черкаси', region: Region.Cherkasy },
      { name: 'Чернівці', region: Region.Chernivtsi },
      { name: 'Чернігів', region: Region.Chernihiv },
      { name: 'Сімферополь', region: Region.Crimea },
    ]);
  }
}
