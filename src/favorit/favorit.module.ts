import { Module } from '@nestjs/common';
import { FavoritService } from './favorit.service';
import { FavoritController } from './favorit.controller';

@Module({
  controllers: [FavoritController],
  providers: [FavoritService],
})
export class FavoritModule {}
