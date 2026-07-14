import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common';
import { DeceasedEntity } from './deceased.entity';
import { ProductEntity } from './product.entity';

@Entity('deceased_item')
export class DeceasedItemEntity extends AbstractEntity {
  @ManyToOne(() => DeceasedEntity)
  @JoinColumn({
    name: 'deceased_id',
    referencedColumnName: 'id',
  })
  deceased: DeceasedEntity;

  @Index('idx_deceased_id')
  @Column({
    type: 'uuid',
    name: 'deceased_id',
  })
  deceasedId: string;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
  })
  product: ProductEntity;

  @Index('idx_product_id')
  @Column({
    type: 'uuid',
    name: 'product_id',
  })
  productId: string;

  @Column({})
  userId: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  validUntil: Date | null;
}
