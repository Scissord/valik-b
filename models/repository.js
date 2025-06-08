import knex from './knex.js';

const db = knex();

const repository = tableName => {
  return {
    // get all records
    getAll: async (order_by = 'id', sort_order = 'asc') => {
      return await db(tableName).select('*').orderBy(order_by, sort_order);
    },

    getActive: async (order_by = 'id', sort_order = 'asc') => {
      return await db(tableName).select('*').orderBy(order_by, sort_order).whereNull('deleted_at');
    },

    // get by query
    getWhere: async (query, order_by = 'id', sort_order = 'desc') => {
      return await db(tableName).select('*').where(query).orderBy(order_by, sort_order);
    },

    // get by query and deleted_at null
    getWhereActive: async query => {
      return await db(tableName).select('*').where(query).andWhere('deleted_at', null);
    },

    getWhereIn: async (field, values) => {
      return await db(tableName).select('*').whereIn(field, values);
    },

    // create record
    create: async data => {
      const [createdRecord] = await db(tableName).insert(data).returning('*');

      return createdRecord;
    },

    createMany: async data => {
      const createdRecords = await db(tableName).insert(data).returning('*');

      return createdRecords;
    },

    // update record data by id
    update: async (id, data) => {
      data.updated_at = Math.floor(Date.now() / 1000);
      const [updatedRecord] = await db(tableName).where('id', id).update(data).returning('*');

      return updatedRecord;
    },

    updateWhere: async (query, data) => {
      data.updated_at = Math.floor(Date.now() / 1000);
      const [updatedRecord] = await db(tableName).where(query).update(data).returning('*');

      return updatedRecord;
    },

    updateWhereIn: async (ids, data) => {
      data.updated_at = Math.floor(Date.now() / 1000);
      const updatedRecords = await db(tableName).whereIn('id', ids).update(data).returning('*');

      return updatedRecords;
    },

    // soft delete record by id
    softDelete: async id => {
      const timestamp = Math.floor(Date.now() / 1000);
      const [deletedRecord] = await db(tableName)
        .where('id', id)
        .update('deleted_at', timestamp)
        .returning('*');

      return deletedRecord;
    },

    // hard delete record by id
    hardDelete: async id => {
      await db(tableName).where('id', id).del();

      return id;
    },

    // hard delete all records
    hardDeleteAll: async () => {
      return await db(tableName).del();
    },

    // hard delete by array of ids
    hardDeleteByIds: async ids => {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Invalid input: ids must be a non-empty array.');
      }

      await db(tableName).whereIn('id', ids).del();

      return ids;
    },

    // find record by id
    find: async id => {
      const record = await db(tableName).select('*').where('id', id).first();

      return record;
    },

    // find by query
    findWhere: async query => {
      const record = await db(tableName).select('*').where(query).first();

      return record;
    },

    // find by query with deleted_at = null
    findWhereActive: async query => {
      const record = await db(tableName).select('*').where(query).where('deleted_at', null).first();

      return record;
    }
  };
};

export default repository;
