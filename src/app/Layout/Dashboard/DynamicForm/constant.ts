export const InitalState = {
  ErrorMessage: "",
  ModuleID: "0",
  ModuleName: "",
  IsActive: false,
  MenuID: "0",
  DisplayTabular: false,
  IsIDGenerate: false,
  IDPrefix: "",
  IDTypeSearch: "",
  SeoPageTitle: "",
  SeoMetaKeywords: "",
  SeoMetaDescription: "",
  SeoCopyRight: "",
  SeoContentType: "",
  SeoRobots: "",
  SeoViewPort: "",
  SeoCharset: "",
  PanelID: "0",
  MainMenuID: '0'
};

export interface PannelListT {
  PanelID: number;
  PanelName: string;
  IsActive: boolean;
  Vertical: boolean;
  MainLogoURL: string;
}

export interface MenuListType {
  ErrorMessage: string
  mainMenuItems: MainMenuItem[]
}

export interface MainMenuItem {
  PanelID: number
  MainMenuID: number
  MainMenuName: string
  MainMenuLogopath: string
  IsActive: boolean
  IconHeight: string
  IconWidth: string
  IconClassName: string
}


export const MainMenuState = {
  PanelID: 0,
  MainMenuID: 0,
  MainMenuName: '',
  MainMenuLogopath: '',
  IsActive: false,
  IconHeight: '',
  IconWidth: '',
  IconClassName: '',
}