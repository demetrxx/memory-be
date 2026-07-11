import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { RefreshSessionEntity } from './refresh-admin-session.entity';

export enum AdminStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum AdminRole {
  Owner = 'owner',
  Developer = 'developer',
  Support = 'support',
}

@Entity('admin')
export class AdminEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  firstName: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lastName: string | null;

  @Column({
    type: 'enum',
    enum: AdminRole,
    default: AdminRole.Developer,
  })
  role: AdminRole;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    type: 'enum',
    enum: AdminStatus,
    default: AdminStatus.Active,
  })
  status: AdminStatus;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  passwordHash: string;

  @OneToMany(() => RefreshSessionEntity, (session) => session.admin)
  refreshSessions: RefreshSessionEntity[];

  @ManyToOne(() => AdminEntity, (admin) => admin.invitedAdmins, {
    nullable: true,
  })
  @JoinColumn({
    name: 'invited_by_id',
    referencedColumnName: 'id',
  })
  invitedBy: AdminEntity | null;

  @Index('idx_admin_invited_by')
  @Column({
    name: 'invited_by_id',
    type: 'uuid',
    nullable: true,
  })
  invitedById: string | null;

  @OneToMany(() => AdminEntity, (admin) => admin.invitedBy)
  invitedAdmins: AdminEntity[];
}
