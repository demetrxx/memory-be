import { FileDir, FileEntity, FileStatus } from '@app/core';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { S3Config } from '@/config';

import { StorageService } from './storage.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    @Inject(S3Config.KEY)
    private readonly config: S3Config,
  ) {}

  private getExtension(fileName: string) {
    const dotParts = fileName.split('.');
    return dotParts.pop();
  }

  async create(params: { mime: string; fileName?: string; folder: FileDir }) {
    const { mime, folder } = params;

    const fileId = uuid();

    const extension = this.getExtension(params.fileName);

    const uniqueFileName = `${fileId}.${extension}`;

    const path = `/${folder}/${uniqueFileName}`;

    const fileRepository = this.dataSource.getRepository(FileEntity);

    return fileRepository.save({
      id: fileId,
      path,
      mime,
      uploadedAt: new Date(),
      status: FileStatus.PENDING,
      url:
        folder === FileDir.Public
          ? `${this.config.cloudFrontUrl}/${uniqueFileName}`
          : null,
      name: uniqueFileName,
      dir: folder,
    });
  }

  async createPresignedPost(params: {
    mime: string;
    fileName?: string;
    folder: FileDir;
  }) {
    const file = await this.create(params);

    const presigned = await this.storageService.signPostUrl(
      file.path,
      file.mime,
    );

    return { presigned, file };
  }

  copy(params: {
    id: string;
    path: string;
    mime: string;
    name: string;
    dir: FileDir;
    url?: string;
  }) {
    const { mime, name, dir, id, path, url } = params;

    const fileRepository = this.dataSource.getRepository(FileEntity);

    // replace cloudfront url with current url
    const [, pathname] = url.split('.net');
    const currentUrl = `${this.config.cloudFrontUrl}${pathname}`;

    return fileRepository.save({
      id,
      path,
      mime,
      name,
      status: FileStatus.UPLOADED,
      dir,
      url: currentUrl,
      uploadedAt: new Date(),
    });
  }

  async markUploaded(params: { fileId: string }) {
    const { fileId } = params;

    await this.dataSource.manager.transaction(async (ds) => {
      const fileRepository = ds.getRepository(FileEntity);

      const file = await fileRepository.findOne({
        where: {
          id: fileId,
        },
      });

      if (!file) {
        throw new BadRequestException('File not found');
      }

      await fileRepository.update(
        { id: fileId },
        { status: FileStatus.UPLOADED },
      );
    });
  }

  async uploadOne(params: {
    folder: FileDir;
    mime: string;
    buffer: Buffer;
    fileName: string;
  }) {
    const { folder, mime, buffer } = params;

    const extension = this.getExtension(params.fileName);

    const fileId = uuid();
    const uniqueFileName = `${fileId}.${extension}`;
    const path = `/${folder}/${uniqueFileName}`;

    const fileRepository = this.dataSource.getRepository(FileEntity);

    const fileEntity = await fileRepository.save({
      id: fileId,
      path,
      mime,
      name: uniqueFileName,
      status: FileStatus.UPLOADED,
      dir: folder,
      url: `${this.config.cloudFrontUrl}/${uniqueFileName}`,
      uploadedAt: new Date(),
    });
    await this.storageService.upload(path, buffer, mime);

    return fileEntity;
  }

  async uploadOneWithStream(params: {
    folder: FileDir;
    file: Buffer;
    fileName: string;
    mime: string;
  }) {
    const { folder, file, mime } = params;

    const extension = this.getExtension(params.fileName);

    const fileId = uuid();
    const uniqueFileName = `${fileId}.${extension}`;

    const path = `/${folder}/${uniqueFileName}`;

    const fileRepository = this.dataSource.getRepository(FileEntity);
    const fileEntity = await fileRepository.save({
      id: fileId,
      path,
      mime,
      name: uniqueFileName,
      status: FileStatus.UPLOADED,
      uploadedAt: new Date(),
    });
    await this.storageService.upload(path, file, mime);

    return fileEntity;
  }

  async getOne(fileId: string): Promise<FileEntity | null> {
    const fileRepository = this.dataSource.getRepository(FileEntity);

    return fileRepository.findOne({
      where: { id: fileId },
    });
  }

  async getSignedUrl(params: { fileId: string }) {
    const { fileId } = params;

    const fileRepository = this.dataSource.getRepository(FileEntity);

    const file = await fileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new BadRequestException();
    }

    return this.storageService.signGetUrl(file);
  }

  async deleteOne(params: { fileId: string }) {
    const { fileId } = params;

    const fileRepository = this.dataSource.getRepository(FileEntity);

    const file = await fileRepository.findOne({
      where: { id: fileId },
    });

    if (!file) {
      throw new BadRequestException();
    }

    await this.storageService.delete(file.path);
    await fileRepository.delete({ id: file.id });

    return file;
  }

  getBuffer(path: string) {
    return this.storageService.getBuffer(path);
  }

  getStream(path: string) {
    return this.storageService.get(path);
  }
}
