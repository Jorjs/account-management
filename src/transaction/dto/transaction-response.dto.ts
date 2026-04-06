import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty()
  transactionId: number;

  @ApiProperty()
  accountId: number;

  @ApiProperty()
  value: number;

  @ApiProperty()
  transactionDate: Date;
}
