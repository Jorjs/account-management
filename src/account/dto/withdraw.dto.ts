import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ description: 'Amount to withdraw', example: 200.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;
}
