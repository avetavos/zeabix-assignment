import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoriesService } from '../inventories/inventories.service';
import { KafkaProducerService } from './kafka-producer.service';

@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);
  constructor(
    private readonly inventoriesService: InventoriesService,
    private readonly kafkaProducerService: KafkaProducerService,
  ) {}

  @EventPattern('orders.outbox')
  async handleOrderOutboxEvent(@Payload() message: any) {
    this.logger.log('Received order outbox event from Kafka: ', message);

    const { after, op } = message;
    try {
      switch (op) {
        case 'c':
          const orderStatus =
            await this.inventoriesService.handleOrderPlacedEvent(after);

          await this.kafkaProducerService.sendMessage(
            'orders.processed.events',
            {
              outboxMessageId: after.id,
              orderId: after.aggregate_id,
              status: orderStatus,
            },
          );
          return;
        default:
          this.logger.warn(`Unhandled operation type: ${op}`);
          return;
      }
    } catch (error) {
      this.logger.error('Error processing order outbox event', error as any);
    }
  }
}
