import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';

export enum MilitaryUnitType {
  COMMAND = 'command', // Командування
  CORPS = 'corps', // Корпус
  BRIGADE = 'brigade', // Бригада
  REGIMENT = 'regiment', // Полк
  BATTALION = 'battalion', // Батальйон
  COMPANY = 'company', // Рота
  PLATOON = 'platoon', // Взвод
  DETACHMENT = 'detachment', // Загін
  CENTER = 'center', // Центр
  OTHER = 'other', // Інше
  UNKNOWN = 'unknown', // Невідомо
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

@Entity('military_unit')
export class MilitaryUnitEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'enum',
    enum: MilitaryUnitType,
    name: 'type',
  })
  type: MilitaryUnitType;

  @Column({
    type: 'enum',
    enum: MilitaryUnitBranch,
    name: 'branches',
    array: true,
  })
  branches: MilitaryUnitBranch[];
}
