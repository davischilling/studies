export interface IRepository<T = any> {
  create: (params: any) => Promise<string | null>
  find: (params: any) => Promise<{ items: number; data: T[] }>
  findById: (id: string) => Promise<T | null>
  findOneByParam: (param: any) => Promise<T | null>
  findByIdAndUpdate: (id: string, updatedObj: any) => Promise<string | null>
  findByIdAndDelete: (id: string) => Promise<string | null>
}
