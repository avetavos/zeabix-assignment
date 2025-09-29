import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InventoriesService } from './inventories.service';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { Response } from 'express';

@Controller('inventories')
export class InventoriesController {
  private readonly logger = new Logger(InventoriesController.name);
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Post('adjust')
  async create(
    @Res() res: Response,
    @Body() adjustInventoryDto: AdjustInventoryDto,
  ) {
    try {
      const result =
        await this.inventoriesService.adjustStock(adjustInventoryDto);
      res.status(HttpStatus.CREATED).json({
        message: 'Inventory adjusted successfully',
        data: result,
      });
    } catch (error) {
      this.logger.error('Error adjusting inventory', error as any);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Internal server error',
      });
    }
  }

  @Get(':sku')
  async findOne(@Param('sku') sku: string) {
    try {
      const result = await this.inventoriesService.findBySku(sku);
      if (!result) {
        return {
          message: 'Inventory not found',
        };
      }
      return {
        message: 'Inventory fetched successfully',
        data: result,
      };
    } catch (error) {
      this.logger.error('Error fetching inventory', error as any);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }
  }
}
