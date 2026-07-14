import { CartItemEntity } from '@app/core/db/entities/cart-item.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getCart(userId: string) {
    return this.dataSource.getRepository(CartItemEntity).findOne({
      where: { userId },
    });
  }

  async add(userId: string, productId: string) {
    await this.dataSource.getRepository(CartItemEntity).upsert(
      {
        userId,
        productId,
      },
      {
        conflictPaths: ['userId', 'productId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }

  async remove(userId: string, productId: string) {
    await this.dataSource.getRepository(CartItemEntity).delete({
      userId,
      productId,
    });
  }

  async clear(userId: string) {
    await this.dataSource.getRepository(CartItemEntity).delete({
      userId,
    });
  }
}
