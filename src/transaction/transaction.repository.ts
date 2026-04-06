import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
  ) {}

  async createWithManager(
    data: Partial<Transaction>,
    manager: EntityManager,
  ): Promise<Transaction> {
    const transaction = manager.create(Transaction, data);
    return manager.save(Transaction, transaction);
  }

  async findByAccountId(
    accountId: number,
    options: {
      startDate?: string;
      endDate?: string;
      page: number;
      limit: number;
    },
  ): Promise<{ data: Transaction[]; total: number }> {
    const qb = this.repository
      .createQueryBuilder('t')
      .where('t.account_id = :accountId', { accountId })
      .orderBy('t.transaction_date', 'DESC');

    if (options.startDate) {
      qb.andWhere('t.transaction_date >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options.endDate) {
      qb.andWhere('t.transaction_date <= :endDate', {
        endDate: options.endDate + ' 23:59:59',
      });
    }

    const [data, total] = await qb
      .skip((options.page - 1) * options.limit)
      .take(options.limit)
      .getManyAndCount();

    return { data, total };
  }
}
