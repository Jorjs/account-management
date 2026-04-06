import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

describe('AccountController', () => {
  let controller: AccountController;
  let service: jest.Mocked<AccountService>;

  const mockAccountResponse = {
    accountId: 1,
    personId: 1,
    balance: 0,
    dailyWithdrawalLimit: 1000,
    activeFlag: true,
    accountType: 1,
    createDate: new Date(),
  };

  const mockOperationResponse = {
    accountId: 1,
    balance: 500,
    message: 'Deposit successful',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: AccountService,
          useValue: {
            create: jest.fn(),
            getBalance: jest.fn(),
            deposit: jest.fn(),
            withdraw: jest.fn(),
            block: jest.fn(),
            unblock: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    service = module.get(AccountService);
  });

  describe('create', () => {
    it('should call service.create with the DTO', async () => {
      service.create.mockResolvedValue(mockAccountResponse);

      const dto = { personId: 1, dailyWithdrawalLimit: 1000, accountType: 1 };
      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result.accountId).toBe(1);
    });
  });

  describe('getBalance', () => {
    it('should call service.getBalance with account ID', async () => {
      service.getBalance.mockResolvedValue({ accountId: 1, balance: 500 });

      const result = await controller.getBalance(1);

      expect(service.getBalance).toHaveBeenCalledWith(1);
      expect(result.balance).toBe(500);
    });
  });

  describe('deposit', () => {
    it('should call service.deposit with account ID and DTO', async () => {
      service.deposit.mockResolvedValue(mockOperationResponse);

      const result = await controller.deposit(1, { value: 500 });

      expect(service.deposit).toHaveBeenCalledWith(1, { value: 500 });
      expect(result.balance).toBe(500);
    });
  });

  describe('withdraw', () => {
    it('should call service.withdraw with account ID and DTO', async () => {
      service.withdraw.mockResolvedValue({
        accountId: 1,
        balance: 300,
        message: 'Withdrawal successful',
      });

      const result = await controller.withdraw(1, { value: 200 });

      expect(service.withdraw).toHaveBeenCalledWith(1, { value: 200 });
      expect(result.balance).toBe(300);
    });
  });

  describe('block', () => {
    it('should call service.block with account ID', async () => {
      service.block.mockResolvedValue({
        accountId: 1,
        balance: 500,
        message: 'Account blocked successfully',
      });

      const result = await controller.block(1);

      expect(service.block).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Account blocked successfully');
    });
  });

  describe('unblock', () => {
    it('should call service.unblock with account ID', async () => {
      service.unblock.mockResolvedValue({
        accountId: 1,
        balance: 500,
        message: 'Account unblocked successfully',
      });

      const result = await controller.unblock(1);

      expect(service.unblock).toHaveBeenCalledWith(1);
      expect(result.message).toBe('Account unblocked successfully');
    });
  });
});
