export interface IEntityService {
  findById(id: string): Promise<any>;
}
