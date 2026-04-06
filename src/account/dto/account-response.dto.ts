import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
  @ApiProperty()
  accountId: number;

  @ApiProperty()
  personId: number;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  dailyWithdrawalLimit: number;

  @ApiProperty()
  activeFlag: boolean;

  @ApiProperty()
  accountType: number;

  @ApiProperty()
  createDate: Date;
}
