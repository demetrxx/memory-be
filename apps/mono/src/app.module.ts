import {
  BULLMQ_MAIN_CONFIG_KEY,
  BULLMQ_MEDIA_CONFIG_KEY,
  getDataSourceOptions,
} from '@app/core';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiModule } from '@/api';

import { AuthConfig, InternalConfig, RedisConfig } from './config';

const getBullConnectionOptions = (redisConfig: RedisConfig['main']) => ({
  host: redisConfig.host,
  port: redisConfig.port,
  ...(redisConfig.password && { password: redisConfig.password }),
  ...(redisConfig.username && { username: redisConfig.username }),
});

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    ConfigModule.forRoot({
      load: [RedisConfig, AuthConfig, InternalConfig],
      isGlobal: true,
    }),
    BullModule.forRootAsync(BULLMQ_MAIN_CONFIG_KEY, {
      useFactory: (redisConfig: RedisConfig) => ({
        connection: getBullConnectionOptions(redisConfig.main),
      }),
      inject: [RedisConfig.KEY],
    }),
    BullModule.forRootAsync(BULLMQ_MEDIA_CONFIG_KEY, {
      useFactory: (redisConfig: RedisConfig) => ({
        connection: getBullConnectionOptions(redisConfig.media),
      }),
      inject: [RedisConfig.KEY],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getDataSourceOptions(),
    }),

    ApiModule,
  ],
})
export class AppModule {}
