import { Logger, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const logger = new Logger('Redis');
        const client = new Redis({
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
          // No tirar la app si Redis no está: el cache es una optimización,
          // no una dependencia dura. Cada operación además va con try/catch
          // en ItemsService para "fallar abierto" hacia la base de datos.
          maxRetriesPerRequest: 1,
          retryStrategy: () => 1000,
        });
        client.on('error', (err) => logger.warn(`Redis error: ${err.message}`));
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
