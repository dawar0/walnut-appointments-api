import { Module } from '@nestjs/common';
import { PrismaService } from './client.service';

@Module({
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class ClientModule {}
