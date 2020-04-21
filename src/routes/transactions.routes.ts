import { Router } from 'express';
import multer from 'multer';

import CreateTransactionService from '../services/CreateTransactionService';
import GetAllTransactionsService from '../repositories/GetAllTransactionsService';
import DeleteTransactionService from '../services/DeleteTransactionService';

import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const service = new GetAllTransactionsService();
  const transactions = await service.execute();
  return response.json(transactions);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const service = new CreateTransactionService();
  const transaction = await service.execute({
    title,
    value,
    type,
    categoryName: category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const service = new DeleteTransactionService();
  await service.execute(id);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { path } = request.file;

    const service = new ImportTransactionsService();
    const transactions = await service.execute(path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
