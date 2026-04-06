import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Account } from './account.entity';
import { Transaction } from '../transaction/transaction.entity';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
    private readonly dataSource: DataSource,
  ) {}

  async findById(accountId: number): Promise<Account | null> {
    return this.repository.findOneBy({ accountId });
  }

  async create(data: Partial<Account>): Promise<Account> {
    const account = this.repository.create(data);
    return this.repository.save(account);
  }

  async save(account: Account): Promise<Account> {
    return this.repository.save(account);
  }

  async findByIdWithLock(
    accountId: number,
    manager: EntityManager,
  ): Promise<Account | null> {
    return manager.findOne(Account, {
      where: { accountId },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async getDailyWithdrawnAmount(
    accountId: number,
    today: Date,
    manager: EntityManager,
  ): Promise<number> {
    const result = await manager
      .createQueryBuilder(Transaction, 't')
      .select('COALESCE(SUM(ABS(t.value)), 0)', 'total')
      .where('t.account_id = :accountId', { accountId })
      .andWhere('t.value < 0')
      .andWhere('t.transaction_date >= :today', { today })
      .getRawOne();

    return Number(result?.total ?? 0);
  }

  async executeInTransaction<T>(
    work: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(work);
  }
}
