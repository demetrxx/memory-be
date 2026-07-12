import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ProtectedWeb } from '@/modules/auth';
import { FileService } from '@/modules/file';

import { CopyFileRequestDto, SignUploadDto } from './dtos';
import {
  CopyFileOpenApi,
  GetSignedUrlOpenApi,
  SignUploadOpenApi,
  UploadCompleteOpenApi,
} from './files.openapi';

@ApiTags('Files')
@ProtectedWeb(true)
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
}
