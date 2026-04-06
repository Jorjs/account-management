import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { StatementQueryDto } from './dto/statement-query.dto';

@ApiTags('Transactions')
@Controller('accounts')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get(':id/statements')
  @ApiOperation({
    summary: 'Get account statement (optionally filtered by date range)',
  })
  @ApiResponse({ status: 200, description: 'Returns list of transactions' })
  getStatement(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: StatementQueryDto,
  ) {
    return this.transactionService.getStatement(id, query);
  }
}
