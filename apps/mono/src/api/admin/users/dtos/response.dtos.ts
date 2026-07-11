import { UserEntity, UserStatus } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'User identifier',
    example: 'user-123',
  })
  id: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'User status',
    example: UserStatus.Active,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'User last activity date',
    example: '2023-01-01T00:00:00.000Z',
    nullable: true,
  })
  lastActivityAt: Date | null;

  @ApiProperty({
    description: 'User creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  static mapFromEntity(entity: UserEntity): UserDto {
    return {
      id: entity.id,
      status: entity.status,
      firstName: entity.firstName,
      lastName: entity.lastName,
      lastActivityAt: entity.lastActivityAt,
      updatedAt: entity.updatedAt,
      createdAt: entity.createdAt,
    };
  }
}

export class UserDetailsDto extends UserDto {
  static mapFromEntity(entity: UserEntity): UserDetailsDto {
    return {
      ...UserDto.mapFromEntity(entity),
    };
  }
}
