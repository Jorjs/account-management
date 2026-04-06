import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Account } from '../account/account.entity';
import { StatementQueryDto } from './dto/statement-query.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async getStatement(
    accountId: number,
    query: StatementQueryDto,
  ): Promise<Transaction[]> {
    const account = await this.accountRepository.findOneBy({ accountId });
    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    const qb = this.transactionRepository
      .createQueryBuilder('t')
      .where('t.account_id = :accountId', { accountId })
      .orderBy('t.transaction_date', 'DESC');

    if (query.startDate) {
      qb.andWhere('t.transaction_date >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('t.transaction_date <= :endDate', {
        endDate: query.endDate + ' 23:59:59',
      });
    }

    return qb.getMany();
  }
}
