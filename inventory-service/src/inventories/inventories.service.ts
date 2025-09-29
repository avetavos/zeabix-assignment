import { Injectable, Logger } from '@nestjs/common';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Inventory } from './schemas/inventory.schema';
import { Model } from 'mongoose';
import { OrderItem, OrderMessage } from './interfaces/order-message.interface';

@Injectable()
export class InventoriesService {
  private readonly logger = new Logger(InventoriesService.name);
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
  ) {}

  async adjustStock(
    adjustInventoryDto: AdjustInventoryDto,
  ): Promise<Inventory> {
    const { sku, delta } = adjustInventoryDto;
    const existingInventory = await this.inventoryModel.findOne({ sku });

    if (existingInventory) {
      existingInventory.available += delta;
      return existingInventory.save();
    }

    const newInventory = new this.inventoryModel({
      sku,
      available: delta,
      reserved: 0,
    });

    await newInventory.save();

    return newInventory;
  }

  async findBySku(sku: string): Promise<Inventory | null> {
    const inventory = await this.inventoryModel.findOne({ sku });
    return inventory;
  }

  async handleOrderPlacedEvent(order: OrderMessage): Promise<string> {
    const orderItems = JSON.parse(order.payload) as OrderItem[];

    // check if inventory exists for all order items
    const productStock = await Promise.all(
      orderItems.map((item) => this.findBySku(item.sku)),
    );

    if (productStock.some((inv) => inv == null)) {
      this.logger.warn('Inventory not found for one or more SKUs');
      return 'OrderCancelled';
    }

    if (
      productStock.some(
        (inv) =>
          inv.available < orderItems.find((item) => item.sku === inv.sku).qty,
      )
    ) {
      this.logger.warn('Insufficient stock for one or more SKUs');
      return 'OrderCancelled';
    }

    const inventoryUpdates: { inventory: any; item: OrderItem }[] = [];

    for (const item of orderItems) {
      const inventory = await this.inventoryModel.findOne({ sku: item.sku });

      if (!inventory) {
        throw new Error(`Inventory not found for SKU: ${item.sku}`);
      }

      if (inventory.available < item.qty) {
        this.logger.warn(`Insufficient stock for SKU: ${item.sku}`);
        return 'OrderCancelled';
      }

      inventoryUpdates.push({ inventory, item });
    }

    for (const { inventory, item } of inventoryUpdates) {
      inventory.available -= item.qty;
      inventory.reserved += item.qty;
      await inventory.save();

      this.logger.log(
        `Updated inventory for SKU: ${item.sku}, Available: ${inventory.available}, Reserved: ${inventory.reserved}`,
      );
    }

    this.logger.log('Order processed successfully without transaction');
    return 'OrderConfirmed';
  }
}
