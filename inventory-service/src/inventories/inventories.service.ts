import { Injectable } from '@nestjs/common';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Inventory } from './schemas/inventory.schema';
import { Model } from 'mongoose';

@Injectable()
export class InventoriesService {
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
}
