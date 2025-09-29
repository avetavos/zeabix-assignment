import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InventoriesModule } from './inventories/inventories.module';
import configuration from 'src/config/configuration';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    KafkaModule,
    InventoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
