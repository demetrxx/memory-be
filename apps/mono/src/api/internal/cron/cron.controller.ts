import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ExternalService, Internal } from '../common';

@ApiTags('Internal / Cron')
@Internal(ExternalService.CRON)
@Controller('/')
export class CronController {
  constructor() {}
}
