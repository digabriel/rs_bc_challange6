// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(repositoryId: string): Promise<void> {
    const repository = getCustomRepository(TransactionsRepository);
    repository.delete(repositoryId);
  }
}

export default DeleteTransactionService;
