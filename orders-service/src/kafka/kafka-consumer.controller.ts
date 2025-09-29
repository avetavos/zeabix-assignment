import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OrdersService } from '../orders/orders.service';

@Controller()
export class KafkaConsumerController {
  private readonly logger = new Logger(KafkaConsumerController.name);
  constructor(private readonly ordersService: OrdersService) {}

  @EventPattern('orders.processed.events')
  async handleOrderOutboxEvent(@Payload() message: any) {
    this.logger.log(`Received message: ${JSON.stringify(message)}`);
    const { outboxMessageId, orderId, status } = message;
    await this.ordersService.handleOrderProcessed(
      outboxMessageId,
      orderId,
      status,
    );
  }
}
