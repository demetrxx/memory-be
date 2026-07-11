import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

import { UserDetailsDto, UserDto } from './dtos';

export const GetUsersOpenApi = applyDecorators(
  ApiOkResponse({
    type: UserDto,
    isArray: true,
  }),
);

export const UpdateUserOpenApi = applyDecorators(
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

export const GetUserOpenApi = applyDecorators(
  ApiOkResponse({
    type: UserDetailsDto,
  }),
);
