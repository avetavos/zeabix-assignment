import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { Kafka } from 'kafkajs';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}
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

    let brokerStatus = 'UP';
    try {
      const kafkaConfig = this.configService.get('kafka');
      const kafka = new Kafka({
        clientId: 'health-check',
        brokers: kafkaConfig.brokers,
        connectionTimeout: 3000,
        requestTimeout: 3000,
      });

      const admin = kafka.admin();
      await admin.connect();
      await admin.listTopics();
      await admin.disconnect();
    } catch {
      brokerStatus = 'DOWN';
    }

    return {
      status: 'UP',
      database: dbStatus,
      broker: brokerStatus,
    };
  }
}
