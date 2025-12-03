import * as Product from '#models/product.js';
import * as Brand from '#models/brand.js';
import * as Category from '#models/category.js';
import es from '#services/elastic_search/es.js';

async function create_indexes() {
  // for (const index of ['products', 'brands', 'categories']) {
  //   try {
  //     await es.indices.delete({ index });
  //   } catch (err) {
  //     if (err.meta?.statusCode !== 404) console.error(`Ошибка удаления индекса ${index}:`, err);
  //   }
  // };

  const products = await Product.getForSearch();
  const brands = await Brand.getForSearch();
  const categories = await Category.getForSearch();

  const chunkSize = 500;

  const bulkInsert = async (index, items, mapFn) => {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);

      const body = chunk.flatMap(mapFn);

      try {
        const { errors, items: resItems } = await es.bulk({ refresh: true, body });
        if (errors) {
          const errored = resItems.filter(x => x.index && x.index.error);
          console.error(`❌ Ошибки в ${index} [${i}–${i + chunk.length}]`, errored);
        } else {
          console.log(`✅ ${index}: загружено [${i}–${i + chunk.length}]`);
        }
      } catch (error) {
        console.error(`❌ Ошибка при вставке в ${index} [${i}–${i + chunk.length}]`, error);
      }
    }
  };

  await bulkInsert('products', products, product => [
    { index: { _index: 'products' } },
    {
      id: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      images: product.images,
    }
  ]);

  await bulkInsert('brands', brands, brand => [
    { index: { _index: 'brands' } },
    {
      id: brand.id,
      title: brand.title,
    }
  ]);

  await bulkInsert('categories', categories, category => [
    { index: { _index: 'categories' } },
    {
      id: category.id,
      title: category.title,
    }
  ]);
}

export default create_indexes;
