import { Gender, MediaType, MilitaryRoleType } from '@app/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';
import { CreateDeceasedDto } from '@/modules/deceased';

export class GetDeceasedRequestDto extends PaginationSortingQuery {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  birthPlaceId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  deathPlaceId?: string;

  @ApiPropertyOptional()
  @IsEnum(MilitaryRoleType)
  @IsOptional()
  militaryRole?: MilitaryRoleType;

  @ApiPropertyOptional()
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  callSign?: string;
}

export class AddMediaRequestDto {
  @ApiProperty({
    description: 'The media of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  fileId: string;

  @ApiProperty({
    description: 'The type of the media',
    example: MediaType.IMAGE,
  })
  @IsEnum(MediaType)
  type: MediaType;
}

export class CreateDeceasedRequestDto implements CreateDeceasedDto {
  @ApiProperty({
    description: 'The first name of the deceased',
    example: 'John',
  })
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  firstName: string;
  @ApiProperty({
    description: 'The first name of the deceased',
    example: 'John',
  })
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  lastName: string;

  @ApiProperty({
    description: 'The father name of the deceased',
    example: 'John',
  })
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  fatherName: string;

  @ApiProperty({
    description: 'The call sign of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  callSign: string;

  @ApiProperty({
    description: 'The gender of the deceased',
    example: Gender.Male,
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    description: 'The date of birth of the deceased',
    example: '2021-01-01',
  })
  @IsDate()
  dob: Date;

  @ApiProperty({
    description: 'The avatar of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  avatarId: string;

  @ApiProperty({
    description: 'The place of birth of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  birthPlaceId: string;

  @ApiProperty({
    description: 'The place of death of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  deathPlaceId: string;

  @ApiProperty({
    description: 'The military unit of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  deathMilitaryUnitId: string;

  @ApiProperty({
    description: 'The military role of the deceased',
    example: MilitaryRoleType.Soldier,
  })
  @IsEnum(MilitaryRoleType)
  militaryRole: MilitaryRoleType;

  @ApiProperty({
    description: 'The date of death of the deceased',
    example: '2021-01-01',
  })
  @IsDate()
  dod: Date;

  @ApiProperty({
    description: 'The death cause of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  deathCause: string;

  @ApiProperty({
    description: 'The life role of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  lifeRole: string;

  @ApiProperty({
    description: 'The bio of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  bio: string;

  @ApiProperty({
    description: 'The created by relation of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  createdByRelation: string;

  @ApiProperty({
    description: 'The media of the deceased',
    example: [AddMediaRequestDto],
  })
  @ValidateNested({ each: true })
  @Type(() => AddMediaRequestDto)
  media: AddMediaRequestDto[];
}
