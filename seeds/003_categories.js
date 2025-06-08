/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const seed = async knex => {
  await knex('category').del();

  const categories = [];
  let idCounter = 1;

  for (let i = 1; i <= 10; i++) {
    const level1Id = idCounter;
    categories.push({
      id: idCounter++,
      title: `Категория ${i}`,
      parent_id: null,
      slug: `category_${i}`
    });

    for (let j = 1; j <= 10; j++) {
      const level2Id = idCounter;
      categories.push({
        id: idCounter++,
        title: `Категория ${i}.${j}`,
        parent_id: level1Id,
        slug: `category_${i}_${j}`
      });

      for (let k = 1; k <= 10; k++) {
        categories.push({
          id: idCounter++,
          title: `Категория ${i}.${j}.${k}`,
          parent_id: level2Id,
          slug: `category_${i}_${j}_${k}`
        });
      }
    }
  }

  await knex('category').insert(categories);

  await knex.raw("SELECT setval('category_id_seq', (SELECT MAX(id) FROM category))");
};
