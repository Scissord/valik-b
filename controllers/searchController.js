import es from '#services/elastic_search/es.js';
import create_indexes from '#services/elastic_search/create_indexes.js';

export const search = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'No search term provided' });
  }

  try {
    const result = await es.search({
      index: ['products', 'brands', 'categories'],
      query: {
        multi_match: {
          query: q,
          fields: ['title^3'],
          fuzziness: 'AUTO'
        }
      }
    });

    const hits = result.hits.hits.reduce((acc, hit) => {
      const index = hit._index;
      if (!acc[index]) acc[index] = [];
      acc[index].push(hit._source);
      return acc;
    }, {});

    res.status(200).json(hits);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

export const createIndex = async (req, res) => {
  try {
    await create_indexes();
    res.status(200).json('ok');
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};
