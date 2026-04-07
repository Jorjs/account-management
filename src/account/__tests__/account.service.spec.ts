import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AccountService } from '../account.service';
import { AccountRepository } from '../account.repository';
import { PersonRepository } from '../../person/person.repository';
import { TransactionRepository } from '../../transaction/transaction.repository';
import { Account } from '../account.entity';

describe('AccountService', () => {
  let service: AccountService;
  let accountRepository: jest.Mocked<AccountRepository>;
  let personRepository: jest.Mocked<PersonRepository>;
  let transactionRepository: jest.Mocked<TransactionRepository>;

  const mockAccount = {
    accountId: 1,
    personId: 1,
    balance: 1000,
    dailyWithdrawalLimit: 500,
    activeFlag: true,
    accountType: 1,
    createDate: new Date(),
  } as Account;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findByIdWithLock: jest.fn(),
            findManyByIdsWithLock: jest.fn(),
            getDailyWithdrawnAmount: jest.fn(),
            executeInTransaction: jest.fn(),
          },
        },
        {
          provide: PersonRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: TransactionRepository,
          useValue: {
            createWithManager: jest.fn(),
            createManyWithManager: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountRepository = module.get(AccountRepository);
    personRepository = module.get(PersonRepository);
    transactionRepository = module.get(TransactionRepository);
  });

  describe('create', () => {
    it('should create an account successfully', async () => {
      personRepository.findById.mockResolvedValue({
        personId: 1,
        name: 'John',
        document: '123',
        birthDate: new Date(),
        accounts: [],
      });
      accountRepository.create.mockResolvedValue({
        ...mockAccount,
        balance: 0,
      });

      const result = await service.create({
        personId: 1,
        dailyWithdrawalLimit: 500,
        accountType: 1,
      });

      expect(result.accountId).toBe(1);
      expect(result.balance).toBe(0);
      expect(accountRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if person does not exist', async () => {
      personRepository.findById.mockResolvedValue(null);

      await expect(
        service.create({
          personId: 999,
          dailyWithdrawalLimit: 500,
          accountType: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBalance', () => {
    it('should return the account balance', async () => {
      accountRepository.findById.mockResolvedValue(mockAccount);

      const result = await service.getBalance(1);

      expect(result).toEqual({ accountId: 1, balance: 1000 });
    });

    it('should throw NotFoundException if account does not exist', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await expect(service.getBalance(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deposit', () => {
    it('should deposit and return updated balance', async () => {
      const account = { ...mockAccount, balance: 500 };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = {
            save: jest.fn().mockResolvedValue(account),
          } as any;
          accountRepository.findByIdWithLock.mockResolvedValue(account);
          transactionRepository.createWithManager.mockResolvedValue({} as any);
          return work(manager);
        },
      );

      const result = await service.deposit(1, { value: 200 });

      expect(result.balance).toBe(700);
      expect(result.message).toBe('Deposit successful');
    });

    it('should throw BadRequestException if account is blocked', async () => {
      const blockedAccount = { ...mockAccount, activeFlag: false };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = { save: jest.fn() } as any;
          accountRepository.findByIdWithLock.mockResolvedValue(blockedAccount);
          return work(manager);
        },
      );

      await expect(service.deposit(1, { value: 200 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('withdraw', () => {
    it('should withdraw and return updated balance', async () => {
      const account = { ...mockAccount, balance: 1000 };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = {
            save: jest.fn().mockResolvedValue(account),
          } as any;
          accountRepository.findByIdWithLock.mockResolvedValue(account);
          accountRepository.getDailyWithdrawnAmount.mockResolvedValue(0);
          transactionRepository.createWithManager.mockResolvedValue({} as any);
          return work(manager);
        },
      );

      const result = await service.withdraw(1, { value: 300 });

      expect(result.balance).toBe(700);
      expect(result.message).toBe('Withdrawal successful');
    });

    it('should throw BadRequestException for insufficient funds', async () => {
      const account = { ...mockAccount, balance: 100 };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = { save: jest.fn() } as any;
          accountRepository.findByIdWithLock.mockResolvedValue(account);
          return work(manager);
        },
      );

      await expect(service.withdraw(1, { value: 500 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when daily withdrawal limit exceeded', async () => {
      const account = { ...mockAccount, balance: 5000 };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = { save: jest.fn() } as any;
          accountRepository.findByIdWithLock.mockResolvedValue(account);
          accountRepository.getDailyWithdrawnAmount.mockResolvedValue(400);
          return work(manager);
        },
      );

      await expect(service.withdraw(1, { value: 200 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if account is blocked', async () => {
      const blockedAccount = { ...mockAccount, activeFlag: false };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = { save: jest.fn() } as any;
          accountRepository.findByIdWithLock.mockResolvedValue(blockedAccount);
          return work(manager);
        },
      );

      await expect(service.withdraw(1, { value: 100 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('block', () => {
    it('should block an active account', async () => {
      const account = { ...mockAccount, activeFlag: true };
      accountRepository.findById.mockResolvedValue(account);
      accountRepository.save.mockResolvedValue({
        ...account,
        activeFlag: false,
      });

      const result = await service.block(1);

      expect(result.message).toBe('Account blocked successfully');
    });

    it('should throw BadRequestException if account is already blocked', async () => {
      const blockedAccount = { ...mockAccount, activeFlag: false };
      accountRepository.findById.mockResolvedValue(blockedAccount);

      await expect(service.block(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await expect(service.block(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unblock', () => {
    it('should unblock a blocked account', async () => {
      const account = { ...mockAccount, activeFlag: false };
      accountRepository.findById.mockResolvedValue(account);
      accountRepository.save.mockResolvedValue({
        ...account,
        activeFlag: true,
      });

      const result = await service.unblock(1);

      expect(result.message).toBe('Account unblocked successfully');
    });

    it('should throw BadRequestException if account is already active', async () => {
      accountRepository.findById.mockResolvedValue(mockAccount);

      await expect(service.unblock(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      accountRepository.findById.mockResolvedValue(null);

      await expect(service.unblock(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('transfer', () => {
    const mockToAccount = {
      accountId: 2,
      personId: 2,
      balance: 200,
      dailyWithdrawalLimit: 500,
      activeFlag: true,
      accountType: 1,
      createDate: new Date(),
    } as Account;

    it('should transfer money between accounts', async () => {
      const fromAccount = { ...mockAccount, balance: 1000 };
      const toAccount = { ...mockToAccount, balance: 200 };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = {
            save: jest.fn().mockResolvedValue([fromAccount, toAccount]),
          } as any;
          accountRepository.findManyByIdsWithLock.mockResolvedValue([
            fromAccount,
            toAccount,
          ]);
          transactionRepository.createManyWithManager.mockResolvedValue(
            [] as any,
          );
          return work(manager);
        },
      );

      const result = await service.transfer(1, {
        toAccountId: 2,
        value: 300,
      });

      expect(result.balance).toBe(700);
      expect(result.message).toBe('Transfer successful');
    });

    it('should throw BadRequestException when transferring to same account', async () => {
      await expect(
        service.transfer(1, { toAccountId: 1, value: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for insufficient funds', async () => {
      const fromAccount = { ...mockAccount, balance: 50 };
      const toAccount = { ...mockToAccount };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = { save: jest.fn() } as any;
          accountRepository.findManyByIdsWithLock.mockResolvedValue([
            fromAccount,
            toAccount,
          ]);
          return work(manager);
        },
      );

      await expect(
        service.transfer(1, { toAccountId: 2, value: 500 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if source account is blocked', async () => {
      const blockedFrom = { ...mockAccount, activeFlag: false };
      const toAccount = { ...mockToAccount };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = { save: jest.fn() } as any;
          accountRepository.findManyByIdsWithLock.mockResolvedValue([
            blockedFrom,
            toAccount,
          ]);
          return work(manager);
        },
      );

      await expect(
        service.transfer(1, { toAccountId: 2, value: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if destination account is blocked', async () => {
      const fromAccount = { ...mockAccount };
      const blockedTo = { ...mockToAccount, activeFlag: false };

      accountRepository.executeInTransaction.mockImplementation(
        async (work) => {
          const manager = { save: jest.fn() } as any;
          accountRepository.findManyByIdsWithLock.mockResolvedValue([
            fromAccount,
            blockedTo,
          ]);
          return work(manager);
        },
      );

      await expect(
        service.transfer(1, { toAccountId: 2, value: 100 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
