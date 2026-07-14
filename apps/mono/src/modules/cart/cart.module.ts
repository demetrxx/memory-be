import { Module } from '@nestjs/common';

import { CartService } from './cart.service';

@Module({
  imports: [],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
