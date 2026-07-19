import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';

export enum Country {
  RUSSIA = 'russia',
}

export enum SettlementType {
  CITY = 'city', // M,K
  SETTLEMENT = 'settlement', // X
  VILLAGE = 'village', // C

  ISLAND = 'island',
  HAMLET = 'hamlet',
  OTHER = 'other',
}

export enum Region {
  Kharkiv = 'kharkiv', // UA63000000000041885
  Kyiv = 'kyiv', // UA32000000000030281
  Lviv = 'lviv', // UA46000000000026241
  Odesa = 'odesa', // UA51000000000030770
  Zaporizhzhia = 'zaporizhzhia', // UA23000000000064947
  Zhytomyr = 'zhytomyr', // UA18000000000041385
  IvanoFrankivsk = 'ivano-frankivsk', // UA26000000000069363
  Kirovohrad = 'kirovohrad', // UA35000000000016081
  Lutsk = 'lutsk', // UA07000000000024379
  Kherson = 'kherson', // UA65000000000030969
  Khmelnytskyi = 'khmelnytskyi', // UA68000000000099709
  Cherkasy = 'cherkasy', // UA71000000000010357
  Chernivtsi = 'chernivtsi', // UA73000000000044923
  Chernihiv = 'chernihiv', // UA74000000000025378
  Dnipropetrovsk = 'dnipropetrovsk', // UA12000000000090473
  Donetsk = 'donetsk', // UA14000000000091971
  Luhansk = 'luhansk', // UA44000000000018893
  Mykolaiv = 'mykolaiv', // UA48000000000039575
  Rivne = 'rivne', // UA56000000000066151
  Sumy = 'sumy', // UA59000000000057109
  Ternopil = 'ternopil', // UA61000000000060328
  Vinnytsia = 'vinnytsia', // UA05000000000010236
  Poltava = 'poltava', // UA53000000000028050
  Uzhhorod = 'uzhhorod', // UA21000000000011690
  Crimea = 'crimea', // UA01000000000013043
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
    type: 'enum',
    enum: SettlementType,
    name: 'type',
    enumName: 'settlement_type',
  })
  type: SettlementType;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'aliases',
    array: true,
  })
  aliases: string[];

  @Column({
    name: 'region',
    type: 'enum',
    enum: Region,
    enumName: 'region',
  })
  region: Region;

  @Column({
    name: 'lat',
    type: 'double precision',
  })
  lat: number;

  @Column({
    name: 'lng',
    type: 'double precision',
  })
  lng: number;

  @Column({
    type: 'enum',
    enum: Country,
    name: 'other_country',
    nullable: true,
  })
  otherCountry: Country | null;
}
