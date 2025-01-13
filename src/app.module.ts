import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FavoritModule } from './favorit/favorit.module';

@Module({
  imports: [FavoritModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
