import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsInt } from 'class-validator';
import { AccountType } from '../enums/account-type.enum';

export class CreateAccountDto {
  @ApiProperty({ description: 'ID of the person who owns the account' })
  @IsInt()
  personId: number;

  @ApiProperty({ description: 'Daily withdrawal limit', example: 1000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  dailyWithdrawalLimit: number;

  @ApiProperty({
    description: 'Account type (1 = Checking, 2 = Savings)',
    enum: AccountType,
    example: AccountType.CHECKING,
  })
  @IsEnum(AccountType)
  accountType: AccountType;
}
