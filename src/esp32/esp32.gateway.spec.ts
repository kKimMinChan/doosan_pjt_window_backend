import { Test, TestingModule } from '@nestjs/testing';
import { Esp32Gateway } from './esp32.gateway';

describe('Esp32Gateway', () => {
  let gateway: Esp32Gateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Esp32Gateway],
    }).compile();

    gateway = module.get<Esp32Gateway>(Esp32Gateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
