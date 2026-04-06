import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { Account } from '../account/account.entity';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionRepository } from './transaction.repository';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Account]),
    forwardRef(() => AccountModule),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionRepository],
})
export class TransactionModule {}
