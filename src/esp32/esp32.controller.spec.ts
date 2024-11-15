import { Test, TestingModule } from '@nestjs/testing';
import { Esp32Controller } from './esp32.controller';

describe('Esp32Controller', () => {
  let controller: Esp32Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [Esp32Controller],
    }).compile();

    controller = module.get<Esp32Controller>(Esp32Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
