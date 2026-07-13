import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Column } from 'typeorm';

import { AbstractEntity, MediaType } from '../common';
import { DeceasedEntity } from './deceased.entity';
import { FileEntity } from './file.entity';

@Entity('deceased_media')
export class DeceasedMediaEntity extends AbstractEntity {
  @ManyToOne(() => DeceasedEntity, (entity) => entity.media)
  @JoinColumn({
    name: 'deceased_id',
    referencedColumnName: 'id',
  })
  deceased: DeceasedEntity;

  @Index('idx_deceased_media_deceased_id')
  @Column({
    type: 'uuid',
    name: 'deceased_id',
  })
  deceasedId: string;

  @Column({
    type: 'enum',
    enum: MediaType,
    name: 'type',
    enumName: 'media_type',
  })
  type: MediaType;

  @ManyToOne(() => FileEntity, { nullable: false })
  @JoinColumn({
    name: 'file_id',
    referencedColumnName: 'id',
  })
  file: FileEntity;

  @Column({
    type: 'uuid',
    name: 'file_id',
    nullable: false,
  })
  fileId: string;
}
