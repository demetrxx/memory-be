import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../common';

export enum ProductType {
  Flower = 'flower',
  Bush = 'bush',
  Tree = 'tree',
  Candle = 'candle',
  Star = 'star',
}

@Entity('product')
export class ProductEntity extends AbstractEntity {
  @Column({
    type: 'enum',
    enum: ProductType,
    name: 'type',
  })
  type: ProductType;

  @Column({
    type: 'integer',
    name: 'price_cents',
  })
  priceCents: number;

  @Column({
    type: 'boolean',
    name: 'is_active',
  })
  isActive: boolean;
}
