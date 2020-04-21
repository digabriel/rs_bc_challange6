import parse from 'csv-parse';
import fs from 'fs';

import { getCustomRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface TransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  categoryName: string;
}

class ImportTransactionsService {
  async execute(csvFilePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const csvContent = await fs.promises.readFile(csvFilePath);
    const parser = parse(csvContent, { cast: true, from_line: 2, trim: true });

    const transactions: TransactionDTO[] = [];
    const categoriesTitles: Set<string> = new Set();

    parser.on('data', csvTransaction => {
      const [title, type, value, categoryName] = csvTransaction;

      const transaction = {
        title,
        type,
        value,
        categoryName,
      };

      categoriesTitles.add(categoryName);
      transactions.push(transaction);
    });

    await new Promise(resolve => parser.on('end', resolve));

    const categories = await this.findOrCreateCategories(
      Array.from(categoriesTitles.values()),
    );

    const createdTransactions = transactions.map(transaction => {
      const category = categories.find(
        cat => cat.title === transaction.categoryName,
      );

      if (!category) {
        throw new AppError(
          `Error: cannot create a category with name: ${transaction.categoryName}`,
          400,
        );
      }

      const { title, type, value } = transaction;

      return transactionRepository.create({
        title,
        type,
        value,
        category_id: category.id,
      });
    });

    await transactionRepository.save(createdTransactions);

    return createdTransactions;
  }

  private async findOrCreateCategories(
    categoriesTitles: string[],
  ): Promise<Category[]> {
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const foundCategories = await categoriesRepository.find({
      where: {
        title: In(categoriesTitles),
      },
    });

    const toCreateCategoriesTitle = categoriesTitles.filter(
      title => foundCategories.findIndex(cat => cat.title === title) === -1,
    );

    const newCategories = toCreateCategoriesTitle.map(categoryTitle =>
      categoriesRepository.create({ title: categoryTitle }),
    );

    await categoriesRepository.save(newCategories);
    return foundCategories.concat(newCategories);
  }
}

export default ImportTransactionsService;
