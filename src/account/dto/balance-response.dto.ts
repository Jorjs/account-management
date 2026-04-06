import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty()
  accountId: number;

  @ApiProperty()
  balance: number;
}
