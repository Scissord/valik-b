import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Инициализация клиента S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const upload = async (req, res) => {
  try {
    const file = req.files.file;

    const fileExtension = path.extname(file.name);
    const fileName = crypto.randomUUID() + fileExtension;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    res.status(200).json({ message: 'Файл успешно загружен', key: fileName });
  } catch (error) {
    console.error('Ошибка при загрузке файла:', error);
    res.status(500).json({ error: 'Ошибка при загрузке файла' });
  }
};

export const getFileUrl = async (req, res) => {
  try {
    const key = req.query.key || 'b0b7fe1e-fdff-49ec-bbe0-776a9fc3bbcd.doc';

    if (!key) {
      return res.status(400).json({ error: 'Отсутствует параметр key' });
    }

    const bucket = process.env.S3_BUCKET_NAME;
    const region = process.env.AWS_REGION || 'eu-central-1'; // замените на ваш регион, если отличается

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    res.status(200).json({ url });
  } catch (error) {
    console.error('Ошибка при формировании публичного URL:', error);
    res.status(500).json({ error: 'Ошибка при формировании URL' });
  }
};
