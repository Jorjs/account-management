import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Transaction } from '../transaction/transaction.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountRepository } from './account.repository';
import { PersonModule } from '../person/person.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Transaction]),
    PersonModule,
    forwardRef(() => TransactionModule),
  ],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountRepository],
})
export class AccountModule {}
