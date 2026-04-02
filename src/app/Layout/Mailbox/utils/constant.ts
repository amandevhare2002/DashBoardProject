export const localStorageKeys = {
  TOKEN: "token",
};

export const sortSelectOptions = [
  {
    label: "From",
    value: "FROMMAIL",
  },
  {
    label: "Subject",
    value: "SUBJECT",
  },
  {
    label: "Date",
    value: "RecieveDate",
  },
];

export const emptyFilterOption = {
  SearchByFrom: "",
  SearchByTo_CC: "",
  SearchSubject: "",
  SearchWords: "",
  AttachmentSize: "",
  StartDate: "",
  EndDate: "",
  FileExtentions: "",
  mappingTypes: [],
  vendorNames: [],
  vendorTag: []
};

export const DEBOUNCE_DELAY = 800;
