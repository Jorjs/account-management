import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';
import { AccountRepository } from '../account/account.repository';

describe('TransactionService', () => {
  let service: TransactionService;
  let transactionRepository: jest.Mocked<TransactionRepository>;
  let accountRepository: jest.Mocked<AccountRepository>;

  const mockTransactions = [
    {
      transactionId: 2,
      accountId: 1,
      value: -200,
      transactionDate: new Date('2026-04-06'),
    },
    {
      transactionId: 1,
      accountId: 1,
      value: 500,
      transactionDate: new Date('2026-04-05'),
    },
  ] as any[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TransactionRepository,
          useValue: {
            findByAccountId: jest.fn(),
          },
        },
        {
          provide: AccountRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    transactionRepository = module.get(TransactionRepository);
    accountRepository = module.get(AccountRepository);
  });

  describe('getStatement', () => {
    it('should return paginated transactions for an account', async () => {
      accountRepository.findById.mockResolvedValue({
        accountId: 1,
      } as any);
      transactionRepository.findByAccountId.mockResolvedValue({
        data: mockTransactions,
        total: 2,
      });

      const result = await service.getStatement(1, {});

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.data[0].transactionId).toBe(2);
      expect(result.data[1].value).toBe(500);
    });

    it('should filter transactions by date range', async () => {
      accountRepository.findById.mockResolvedValue({
        accountId: 1,
      } as any);
      transactionRepository.findByAccountId.mockResolvedValue({
        data: [mockTransactions[0]],
        total: 1,
      });

      const result = await service.getStatement(1, {
        startDate: '2026-04-06',
        endDate: '2026-04-06',
      });

      expect(result.data).toHaveLength(1);
      expect(transactionRepository.findByAccountId).toHaveBeenCalledWith(1, {
        startDate: '2026-04-06',
        endDate: '2026-04-06',
        page: 1,
        limit: 20,
      });
    });

    it('should throw NotFoundException if account does not exist', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await expect(service.getStatement(999, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
