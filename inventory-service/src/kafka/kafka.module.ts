import { Module } from '@nestjs/common';
import { KafkaConsumerController } from './kafka-consumer.controller';
import { InventoriesModule } from '../inventories/inventories.module';
import { KafkaProducerService } from './kafka-producer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
    InventoriesModule,
  ],
  controllers: [KafkaConsumerController],
  providers: [KafkaProducerService],
})
export class KafkaModule {}
