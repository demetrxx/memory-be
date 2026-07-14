import {
  DeceasedEntity,
  DeceasedMediaEntity,
  DeceasedStatus,
  Gender,
  MediaType,
} from '@app/core';
import { ApiProperty } from '@nestjs/swagger';

import { MilitaryUnitDto } from '../../military-units/dtos';
import { SettlementDto } from '../../settlements/dtos';

export class DeceasedDto {
  @ApiProperty({
    description: 'The ID of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The status of the deceased',
    example: DeceasedStatus.Approved,
  })
  status: DeceasedStatus;

  @ApiProperty({
    description: 'The slug of the deceased',
    example: 'john-doe',
  })
  slug: string;

  @ApiProperty({
    description: 'The first name of the deceased',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the deceased',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'The father name of the deceased',
    example: 'Doe',
  })
  fatherName: string;

  @ApiProperty({
    description: 'The call sign of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  callSign: string;

  @ApiProperty({
    description: 'The gender of the deceased',
    example: Gender.Male,
  })
  gender: Gender;

  @ApiProperty({
    description: 'The date of birth of the deceased',
    example: '2021-01-01',
  })
  dob: Date;

  @ApiProperty({
    description: 'The date of death of the deceased',
    example: '2021-01-01',
  })
  dod: Date;

  @ApiProperty({
    description: 'The life role of the deceased',
    example: 'Soldier',
  })
  lifeRole: string;

  @ApiProperty({
    description: 'The birth place of the deceased',
    example: 'Kyiv',
  })
  birthPlace: SettlementDto;

  @ApiProperty({
    description: 'The death place of the deceased',
    example: 'Kyiv',
  })
  deathPlace: SettlementDto;

  @ApiProperty({
    description: 'The avatar url of the deceased',
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl: string;

  @ApiProperty({
    description: 'The life photo url of the deceased',
    example: 'https://example.com/life-photo.jpg',
  })
  lifePhotoUrl: string;

  @ApiProperty({
    description: 'The bio of the deceased',
    example: 'John Doe is a soldier who died in the war.',
  })
  bio: string;

  @ApiProperty({
    description: 'The death cause of the deceased',
    example: 'War',
  })
  deathCause: string;

  @ApiProperty({
    description: 'The death military unit of the deceased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  deathMilitaryUnit: MilitaryUnitDto;

  @ApiProperty({
    description: 'The comments count of the deceased',
    example: 0,
  })
  commentsCount: number;

  @ApiProperty({
    description: 'The memories count of the deceased',
    example: 0,
  })
  memoriesCount: number;

  @ApiProperty({
    description: 'The items of the deceased',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174000',
    ],
  })
  items: string[];

  static mapFromEntity(entity: DeceasedEntity): DeceasedDto {
    return {
      id: entity.id,
      status: entity.status,
      slug: entity.slug,
      firstName: entity.firstName,
      lastName: entity.lastName,
      fatherName: entity.fatherName,
      callSign: entity.callSign,
      gender: entity.gender,
      dob: entity.dob,
      dod: entity.dod,
      lifeRole: entity.lifeRole,
      lifePhotoUrl: entity.lifePhoto?.url,
      birthPlace: SettlementDto.mapFromEntity(entity.birthPlace),
      deathPlace: SettlementDto.mapFromEntity(entity.deathPlace),
      avatarUrl: entity.avatar?.url,
      bio: entity.bio,
      deathCause: entity.deathCause,
      commentsCount: 0,
      memoriesCount: 0,
      deathMilitaryUnit: MilitaryUnitDto.mapFromEntity(
        entity.deathMilitaryUnit,
      ),
      items: [],
    };
  }
}

export class MediaDto {
  @ApiProperty({
    description: 'The ID of the media',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The type of the media',
    example: MediaType.IMAGE,
  })
  type: MediaType;

  @ApiProperty({
    description: 'The url of the media',
    example: 'https://example.com/media.jpg',
  })
  url: string;

  static mapFromEntity(entity: DeceasedMediaEntity): MediaDto {
    return {
      id: entity.id,
      type: entity.type,
      url: entity.file.url,
    };
  }
}

export class DeceasedDetailsDto extends DeceasedDto {
  @ApiProperty({
    description: 'The media of the deceased',
    example: 'https://example.com/media.jpg',
  })
  media: MediaDto[];

  @ApiProperty({
    description: 'The created by relation of the deceased',
    example: 'John Doe',
  })
  createdByRelation: string;

  @ApiProperty({
    description: 'The created by of the deceased',
  })
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
  };

  static mapFromEntity(entity: DeceasedEntity): DeceasedDetailsDto {
    return {
      ...DeceasedDto.mapFromEntity(entity),
      media: entity.media.map(MediaDto.mapFromEntity),
      createdByRelation: entity.createdByRelation,
      createdBy: {
        id: entity.createdBy.id,
        firstName: entity.createdBy.firstName,
        lastName: entity.createdBy.lastName,
      },
    };
  }
}
