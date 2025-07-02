import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import * as Supplier from '#models/supplier.js';
import * as SupplierToken from '#models/supplier_token.js';
import * as Product from '#models/product.js';
import * as ProductImage from '#models/product_image.js';
import generateTokens from '#utils/tokens/generateSupplierTokens.js';

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

    for (const file of req.savedFiles) {
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
