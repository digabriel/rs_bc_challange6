import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'tmp'),
    filename(request, file, callback) {
      const fileId = uuidv4();
      const fileName = `${fileId}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
