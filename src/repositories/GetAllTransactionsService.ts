import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Balance from '../interfaces/Balance';
import TransactionsRepository from './TransactionsRepository';

interface GetAllTransactionsResponse {
  transactions: Transaction[];
  balance: Balance;
}

class GetAllTransactionsService {
  private transactionsRepository: TransactionsRepository;

  constructor() {
    this.transactionsRepository = getCustomRepository(TransactionsRepository);
  }

  public async execute(): Promise<GetAllTransactionsResponse> {
    const transactions = await this.transactionsRepository.all();
    const balance = await this.transactionsRepository.getBalance();
    return { transactions, balance };
  }
}

export default GetAllTransactionsService;
