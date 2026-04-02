export const SET_SELECTED_FOLDER = "SET_SELECTED_FOLDER";
export const SET_MAIL_FOLDER_LIST = "SET_MAIL_FOLDER_LIST";
export const SET_MAIL_USER_ID = "SET_MAIL_USER_ID";
export const SET_MODULE_LIST = 'SET_MODULE_LIST';

export const setSelectedFolder = (selectedFolder: any) => ({
  type: SET_SELECTED_FOLDER,
  selectedFolder,
});

export const setMailFolderList = (mailFolderList: any) => ({
  type: SET_MAIL_FOLDER_LIST,
  mailFolderList,
});

export const setModuleList = (moduleList: any) => ({
  type: SET_MODULE_LIST,
  moduleList,
});

export const setMailUserId = (mailUserId: any) => ({
  type: SET_MAIL_USER_ID,
  mailUserId,
});

const initialState = {
  selectedFolder: "Deleted Items",
  mailFolderList: [],
  moduleList:[],
  mailUserId: '',
};

export default function mailReducer(state = initialState, action: any) {
  switch (action.type) {
    case SET_SELECTED_FOLDER:
      return {
        ...state,
        selectedFolder: action.selectedFolder,
      };
  
    case SET_MAIL_FOLDER_LIST:
      return {
        ...state,
        mailFolderList: action.mailFolderList,
      };
      case SET_MAIL_USER_ID:
        return {
          ...state,
          mailUserId: action.mailUserId,
        };
      case SET_MODULE_LIST:
        return {
          ...state,
          moduleList: action.moduleList
        }

    default:
  }
  return state;
}
