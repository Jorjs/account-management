import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ description: 'ID of the person who owns the account' })
  @IsInt()
  personId: number;

  @ApiProperty({ description: 'Daily withdrawal limit', example: 1000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  dailyWithdrawalLimit: number;

  @ApiProperty({ description: 'Account type identifier', example: 1 })
  @IsInt()
  @Min(1)
  accountType: number;
}
