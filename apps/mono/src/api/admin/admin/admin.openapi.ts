import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

import { AdminDto } from './dtos';

export const GetAdminOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get admin details',
      description: 'Retrieve detailed information about the current admin',
    }),
    ApiOkResponse({
      description: 'Admin details retrieved successfully',
      type: AdminDto,
    }),
  );

export const UpdateAdminOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update admin',
      description: 'Update the current admin',
    }),
    ApiOkResponse({
      description: 'Admin updated successfully',
      type: 'object',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
        },
      },
    }),
  );

export const InviteAdminOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Invite admin',
      description: 'Invite a new admin',
    }),
    ApiOkResponse({
      description: 'Admin invited successfully',
      type: 'object',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
        },
      },
    }),
  );

export const GetAdminsOpenApi = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get admins',
      description: 'Retrieve a list of admins',
    }),
    ApiOkResponse({
      description: 'Admins retrieved successfully',
      type: AdminDto,
      isArray: true,
    }),
  );
