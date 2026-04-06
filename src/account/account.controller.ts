import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  create(@Body() dto: CreateAccountDto) {
    return this.accountService.create(dto);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get account balance' })
  @ApiResponse({ status: 200, description: 'Returns account balance' })
  getBalance(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.getBalance(id);
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Deposit into account' })
  @ApiResponse({ status: 200, description: 'Deposit successful' })
  deposit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DepositDto,
  ) {
    return this.accountService.deposit(id, dto);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw from account' })
  @ApiResponse({ status: 200, description: 'Withdrawal successful' })
  withdraw(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: WithdrawDto,
  ) {
    return this.accountService.withdraw(id, dto);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Block an account' })
  @ApiResponse({ status: 200, description: 'Account blocked successfully' })
  block(@Param('id', ParseIntPipe) id: number) {
    return this.accountService.block(id);
  }
}
