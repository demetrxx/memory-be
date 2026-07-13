import { Module } from '@nestjs/common';

import { DeceasedService } from './deceased.service';

@Module({
  imports: [],
  providers: [DeceasedService],
  exports: [DeceasedService],
})
export class DeceasedModule {}
