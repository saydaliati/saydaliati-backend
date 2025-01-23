import { Test, TestingModule } from '@nestjs/testing';
import { FavoritService } from './favorit.service';

describe('FavoritService', () => {
  let service: FavoritService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoritService],
    }).compile();

    service = module.get<FavoritService>(FavoritService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
