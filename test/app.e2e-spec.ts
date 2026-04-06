import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Account Management (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let accountId: number;
  let personId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);

    // Clean existing test data
    await dataSource.query('DELETE FROM transactions');
    await dataSource.query('DELETE FROM accounts');
    await dataSource.query(
      `DELETE FROM persons WHERE document = '999.888.777-66'`,
    );

    // Seed a person for testing
    const result = await dataSource.query(
      `INSERT INTO persons (name, document, birth_date)
       VALUES ('Test User', '999.888.777-66', '1990-01-01')
       RETURNING person_id`,
    );
    personId = result[0].person_id;
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM transactions');
    await dataSource.query('DELETE FROM accounts');
    await dataSource.query(
      `DELETE FROM persons WHERE document = '999.888.777-66'`,
    );
    await app.close();
  });

  describe('POST /accounts', () => {
    it('should create an account', async () => {
      const res = await request(app.getHttpServer())
        .post('/accounts')
        .send({
          personId,
          dailyWithdrawalLimit: 1000,
          accountType: 1,
        })
        .expect(201);

      accountId = res.body.accountId;
      expect(accountId).toBeDefined();
      expect(res.body.balance).toBe(0);
      expect(res.body.activeFlag).toBe(true);
    });

    it('should return 404 for non-existent person', () => {
      return request(app.getHttpServer())
        .post('/accounts')
        .send({
          personId: 9999,
          dailyWithdrawalLimit: 1000,
          accountType: 1,
        })
        .expect(404);
    });

    it('should return 400 for invalid input', () => {
      return request(app.getHttpServer())
        .post('/accounts')
        .send({
          personId,
          dailyWithdrawalLimit: -100,
          accountType: 1,
        })
        .expect(400);
    });
  });

  describe('POST /accounts/:id/deposit', () => {
    it('should deposit into an account', async () => {
      const res = await request(app.getHttpServer())
        .post(`/accounts/${accountId}/deposit`)
        .send({ value: 500 })
        .expect(200);

      expect(res.body.balance).toBe(500);
      expect(res.body.message).toBe('Deposit successful');
    });

    it('should return 400 for negative deposit', () => {
      return request(app.getHttpServer())
        .post(`/accounts/${accountId}/deposit`)
        .send({ value: -100 })
        .expect(400);
    });

    it('should return 404 for non-existent account', () => {
      return request(app.getHttpServer())
        .post('/accounts/9999/deposit')
        .send({ value: 100 })
        .expect(404);
    });
  });

  describe('GET /accounts/:id/balance', () => {
    it('should return the account balance', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${accountId}/balance`)
        .expect(200);

      expect(res.body.accountId).toBe(accountId);
      expect(res.body.balance).toBe(500);
    });

    it('should return 404 for non-existent account', () => {
      return request(app.getHttpServer())
        .get('/accounts/9999/balance')
        .expect(404);
    });
  });

  describe('POST /accounts/:id/withdraw', () => {
    it('should withdraw from an account', async () => {
      const res = await request(app.getHttpServer())
        .post(`/accounts/${accountId}/withdraw`)
        .send({ value: 200 })
        .expect(200);

      expect(res.body.balance).toBe(300);
      expect(res.body.message).toBe('Withdrawal successful');
    });

    it('should return 400 for insufficient funds', () => {
      return request(app.getHttpServer())
        .post(`/accounts/${accountId}/withdraw`)
        .send({ value: 999999 })
        .expect(400);
    });
  });

  describe('GET /accounts/:id/statements', () => {
    it('should return paginated account statement', async () => {
      const res = await request(app.getHttpServer())
        .get(`/accounts/${accountId}/statements`)
        .expect(200);

      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(20);
      expect(res.body.data[0].transactionId).toBeDefined();
      expect(res.body.data[0].value).toBeDefined();
    });

    it('should filter by date range', () => {
      return request(app.getHttpServer())
        .get(
          `/accounts/${accountId}/statements?startDate=2020-01-01&endDate=2020-12-31`,
        )
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(0);
          expect(res.body.total).toBe(0);
        });
    });

    it('should return 404 for non-existent account', () => {
      return request(app.getHttpServer())
        .get('/accounts/9999/statements')
        .expect(404);
    });
  });

  describe('PATCH /accounts/:id/block', () => {
    it('should block an account', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/accounts/${accountId}/block`)
        .expect(200);

      expect(res.body.message).toBe('Account blocked successfully');
    });

    it('should return 400 when blocking an already blocked account', () => {
      return request(app.getHttpServer())
        .patch(`/accounts/${accountId}/block`)
        .expect(400);
    });

    it('should return 400 when depositing to blocked account', () => {
      return request(app.getHttpServer())
        .post(`/accounts/${accountId}/deposit`)
        .send({ value: 100 })
        .expect(400);
    });

    it('should return 400 when withdrawing from blocked account', () => {
      return request(app.getHttpServer())
        .post(`/accounts/${accountId}/withdraw`)
        .send({ value: 100 })
        .expect(400);
    });
  });
});
