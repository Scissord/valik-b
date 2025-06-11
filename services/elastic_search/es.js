import { Client } from '@elastic/elasticsearch'

const es = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: '5teqH7OCP2o3SAwfrHTR'
  },
  tls: {
    rejectUnauthorized: false
  },
  compatibility: true
})

// const exists = await es.indices.exists({ index: 'products_search' });
// console.log(exists);

export default es
