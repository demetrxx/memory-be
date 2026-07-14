import {
  MilitaryUnitBranch,
  MilitaryUnitEchelon,
  MilitaryUnitEntity,
  MilitaryUnitName,
  MilitaryUnitSpecialization,
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
  names: MilitaryUnitName[];

  @ApiProperty({
    description: 'The branches of the military unit',
    example: [MilitaryUnitBranch.ARMED_FORCES],
  })
  branch: MilitaryUnitBranch;

  @ApiProperty({
    description: 'The is presidential of the military unit',
    example: true,
  })
  isPresidential: boolean;

  @ApiProperty({
    description: 'The is separate of the military unit',
    example: true,
  })
  isSeparate: boolean;

  @ApiProperty({
    description: 'The number of the military unit',
    example: 155,
  })
  number: number;

  @ApiProperty({
    description: 'The echelon of the military unit',
    example: MilitaryUnitEchelon.BRIGADE,
  })
  echelon: MilitaryUnitEchelon;

  @ApiProperty({
    description: 'The specialization of the military unit',
    example: MilitaryUnitSpecialization.ASSAULT,
  })
  specialization: MilitaryUnitSpecialization;

  static mapFromEntity(entity: MilitaryUnitEntity): MilitaryUnitDto {
    return {
      id: entity.id,
      names: entity.names,
      echelon: entity.echelon,
      specialization: entity.specialization,
      isPresidential: entity.isPresidential,
      isSeparate: entity.isSeparate,
      number: entity.number,
      branch: entity.branch,
    };
  }
}
