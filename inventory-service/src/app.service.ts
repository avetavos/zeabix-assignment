import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import { MongoClient } from 'mongodb';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}
  async healthCheck(): Promise<{
    status: string;
    database: string;
    broker: string;
  }> {
    let dbStatus = 'UP';
    try {
      const mongoConfig = this.configService.get('database');
      const client = new MongoClient(mongoConfig.uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      await client.connect();
      await client.db().admin().ping();
      await client.close();
    } catch {
      dbStatus = 'DOWN';
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
