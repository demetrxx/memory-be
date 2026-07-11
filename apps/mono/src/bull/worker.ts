import { ProcessorOptions } from '@nestjs/bullmq';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { BullMQConfigKey } from './bull.config';

export function worker<TData extends object>(
  name: string,
  service: any,
  method: string,
  configKey: BullMQConfigKey,
  opts?: ProcessorOptions,
): any {
  const processorOptions = opts ?? {
    concurrency: 20,
    removeOnComplete: { age: 3 },
    removeOnFail: { age: 3 },
  };
  @Processor({ name, configKey }, processorOptions)
  class Worker extends WorkerHost {
    private readonly logger = new Logger(`${name.toUpperCase()} Worker`);

    constructor(
      @Inject(service)
      readonly serviceInstance: typeof service,
    ) {
      super();
      this.logger.debug(`Creating ${name} Worker`);
    }

    public async process(job: Job<TData, void>): Promise<any> {
      try {
        await this.tryProcess(job);
      } catch (error) {
        this.logger.error(`Error processing job ${job.id}: ${error}`);
        job.failedReason = error.message;
      }
    }

    private async tryProcess(job: Job<TData, void>) {
      this.logger.log(`Processing job ${job.id} with data`);

      await this.serviceInstance[method](job.data);
    }
  }

  return Worker;
}
