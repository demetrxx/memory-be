import 'dotenv/config';

import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import * as process from 'node:process';
import { pipeline } from 'node:stream/promises';

import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { configureRawBody } from './common/config';
import { setupBullBoard } from './common/config';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { LoggingInterceptor } from './common/interceptors';

const logger = new Logger('Bootstrap');
const MULTIPART_TMP_DIR = path.join(tmpdir(), 'aera-multipart');
const MULTIPART_TMP_FILES_KEY = Symbol('multipartTempFiles');

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection reason: ${reason}`, (reason as any)?.stack);
});

function setupSwagger(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle('Aera API')
    .setDescription('API documentation for Aera')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(process.env.APP_SWAGGER_ENDPOINT, app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

function setupHttp(app: NestFastifyApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new AppExceptionFilter());

  // Apply global interceptors for HTTP request logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  logger.log('HTTP request logging enabled', 'API');
}

function setupCors(app: NestFastifyApplication) {
  app.enableCors({
    origin: process.env.APP_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });
}

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  await app.register(multipart, {
    attachFieldsToBody: 'keyValues',
    onFile: async function (file) {
      const requestWithTempFiles = this as {
        [MULTIPART_TMP_FILES_KEY]?: string[];
      };

      await mkdir(MULTIPART_TMP_DIR, { recursive: true });

      const filepath = path.join(
        MULTIPART_TMP_DIR,
        `${randomUUID()}-${path.basename(file.filename)}`,
      );

      await pipeline(file.file, createWriteStream(filepath));
      requestWithTempFiles[MULTIPART_TMP_FILES_KEY] ??= [];
      requestWithTempFiles[MULTIPART_TMP_FILES_KEY]?.push(filepath);

      // exclude `fields` property from a result, because it leads to callstack exceed
      // @ts-expect-error is ok
      file.value = {
        fieldname: file.fieldname,
        filename: file.filename,
        encoding: file.encoding,
        mimetype: file.mimetype,
        filepath,
        toBuffer: () => readFile(filepath),
      };
    },
    limits: {
      fileSize: 2000_971_520,
    },
  });
  await app.register(cookie);

  // Configure raw body capture for webhook routes (required for signature verification)
  const fastifyInstance = app.getHttpAdapter().getInstance();
  fastifyInstance.addHook('onResponse', async (request) => {
    const tempFiles =
      (request as { [MULTIPART_TMP_FILES_KEY]?: string[] })[
        MULTIPART_TMP_FILES_KEY
      ] ?? [];

    await Promise.all(
      tempFiles.map((filepath) => unlink(filepath).catch(() => undefined)),
    );
  });
  configureRawBody(fastifyInstance);

  setupHttp(app);
  setupCors(app);
  setupSwagger(app);
  await setupBullBoard(app);

  const port = process.env.APP_PORT;
  const host = process.env.APP_HOST;

  await app.listen(port, host, () => {
    logger.log('Server is running on port 3000');
  });
}

bootstrap();
