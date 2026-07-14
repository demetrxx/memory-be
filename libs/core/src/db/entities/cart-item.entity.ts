import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../common/base.entity';
import { ProductEntity } from './product.entity';
import { UserEntity } from './user.entity';

@Index('idx_cart_item_user_product', ['userId', 'productId'])
@Entity('cart_item')
export class CartItemEntity extends AbstractEntity {
  @ManyToOne(() => UserEntity)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Index('idx_cart_item_user')
  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId: string;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
  })
  product: ProductEntity;

  @Index('idx_cart_item_product')
  @Column({
    type: 'uuid',
    name: 'product_id',
  })
  productId: string;
}
