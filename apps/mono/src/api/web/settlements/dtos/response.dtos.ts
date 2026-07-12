import { SettlementEntity } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

export class SettlementDto {
  @ApiProperty({
    description: 'The ID of the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the settlement',
    example: 'Kharkiv',
  })
  name: string;

  @ApiProperty({
    description: 'The region of the settlement',
    example: 'Kharkiv',
  })
  region: string;

  static mapFromEntity(entity: SettlementEntity): SettlementDto {
    return {
      id: entity.id,
      name: entity.name,
      region: entity.region,
    };
  }
}
