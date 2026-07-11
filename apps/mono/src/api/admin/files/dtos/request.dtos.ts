import { FileDir } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsObject, IsString, IsUUID } from 'class-validator';

import { MimeType } from '@/common/consts';
import { UploadedMultipartFile } from '@/common/types/uploaded-multipart-file';

export class PostFileRequestDto {
  @ApiProperty({
    type: String,
    format: 'binary',
  })
  @IsObject()
  file: UploadedMultipartFile;
}

export class SignUploadDto {
  @ApiProperty()
  @IsEnum(MimeType)
  mime: MimeType;

  @ApiProperty()
  @IsString()
  fileName?: string;

  @ApiProperty()
  @IsEnum(FileDir)
  folder: FileDir;
}

export class CopyFileRequestDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  path: string;

  @ApiProperty()
  @IsString()
  mime: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEnum(FileDir)
  dir: FileDir;

  @ApiProperty()
  @IsString()
  url?: string;
}
