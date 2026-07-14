import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth';
import { DeceasedModule } from '@/modules/deceased';

import { DeceasedController } from './deceased.controller';

@Module({
  imports: [DeceasedModule, AuthModule],
  controllers: [DeceasedController],
  providers: [],
})
export class DeceasedApiModule {}
