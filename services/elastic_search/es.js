import { Client } from '@elastic/elasticsearch';

const es = new Client({
  node: 'http://localhost:9200'
});

// const exists = await es.indices.exists({ index: 'products' });
// console.log(exists);

export default es;
