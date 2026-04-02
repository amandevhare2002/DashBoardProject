export interface MenuItemsTypes {
  menuitems: Menuitem[];
  DisplayVertical: boolean;
  ErrorMsg: string;
  Errorcode: number;
  IsIconDisplay: boolean;
  LogoPath: any;
  headerbar: Headerbar;
}

export interface Menuitem {
  PanelName: string;
  MainMenuID: number;
  MainMenuName: string;
  IsSubmenu: boolean;
  IconPathUrl: string;
  IconWidth: string;
  IconHeight: string;
  IconClassName: string;
  MenuHeaderName: string;
  submenuitems: Submenuitem[];
  submenu?: Submenu[];
  MenuHeaderID: number;
  ServerName:string;
}

export interface Submenuitem {
  MenuID: number;
  SubMenuIconClsName: string;
  SubmenuName: string;
  SubMenuSequenceNo: number;
  SubmenuIconPathUrl: string;
  IsSubmenuActive: boolean;
  DefaultDbname: string;
  DefaultTablename: string;
  PathUrl: string;
  ModuleID: string
}

export interface Submenu {
  SubMenuName: string;
  submenuitems: any;
}

export interface Headerbar {
  headerbaritems: Headerbaritem[];
}

export interface Headerbaritem {
  ItemID: number;
  ItemName: string;
  ItemType: string;
  ItemIconPath: string;
  headeritemvalues: Headeritemvalue[];
}

export interface Headeritemvalue {
  ValueID: number;
  Headervalues: string;
  HeadervalueICONPath: string;
}
