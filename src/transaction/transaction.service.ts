import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountRepository } from '../account/account.repository';
import { TransactionRepository } from './transaction.repository';
import { StatementQueryDto } from './dto/statement-query.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async getStatement(
    accountId: number,
    query: StatementQueryDto,
  ): Promise<TransactionResponseDto[]> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    const transactions = await this.transactionRepository.findByAccountId(
      accountId,
      query.startDate,
      query.endDate,
    );

    return transactions.map((t) => ({
      transactionId: t.transactionId,
      accountId: t.accountId,
      value: Number(t.value),
      transactionDate: t.transactionDate,
    }));
  }
}
