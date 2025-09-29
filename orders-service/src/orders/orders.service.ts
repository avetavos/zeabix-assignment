import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma.service';
import { Order, OrderStatus, OrderItem, Outbox } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}
  async create(
    userId: string,
    createOrderDto: CreateOrderDto,
    traceId: string,
  ): Promise<Order & { items: OrderItem[] }> {
    const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'version'> =
      {
        customerId: userId,
        status: OrderStatus.PENDING,
      };

    const orderItems: Omit<OrderItem, 'id' | 'orderId'>[] =
      createOrderDto.items.map((item, index) => ({
        lineNo: index + 1,
        sku: item.sku,
        qty: item.qty,
      }));

    const outboxEvent: Omit<
      Outbox,
      'id' | 'createdAt' | 'correlationId' | 'idempotencyKey'
    > = {
      aggregateId: '',
      type: 'OrderPlaced',
      payload: JSON.parse(JSON.stringify(createOrderDto.items)),
      processedAt: null,
      traceId,
    };

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: newOrder,
      });

      const orderItemsWithOrderId = orderItems.map((item) => ({
        ...item,
        orderId: createdOrder.id,
      }));

      await tx.orderItem.createMany({
        data: orderItemsWithOrderId,
      });

      await tx.outbox.create({
        data: {
          ...outboxEvent,
          aggregateId: createdOrder.id,
        },
      });

      const orderWithItems = await tx.order.findUnique({
        where: { id: createdOrder.id },
        include: { items: true },
      });

      return orderWithItems;
    });

    return order;
  }

  async findOne(id: string): Promise<(Order & { items: OrderItem[] }) | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    return order;
  }

  async handleOrderProcessed(
    outboxId: string,
    orderId: string,
    processStatus: string,
  ): Promise<void> {
    const orderStatus =
      processStatus === 'OrderConfirmed'
        ? OrderStatus.CONFIRMED
        : OrderStatus.CANCELLED;

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: orderStatus },
      });

      await tx.outbox.update({
        where: { id: outboxId },
        data: { type: processStatus, processedAt: new Date() },
      });
    });
  }
}
