import { Controller } from '@nestjs/common';
import { FavoritService } from './favorit.service';

@Controller('favorit')
export class FavoritController {
  constructor(private readonly favoritService: FavoritService) {}
}
