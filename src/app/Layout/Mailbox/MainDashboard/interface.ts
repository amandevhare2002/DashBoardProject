export interface BankAndCreditCard {
    companiesLists: CompaniesList[]
    ErrorMessage: any
  }
  
  export interface CompaniesList {
    Companyname: string
    assetTypes: AssetType[]
  }
  
  export interface AssetType {
    Assetname: string
    assetValues: AssetValue[]
  }
  
  export interface AssetValue {
    AssetName: string
    Name: string
    Value: string
    YatraBalance: string
    ApprovalBalance: string
    Limit?: string
  }

  export type ITransactions = Transactions[]

export interface Transactions {
  AccountCode: string
  DESCRIPTION: string
  Amount?: string
  TransDate: string
  Company: string
  status: string
  Voucherno?: string
  AppID?: string
}
