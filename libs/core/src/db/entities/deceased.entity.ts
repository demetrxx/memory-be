import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { FileEntity } from './file.entity';
import { MilitaryUnitEntity } from './military-unit.entity';
import { SettlementEntity } from './settlement.entity';
import { UserEntity } from './user.entity';

export enum Gender {
  Male = 'male',
  Female = 'female',
}

export enum DeceasedStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

@Entity('deceased')
export class DeceasedEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: DeceasedStatus,
    enumName: 'status',
  })
  status: DeceasedStatus;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'slug',
    unique: true,
  })
  slug: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  fatherName: string;

  @Column({
    type: 'enum',
    enum: Gender,
    enumName: 'gender',
  })
  gender: Gender;

  @Column({
    type: 'date',
    name: 'dob',
  })
  dob: Date;

  @Column({
    type: 'date',
    name: 'dod',
  })
  dod: Date;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'life_role',
  })
  lifeRole: string;

  @ManyToOne(() => SettlementEntity, { nullable: true })
  @JoinColumn({
    name: 'birth_place_id',
    referencedColumnName: 'id',
  })
  birthPlace: SettlementEntity | null;

  @Column({
    type: 'uuid',
    name: 'birth_place_id',
    nullable: true,
  })
  birthPlaceId: string | null;

  @ManyToOne(() => SettlementEntity, { nullable: true })
  @JoinColumn({
    name: 'death_place_id',
    referencedColumnName: 'id',
  })
  deathPlace: SettlementEntity | null;

  @Column({
    type: 'uuid',
    name: 'death_place_id',
    nullable: true,
  })
  deathPlaceId: string | null;

  @OneToOne(() => FileEntity, { nullable: true })
  @JoinColumn({
    name: 'avatar_id',
    referencedColumnName: 'id',
  })
  avatar: FileEntity | null;

  @Column({
    type: 'uuid',
    name: 'avatar_id',
    nullable: true,
  })
  avatarId: string | null;

  @Column({
    type: 'text',
    name: 'bio',
    nullable: true,
  })
  bio: string | null;

  // war data
  @Column({
    type: 'varchar',
    length: 255,
    name: 'call_sign',
    nullable: true,
  })
  callSign: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'death_cause',
  })
  deathCause: string;

  @ManyToOne(() => MilitaryUnitEntity, { nullable: true })
  @JoinColumn({
    name: 'death_military_unit_id',
    referencedColumnName: 'id',
  })
  deathMilitaryUnit: MilitaryUnitEntity | null;

  @Column({
    type: 'uuid',
    name: 'death_military_unit_id',
    nullable: true,
  })
  deathMilitaryUnitId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({
    name: 'created_by_id',
    referencedColumnName: 'id',
  })
  createdBy: UserEntity | null;

  @Column({
    type: 'uuid',
    name: 'created_by_id',
    nullable: true,
  })
  createdById: string | null;
}
