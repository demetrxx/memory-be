import { FileDir } from '@app/core';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FileService } from '@/modules/file';

import {
  CopyFileRequestDto,
  FileDto,
  PostFileRequestDto,
  SignUploadDto,
} from './dtos';
import {
  CopyFileOpenApi,
  GetSignedUrlOpenApi,
  SignUploadOpenApi,
  UploadCompleteOpenApi,
} from './files.openapi';

@ApiTags('Files')
// @ProtectedAdmin()
@Controller()
export class FilesController {
  constructor(private readonly fileService: FileService) {}

  @GetSignedUrlOpenApi
  @Get(':fileId/signed-url')
  getSignedUrl(@Param('fileId') fileId: string) {
    return this.fileService.getSignedUrl({ fileId });
  }

  @SignUploadOpenApi
  @Post('upload-url')
  async signUpload(@Body() dto: SignUploadDto) {
    return this.fileService.createPresignedPost({
      mime: dto.mime,
      folder: dto.folder,
      fileName: dto.fileName,
    });
  }

  @UploadCompleteOpenApi
  @Patch(':fileId/mark-uploaded')
  async uploadComplete(@Param('fileId') fileId: string) {
    await this.fileService.markUploaded({ fileId });
    return { success: true };
  }

  @CopyFileOpenApi
  @Post('copy')
  async copy(@Body() body: CopyFileRequestDto) {
    return this.fileService.copy(body);
  }

  // @Get('rename')
  // async rename() {
  //   await this.fileService.renameMany();
  // }

  // @UploadOpenApi
  // @Post('static')
  async uploadStatic(@Body() body: PostFileRequestDto) {
    if (!body.file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only images are allowed');
    }

    const buffer = await body.file.toBuffer();

    const file = await this.fileService.uploadOne({
      mime: body.file.mimetype,
      fileName: body.file.filename,
      buffer,
      folder: FileDir.Public,
    });

    return FileDto.mapFromEntity(file);
  }

  // @UploadOpenApi
  // @Post('files')
  async uploadFiles(@Body() body: PostFileRequestDto) {
    const buffer = await body.file.toBuffer();

    const file = await this.fileService.uploadOne({
      mime: body.file.mimetype,
      fileName: body.file.filename,
      buffer,
      folder: FileDir.Private,
    });

    return FileDto.mapFromEntity(file);
  }
}
