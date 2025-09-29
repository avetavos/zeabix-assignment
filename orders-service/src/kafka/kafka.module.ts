import { Module } from '@nestjs/common';
import { KafkaConsumerController } from './kafka-consumer.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const kafkaConfig = configService.get('kafka');
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: 'inventory-producer',
                brokers: kafkaConfig.brokers,
              },
              consumer: {
                groupId: kafkaConfig.groupId + '-producer',
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
    OrdersModule,
  ],
  controllers: [KafkaConsumerController],
})
export class KafkaModule {}
