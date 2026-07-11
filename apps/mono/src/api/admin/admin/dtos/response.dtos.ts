import { AdminEntity, AdminRole, AdminStatus } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

export class AdminDto {
  @ApiProperty({
    description: 'Admin identifier',
    example: 'admin-123',
  })
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Admin role',
    example: 'owner',
  })
  role: AdminRole;

  @ApiProperty({
    description: 'Admin status',
    example: 'active',
  })
  status: AdminStatus;

  @ApiProperty({
    description: 'Admin creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Admin last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  static mapFromEntity(e: AdminEntity): AdminDto {
    return {
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      role: e.role,
      status: e.status,
      email: e.email,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }
}
