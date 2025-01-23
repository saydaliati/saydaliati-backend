import { Body, Controller, Post , Headers} from '@nestjs/common';
import { FavoritService } from './favorit.service';
import { FavoritDto } from './dto/favorit.dto';

@Controller('favorit')
export class FavoritController {
  constructor(private readonly favoritService: FavoritService) {}

  @Post('add')
  async addFavorit(@Body() favoritDto: FavoritDto , @Headers('authorization') token: string): Promise<void> {
    return this.favoritService.addFavorit(favoritDto , token);
  }

  @Post('remove')
  async removeFavorit(@Body() favoritDto: FavoritDto , @Headers('authorization') token: string): Promise<void> {
    return this.favoritService.removeFavorit(favoritDto , token);
  }
}
