import { BullModule } from '@nestjs/bullmq';

import { BullMQConfigKey } from './bull.config';

export class AppQueue<TData extends object> {
  public readonly name: string;
  public readonly data: TData;
  public readonly configKey: BullMQConfigKey;

  constructor(name: string, configKey: BullMQConfigKey) {
    this.name = name;
    this.configKey = configKey;
  }

  register() {
    return BullModule.registerQueue({
      configKey: this.configKey,
      name: this.name,
    });
  }
}
