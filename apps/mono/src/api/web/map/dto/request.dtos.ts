import { Region } from '@app/core';
import { IsEnum, IsString } from 'class-validator';

export class RegionParamsDto {
  @IsString()
  @IsEnum(Region)
  region: Region;
}
