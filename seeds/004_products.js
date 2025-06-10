/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  await knex('product').del();

  const categories = [];
  let idCounter = 1;

  for (let i = 1; i <= 10; i++) {
    const level1Id = idCounter;
    categories.push({
      id: idCounter++,
      name: `Категория ${i}`,
      parent_id: null,
      slug: `category_${i}`
    });

    for (let j = 1; j <= 10; j++) {
      const level2Id = idCounter;
      categories.push({
        id: idCounter++,
        name: `Категория ${i}.${j}`,
        parent_id: level1Id,
        slug: `category_${i}_${j}`
      });

      for (let k = 1; k <= 10; k++) {
        categories.push({
          id: idCounter++,
          name: `Категория ${i}.${j}.${k}`,
          parent_id: level2Id,
          slug: `category_${i}_${j}_${k}`
        });
      }
    }
  }

  const products = [];
  let idProductCounter = 1;

  for (const category of categories) {
    for (let i = 1; i <= 10; i++) {
      products.push({
        id: idProductCounter++,
        title: `Продукт ${idProductCounter}`,
        brand_id: 1,
        unit_id: 1,
        description: 'Очень хороший товар!',
        price: 100,
        supplier_id: Math.floor(Math.random() * 3) + 1,
        category_id: category.id
      });
    }
  }

  const chunkSize = 1000;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize);
    await knex('product').insert(chunk);
  }

  await knex.raw("SELECT setval('product_id_seq', (SELECT MAX(id) FROM product))");
};
