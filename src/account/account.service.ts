import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Account } from './account.entity';
import { AccountRepository } from './account.repository';
import { PersonRepository } from '../person/person.repository';
import { TransactionRepository } from '../transaction/transaction.repository';
import { CreateAccountDto } from './dto/create-account.dto';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { OperationResponseDto } from './dto/operation-response.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly personRepository: PersonRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async create(dto: CreateAccountDto): Promise<AccountResponseDto> {
    const person = await this.personRepository.findById(dto.personId);
    if (!person) {
      throw new NotFoundException(`Person with ID ${dto.personId} not found`);
    }

    const account = await this.accountRepository.create({
      personId: dto.personId,
      balance: 0,
      dailyWithdrawalLimit: dto.dailyWithdrawalLimit,
      activeFlag: true,
      accountType: dto.accountType,
    });

    return this.toAccountResponse(account);
  }

  async getBalance(accountId: number): Promise<BalanceResponseDto> {
    const account = await this.findAccountOrFail(accountId);
    return {
      accountId: account.accountId,
      balance: Number(account.balance),
    };
  }

  async deposit(
    accountId: number,
    dto: DepositDto,
  ): Promise<OperationResponseDto> {
    const account = await this.accountRepository.executeInTransaction(
      async (manager) => {
        const acc = await this.findLockedAccountOrFail(accountId, manager);

        this.assertAccountActive(acc);

        acc.balance = Number(acc.balance) + dto.value;
        await manager.save(Account, acc);

        await this.transactionRepository.createWithManager(
          { accountId, value: dto.value },
          manager,
        );

        return acc;
      },
    );

    return {
      accountId: account.accountId,
      balance: Number(account.balance),
      message: 'Deposit successful',
    };
  }

  async withdraw(
    accountId: number,
    dto: WithdrawDto,
  ): Promise<OperationResponseDto> {
    const account = await this.accountRepository.executeInTransaction(
      async (manager) => {
        const acc = await this.findLockedAccountOrFail(accountId, manager);

        this.assertAccountActive(acc);

        const currentBalance = Number(acc.balance);
        if (dto.value > currentBalance) {
          throw new BadRequestException('Insufficient funds');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalWithdrawnToday =
          await this.accountRepository.getDailyWithdrawnAmount(
            accountId,
            today,
            manager,
          );

        if (
          totalWithdrawnToday + dto.value >
          Number(acc.dailyWithdrawalLimit)
        ) {
          throw new BadRequestException('Daily withdrawal limit exceeded');
        }

        acc.balance = currentBalance - dto.value;
        await manager.save(Account, acc);

        await this.transactionRepository.createWithManager(
          { accountId, value: -dto.value },
          manager,
        );

        return acc;
      },
    );

    return {
      accountId: account.accountId,
      balance: Number(account.balance),
      message: 'Withdrawal successful',
    };
  }

  async block(accountId: number): Promise<OperationResponseDto> {
    const account = await this.findAccountOrFail(accountId);

    if (!account.activeFlag) {
      throw new BadRequestException('Account is already blocked');
    }

    account.activeFlag = false;
    await this.accountRepository.save(account);

    return {
      accountId: account.accountId,
      balance: Number(account.balance),
      message: 'Account blocked successfully',
    };
  }

  async transfer(
    fromAccountId: number,
    dto: TransferDto,
  ): Promise<OperationResponseDto> {
    if (fromAccountId === dto.toAccountId) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    const account = await this.accountRepository.executeInTransaction(
      async (manager) => {
        const fromAccount = await this.findLockedAccountOrFail(
          fromAccountId,
          manager,
        );
        const toAccount = await this.findLockedAccountOrFail(
          dto.toAccountId,
          manager,
        );

        this.assertAccountActive(fromAccount);
        this.assertAccountActive(toAccount);

        const fromBalance = Number(fromAccount.balance);
        if (dto.value > fromBalance) {
          throw new BadRequestException('Insufficient funds');
        }

        fromAccount.balance = fromBalance - dto.value;
        toAccount.balance = Number(toAccount.balance) + dto.value;

        await manager.save(Account, [fromAccount, toAccount]);

        await this.transactionRepository.createManyWithManager(
          [
            { accountId: fromAccountId, value: -dto.value },
            { accountId: dto.toAccountId, value: dto.value },
          ],
          manager,
        );

        return fromAccount;
      },
    );

    return {
      accountId: account.accountId,
      balance: Number(account.balance),
      message: 'Transfer successful',
    };
  }

  async unblock(accountId: number): Promise<OperationResponseDto> {
    const account = await this.findAccountOrFail(accountId);

    if (account.activeFlag) {
      throw new BadRequestException('Account is already active');
    }

    account.activeFlag = true;
    await this.accountRepository.save(account);

    return {
      accountId: account.accountId,
      balance: Number(account.balance),
      message: 'Account unblocked successfully',
    };
  }

  private toAccountResponse(account: Account): AccountResponseDto {
    return {
      accountId: account.accountId,
      personId: account.personId,
      balance: Number(account.balance),
      dailyWithdrawalLimit: Number(account.dailyWithdrawalLimit),
      activeFlag: account.activeFlag,
      accountType: account.accountType,
      createDate: account.createDate,
    };
  }

  private async findAccountOrFail(accountId: number): Promise<Account> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }
    return account;
  }

  private async findLockedAccountOrFail(
    accountId: number,
    manager: EntityManager,
  ): Promise<Account> {
    const account = await this.accountRepository.findByIdWithLock(
      accountId,
      manager,
    );
    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }
    return account;
  }

  private assertAccountActive(account: Account): void {
    if (!account.activeFlag) {
      throw new BadRequestException('Account is blocked');
    }
  }
}
