import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(
    private readonly configService: ConfigService,
    @Inject('KAFKA_SERVICE') private readonly client: ClientKafka,
  ) {
    const kafkaConfig = this.configService.get('kafka');
    this.kafka = new Kafka({
      clientId: 'inventory-producer',
      brokers: kafkaConfig.brokers,
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendMessage(topic: string, message: any) {
    await this.client.emit(topic, message);
    this.logger.log(
      `Message sent to topic ${topic}: ${JSON.stringify(message)}`,
    );
  }
}
