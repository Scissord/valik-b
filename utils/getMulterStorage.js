import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as File from '#models/file.js';

const url = `${process.env.URL}:${process.env.PORT}/uploads`;

export default function getMulterStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.resolve('./uploads');

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: async (req, file, cb) => {
      try {
        const extension = path.extname(file.originalname);
        const name = `${Date.now()}${extension}`;

        const createdFile = await File.create({
          link: `${url}/${name}`,
          name: name,
          originalname: file.originalname,
          mimetype: file.mimetype
        });

        if (!req.savedFiles) {
          req.savedFiles = [];
        }

        req.savedFiles.push({
          id: createdFile.id,
          mimetype: createdFile.mimetype
        });

        cb(null, name);
      } catch (err) {
        cb(err);
      }
    }
  });
}
