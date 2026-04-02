export interface IDynamicUI {
  ModuleHeading: string;
  ModuleID: number;
  Maxrow: number;
  Maxcol: number;
  uiitems: Uiitem[];
  extracols: any;
  accordion: any;
  tabcontain: any;
  carousel: any;
  tabledata: any;
  popup: any;
  cardbox: any;
  commonstyle: Commonstyle;
  pageheaderclass: Pageheaderclass;
}

export interface Uiitem {
  FieldID: number;
  FieldName: string;
  inputtype: string;
  PlaceHolder_Label?: string;
  fieldValue?: string;
  IsMandatory: boolean;
  IsAutoFill: boolean;
  IsCalender: boolean;
  RowIDX: number;
  ColIDX: number;
  default_RowIDX: number;
  default_ColIDX: number;
  FieldHeight: number;
  FieldWidth: number;
  uiitemsvalues?: Uiitemsvalue[] | null;
  IsClickEventAvailable: boolean;
  ClickEventURL?: string | null;
  DefaultVisibility: boolean;
  IsToolTip: boolean;
  ToolTiptext?: string | null;
  ButtonOperation?: string | null;
  IsButtonforFileUpload: boolean;
  ButtonEventURL?: string | null;
  uibuttonfields?: Uibuttonfield[] | null;
  uIstyleItems: UIstyleItems;
  id?: string;
  colspan?: string;
  dependentCol: boolean;
  mainFieldID?: {
    value: string;
    label: string;
  };
  ValuesStaticDbApiComputed?: string;
  DBColumnName?: {
    value: string;
    label: string;
  };
  Tablename?: {
    value: string;
    label: string;
  };
  DBName?: {
    value: string;
    label: string;
  };
  valueDbName?: {
    value: string;
    label: string;
  };
  valueTableName?: {
    value: string;
    label: string;
  };
  ValueColumnName?: {
    value: string;
    label: string;
  };
  SearchColumn?: {
    value: string;
    label: string;
  };
  SearchValueDropDown?: string;
  ConditionalFields?: Array<{
    value: string;
    label: string;
  }>;
  ConditionalFieldsColumns?: Array<{
    value: string;
    label: string;
  }>;
  staticfieldvalue: Array<{
    Value: string;
    IsActive: boolean;
    Seqno: number;
  }>;
  IsActive: boolean;
  AutoIDDisplay: boolean;
  IsCheckinDependentTable: boolean;
  IsForMail: boolean;
  Buttoncolorcode: string;
  dependentFields: Array<{
    MainFieldID: number;
    MainColValue: string;
    ModuleID: number;
    SubcolID: {
      value: string;
      label: string;
    };
    IsActive: boolean;
    FieldVisible: boolean;
  }>;
  databaseArray?: Array<any>;
  databaseTableArray?: Array<any>;
  dataBaseColumnArray?: {
    columnLists : Array<any>
  };
  valueDatabaseArray?: Array<any>;
  valueTableArray?: Array<any>;
  valueColumnArray?: {
    columnLists : Array<any>
  };
  isDrag?: boolean;
  updated?: boolean;
  isHeader?: boolean;
  Align?: {
    value: string;
    label: string;
  };
  dropType?: string;
  sectionsLists: Array<{
    Sec_ColIDX: number;
    Sec_RowIDX: number;
    SectionID: number;
    SectionName: string;
  }>;
  dependentSectiononFieldValues: Array<{
    MainFieldID: number;
    MainFieldValue: string;
    SectionID: number;
    SectionVisibility: boolean;
    SectionName: string;
  }>;
}

export interface Uiitemsvalue {
  UIValue?: string;
}

export interface Uibuttonfield {
  FieldID: number;
}

export interface UIstyleItems {
  bgcolorcode: string;
  forecolorcode: string;
  FontSize: string;
  FontName: string;
  IsBold: boolean;
  IsItalic: boolean;
  IsUnderLine: boolean;
  Height: string;
  Width: string;
  LeftMgn: string;
  RightMgn: string;
  TopMgn: string;
  BottomMgn: string;
}

export interface Commonstyle {
  Commonbgcolorcode: string;
  Commonforecolorcode: string;
  CommonFontSize: string;
  CommonFontName: string;
  pagecolor: string;
}

export interface Pageheaderclass {
  SeoPageTitle: string;
  SeoMetaKeywords: string;
  SeoMetaDescription: string;
  SeoCopyRight: string;
  SeoContentType: string;
  SeoRobots: string;
  SeoViewPort: string;
  SeoCharset: string;
}
