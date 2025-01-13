import { Test, TestingModule } from '@nestjs/testing';
import { FavoritController } from './favorit.controller';
import { FavoritService } from './favorit.service';

describe('FavoritController', () => {
  let controller: FavoritController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritController],
      providers: [FavoritService],
    }).compile();

    controller = module.get<FavoritController>(FavoritController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
