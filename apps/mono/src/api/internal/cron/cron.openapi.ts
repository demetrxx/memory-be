import { applyDecorators } from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const CronOpenApi = applyDecorators(
  ApiOperation({ summary: 'Cron job' }),
  ApiUnauthorizedResponse(),
  ApiHeader({
    name: 'x-internal-secret',
    description: 'Internal secret',
    required: true,
  }),
  ApiOkResponse({ description: 'Cron job executed successfully.' }),
);
