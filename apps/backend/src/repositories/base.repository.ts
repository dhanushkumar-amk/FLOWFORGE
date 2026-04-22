import type {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  SortOrder,
  UpdateQuery,
} from "mongoose";

export interface FindManyOptions<T> {
  projection?: ProjectionType<T>;
  sort?: Record<string, SortOrder>;
  skip?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export abstract class BaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  async findById(id: string, options?: QueryOptions<T>): Promise<T | null> {
    return this.model.findById(id, null, options).lean<T>().exec();
  }

  async findOne(filter: FilterQuery<T>, options?: QueryOptions<T>): Promise<T | null> {
    return this.model.findOne(filter, null, options).lean<T>().exec();
  }

  async findMany(filter: FilterQuery<T> = {}, options: FindManyOptions<T> = {}): Promise<T[]> {
    const query = this.model.find(filter, options.projection).lean<T[]>();

    if (options.sort) {
      query.sort(options.sort);
    }

    if (typeof options.skip === "number") {
      query.skip(options.skip);
    }

    if (typeof options.limit === "number") {
      query.limit(options.limit);
    }

    return query.exec();
  }

  async create(data: Partial<T>): Promise<T> {
    const document = await this.model.create(data);
    return document.toObject<T>();
  }

  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      })
      .lean<T>()
      .exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async paginate(
    filter: FilterQuery<T> = {},
    page = 1,
    limit = 20,
    options: Omit<FindManyOptions<T>, "skip" | "limit"> = {},
  ): Promise<PaginatedResult<T>> {
    const normalizedPage = Math.max(1, page);
    const normalizedLimit = Math.max(1, limit);
    const skip = (normalizedPage - 1) * normalizedLimit;

    const [data, total] = await Promise.all([
      this.findMany(filter, {
        ...options,
        skip,
        limit: normalizedLimit,
      }),
      this.count(filter),
    ]);

    return {
      data,
      total,
      page: normalizedPage,
      pages: Math.ceil(total / normalizedLimit),
    };
  }
}
