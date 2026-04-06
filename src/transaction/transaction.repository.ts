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
    startDate?: string,
    endDate?: string,
  ): Promise<Transaction[]> {
    const qb = this.repository
      .createQueryBuilder('t')
      .where('t.account_id = :accountId', { accountId })
      .orderBy('t.transaction_date', 'DESC');

    if (startDate) {
      qb.andWhere('t.transaction_date >= :startDate', { startDate });
    }

    if (endDate) {
      qb.andWhere('t.transaction_date <= :endDate', {
        endDate: endDate + ' 23:59:59',
      });
    }

    return qb.getMany();
  }
}
