import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const kafkaBrokers = configService.get<string[]>('kafka.brokers');
  const kafkaGroupId = configService.get<string>('kafka.groupId');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'inventory-service',
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: kafkaGroupId,
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(port);
}

bootstrap();
