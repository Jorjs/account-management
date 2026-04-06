import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountRepository } from '../account/account.repository';
import { TransactionRepository } from './transaction.repository';
import { StatementQueryDto } from './dto/statement-query.dto';
import { PaginatedStatementResponseDto } from './dto/paginated-statement-response.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly accountRepository: AccountRepository,
  ) {}

  async getStatement(
    accountId: number,
    query: StatementQueryDto,
  ): Promise<PaginatedStatementResponseDto> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { data, total } = await this.transactionRepository.findByAccountId(
      accountId,
      {
        startDate: query.startDate,
        endDate: query.endDate,
        page,
        limit,
      },
    );

    return {
      data: data.map((t) => ({
        transactionId: t.transactionId,
        accountId: t.accountId,
        value: Number(t.value),
        transactionDate: t.transactionDate,
      })),
      total,
      page,
      limit,
    };
  }
}
