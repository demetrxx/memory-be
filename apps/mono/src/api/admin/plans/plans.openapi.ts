import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { PlanDto } from './dtos';

export const GetPlansOpenApi = applyDecorators(
  ApiOkResponse({
    type: PlanDto,
    isArray: true,
  }),
);

export const UpdatePlanOpenApi = applyDecorators(
  ApiOkResponse({
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  }),
);

export const CreatePlanOpenApi = applyDecorators(
  ApiOkResponse({
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  }),
);

export const DeletePlanOpenApi = applyDecorators(
  ApiOkResponse({
    type: 'object',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  }),
);
