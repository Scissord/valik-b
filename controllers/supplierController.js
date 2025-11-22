import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { parse } from 'csv-parse/sync';
import knex from '#models/knex.js';
import * as Supplier from '#models/supplier.js';
import * as SupplierToken from '#models/supplier_token.js';
import * as Product from '#models/product.js';
import * as ProductImage from '#models/product_image.js';
import * as ProductImportLog from '#models/product_import_log.js';
import * as File from '#models/file.js'; 
import * as OrderItem from '#models/order_item.js';
import * as Order from '#models/order.js';
import generateTokens from '#utils/tokens/generateSupplierTokens.js';

const db = knex();

const normalizeString = value => (typeof value === 'string' ? value.trim() : '');

const parseNumber = value => {
  if (value === undefined || value === null || value === '') return null;

  const normalized = String(value).replace(',', '.').trim();
  const numeric = Number.parseFloat(normalized);
  return Number.isFinite(numeric) ? numeric : null;
};

const parsePrice = value => {
  const raw = normalizeString(value);
  if (!raw) return 0;

  const cleaned = raw.replace(/\s+/g, '').replace(',', '.');
  const numeric = Number.parseFloat(cleaned);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;

  return Math.round(numeric);
};

const parseRowNumber = (row, index) => {
  const raw = row['№'] ?? row['No'] ?? row['#'];
  const parsed = Number.parseInt(raw, 10);

  return Number.isFinite(parsed) ? parsed : index + 1;
};

const parseArticle = value => {
  const raw = normalizeString(value);
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  const MIN_INT = -2147483648;
  const MAX_INT = 2147483647;

  if (!Number.isFinite(parsed) || parsed < MIN_INT || parsed > MAX_INT) {
    return null;
  }

  return parsed;
};

const findEntityByTitle = async (tableName, title, cache, { createIfMissing = false } = {}) => {
  const normalized = normalizeString(title).toLowerCase();
  if (!normalized) return null;

  if (cache.has(normalized)) {
    return cache.get(normalized);
  }

  const record = await db(tableName)
    .select('*')
    .whereRaw('LOWER(title) = ?', [normalized])
    .whereNull('deleted_at')
    .first();

  if (record) {
    cache.set(normalized, record);
    return record;
  }

  if (createIfMissing) {
    const [created] = await db(tableName)
      .insert({ title: normalizeString(title) })
      .returning('*');
    cache.set(normalized, created || null);
    return created || null;
  }

  cache.set(normalized, null);
  return null;
};

const resolveUnitId = async providedId => {
  if (providedId) {
    const unit = await db('unit')
      .select('id')
      .where('id', providedId)
      .whereNull('deleted_at')
      .first();

    return unit?.id || null;
  }

  const unit = await db('unit').select('id').whereNull('deleted_at').orderBy('id', 'asc').first();
  if (unit?.id) return unit.id;

  const [createdUnit] = await db('unit')
    .insert({ title: 'шт' })
    .returning(['id']);

  return createdUnit?.id || null;
};

const normalizeErrorsPayload = errors =>
  JSON.stringify(
    (Array.isArray(errors) ? errors : []).map(item => ({
      row: Number.isFinite(Number(item?.row)) ? Number(item.row) : null,
      message: String(item?.message ?? '')
    }))
  );

export const supplierLogin = async (req, res) => {
  let { login, password } = req.body;

  login = login.trim();
  password = password.trim();

  // 1. Check if login and password exist
  if (!login || !password) {
    res.status(400).send({ message: 'Пожалуйста введите логин и пароль!' });
    return;
  }

  // 2. Find supplier in database
  const supplier = await Supplier.findWhereActive({ login });

  // 3. If supplier is not found
  if (!supplier) {
    res.status(400).send({ message: 'Данный поставщик не найден!' });
    return;
  }

  // 4. Check if password is correct
  const isPasswordCorrect = await bcrypt.compare(password, supplier?.password || '');

  if (!isPasswordCorrect) {
    res.status(400).send({ message: 'Неверный пароль!' });
    return;
  }

  const { accessToken, refreshToken } = generateTokens(supplier.id);

  // 4. save refreshToken in DB
  const supplier_token = await SupplierToken.findWhere({ supplier_id: supplier.id });
  const expires_at = Math.floor(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (supplier_token) {
    await SupplierToken.updateWhere(
      { supplier_id: supplier.id },
      {
        refresh_token: refreshToken,
        expires_at
      }
    );
  } else {
    await SupplierToken.create({
      supplier_id: supplier.id,
      refresh_token: refreshToken,
      expires_at
    });
  }

  // 5. send cookie
  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    httpOnly: true, // Защищает от XSS атак
    sameSite: 'strict', // Защита от CSRF атак
    secure: process.env.NODE_ENV === 'production' // Только в производственной среде
  });

  // 6. make log about ip if ip not match
  // await Log.create({

  // });

  res.status(200).send({
    message: 'ok',
    supplier,
    accessToken
  });
};

export const supplierRegistration = async (req, res) => {
  const data = req.body;

  const salt = await bcrypt.genSalt(10);
  data.password = await bcrypt.hash(data.password, salt);

  const supplier = await Supplier.create(data);
  delete supplier.password;

  const { accessToken, refreshToken } = generateTokens(supplier.id);

  const supplier_token = await SupplierToken.findWhere({ supplier_id: supplier.id });

  const expires_at = Math.floor(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if (supplier_token) {
    await SupplierToken.updateWhere(
      { supplier_id: supplier.id },
      {
        refresh_token: refreshToken,
        expires_at
      }
    );
  } else {
    await SupplierToken.create({
      supplier_id: supplier.id,
      refresh_token: refreshToken,
      expires_at
    });
  }

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
    httpOnly: true, // Защищает от XSS атак
    sameSite: 'strict', // Защита от CSRF атак
    secure: process.env.NODE_ENV === 'production' // Только в производственной среде
  });

  res.status(200).send({
    message: 'Supplier created successfully',
    accessToken,
    supplier
  });
};

export const supplierLogout = async (req, res) => {
  res.cookie('refreshToken', '', { maxAge: 0 });
  console.log('logout successfully');
  res.status(200).send({ message: 'Successfully logout' });
};

export const supplierRefresh = async (req, res) => {
  // 1. check for refreshToken
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).send({
      message: 'Произошла ошибка!, No refresh token!'
    });

  // 2. Try to decode refreshToken
  try {
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // 3. Check if supplier exist
    const supplier = await Supplier.find(decodedRefresh.supplierId);

    if (!supplier)
      return res.status(401).send({
        message: 'Поставщик не найден!'
      });

    // 4. if supplier exist and we get decodedRefresh, we generate JWT TOKEN
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(
      supplier.id
    );

    const expires_at = Math.floor(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // 5. save refreshToken in DB
    await SupplierToken.updateWhere(
      { supplier_id: supplier.id },
      {
        refresh_token: newRefreshToken,
        expires_at
      }
    );

    // 6. send cookie
    res.cookie('refreshToken', newRefreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
      httpOnly: true, // Защищает от XSS атак
      sameSite: 'strict', // Защита от CSRF атак
      secure: process.env.NODE_ENV === 'production' // Только в производственной среде
    });

    res.status(200).send({
      message: 'ok',
      newAccessToken
    });
  } catch (err) {
    // session expired
    res.status(401).send({
      message: 'Сессия окончена!'
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const supplier_id = req.supplier.id;

    const data = await Product.getForSupplier(limit, page, supplier_id);

    res.status(200).send(data);
  } catch (err) {
    console.log('Error in get products for suppliers controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const importProducts = async (req, res) => {
  const supplier_id = req.supplier.id;

  let logEntry;

  try {
    logEntry = await ProductImportLog.create({
      supplier_id,
      status: 'processing',
      row_count: 0,
      errors: normalizeErrorsPayload([])
    });

    if (!req.file) {
      await ProductImportLog.update(logEntry.id, {
        status: 'failed',
        row_count: 0,
        errors: normalizeErrorsPayload([{ row: null, message: 'CSV файл не был загружен' }])
      });

      res.status(400).send({ message: 'CSV файл обязателен', importId: logEntry.id });
      return;
    }

    const allowedMimes = ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'];
    if (req.file.mimetype && !allowedMimes.includes(req.file.mimetype)) {
      await ProductImportLog.update(logEntry.id, {
        status: 'failed',
        row_count: 0,
        errors: [{ row: null, message: 'Некорректный тип файла, ожидается CSV' }]
      });

      res
        .status(400)
        .send({ message: 'Некорректный тип файла, ожидается CSV', importId: logEntry.id });
      return;
    }

    let rows = [];
    try {
      rows = parse(req.file.buffer, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        trim: true
      });
    } catch (err) {
      await ProductImportLog.update(logEntry.id, {
        status: 'failed',
        row_count: 0,
        errors: normalizeErrorsPayload([
          { row: null, message: `Не удалось разобрать CSV: ${err.message}` }
        ])
      });

      res.status(400).send({ message: 'Не удалось прочитать CSV файл', importId: logEntry.id });
      return;
    }

    if (!rows.length) {
      await ProductImportLog.update(logEntry.id, {
        status: 'failed',
        row_count: 0,
        errors: normalizeErrorsPayload([{ row: null, message: 'CSV файл не содержит строк для импорта' }])
      });

      res.status(400).send({ message: 'CSV файл пустой', importId: logEntry.id });
      return;
    }

    const brandCache = new Map();
    const categoryCache = new Map();
  const errors = [];

  const categoryAliasMap = {
    'шпатлевка': 'Шпатлёвки',
    'шпатлевки': 'Шпатлёвки',
    'шпатлёвка': 'Шпатлёвки',
    'штукатурка': 'Декоративные штукатурки',
    'краски и лаки': 'Лаки, краски, клей',
    'грунтовка': 'Грунтовки'
  };

  const unitIdInput = req.body?.unit_id ? Number(req.body.unit_id) : null;
  const unit_id = await resolveUnitId(unitIdInput);
  if (!unit_id) {
    await ProductImportLog.update(logEntry.id, {
      status: 'failed',
        row_count: rows.length,
        errors: normalizeErrorsPayload([
          { row: null, message: 'Не удалось определить единицу измерения' }
        ])
      });

      res
        .status(400)
        .send({ message: 'Не удалось определить единицу измерения', importId: logEntry.id });
      return;
    }

    const productsToInsert = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = parseRowNumber(row, index);
      const title = normalizeString(row['Наименование']);
      const brandTitle = normalizeString(row['Бренд']);
      const rawCategoryTitle = normalizeString(row['Категория']);
      const categoryTitle =
        categoryAliasMap[rawCategoryTitle.toLowerCase?.() ? rawCategoryTitle.toLowerCase() : ''] ||
        rawCategoryTitle;
      const description = normalizeString(row['Описание']) || '';

      if (!title) {
        errors.push({ row: rowNumber, message: 'Не заполнено поле "Наименование"' });
        continue;
      }

      if (!brandTitle) {
        errors.push({ row: rowNumber, message: 'Не указан бренд' });
        continue;
      }

      if (!categoryTitle) {
        errors.push({ row: rowNumber, message: 'Не указана категория' });
        continue;
      }

    const brand = await findEntityByTitle('brand', brandTitle, brandCache, { createIfMissing: true });

    const category = await findEntityByTitle('category', categoryTitle, categoryCache, {
      createIfMissing: true
    });

    const article = parseArticle(row['Артикул']);

    const weight = parseNumber(row['Вес_кг']);
    const width = parseNumber(row['Ширина']);
    const height = parseNumber(row['Высота']);
      const price =
        parsePrice(row['Цена продажи']) ??
        parsePrice(row['Цена']) ??
        parsePrice(row['price']) ??
        0;

    productsToInsert.push({
      title,
      description,
      brand_id: brand.id,
        unit_id,
        category_id: category.id,
        supplier_id,
        article: Number.isFinite(article) ? article : null,
        weight,
        width,
        height,
        price,
        rating: 0
      });
    }

    let inserted = [];
    if (productsToInsert.length) {
      try {
        inserted = await Product.createMany(productsToInsert);
      } catch (err) {
        errors.push({ row: null, message: `Ошибка сохранения товаров: ${err.message}` });
      }
    }

    const status = errors.length === 0 ? 'success' : inserted.length ? 'partial' : 'failed';

    await ProductImportLog.update(logEntry.id, {
      status,
      row_count: rows.length,
      errors: normalizeErrorsPayload(errors)
    });

    res.status(status === 'failed' ? 400 : 200).send({
      importId: logEntry.id,
      imported: inserted.length,
      skipped: rows.length - inserted.length,
      errors
    });
  } catch (err) {
    console.log('Error in import products for suppliers controller', err.message);

    if (logEntry) {
      await ProductImportLog.update(logEntry.id, {
        status: 'failed',
        errors: normalizeErrorsPayload([
          { row: null, message: 'Внутренняя ошибка при импорте товаров' }
        ])
      });
    }

    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const createPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier_id = req.supplier.id;

    const product = await Product.find(id);
    if (+product.supplier_id !== +supplier_id) {
      res.status(400).send({
        message: 'Данный продукт не относится к поставщику!'
      });
      return;
    }

    const incomingFiles = Array.isArray(req.savedFiles)
      ? req.savedFiles
      : Array.isArray(req.files)
      ? req.files
      : [];

    for (const file of incomingFiles) {
      if (file.mimetype?.startsWith('image/')) {
        await ProductImage.create({
          product_id: product.id,
          file_id: file.id
        });
      }
    }

    res.status(200).send({ message: 'OK' });
  } catch (err) {
    console.log('Error in create photos for suppliers controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { link } = req.body;
    const supplier_id = req.supplier.id;

    const product = await Product.find(id);
    if (+product.supplier_id !== +supplier_id) {
      res.status(400).send({
        message: 'Данный продукт не относится к поставщику!'
      });
      return;
    }

    console.log(id);
    console.log(req.body);

    const file = await File.findWhere({ link });
    console.log(file);
    const updated_product_image = await ProductImage.softDeleteWhere({ product_id: id, file_id: file.id });

    console.log('Успешно удалил файл');

    res.status(200).send(updated_product_image);
  } catch (err) {
    console.log('Error in delete photos for suppliers controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const findProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier_id = req.supplier.id;

    const product = await Product.find(id);
    if (+product.supplier_id !== +supplier_id) {
      res.status(400).send({
        message: 'Данный продукт не относится к поставщику!'
      });
      return;
    }

    res.status(200).send(product);
  } catch (err) {
    console.log('Error in get products for suppliers controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const supplier_id = req.supplier.id;
    const data = req.body;
    const product = await Product.create({
      ...data,
      supplier_id
    });

    const incomingFiles = Array.isArray(req.savedFiles)
      ? req.savedFiles
      : Array.isArray(req.files)
      ? req.files
      : [];

    for (const file of incomingFiles) {
      if (file.mimetype?.startsWith('image/')) {
        await ProductImage.create({
          product_id: product.id,
          file_id: file.id
        });
      }
    }

    return res.status(200).send(product);
  } catch (err) {
    console.log('Error in create product for supplier controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const supplier_id = req.supplier.id;

    // check if this product related to supplier
    const product = await Product.find(id);
    if (+product.supplier_id !== +supplier_id) {
      res.status(400).send({
        message: 'Данный продукт не относится к поставщику!'
      });
      return;
    }

    const updated_product = await Product.update(id, data);

    res.status(200).send(updated_product);
  } catch (err) {
    console.log('Error in update product for supplier controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const supplier_id = req.supplier.id;

    // check if this product related to supplier
    const product = await Product.find(id);
    if (+product.supplier_id !== +supplier_id) {
      res.status(400).send({
        message: 'Данный продукт не относится к поставщику!'
      });
      return;
    }

    const updated_product = await Product.softDelete(id);

    res.status(200).send(updated_product);
  } catch (err) {
    console.log('Error in delete product for supplier controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const getOwnOrderItems = async (req, res) => {
  try {
    const supplier_id = req.supplier.id;
    const { status, limit, page } = req.query;
    const items = await OrderItem.getForSupplier(supplier_id, { status, limit, page });
    res.status(200).send(items);
  } catch (err) {
    console.log('Error in get own order items controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const updateOwnOrderItemStatus = async (req, res) => {
  try {
    const supplier_id = req.supplier.id;
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined || status === null) {
      res.status(400).send({ message: 'Не указан статус!' });
      return;
    }

    const updated = await OrderItem.updateStatusOwned(id, supplier_id, status);
    if (!updated) {
      res.status(404).send({ message: 'Позиция не найдена или не принадлежит поставщику' });
      return;
    }

    // Попробуем автообновить заказ, если все позиции достигли этого статуса
    await Order.updateStatusIfAllItems(updated.order_id, status);

    res.status(200).send(updated);
  } catch (err) {
    console.log('Error in update own order item status controller', err.message);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
