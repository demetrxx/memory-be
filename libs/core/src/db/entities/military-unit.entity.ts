import { Column, Entity, Index } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';

export enum MilitaryUnitSpecialization {
  MECHANIZED = 'mechanized', // механізована
  MOTORIZED_INFANTRY = 'motorized_infantry', // мотопіхотна
  INFANTRY = 'infantry', // піхотна
  ASSAULT = 'assault', // штурмова
  MOUNTAIN_ASSAULT = 'mountain_assault', // гірсько-штурмова

  AIR_ASSAULT = 'air_assault', // десантно-штурмова
  AIRBORNE = 'airborne', // повітрянодесантна
  AIRMOBILE = 'airmobile', // аеромобільна

  TANK = 'tank', // танкова
  ARTILLERY = 'artillery', // артилерійська
  MARINE = 'marine', // морської піхоти

  SPECIAL_PURPOSE = 'special_purpose', // спеціального призначення
  OPERATIONAL_PURPOSE = 'operational_purpose', // оперативного призначення

  TERRITORIAL_DEFENSE = 'territorial_defense', // територіальної оборони

  OTHER = 'other',
  UNKNOWN = 'unknown',
}

export enum MilitaryUnitBranch {
  ARMED_FORCES = 'armed_forces', // ЗСУ
  NATIONAL_GUARD = 'national_guard', // НГУ
  BORDER_GUARD = 'border_guard', // ДПСУ
  NATIONAL_POLICE = 'national_police', // Поліція
  SECURITY_SERVICE = 'security_service', // СБУ
  INTELLIGENCE = 'intelligence', // ГУР
  TERRITORIAL_DEFENSE = 'territorial_defense', // Тер Оборона
  OTHER = 'other', // Інше
}

export enum MilitaryUnitNameType {
  NAMED_AFTER = 'named_after',
  GEOGRAPHIC = 'geographic',
  QUOTED_NAME = 'quoted_name',
  OTHER = 'other',
}

export interface MilitaryUnit {
  number?: number;
  echelon: MilitaryUnitEchelon;
  specialization?: MilitaryUnitSpecialization;
  branch: MilitaryUnitBranch;
  isSeparate?: boolean;
  isPresidential?: boolean;
  names: MilitaryUnitName[];
}

export interface MilitaryUnitName {
  type: MilitaryUnitNameType;
  value: string;
}

export enum MilitaryUnitEchelon {
  COMMAND = 'command',
  CORPS = 'corps',
  BRIGADE = 'brigade',
  REGIMENT = 'regiment',
  BATTALION = 'battalion',
  COMPANY = 'company',
  PLATOON = 'platoon',
  DETACHMENT = 'detachment',
  CENTER = 'center',
  OTHER = 'other',
  UNKNOWN = 'unknown',
}

// unique index on type and number
@Index(['echelon', 'number'], { unique: true })
@Entity('military_unit')
export class MilitaryUnitEntity extends AbstractEntity {
  @Column({
    type: 'jsonb',
    name: 'names',
  })
  names: MilitaryUnitName[];

  @Column({
    type: 'boolean',
    name: 'is_separate',
    default: false,
  })
  isSeparate: boolean;

  @Column({
    type: 'boolean',
    name: 'is_presidential',
    default: false,
  })
  isPresidential: boolean;

  @Column({
    type: 'integer',
    name: 'number',
  })
  number: number;

  @Column({
    type: 'enum',
    enum: MilitaryUnitEchelon,
    name: 'echelon',
  })
  echelon: MilitaryUnitEchelon;

  @Column({
    type: 'enum',
    enum: MilitaryUnitSpecialization,
    name: 'specialization',
    nullable: true,
  })
  specialization: MilitaryUnitSpecialization;

  @Column({
    type: 'enum',
    enum: MilitaryUnitBranch,
    name: 'branch',
    enumName: 'military_unit_branch',
  })
  branch: MilitaryUnitBranch;
}
