import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Logger,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    try {
      const userId = req.headers['x-user-id'] as string;
      const traceId = req.headers['x-kong-request-id'] as string;
      const result = await this.ordersService.create(
        userId,
        createOrderDto,
        traceId,
      );
      res.status(HttpStatus.CREATED).json({
        message: 'Order created successfully',
        data: result,
      });
    } catch (error) {
      this.logger.error('Error creating order', error as any);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Internal server error',
      });
    }
  }

  @Get(':id')
  async findOne(@Res() res: Response, @Param('id') id: string) {
    try {
      const result = await this.ordersService.findOne(id);
      if (result == null) {
        res.status(HttpStatus.NOT_FOUND).send({ message: 'Order not found' });
        return;
      }
      res.status(HttpStatus.OK).json({
        message: 'Order fetched successfully',
        data: result,
      });
    } catch (error) {
      this.logger.error('Error fetching order', error as any);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        message: 'Internal server error',
      });
    }
  }
}
