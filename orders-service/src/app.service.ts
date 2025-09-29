import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  async healthCheck(): Promise<{
    status: string;
    database: string;
    broker: string;
  }> {
    let dbStatus = 'UP';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'down';
    }

    return {
      status: 'UP',
      database: dbStatus,
      broker: 'NOT IMPLEMENTED',
    };
  }
}
