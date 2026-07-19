import { SettlementEntity } from '@app/core';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

import { SETTLEMENTS } from '../../../../../settlements/seed';

export default class SettlementSeed implements Seeder {
  public async run(dataSource: DataSource) {
    const repo = dataSource.getRepository(SettlementEntity);

    const settlements = await repo.count();

    if (settlements > 0) {
      return;
    }

    const settlementsData = SETTLEMENTS();
    const amount = settlementsData.length;

    await dataSource.transaction(async (tx) => {
      const repo = tx.getRepository(SettlementEntity);

      const batchSize = 1000;

      for (let index = 0; index < settlementsData.length; index += batchSize) {
        const batch = settlementsData.slice(index, index + batchSize);
        console.log(`Settlement: (${index + 1} of ${amount})`);
        await repo.save(batch);
      }

      // for (let index = 0; index < settlementsData.length; index++) {
      //   const settlement = settlementsData[index];
      //   console.log(`Settlement: (${index + 1} of ${amount})`);
      //   await repo.save(settlement);
      // }
    });
  }
}
