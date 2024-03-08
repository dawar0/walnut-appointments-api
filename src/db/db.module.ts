import { Module } from '@nestjs/common';
import { DBService } from './db.service';

@Module({
  controllers: [],
  providers: [DBService],
  exports: [DBService],
})
export class DBModule {}
