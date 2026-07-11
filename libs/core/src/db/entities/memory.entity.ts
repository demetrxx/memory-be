import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { DeceasedEntity } from './deceased.entity';
import { UserEntity } from './user.entity';

export enum MemoryStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('memory')
export class MemoryEntity extends AbstractEntity {
  @Column({
    type: 'text',
    name: 'text',
  })
  text: string;

  @ManyToOne(() => DeceasedEntity, { nullable: true })
  @JoinColumn({
    name: 'deceased_id',
    referencedColumnName: 'id',
  })
  deceased: DeceasedEntity | null;

  @Column({
    type: 'uuid',
    name: 'deceased_id',
    nullable: true,
  })
  deceasedId: string | null;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity | null;

  @Column({
    type: 'uuid',
    name: 'user_id',
    nullable: true,
  })
  userId: string | null;

  @Column({
    type: 'enum',
    enum: MemoryStatus,
    name: 'status',
  })
  status: MemoryStatus;
}
