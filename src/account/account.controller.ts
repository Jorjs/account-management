import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { OperationResponseDto } from './dto/operation-response.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, type: AccountResponseDto })
  create(@Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    return this.accountService.create(dto);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, type: BalanceResponseDto })
  getBalance(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BalanceResponseDto> {
    return this.accountService.getBalance(id);
  }

  @Post(':id/deposit')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deposit into account' })
  @ApiResponse({ status: 200, type: OperationResponseDto })
  deposit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DepositDto,
  ): Promise<OperationResponseDto> {
    return this.accountService.deposit(id, dto);
  }

  @Post(':id/withdraw')
  @HttpCode(200)
  @ApiOperation({ summary: 'Withdraw from account' })
  @ApiResponse({ status: 200, type: OperationResponseDto })
  withdraw(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: WithdrawDto,
  ): Promise<OperationResponseDto> {
    return this.accountService.withdraw(id, dto);
  }

  @Post(':id/transfer')
  @HttpCode(200)
  @ApiOperation({ summary: 'Transfer money to another account' })
  @ApiResponse({ status: 200, type: OperationResponseDto })
  transfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransferDto,
  ): Promise<OperationResponseDto> {
    return this.accountService.transfer(id, dto);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Block an account' })
  @ApiResponse({ status: 200, type: OperationResponseDto })
  block(@Param('id', ParseIntPipe) id: number): Promise<OperationResponseDto> {
    return this.accountService.block(id);
  }

  @Patch(':id/unblock')
  @ApiOperation({ summary: 'Unblock an account' })
  @ApiResponse({ status: 200, type: OperationResponseDto })
  unblock(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OperationResponseDto> {
    return this.accountService.unblock(id);
  }
}
