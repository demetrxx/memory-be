import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { getQueueToken } from '@nestjs/bullmq';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { Queue } from 'bullmq';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { InternalConfig } from '@/config';

const BULL_BOARD_BASE_PATH = '/admin/queues';
const BULL_BOARD_SECRET_COOKIE_NAME = 'bull_board_internal_secret';
const INTERNAL_SECRET_HEADER_NAME = 'x-internal-secret';

const BULL_BOARD_QUEUE_NAMES = [] as const;

export async function setupBullBoard(app: NestFastifyApplication) {
  const serverAdapter = new FastifyAdapter();
  serverAdapter.setBasePath(BULL_BOARD_BASE_PATH);

  createBullBoard({
    queues: BULL_BOARD_QUEUE_NAMES.map(
      (queueName) =>
        new BullMQAdapter(app.get<Queue>(getQueueToken(queueName))),
    ),
    serverAdapter,
  });

  const internalConfig = app.get(InternalConfig.KEY);
  const fastify = app.getHttpAdapter().getInstance();

  await fastify.register(async (instance) => {
    instance.addHook(
      'onRequest',
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const requestWithCookies = request as FastifyRequest & {
            cookies?: Record<string, string>;
            query?: Record<string, unknown>;
          };
          const secretFromCookie =
            requestWithCookies.cookies?.[BULL_BOARD_SECRET_COOKIE_NAME] ?? null;
          const secretFromQuery = getInternalSecretQuery(
            requestWithCookies.query,
          );
          const secretFromHeader = getHeaderValue(
            request.headers[INTERNAL_SECRET_HEADER_NAME],
          );
          const internalSecret =
            secretFromHeader ?? secretFromCookie ?? secretFromQuery;

          if (!internalSecret || internalSecret !== internalConfig.cronSecret) {
            throw new Error('Unauthorized');
          }

          if (
            secretFromQuery &&
            requestWithCookies.cookies?.[BULL_BOARD_SECRET_COOKIE_NAME] !==
              secretFromQuery
          ) {
            reply.setCookie(BULL_BOARD_SECRET_COOKIE_NAME, secretFromQuery, {
              httpOnly: true,
              sameSite: 'lax',
              path: BULL_BOARD_BASE_PATH,
            });
          }
        } catch {
          return reply.code(401).send({
            statusCode: 401,
            message: 'Unauthorized',
          });
        }
      },
    );

    await instance.register(serverAdapter.registerPlugin(), {
      prefix: BULL_BOARD_BASE_PATH,
    });
  });
}

function getInternalSecretQuery(
  query: Record<string, unknown> | undefined,
): string | null {
  const internalSecret = query?.internalSecret;

  return typeof internalSecret === 'string' && internalSecret.length > 0
    ? internalSecret
    : null;
}

function getHeaderValue(header: string | string[] | undefined) {
  if (Array.isArray(header)) {
    return header[0] ?? null;
  }

  return header ?? null;
}
