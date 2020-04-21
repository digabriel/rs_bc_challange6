// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import CategoriesRepository from '../repositories/CategoriesRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}

class CreateTransactionService {
  private categoriesRepository: CategoriesRepository;

  private transactionsRepository: TransactionsRepository;

  constructor() {
    this.categoriesRepository = getCustomRepository(CategoriesRepository);
    this.transactionsRepository = getCustomRepository(TransactionsRepository);
  }

  public async execute(data: Request): Promise<Transaction> {
    const balance = await this.transactionsRepository.getBalance();

    if (data.type === 'outcome' && data.value > balance.total) {
      throw new AppError(
        'No balance available to create this transaction',
        400,
      );
    }

    let category = await this.categoriesRepository.findOne({
      where: {
        title: data.categoryName,
      },
    });

    if (!category) {
      category = this.categoriesRepository.create({
        title: data.categoryName,
      });

      await this.categoriesRepository.save(category);
    }

    const transaction = this.transactionsRepository.create({
      category_id: category.id,
      title: data.title,
      value: data.value,
      type: data.type,
    });

    await this.transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
