export type Supplier = Products[];

export interface Products {
  product: string;
  productTypes: ProductType[];
}

export interface ProductType {
  producttype: string;
  productNames: ProductName[];
  suppliers: Company[];
}

export interface ProductName {
  ProdName: string;
}

export interface Company {
  SupplierName: string;
  BranchCountNew: number;
  branches: Branch[];
}

export interface Branch {
  SupID: string;
  BranchCount: number;
  BranchName: string;
  Company?: string;
  departmentTypes: DepartmentType[];
}

export interface DepartmentType {
  DepartmentName: string;
  PersonCount: number;
  Company?: string;
  suppliersperson: Suppliersperson[];
}

export interface Suppliersperson {
  PersonName: string;
  Company?: string;
  PersonID: string;
  EmailSentType: string;
}
