import { AdminEntity, AdminRole, AdminStatus } from '@app/core';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';

export default class RootSeed implements Seeder {
  public async run(dataSource: DataSource) {
    const email = process.env.ROOT_USER_EMAIL;
    const password = process.env.ROOT_USER_PASSWORD;

    if (!email || !password) {
      return;
    }

    await dataSource.transaction(async (tx) => {
      const adminRepository = tx.getRepository(AdminEntity);
      const existing = await adminRepository.findOne({ where: { email } });

      if (existing) {
        return;
      }

      await adminRepository.save({
        email,
        firstName: 'Super',
        lastName: 'Admin',
        passwordHash: await bcrypt.hash(password, 12),
        role: AdminRole.Owner,
        status: AdminStatus.Active,
      });
    });
  }
}
