import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: jest.Mocked<TransactionService>;

  const mockPaginatedResponse = {
    data: [
      {
        transactionId: 1,
        accountId: 1,
        value: 500,
        transactionDate: new Date(),
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: {
            getStatement: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get(TransactionService);
  });

  describe('getStatement', () => {
    it('should call service.getStatement with account ID and query', async () => {
      service.getStatement.mockResolvedValue(mockPaginatedResponse);

      const query = { startDate: '2026-01-01', endDate: '2026-12-31' };
      const result = await controller.getStatement(1, query);

      expect(service.getStatement).toHaveBeenCalledWith(1, query);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should work without date filters', async () => {
      service.getStatement.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.getStatement(1, {});

      expect(service.getStatement).toHaveBeenCalledWith(1, {});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });
  });
});
