import type { FilterQuery, UpdateQuery } from "mongoose";

export interface RepositoryModel<TDocument> {
  create(data: Partial<TDocument>): Promise<TDocument>;
  find(filter?: FilterQuery<TDocument>): {
    lean(): Promise<TDocument[]>;
  };
  findById(id: string): {
    lean(): Promise<TDocument | null>;
  };
  findByIdAndUpdate(id: string, data: UpdateQuery<TDocument>, options: { new: boolean }): {
    lean(): Promise<TDocument | null>;
  };
  findByIdAndDelete(id: string): Promise<TDocument | null>;
}

export abstract class BaseRepository<TDocument> {
  protected constructor(protected readonly model: RepositoryModel<TDocument>) {}

  async findById(id: string): Promise<TDocument | null> {
    return this.model.findById(id).lean();
  }

  async findAll(filter: FilterQuery<TDocument> = {}): Promise<TDocument[]> {
    return this.model.find(filter).lean();
  }

  async create(data: Partial<TDocument>): Promise<TDocument> {
    return this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<TDocument>): Promise<TDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await this.model.findByIdAndDelete(id);
    return Boolean(deleted);
  }
}
