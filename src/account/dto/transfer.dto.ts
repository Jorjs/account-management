import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class TransferDto {
  @ApiProperty({ description: 'Destination account ID' })
  @IsInt()
  toAccountId: number;

  @ApiProperty({ description: 'Amount to transfer', example: 100 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  value: number;
}
