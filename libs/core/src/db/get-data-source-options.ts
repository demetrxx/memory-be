import * as path from 'node:path';

import { DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

import * as entities from './entities';

export const getDataSourceOptions = (): DataSourceOptions & SeederOptions => {
  const isTsNode =
    Boolean(process[Symbol.for('ts-node.register.instance')]) ||
    process.env.TS_NODE_DEV === 'true' ||
    process.env.TS_NODE === 'true';

  const migrationsPath = isTsNode
    ? path.join(process.cwd(), 'libs/core/src/db/migrations/*.ts')
    : path.join(process.cwd(), 'dist/libs/core/db/migrations/*.js');

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    seeds: [path.join(__dirname, 'seeds', `*.seed.{ts,js}`)],
    entities: Object.entries(entities)
      .filter(([k]) => k.endsWith('Entity'))
      .map(([, v]) => v) as any[],
    migrations: [migrationsPath],
    ssl: process.env.DATABASE_SSL === 'true',

    migrationsRun: process.env.DATABASE_RUN_MIGRATIONS === 'true',
    synchronize: process.env.DATABASE_SYNC === 'true',
    logging: process.env.DATABASE_LOGGING === 'true',
  };
};
