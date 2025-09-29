import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true, versionKey: 'version' })
export class Inventory {
  @Prop({ required: true, unique: true })
  sku: string;

  @Prop({ required: true, min: 0 })
  available: number;

  @Prop({ required: true, min: 0 })
  reserved: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  version: number;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

InventorySchema.index({ available: 1 });
