import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Account } from './account.entity';
import { Transaction } from '../transaction/transaction.entity';
import { Person } from '../person/person.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    const person = await this.personRepository.findOneBy({
      personId: dto.personId,
    });
    if (!person) {
      throw new NotFoundException(`Person with ID ${dto.personId} not found`);
    }

    const account = this.accountRepository.create({
      personId: dto.personId,
      balance: 0,
      dailyWithdrawalLimit: dto.dailyWithdrawalLimit,
      activeFlag: true,
      accountType: dto.accountType,
    });

    return this.accountRepository.save(account);
  }

  async getBalance(accountId: number): Promise<{ balance: number }> {
    const account = await this.findAccountOrFail(accountId);
    return { balance: Number(account.balance) };
  }

  async deposit(accountId: number, dto: DepositDto): Promise<Account> {
    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(Account, {
        where: { accountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new NotFoundException(
          `Account with ID ${accountId} not found`,
        );
      }

      if (!account.activeFlag) {
        throw new BadRequestException('Account is blocked');
      }

      account.balance = Number(account.balance) + dto.value;
      await manager.save(Account, account);

      const transaction = manager.create(Transaction, {
        accountId,
        value: dto.value,
      });
      await manager.save(Transaction, transaction);

      return account;
    });
  }

  async withdraw(accountId: number, dto: WithdrawDto): Promise<Account> {
    return this.dataSource.transaction(async (manager) => {
      const account = await manager.findOne(Account, {
        where: { accountId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new NotFoundException(
          `Account with ID ${accountId} not found`,
        );
      }

      if (!account.activeFlag) {
        throw new BadRequestException('Account is blocked');
      }

      const currentBalance = Number(account.balance);
      if (dto.value > currentBalance) {
        throw new BadRequestException('Insufficient funds');
      }

      // Check daily withdrawal limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyWithdrawn = await manager
        .createQueryBuilder(Transaction, 't')
        .select('COALESCE(SUM(ABS(t.value)), 0)', 'total')
        .where('t.account_id = :accountId', { accountId })
        .andWhere('t.value < 0')
        .andWhere('t.transaction_date >= :today', { today })
        .getRawOne();

      const totalWithdrawnToday = Number(dailyWithdrawn.total);
      if (
        totalWithdrawnToday + dto.value >
        Number(account.dailyWithdrawalLimit)
      ) {
        throw new BadRequestException('Daily withdrawal limit exceeded');
      }

      account.balance = currentBalance - dto.value;
      await manager.save(Account, account);

      const transaction = manager.create(Transaction, {
        accountId,
        value: -dto.value,
      });
      await manager.save(Transaction, transaction);

      return account;
    });
  }

  async block(accountId: number): Promise<Account> {
    const account = await this.findAccountOrFail(accountId);

    if (!account.activeFlag) {
      throw new BadRequestException('Account is already blocked');
    }

    account.activeFlag = false;
    return this.accountRepository.save(account);
  }

  private async findAccountOrFail(accountId: number): Promise<Account> {
    const account = await this.accountRepository.findOneBy({ accountId });
    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }
    return account;
  }
}
