import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { FileEntity } from './file.entity';
import { MemoryEntity } from './memory.entity';

export enum MemoryMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity('memory_media')
export class MemoryMediaEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: MemoryMediaType,
    name: 'type',
  })
  type: MemoryMediaType;

  @ManyToOne(() => MemoryEntity, { nullable: true })
  @JoinColumn({
    name: 'memory_id',
    referencedColumnName: 'id',
  })
  memory: MemoryEntity | null;

  @Column({
    type: 'uuid',
    name: 'memory_id',
    nullable: true,
  })
  memoryId: string | null;

  @ManyToOne(() => FileEntity, { nullable: true })
  @JoinColumn({
    name: 'file_id',
    referencedColumnName: 'id',
  })
  file: FileEntity | null;

  @Column({
    type: 'uuid',
    name: 'file_id',
    nullable: true,
  })
  fileId: string | null;
}
