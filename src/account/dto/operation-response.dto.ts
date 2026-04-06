import { ApiProperty } from '@nestjs/swagger';

export class OperationResponseDto {
  @ApiProperty()
  accountId: number;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  message: string;
}
