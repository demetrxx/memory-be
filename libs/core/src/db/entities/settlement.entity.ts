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
