import {
  ProductEntity,
  ProductType,
} from '@app/core/db/entities/product.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getProducts() {
    const products = await this.dataSource.getRepository(ProductEntity).find();

    if (products.length === 0) {
      return this.seed();
    }

    return products;
  }

  private async seed() {
    return this.dataSource.getRepository(ProductEntity).save([
      {
        type: ProductType.Flower,
        priceCents: 10000,
        isActive: true,
      },
      {
        type: ProductType.Bush,
        priceCents: 20000,
        isActive: true,
      },
      {
        type: ProductType.Tree,
        priceCents: 50000,
        isActive: true,
      },
      {
        type: ProductType.Candle,
        priceCents: 15000,
        isActive: true,
      },
      {
        type: ProductType.Star,
        priceCents: 40000,
        isActive: true,
      },
    ]);
  }
}
