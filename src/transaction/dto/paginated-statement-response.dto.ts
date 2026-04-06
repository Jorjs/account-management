import { ApiProperty } from '@nestjs/swagger';
import { TransactionResponseDto } from './transaction-response.dto';

export class PaginatedStatementResponseDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  data: TransactionResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
