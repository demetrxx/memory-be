import {
  MilitaryUnitBranch,
  MilitaryUnitEntity,
  MilitaryUnitType,
} from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

export class MilitaryUnitDto {
  @ApiProperty({
    description: 'The ID of the military unit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the military unit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  name: string;

  @ApiProperty({
    description: 'The type of the military unit',
    example: MilitaryUnitType.BRIGADE,
  })
  type: MilitaryUnitType;

  @ApiProperty({
    description: 'The branches of the military unit',
    example: [MilitaryUnitBranch.ARMED_FORCES],
  })
  branches: MilitaryUnitBranch[];

  static mapFromEntity(entity: MilitaryUnitEntity): MilitaryUnitDto {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      branches: entity.branches,
    };
  }
}
