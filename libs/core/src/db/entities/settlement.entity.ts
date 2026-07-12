import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';

export enum Country {
  RUSSIA = 'russia',
}

export enum SettlementType {
  ISLAND = 'island',
  CITY = 'city',
  TOWN = 'town',
  URBAN_SETTLEMENT = 'urban_settlement',
  VILLAGE = 'village',
  HAMLET = 'hamlet',
  OTHER = 'other',
}

export enum Region {
  Kharkiv = 'kharkiv',
  Kyiv = 'kyiv',
  Lviv = 'lviv',
  Odesa = 'odesa',
  Zaporizhzhia = 'zaporizhzhia',
  Zhytomyr = 'zhytomyr',
  IvanoFrankivsk = 'ivano-frankivsk',
  Kirovohrad = 'kirovohrad',
  Lutsk = 'lutsk',
  Kherson = 'kherson',
  Khmelnytskyi = 'khmelnytskyi',
  Cherkasy = 'cherkasy',
  Chernivtsi = 'chernivtsi',
  Chernihiv = 'chernihiv',
  Dnipropetrovsk = 'dnipropetrovsk',
  Donetsk = 'donetsk',
  Luhansk = 'luhansk',
  Mykolaiv = 'mykolaiv',
  Rivne = 'rivne',
  Sumy = 'sumy',
  Ternopil = 'ternopil',
  Vinnytsia = 'vinnytsia',
  Poltava = 'poltava',
  Uzhhorod = 'uzhhorod',
  Crimea = 'crimea',
}

@Entity('settlement')
export class SettlementEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'region',
    nullable: true,
  })
  region: string | null;

  @Column({
    type: 'enum',
    enum: Country,
    name: 'other_country',
    nullable: true,
  })
  otherCountry: Country | null;
}
