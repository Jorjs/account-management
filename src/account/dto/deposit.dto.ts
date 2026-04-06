import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class DepositDto {
  @ApiProperty({ description: 'Amount to deposit', example: 500.0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;
}
