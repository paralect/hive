import _ from 'lodash';
import MongoServiceError from './mongo-service-error';

class MongoQueryService<TDoc = any> {
  _collection: any;
  _options: any;
  name: string;
  aggregate: any;
  count: any;
  distinct: any;
  geoHaystackSearch: any;
  indexes: any;
  mapReduce: any;
  stats: any;

  constructor(collection, options = {}) {
    this._collection = collection;
    this._options = options;

    this.name = collection.name;

    this.aggregate = collection.aggregate;
    this.count = collection.count;
    this.distinct = collection.distinct;
    this.geoHaystackSearch = collection.geoHaystackSearch;
    this.indexes = collection.indexes;
    this.mapReduce = collection.mapReduce;
    this.stats = collection.stats;
  }

  async find(query = {}, opt = { perPage: 100, page: 0 }): Promise<{ results: TDoc[]; pagesCount?: number; count?: number }> {
    const options = _.cloneDeep(opt);
    const { page, perPage } = options;
    const hasPaging = page > 0;
    if (hasPaging) {
      options.skip = (page - 1) * perPage;
      options.limit = perPage;
    }
    delete options.perPage;
    delete options.page;

    const results = await this._collection.find(query, options);
    if (!hasPaging) {
      return {
        results,
      };
    }

    const countOptions = {};
    if (options.session) countOptions.session = options.session;
    const count = await this._collection.count(query, countOptions);
    const pagesCount = Math.ceil(count / perPage) || 1;

    return {
      pagesCount,
      results: results.map(doc => {
        return _.omit(doc, opt.isIncludeSecureFields ? [] : this._options.secureFields || []);
      }),
      count,
    };
  }

  async findOne(query = {}, options = {}): Promise<TDoc | null> {
    const { results } = await this.find(query, { limit: 2, ...options });

    // if (results.length > 1) {
    //   throw new MongoServiceError(
    //     MongoServiceError.MORE_THAN_ONE,
    //     `findOne: More than one document return for query ${JSON.stringify(
    //       query
    //     )}`
    //   );
    // }
    let result = results[0] || null;

    if (result && !options.isIncludeSecureFields) {
      result = _.omit(result as any, this._options.secureFields || []) as TDoc;
    }

    return result as TDoc | null;
  }

  async exists(query, options = {}): Promise<boolean> {
    const count = await this.count(query, { limit: 1, ...options });
    return count > 0;
  }
}

export default MongoQueryService;
