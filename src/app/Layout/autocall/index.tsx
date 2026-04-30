"use client";
import UserUploadFiles from "@/app/Layout/autocall/_components/UserUploadedFiles";
import Loading from "@/app/loading";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import Commissions from "./_components/commissions";
import PersonalDetails from "./_components/peronal-details";
import { ConfirmProvider } from "material-ui-confirm";
// Icons
import MainTable from "@/utils/table";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DialerSipIcon from "@mui/icons-material/DialerSip";
import DialpadIcon from "@mui/icons-material/Dialpad";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import EditCalendarIcon from "@mui/icons-material/EditCalendar";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PhoneMissedIcon from "@mui/icons-material/PhoneMissed";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import QuizIcon from "@mui/icons-material/Quiz";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import moment from "moment";
import Tooltip from "rc-tooltip";
import ReactDatePicker from "react-datepicker";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Select from "react-select";
import { DndProvider, XYCoord, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AddNewField } from "./_components/AddNewField";
import * as signalR from "@microsoft/signalr";
import { toast } from "react-toastify";
import { ButtonField } from "./_components/Fields/ButtonField";
import { DropDownField } from "./_components/Fields/DropDown";
import { DateField } from "./_components/Fields/DateField";
import { BoxField } from "./_components/Fields/Box";
import { LableField } from "./_components/Fields/Lable";
import { promiseOptions } from "@/utils";
import ExcelUploadSection from "@/utils/excelFileUpload";
import { useSelector } from "react-redux";
import ExcelUploadUtility from "@/utils/excelFileUpload";
import AsyncSelect from "react-select/async";
import { RCDatePicker } from "../Common/DatePicker";
import { HubConnectionState } from "@microsoft/signalr";
import Pako from "pako";
import PDFSizeModal from "../Common/pdfSizeModal";
import PDFPreviewModal from "../Common/PdfPreviwe";
import GlobalIframe, { showIframe } from "../Common/CmnIframe";
import NewTablePage from "@/utils/newTable";
import SearchDropArea from "./_components/SearchBoxContainer";
import { CSSProperties } from "styled-components";
import { OuterAdvancedTabs } from "./_components/AdvancedOutertabs";

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

export interface PDFSize {
  PageType: string;
  PageHeight: string;
  PageWidth: string;
}

export interface PDFSettings {
  size: PDFSize;
  orientation: "portrait" | "landscape";
}
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}
const AutoCallPage = ({
  recordID,
  moduleID,
  isModalOpen,
  defaultVisible,
  postedJson,
  replaceApiUrl,
}: any) => {
  console.log("moduleIDmoduleID", moduleID);
  const sidebarRef = useRef<any>(null);
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { mainMenuID, menuID, mainColValue } = router.query;
  const [tab, setTab] = useState("");
  const [information, setInformation] = useState<any>();
  const [tableBtnInfo, setTableBtnInfo] = useState([]);
  const [isFileUpload, setIsFileUpload] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [sidebar, setSideBar] = useState(false);
  const [leftTabs, setLefttabs] = useState<any>([]);
  const [searchLeadVal, setSearchLeadVal] = useState("");
  const [searchLeadData, setSearchLeadData] = useState<any>({
    tables: [],
    tableWidth: [],
    isDetailPopupOpen: false,
    cardData: [],
    defaultVisibleSearch: null,
    isFreezeHeader: false,
  });
  const [value, setValue] = useState<any>("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [iframeShow, setIframeShow] = useState(false);
  const [headerStatusBtn, setHeaderStatusBtn] = useState("");
  const [manualDialVal, setManualDialVal] = useState("");
  const [faqData, setFaqData] = useState<any>();
  const [faqType, setFaqType] = useState({ label: "", value: "" });
  const [faqSearch, setFaqSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [faqModal, setFaqModal] = useState(false);
  const [currentRecordID, setCurrentRecordID] = useState("");
  const [edit, setEdit] = useState(false);
  const [apiCall, setApiCall] = useState(false);
  const [editBtn, setEditBtn] = useState(false);
  const [newFieldValues, setNewFieldValues] = useState<any>([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [barButtons, setBarButtons] = useState<any>([]);
  const [isDrag, setIsDrag] = useState<boolean>(false);
  const [isDisable, setIsDisable] = useState<boolean>(false);

  const [isAddNewField, setIsAddNewField] = useState<boolean>(false);
  const [isCardView, setIsCardView] = useState<boolean>(false);
  const [cardViewData, setCardViewData] = useState<any>([]);
  const [buttonMaster, setButtonMaster] = useState<any>([]);
  const [handleNext, setHandleNext] = useState<any>([]);
  const [isModify, setIsModify] = useState<boolean>(false);
  const [isAddLead, setAddLead] = useState<boolean>(false);

  const previousModuleID = useRef<string | null>(null);
  const previousRecordID = useRef<string | null>(null);
  const personalDetailsRef = useRef<any>(null);
  const onChangeDates = (dates: any) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const markasFieldbool = information?.Data?.[0]?.Fields.map(
    (item: any) => item.Values?.[0]?.MarkasFilter,
  );
  const crypto = require("crypto");
  const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_KEY;

  const [filterFields, setFilterFields] = useState<any[]>([]);
  const [searchValues, setSearchValues] = useState<any>({});
  const [TableDataUpdate, setTableDataUpdate] = useState<any>([]);
  const [dropDownArray, setDropDownArray] = useState<any>([
    { value: "", label: "" },
  ]);
  const [columnSelect, setColumnSelect] = useState("");
  const [dyanmicModuleData, setDyanmicModuleData] = useState<any>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [isSocketCall, setIsSocketCall] = useState<boolean>(false);
  const [socketRecordId, setSocketRecordId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [filename, setFileName] = useState<any[]>([]);
  const [isPDFSizeModalOpen, setIsPDFSizeModalOpen] = useState(false);
  const [isPDFPreviewOpen, setIsPDFPreviewOpen] = useState(false);
  const [selectedPdfSettings, setSelectedPdfSettings] =
    useState<PDFSettings | null>(null);
  const [scopedSaveData, setScopedSaveData] = useState<{ [key: string]: any }>(
    {},
  );
  const [currentRecordContext, setCurrentRecordContext] = useState<{
    recordKey: string;
    moduleID: string;
    recordID: string;
  } | null>(null);
  const [selectedTableRows, setSelectedTableRows] = useState<any[]>([]);
  const [isSearchDrag, setIsSearchDrag] = useState<boolean>(false);
  // Add this state in AutoCallPage
  const [searchFieldPositions, setSearchFieldPositions] = useState<{
    [key: string]: any;
  }>({});
  const [autopopupdrawer, setAutopopupdrawer] = useState({
    IsPopup: true,
    IsSidedrawer: false,
    popheight: "",
    popupwidth: "",
    Pos_Trans: "",
  });
  // In AutoCallPage component, update the useEffect that initializes positions
  useEffect(() => {
    if (filterFields.length > 0) {
      const initialPositions: any = {};
      filterFields.forEach((field: any) => {
        initialPositions[field.FieldID] = {
          Rownum: field.SearchRownum || field.Rownum || 0,
          Colnum: field.SearchColnum || field.Colnum || 0,
          Width: field.SearchWidth || field.Width || "100%",
          Height: field.SearchHeight || field.Height || "38px",
          PDFRownum: field.PDFRownum || 0,
          PDFColnum: field.PDFColnum || 0,
          PDFWidth: field.PDFWidth || "100%",
          PDFHeight: field.PDFHeight || "38px",
        };
      });
      setSearchFieldPositions(initialPositions);
    }
  }, [filterFields]);

  const togglePDFSizeModal = () => {
    setIsPDFSizeModalOpen(!isPDFSizeModalOpen);
  };

  // Handle Apply in PDFSizeModal
  const handleApplyPDFSettings = () => {
    setIsPDFPreviewOpen(true); // Open PDFPreviewModal
    setIsPDFSizeModalOpen(false); // Ensure PDFSizeModal closes (optional, as toggle is called in PDFSizeModal)
  };

  // Handle closing PDFPreviewModal
  const handleClosePDFPreview = () => {
    setIsPDFPreviewOpen(false);
  };
  // const AddDropDownData = async (text: any) => {
  //   try {
  //     setLoadingDropdown(true);
  //     const columnsData = reportData?.columnsArray?.find(
  //       (reportCol: any) => reportCol.columnName.toLowerCase() === columnSelect.toLowerCase()
  //     );
  //     if (!columnsData) {
  //       return [];
  //     }
  //     const data = {
  //       Userid: localStorage.getItem('username'),
  //       Dbname: columnsData?.ReadDBName,
  //       Tabname: columnsData?.ReadtableName,
  //       Colname: columnsData?.ReadcolumnName,
  //       ServerName: columnsData?.ReadServerName,
  //       SearchText: text,
  //     };
  //     const res = await axios.post(
  //       'https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValues',
  //       data,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (res?.data?.colvalues) {
  //       const options = res.data.colvalues.map((value: any) => ({
  //         value: value.Colvalue,
  //         label: value.Colvalue,
  //       }));
  //       setDropDownArray(options);
  //       return options;
  //     }
  //     return [];
  //   } catch (error) {
  //     console.error('Error fetching dropdown values:', error);
  //     toast.error('Failed to fetch dropdown values');
  //     return [];
  //   } finally {
  //     setLoadingDropdown(false);
  //   }
  // };
  useEffect(() => {
    setSearchLeadData([]);
  }, [moduleID, menuID]);
  const promiseOptions = (inputValue: string) =>
    new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve(AddDropDownData(inputValue));
      }, 1000);
    });

  const onChangeInput = (e: any) => {
    const rowMainCol = reportData?.columnsArray?.find(
      (data: any) => data?.IsMaincol === true,
    );
    e.row[e.target.name] = e.target.value;
    setTableDataUpdate((prev: any) => {
      let tableRowData = [...prev];
      let checkRow = tableRowData.findIndex(
        (col: any) =>
          col[rowMainCol?.columnName] === e.row[rowMainCol?.columnName],
      );
      if (checkRow !== -1 && checkRow !== false) {
        tableRowData[checkRow] = e.row;
      } else {
        tableRowData.push(e.row);
      }
      return tableRowData;
    });
  };

  const onInputChange = (newValue: any, column: any) => {
    setColumnSelect(column);
  };

  // In AutoCallPage component - fix the handleSaveData function
  const handleSaveData = (modifiedData: any[]) => {
    return async () => {
      try {
        if (!modifiedData || modifiedData.length === 0) {
          console.log("No data to save");
          setEdit(false);
          setSearchLeadData({ ...searchLeadData });
          return;
        }

        console.log("Preparing to save data:", modifiedData);

        const recordsbulk = modifiedData.map((row: any) => {
          const dataOfRow = Object.keys(row)
            .map((rowKey) => {
              // Skip internal fields
              if (
                rowKey === "id" ||
                rowKey === "__originalIndex" ||
                rowKey === "fieldsDatanew"
              ) {
                return null;
              }

              const columnData = reportData?.columnsArray?.find(
                (data: any) => data?.columnName === rowKey,
              );

              if (columnData) {
                return {
                  Fieldname: rowKey,
                  FieldValue: row[rowKey] ?? "",
                  Colname: columnData?.ReadcolumnName || rowKey,
                  IsMain: columnData?.IsMaincol || false,
                };
              }
              return null;
            })
            .filter(Boolean); // Remove null entries

          return { fieldsDatanew: dataOfRow };
        });

        console.log("Prepared recordsbulk:", recordsbulk);

        const data = {
          Userid: localStorage.getItem("username"),
          ModuleID: moduleID || menuID,
          Operation: "UPDATE",
          recordsbulk,
        };

        console.log("Sending API request with data:", data);

        const res = await axios.post(
          "https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldBulk",
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        console.log("API Response:", res);

        if (res) {
          setSearchLeadData({ ...searchLeadData });
          toast.success("Data Updated Successfully!", { style: { top: 80 } });
          if (currentRecordID) {
            handleProfileInformation(currentRecordID, moduleID || menuID);
          }
          // Reset edit mode
          setEdit(false);
        }
      } catch (error) {
        console.error("Error saving data:", error);
        toast.error("Failed to update data");
      }
    };
  };

  // Create a direct save function for NewTablePage
  const handleDirectSave = async (modifiedData: any[]) => {
    console.log("AutoCallPage: handleDirectSave called with:", modifiedData);

    try {
      if (!modifiedData || modifiedData.length === 0) {
        console.log("No data to save");
        toast.info("No changes to save");
        return;
      }

      console.log("Preparing to save data:", modifiedData);

      // Transform the data for the API
      const recordsbulk = modifiedData.map((row: any) => {
        // Use the fieldsDatanew array that's already prepared in modifiedData
        if (row.fieldsDatanew && row.fieldsDatanew.length > 0) {
          return { fieldsDatanew: row.fieldsDatanew };
        }

        // Fallback: create fieldsDatanew from row data
        const dataOfRow = Object.keys(row)
          .filter(
            (key) => !["id", "__originalIndex", "fieldsDatanew"].includes(key),
          )
          .map((rowKey) => {
            const columnData = reportData?.columnsArray?.find(
              (data: any) => data?.columnName === rowKey,
            );

            return {
              Fieldname: rowKey,
              FieldValue: row[rowKey] ?? "",
              Colname: columnData?.ReadcolumnName || rowKey,
              IsMain: columnData?.IsMaincol || false,
            };
          });

        return { fieldsDatanew: dataOfRow };
      });

      console.log("Prepared recordsbulk:", recordsbulk);

      const data = {
        Userid: localStorage.getItem("username"),
        ModuleID: moduleID || menuID,
        Operation: "UPDATE",
        recordsbulk,
      };

      console.log("Sending API request with data:", data);

      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldBulk",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("API Response:", res);

      if (res) {
        // Refresh the table data
        setSearchLeadData((prev: any) => ({ ...prev }));
        toast.success("Data Updated Successfully!", { style: { top: 80 } });

        // Refresh current record if needed
        if (currentRecordID) {
          handleProfileInformation(currentRecordID, moduleID || menuID);
        }

        // Reset edit mode
        setEdit(false);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to update data");
    }
  };

  // Extract fields with MarkasFilter=true when personalDetails are loaded
  useEffect(() => {
    if (information?.Data?.[0]?.Fields) {
      const markAsFilterFields = information.Data[0].Fields.flatMap(
        (tab: any) => tab.Values.filter((field: any) => field.MarkasFilter),
      );
      setFilterFields(markAsFilterFields);

      // Initialize search values
      const initialValues: any = {};
      markAsFilterFields.forEach((field: { FieldName: string | number }) => {
        initialValues[field.FieldName] = "";
      });
      setSearchValues(initialValues);
    }
  }, [information]);

  const handleSearchInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: any,
  ) => {
    setSearchValues({
      ...searchValues,
      [field.FieldName]: e.target.value,
    });
  };

  const handleSearchDateChange = (date: Date | null, field: any) => {
    setSearchValues({
      ...searchValues,
      [field.FieldName]: date ? moment(date).format("YYYY-MM-DD") : "",
    });
  };

  const handleDropdownChange = (selectedOption: any, field: any) => {
    setSearchValues({
      ...searchValues,
      [field.FieldName]: selectedOption ? selectedOption.value : "",
    });
  };

  // In AutoCallPage component, replace the fetchDropdownDataForAllFields function
  // In AutoCallPage component, replace the fetchDropdownDataForSearchFields function with this:
  const fetchDropdownDataForSearchFields = async () => {
    try {
      setLoading(true);

      // Get dropdown fields from filterFields (which contains the search fields)
      const dropdownFields = filterFields.filter(
        (field) => field.FieldType === "DROPDOWN",
      );

      if (dropdownFields.length === 0) return;

      // Fetch dropdown data for each search dropdown field using the dynamic API URL
      const fetchPromises = dropdownFields.map(async (field) => {
        try {
          // First, try to get the APIURL from field configuration
          let apiUrl =
            field.APIURL ||
            "https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValues";

          // Build dynamic payload similar to PersonalDetails component
          const dynamicPayload = buildDynamicPayloadForSearchField(field);

          if (!dynamicPayload.Colname && !dynamicPayload.apiUrl) {
            console.error(
              `No column configuration found for field ${field.FieldName}`,
            );
            return null;
          }

          const data = {
            ...dynamicPayload,
            Userid: localStorage.getItem("username"),
            SearchText: "",
          };

          console.log("Fetching dropdown data for:", field.FieldName, {
            apiUrl,
            data,
          });

          const res = await axios.post(apiUrl, data, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (res?.data?.colvalues) {
            const options = res.data.colvalues.map((value: any) => ({
              value: value.Colvalue,
              label: value.colvaluesAlias || value.Colvalue,
              fieldnamechange: value.fieldnamechange,
              visibilityfields: value.visibilityfields,
              TabVisibility: value.TabVisibility || [],
            }));

            return {
              fieldId: field.FieldID,
              fieldName: field.FieldName,
              options: options,
              childfields: res?.data?.childfields || [],
            };
          }
          return null;
        } catch (error) {
          console.error(
            `Error fetching dropdown for field ${field.FieldName}:`,
            error,
          );
          return null;
        }
      });

      const results = await Promise.all(fetchPromises);

      // Update filterFields with dropdown data
      setFilterFields((prev) => {
        return prev.map((field) => {
          const dropdownResult = results.find(
            (r) => r?.fieldId === field.FieldID,
          );
          if (dropdownResult && field.FieldType === "DROPDOWN") {
            return {
              ...field,
              DropdownArray: dropdownResult.options || [],
              childfields: dropdownResult.childfields || [],
              APIURL:
                field.APIURL ||
                "https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValues",
            };
          }
          return field;
        });
      });
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to build dynamic payload for search fields
  const buildDynamicPayloadForSearchField = (field: any) => {
    // Similar to the buildDynamicPayload in PersonalDetails
    const payload: any = {};

    // If field has apifields configuration, use it
    if (field.apifields && Array.isArray(field.apifields)) {
      for (const config of field.apifields) {
        const { KeyName, KeyValue, KeyType, ArrayName, IsParent } = config;

        if (KeyType === "ELEMENT") {
          if (!ArrayName) {
            payload[KeyName] = field[KeyValue] ?? "";
          } else {
            if (!payload[ArrayName]) payload[ArrayName] = [];
            payload[ArrayName].push({
              [KeyName]: field[KeyValue] ?? "",
            });
          }
        }
      }
    } else {
      // Fallback to basic configuration
      payload.Servername = field.ServerName || field.ReadServername;
      payload.Dbname = field.Dbname || field.ReadDbname;
      payload.Tabname = field.Tabname || field.ReadTablename;
      payload.Colname = field.Colname || field.Readcolname;
      payload.FieldType = field.FieldType;
    }

    return payload;
  };

  // Update the AddDropDownData function to use the same approach
  const AddDropDownData = async (text: any, field?: any) => {
    try {
      setLoadingDropdown(true);

      // If field is provided, use its configuration
      const targetField =
        field || filterFields.find((f) => f.FieldID === columnSelect);
      if (!targetField) {
        console.error("Field not found for dropdown:", columnSelect);
        return [];
      }

      // Try to get APIURL from field configuration
      let apiUrl =
        targetField.APIURL ||
        "https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValues";

      // Build dynamic payload
      const dynamicPayload = buildDynamicPayloadForSearchField(targetField);

      if (!dynamicPayload.Colname && !dynamicPayload.apiUrl) {
        console.error("No column configuration available");
        return [];
      }

      const data = {
        ...dynamicPayload,
        Userid: localStorage.getItem("username"),
        SearchText: text,
      };

      console.log("Fetching dropdown options with:", { apiUrl, data });

      const res = await axios.post(apiUrl, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res?.data?.colvalues) {
        const options = res.data.colvalues.map((value: any) => ({
          value: value.Colvalue,
          label: value.colvaluesAlias || value.Colvalue,
          fieldnamechange: value.fieldnamechange,
          visibilityfields: value.visibilityfields,
          TabVisibility: value.TabVisibility || [],
        }));

        // Update the field in filterFields with new options
        setFilterFields((prev) =>
          prev.map((f) =>
            f.FieldID === targetField.FieldID
              ? {
                  ...f,
                  DropdownArray: options,
                  childfields: res?.data?.childfields || [],
                }
              : f,
          ),
        );

        return options;
      }
      return [];
    } catch (error) {
      toast.error("Failed to fetch dropdown values");
      return [];
    } finally {
      setLoadingDropdown(false);
    }
  };

  // Add this function to handle child fields when dropdown selection changes
  const handleDropdownChildFields = async (
    selectedOption: any,
    childFields: any[],
  ) => {
    try {
      // For each child field, refresh its dropdown data
      const refreshPromises = childFields.map(async (childFieldId: string) => {
        const childField = filterFields.find((f) => f.FieldID === childFieldId);
        if (childField && childField.FieldType === "DROPDOWN") {
          await AddDropDownData("", childField);
        }
      });

      await Promise.all(refreshPromises);
    } catch (error) {
      console.error("Error refreshing child fields:", error);
    }
  };

  // Call this when search page loads
  useEffect(() => {
    if (value === 4) {
      // Assuming 4 is the search page index
      console.log("Search page loaded, fetching dropdown data");
      fetchDropdownDataForSearchFields();
    }
  }, [value]);

  // Also call this when filterFields change
  useEffect(() => {
    if (filterFields.length > 0 && value === 4) {
      // Check if any dropdown fields need data
      const dropdownFieldsNeedingData = filterFields.filter(
        (field) =>
          field.FieldType === "DROPDOWN" &&
          (!field.DropdownArray || field.DropdownArray.length === 0),
      );

      if (dropdownFieldsNeedingData.length > 0) {
        console.log("Dropdown fields need data, fetching...");
        fetchDropdownDataForSearchFields();
      }
    }
  }, [filterFields]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      await fetchDropdownDataForSearchFields();
      const searchData = filterFields.map((field) => {
        const baseField = {
          Servername: field.ServerName,
          Dbname: field.Dbname,
          Tabname: field.Tabname,
          Colname: field.Colname,
          FieldType: field.FieldType,
          FieldID: field.FieldID,
        };

        const fieldValue = searchValues[field.FieldName];

        // Only include fields with non-empty values
        if (fieldValue !== null && fieldValue !== "") {
          // For date range fields
          if (field.FieldType === "DATE") {
            return {
              ...baseField,
              Values: Array.isArray(fieldValue) ? fieldValue : [],
            };
          }
          if (field.FieldType === "DROPDOWN") {
            return {
              ...baseField,
              Values: [{ Value: fieldValue }],
            };
          }

          // For normal fields
          return {
            ...baseField,
            Values: Array.isArray(fieldValue)
              ? fieldValue
              : [{ Value: fieldValue }],
          };
        }

        // If field value is empty, return null
        return null;
      });

      // Filter out null values from searchData
      const filteredSearchData = searchData.filter(Boolean);

      const result = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/SearchLeadV3",
        {
          Userid: localStorage.getItem("username"),
          ModuleID: moduleID || menuID,
          SearchData: filteredSearchData,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setFileName(result?.data?.Filename);
      if (result.data) {
        setSearchLeadData({
          tables: result.data.Tables?.Table1 || [],
          tableWidth: result.data.TableWidth || [],
          isDetailPopupOpen: result.data.IsDetailPopupOpen || false,
          cardData: result.data.cardData || [],
          defaultVisibleSearch: result.data.DefaultTabSelected || null,
          isFreezeHeader: result.data.IsFreezeHeader || false,
        });

        // PROCESS cardViewData like in old implementation
        const newCardData: any = [];
        Object.keys(result?.data?.Tables || {}).map((key: any) => {
          result?.data?.cardData?.map((response: any) => {
            const newArray: any = [];
            result?.data?.Tables[key]?.map((res: any) => {
              if (response.FieldID) {
                newArray.push(res);
              }
            });
            const newObject = {
              ...response,
              tableArray: [...newArray],
            };
            newCardData.push(newObject);
          });
        });

        const finalUpdatedArray: any = [];
        newCardData.map((res: any) => {
          if (res.tableArray.length > 0) {
            finalUpdatedArray.push(res);
          }
        });
        setCardViewData(finalUpdatedArray);
      }
    } catch (error: any) {
      toast.error("No Data Found", {
        style: { top: "110px" },
      });

      // Clear old data when error occurs
      setSearchLeadData({
        tables: [],
        tableWidth: [],
        isDetailPopupOpen: false,
        cardData: [],
        defaultVisibleSearch: null,
        isFreezeHeader: false,
      });
      setCardViewData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset table data when tab changes
    setSearchLeadData({ Table: [] });
  }, []); // Reset when `tab` changes

  const handleChange = (event: React.SyntheticEvent, newValue: any) => {
    if (newValue === value) {
      setValue("");
    } else {
      setValue(newValue);
    }
  };

  const [isLinkLoading, setIsLinkLoading] = useState(false);
  const [socketURL, setSocketURL] = useState(false);

  const [activeRecord, setActiveRecord] = useState<{
    recordID: string;
    moduleID: string;
    data: any;
  } | null>(null);
  console.log(activeRecord, "activeRecordactiveRecord");
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileInformation = async (
    recordID: string,
    moduleID: string,
    isEdit?: boolean,
    ValueType?: string,
    mainColValue?: string,
    timelineData?: any[],
    postedJson?: any[],
    replaceApiUrl?: string,
  ) => {
    setValue(2);
    const fieldID = moduleID === "349";
    setIsLoading(true);
    try {
      setIsLinkLoading(true);
      const effectiveRecordID =
        mainColValue || (isSocketCall ? socketRecordId : recordID);
      const effectiveModuleID = moduleID || menuID;
      console.log("Effective Record ID:", effectiveRecordID);
      setCurrentRecordID(effectiveRecordID);
      setLoading(true);

      if (!moduleID) {
        if (!mainMenuID) {
          setLoading(false);
          setIsLinkLoading(false);
          return;
        }
      }

      const useReplaceApi =
        replaceApiUrl && postedJson && postedJson.length > 0;
      const url = useReplaceApi
        ? replaceApiUrl
        : fieldID
          ? `https://logpanel.insurancepolicy4u.com/api/Login/AutoCallV3`
          : `https://logpanel.insurancepolicy4u.com/api/Login/AutoCall`;

      const payload: any = {
        Userid: localStorage.getItem("username"),
        ModuleID:
          effectiveRecordID === "userid"
            ? 0
            : moduleID
              ? moduleID
              : Number(menuID),
        RecordID:
          effectiveRecordID === "userid"
            ? localStorage.getItem("username")
            : effectiveRecordID,
      };

      if (postedJson && postedJson.length > 0) {
        payload.PostedJson = postedJson;
        console.log("Adding PostedJson to payload:", postedJson);
      }

      if (
        ValueType !== undefined &&
        ValueType !== null &&
        ValueType.trim() !== ""
      ) {
        payload.ValueType = ValueType;
      }

      console.log("Final API Payload:", payload);

      const result = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (result && result?.data) {
        // Check if this was a socket call and update state accordingly
        if (result.data.IsSocketCall !== undefined) {
          setIsSocketCall(result.data.IsSocketCall);
        }

        const recordKey = `${effectiveModuleID}-${effectiveRecordID}`;

        if (!scopedSaveData[recordKey]) {
          setScopedSaveData((prev) => ({
            ...prev,
            [recordKey]: {},
          }));
        }

        setCurrentRecordContext({
          recordKey,
          moduleID: effectiveModuleID,
          recordID: effectiveRecordID,
        });

        const newData: any = [];
        result?.data?.Data?.map((res: any) => {
          return {
            ...res,
            Fields: res.Fields.map((response: any) => {
              return {
                ...response,
                Values: response.Values.map((newRes: any) => {
                  newData.push({
                    FieldName: newRes.FieldName,
                    FieldValue: newRes.FieldValue,
                  });
                }),
              };
            }),
          };
        });

        setBarButtons(result?.data?.barbuttons);
        setNewFieldValues(newData);
        setInformation(result?.data);
        setSocketURL(result?.data?.SocketURL);
        setAutopopupdrawer(result?.data?.popupdrawersettings);

        // Set Tablebuttoncss BEFORE setting loading to false
        if (result.data.Tablebuttoncss) {
          console.log("Setting tableBtnInfo to:", result.data.Tablebuttoncss);
          setTableBtnInfo(result.data.Tablebuttoncss);
        } else {
          console.log("No Tablebuttoncss in response");
          setTableBtnInfo([]); // Reset if not present
        }

        setIsFileUpload(information?.Data?.[0]?.Fields[0]?.IsFileUpload);

        if (isModalOpen && isEdit) {
          setTab("Personal Details");
        }

        setLoading(false);

        if (apiCall) {
          setApiCall(false);
        }
      }
    } catch (error) {
      console.log("error in handleProfileIntromation", error);
      setLoading(false);
      setTableBtnInfo([]); // Reset on error
    } finally {
      setIsLoading(false);
      setIsLinkLoading(false);
    }
  };

  const getCurrentSaveData = () => {
    if (!currentRecordContext) return {};
    return scopedSaveData[currentRecordContext.recordKey] || {};
  };

  const setCurrentSaveData = (updater: any) => {
    if (!currentRecordContext) return;

    setScopedSaveData((prev) => {
      const currentData = prev[currentRecordContext.recordKey] || {};
      const newData =
        typeof updater === "function" ? updater(currentData) : updater;

      return {
        ...prev,
        [currentRecordContext.recordKey]: newData,
      };
    });
  };

  const handleTableLinkClick = useCallback(
    async (recordID: string, moduleID: string) => {
      console.log("recordID", recordID, "moduleID", moduleID);
      try {
        setLoading(true);
        setActiveRecord(null);
        setValue(3);
        setTab(leftTabs[0]);

        await handleProfileInformation(recordID, moduleID, false, "", recordID);
        setActiveRecord({
          recordID,
          moduleID,
          data: null,
        });
      } catch (error) {
        console.log("error in handleTableLinkClick", error);
      } finally {
        setLoading(false);
      }
    },
    [leftTabs],
  );
  const handleTableSelectionChange = (selectedRows: any[]) => {
    console.log("AutoCallPage: Selected rows updated:", selectedRows);
    setSelectedTableRows(selectedRows);
  };

  useEffect(() => {
    if (activeRecord) {
      setValue(3);
      setTab(leftTabs[0] || "Personal Details");
    }
  }, [activeRecord, leftTabs]);

  // In AutoCallPage.tsx - Add these states
  const [tabVisibility, setTabVisibility] = useState<{
    [key: string]: boolean;
  }>({});
  const [tabObjects, setTabObjects] = useState<any[]>([]);

  // Add this useEffect to initialize tab visibility
  useEffect(() => {
    if (information?.Data) {
      const visibilityMap: { [key: string]: boolean } = {};
      const tabDataObjects: any[] = [];

      information.Data.forEach((data: any) => {
        const tabName = data.Tabname;
        tabDataObjects.push(data);
        visibilityMap[tabName] = true; // Default all tabs to visible
      });

      setTabObjects(tabDataObjects);
      setTabVisibility(visibilityMap);
    }
  }, [information]);

  // Add this function to update tab visibility from child components
  const updateTabVisibility = (
    visibilityUpdates: { Tabname: string; IsVisible: boolean }[],
  ) => {
    setTabVisibility((prev) => {
      const newVisibility = { ...prev };
      visibilityUpdates.forEach((update) => {
        newVisibility[update.Tabname] = update.IsVisible;
      });
      return newVisibility;
    });
  };
  // Fixed useEffect - always call when moduleID or recordID changes
  useEffect(() => {
    const effectiveRecordID = isModalOpen && recordID ? recordID : "0";
    const effectiveModuleID = moduleID || menuID;

    console.log("AutoCall useEffect triggered with postedJson:", postedJson);

    // Always reset search states
    setSearchLeadVal("");
    setStartDate(null);
    setEndDate(null);

    // Call API when we have at least a moduleID
    if (effectiveModuleID) {
      console.log("Calling handleProfileInformation with postedJson");
      handleProfileInformation(
        effectiveRecordID,
        effectiveModuleID,
        false,
        undefined,
        undefined,
        undefined,
        postedJson, // Pass postedJson here
      );
    } else {
      console.log("Skipping API call - no moduleID available");
    }

    // Update refs for future comparisons
    previousModuleID.current = effectiveModuleID;
    previousRecordID.current = effectiveRecordID;
  }, [recordID, moduleID, isModalOpen, menuID, postedJson]); // Include menuID as fallback

  useEffect(() => {
    const updatedTabs: any = [];
    information &&
      Object.keys(information).forEach((tab) => {
        if (tab === "IframeURL") {
          let iframUrl = localStorage.getItem("iframeURL");
          if (!iframUrl) {
            localStorage.setItem("iframeURL", information[tab]);
          }
          return;
        } else if (
          tab === "ErrorMsg" ||
          tab === "IsDisplaySalaryinfo" ||
          tab === "MainCol"
        ) {
          return;
        } else if (tab === "Data") {
          if (information[tab] === null) {
            return;
          }
          const tabData = information["Data"]?.map((data: any) => data.Tabname);
          updatedTabs.push(...tabData);
        }
      });
    setTab(updatedTabs[0]);
    setLefttabs(updatedTabs);
  }, [information]);

  let mainColField = () => {
    let matchingValue;
    if (!information) {
      return;
    }
    for (let info of information?.Data) {
      for (let tab of info.Fields) {
        for (let val of tab.Values) {
          if (val.FieldName === information.MainCol) {
            matchingValue = val;
          }
        }
      }
    }
    return matchingValue;
  };

  useEffect(() => {
    let url: any = localStorage.getItem("iframeURL");
    if (url) {
      setIframeUrl(url);
    }
  }, [iframeShow]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node)
    ) {
      setSideBar(!sidebar);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebar]);

  const handleButtonClick = (row: any, column: string) => {
    console.log(`Button clicked for row:`, row, `column:`, column);
  };

  const columnsSearchLead = useMemo(() => {
    if (
      !searchLeadData?.tables ||
      searchLeadData.tables.length === 0 ||
      !reportData?.columnsArray
    ) {
      return [];
    }

    const firstRow = searchLeadData.tables[0];
    const mainColFieldName = mainColField()?.FieldName?.toLowerCase();

    return Object.keys(firstRow).map((column) => {
      const isKeyColumn = column.toLowerCase() === mainColFieldName;
      const columnData = reportData.columnsArray.find(
        (data: any) => data?.columnName.toLowerCase() === column.toLowerCase(),
      );
      const inputType = columnData?.Inputtype || "BOX"; // Default to BOX if undefined
      const isDisabled = columnData?.IsMaincol || false;

      return {
        name: column,
        selector: (row: any) => row[column],
        sortable: true,
        wrap: true,
        cell: (row: any) => {
          const value = row[column] ?? "";

          if (edit) {
            switch (inputType) {
              case "DROPDOWN":
                return (
                  <div style={{ width: "100%", minWidth: "150px" }}>
                    <AsyncSelect
                      loadOptions={(inputValue: string) =>
                        promiseOptions(inputValue)
                      }
                      defaultOptions={dropDownArray}
                      onChange={(selectedOption: any) => {
                        onChangeInput({
                          target: {
                            name: column,
                            value: selectedOption ? selectedOption.value : "",
                          },
                          row,
                        });
                      }}
                      value={{ label: value, value }}
                      onInputChange={(val: string) =>
                        onInputChange(val, column)
                      }
                      isLoading={loading || loadingDropdown}
                      isDisabled={isDisabled}
                      noOptionsMessage={() => "No Suggestions"}
                      onFocus={() => {
                        setColumnSelect(column);
                        setDropDownArray([{ value: "", label: "" }]);
                      }}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        container: (base) => ({ ...base, width: "100%" }),
                      }}
                      menuPlacement="auto"
                    />
                  </div>
                );
              case "TEXTBOX":
              case "BOX": // Handle BOX as TEXTBOX
                return (
                  <Input
                    value={value}
                    name={column}
                    onChange={(e: any) => {
                      onChangeInput({
                        target: { name: column, value: e.target.value },
                        row,
                      });
                    }}
                    disabled={isDisabled}
                    style={{ width: "100%" }}
                  />
                );
              case "DATE":
                const [startDate, setStartDate] =
                  value && typeof value === "string" && value.includes("|")
                    ? value
                        .split("|")
                        .map((d: string) => (d ? new Date(d) : null))
                    : [null, null];
                return (
                  <div
                    style={{ width: "100%" }}
                    key={`date-${row.id}-${column}`}
                  >
                    <ReactDatePicker
                      selectsRange
                      startDate={startDate}
                      endDate={endDate}
                      onChange={(dates: any) => {
                        const [start, end] = dates;
                        onChangeInput({
                          target: { name: column, value: `${start}|${end}` },
                          row,
                        });
                      }}
                      dateFormat={"yyyy-MM-dd"}
                      placeholderText="Select date range"
                      isClearable
                      disabled={isDisabled}
                      className="form-control"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </div>
                );
              case "BUTTON":
                return (
                  <Button
                    onClick={() => handleButtonClick(row, column)} // Define handleButtonClick
                    disabled={isDisabled}
                  >
                    Action
                  </Button>
                );
              case "LABEL":
                return <span>{value || "-"}</span>;
              default:
                return value || "-";
            }
          }

          if (isKeyColumn) {
            return (
              <div
                style={{ color: "#0088ff", cursor: "pointer" }}
                onClick={() => {
                  if (searchLeadData.isDetailPopupOpen) {
                    // Handle popup logic if needed
                  } else {
                    handleProfileInformation(row[column], moduleID, true);
                  }
                }}
              >
                {value || "-"}
              </div>
            );
          }
          return value || "-";
        },
      };
    });
  }, [
    searchLeadData?.tables,
    mainColField,
    moduleID,
    searchLeadData?.isDetailPopupOpen,
    edit,
    dropDownArray,
    loading,
    loadingDropdown,
    reportData?.columnsArray,
    onChangeInput,
    promiseOptions,
  ]);
  // table refresh for different module id
  useEffect(() => {
    const effectiveModuleID = moduleID || menuID || mainMenuID;
    if (effectiveModuleID && previousModuleID.current !== effectiveModuleID) {
      console.log("Resetting searchLeadData", {
        effectiveModuleID,
        previousModuleID: previousModuleID.current,
      });
      setSearchLeadData({
        tables: [],
        isDetailPopupOpen: false,
        cardData: [],
      });
      previousModuleID.current = effectiveModuleID;
    }
  }, [moduleID, menuID, mainMenuID]);

  const getFaqData = async () => {
    try {
      const result = await axios.post(
        `https://logpanel.insurancepolicy4u.com/api/Login/DisplayFAQ`,
        {
          Userid: localStorage.getItem("username"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (result) {
        setFaqData(result?.data);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (faqModal) {
      getFaqData();
    }
  }, [faqModal]);

  const faqDataResult = useMemo(() => {
    let newFaqResult = [];
    if (!faqData?.FaqData) {
      return [];
    }
    if (faqData?.FaqData) {
      newFaqResult = faqData?.FaqData;
    }
    if (faqType) {
      newFaqResult = faqData.FaqData.filter(
        (type: any) => type.Type.toLowerCase() === faqType.value.toLowerCase(),
      );
    } else {
      newFaqResult = faqData.FaqData;
    }
    if (faqSearch) {
      newFaqResult = faqData.FaqData.filter((type: any) =>
        type.Question.toLowerCase().includes(faqSearch.toLowerCase()),
      );
    }

    return newFaqResult.length > 0 ? newFaqResult : faqData?.FaqData;
  }, [faqModal, faqSearch, faqType, faqData]);

  // const getNumberFunction = async () => {
  //   try {
  //     if (headerStatusBtn === "PAUSE" || headerStatusBtn === "") {
  //       return;
  //     }
  //     const result = await axios.post(
  //       `https://logpanel.insurancepolicy4u.com/api/Login/getNumber`,
  //       {
  //         Userid: localStorage.getItem("username"),
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //         },
  //       }
  //     );
  //     if (result?.data?.RecordNo) {
  //       handleProfileInformation(result?.data?.RecordNo, moduleID);
  //       // setNumberVal(result?.data?.RecordNo)
  //     }
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  // };

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     getNumberFunction();
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, [headerStatusBtn]);

  useEffect(() => {
    let val = sessionStorage.getItem("IsSubMenuEdit");

    if (val === "true") {
      setEditBtn(true);
    } else {
      setEditBtn(false);
    }

    if (!recordID) {
      setValue(1);
    } else {
      setValue(0);
    }
  }, []);
  const getLabel = (response: any, hasIcon: boolean) => {
    if (hasIcon) return undefined;

    return (
      <span
        style={{
          fontSize: `${response.FontSize}px`,
          fontFamily: response.FontName,
          backgroundColor: response.Bgcolor,
          color: response.FontColor,
          fontWeight: response.IsBold ? "bold" : "normal",
          textDecoration: response.IsUnderline ? "underline" : "none",
          fontStyle: response.IsItalic ? "italic" : "normal",
        }}
      >
        {response.BarButtonName}
      </span>
    );
  };
  const getTabs = (response: any) => {
    if (!response) {
      return null;
    }
    const hasIcon = Boolean(response.BarButtonCls);
    switch (response.BarButtonName) {
      case "READY":
        if (response.IsShow) {
          return (
            <Tooltip
              placement="top"
              overlay={
                <Label>
                  {headerStatusBtn === "READY" ? "START" : headerStatusBtn}
                </Label>
              }
            >
              <Tab
                sx={{
                  minWidth: "59px!important",
                  color:
                    headerStatusBtn === "PAUSE"
                      ? "green"
                      : headerStatusBtn === "RESUME"
                        ? "red"
                        : "primary",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setAddLead(false);
                  setIsModify(false);
                  if (value !== 6) {
                    return;
                  }
                  const result = await axios.post(
                    `https://logpanel.insurancepolicy4u.com/api/Login/Setstatus`,
                    {
                      Userid: localStorage.getItem("username"),
                      Value: headerStatusBtn,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token",
                        )}`,
                      },
                    },
                  );
                  if (
                    headerStatusBtn === "READY" ||
                    headerStatusBtn === "RESUME"
                  ) {
                    setHeaderStatusBtn("PAUSE");
                  } else {
                    setHeaderStatusBtn("RESUME");
                  }
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "HANGUP":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>HangUp</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setAddLead(false);
                  setIsModify(false);
                  try {
                    const result = await axios.post(
                      `https://logpanel.insurancepolicy4u.com/api/Login/HangUp`,
                      {
                        Userid: localStorage.getItem("username"),
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token",
                          )}`,
                        },
                      },
                    );
                    if (result) {
                      setHeaderStatusBtn("PAUSE");
                    }
                  } catch (error) {
                    console.log("error", error);
                  }
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "AUTOCALL":
        return (
          <Tooltip placement="top" overlay={<Label>Auto Calls</Label>}>
            <Tab
              sx={{
                minWidth: "59px!important",
                "& .MuiTab-label": {
                  fontSize: `${response.FontSize}px`,
                  fontFamily: response.FontName,
                  backgroundColor: response.Bgcolor,
                  color: response.FontColor,
                  fontWeight: response.IsBold ? "bold" : "normal",
                  textDecoration: response.Isunderline ? "underline" : "none",
                  fontStyle: response.Isitalic ? "italic" : "normal",
                },
              }}
              icon={
                hasIcon ? (
                  <i
                    className={response.BarButtonCls}
                    style={{
                      fontSize: `${response.FontSize}px`,
                      color: `${response.FontColor}`,
                      backgroundColor: `${response.Bgcolor}`,
                      fontWeight: response.IsBold ? "bold" : "normal",
                    }}
                  />
                ) : undefined
              }
              label={getLabel(response, hasIcon)}
              iconPosition="start"
              onClick={() => {
                setIsModify(false);
                setTab(leftTabs[0]);
                setValue(3);
                handleProfileInformation(recordID, moduleID);
              }}
            />
          </Tooltip>
        );
      case "SEARCH LEAD":
        return (
          <Tooltip placement="top" overlay={<Label>Search Lead</Label>}>
            <Tab
              sx={{
                minWidth: "59px!important",
                "& .MuiTab-label": {
                  fontSize: `${response.FontSize}px`,
                  fontFamily: response.FontName,
                  backgroundColor: response.Bgcolor,
                  color: response.FontColor,
                  fontWeight: response.IsBold ? "bold" : "normal",
                  textDecoration: response.Isunderline ? "underline" : "none",
                  fontStyle: response.Isitalic ? "italic" : "normal",
                },
              }}
              icon={
                hasIcon ? (
                  <i
                    className={response.BarButtonCls}
                    style={{
                      fontSize: `${response.FontSize}px`,
                      width: `${response.iconwidth}px`,
                      color: `${response.FontColor}`,
                      backgroundColor: `${response.Bgcolor}`,
                      fontWeight: response.IsBold ? "bold" : "normal",
                    }}
                  />
                ) : undefined
              }
              label={getLabel(response, hasIcon)}
              iconPosition="start"
              onClick={() => {
                setIsModify(false);
                setAddLead(false);
                setValue(4);
              }}
            />
          </Tooltip>
        );
      case "ADD LEAD":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Add Manual Lead</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={() => {
                  setIsModify(false);
                  handleProfileInformation("", moduleID);
                  setAddLead(!isAddLead);
                  setValue(5);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "SHOW OR HIDE":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Show or Hide</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={() => {
                  setIsModify(false);
                  setIframeShow(!iframeShow);
                  setValue(6);
                  setAddLead(false);
                  setHeaderStatusBtn("READY");
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "FAQ":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Show FAQ</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={() => {
                  setIsModify(false);
                  setAddLead(false);
                  setFaqModal(!faqModal);
                  setValue(7);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "RUNNING LEAD":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Running Lead</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={() => {
                  setIsModify(false);
                  setAddLead(false);
                  handleProfileInformation(currentRecordID, moduleID);
                  setValue(8);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "MANUAL DIAL":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Manual Dial</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={() => {
                  setIsModify(false);
                  setAddLead(false);
                  setOpenModal(!openModal);
                  setValue(9);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "DIAL THIS LEAD":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Dial This Lead</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setIsModify(false);
                  setValue(10);
                  setAddLead(false);
                  const result = await axios.post(
                    `https://logpanel.insurancepolicy4u.com/api/Login/DialLead`,
                    {
                      Userid: localStorage.getItem("username"),
                      RecordID: mainColField()?.FieldValue,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token",
                        )}`,
                      },
                    },
                  );
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "Is DragnDrop":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Is DragnDrop</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setIsModify(false);
                  setAddLead(false);
                  setIsDrag(!isDrag);
                  setIsDisable(!isDisable);
                  setIsSearchDrag(!isSearchDrag);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "Add Field":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Add Field</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setIsModify(false);
                  setAddLead(false);
                  setIsAddNewField(true);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "Previous":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Previous</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setIsModify(false);
                  setAddLead(false);
                  setHandleNext(response);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "Next":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Next</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setIsModify(false);
                  setAddLead(false);
                  setHandleNext(response);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "Modify":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Modify</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setAddLead(false);
                  setIsModify(!isModify);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "Party Master":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Party Master</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setIsModify(false);
                  setAddLead(false);
                  setButtonMaster(response);
                }}
              />
            </Tooltip>
          );
        }
        break;
      case "Vendor Master":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Vendor Master</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setIsModify(false);
                  setAddLead(false);
                  setButtonMaster(response);
                }}
              />
            </Tooltip>
          );
        }
        break;

      case "Airline Master":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Airline Master</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={async () => {
                  setIsModify(false);
                  setAddLead(false);
                  setButtonMaster(response);
                }}
              />
            </Tooltip>
          );
        }
      case "Undo":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>Undo</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={() => {
                  setAddLead(false);
                  setIsModify(false);
                  if (personalDetailsRef.current?.handleUndo) {
                    personalDetailsRef.current.handleUndo();
                  }
                }}
              />
            </Tooltip>
          );
        }
      case "PDF Size":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>PDF Size</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={() => {
                  setIsModify(false);
                  setAddLead(false);
                  setIsPDFSizeModalOpen(true);
                }}
              />
            </Tooltip>
          );
        }
      case "Orientation":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>PDF Size</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={() => {
                  setIsModify(false);
                  setAddLead(false);
                  setIsPDFSizeModalOpen(true);
                }}
              />
            </Tooltip>
          );
        }
      case "EDIT":
        if (response.IsShow) {
          return (
            <Tooltip placement="top" overlay={<Label>PDF Size</Label>}>
              <Tab
                sx={{
                  minWidth: "59px!important",
                  "& .MuiTab-label": {
                    fontSize: `${response.FontSize}px`,
                    fontFamily: response.FontName,
                    backgroundColor: response.Bgcolor,
                    color: response.FontColor,
                    fontWeight: response.IsBold ? "bold" : "normal",
                    textDecoration: response.Isunderline ? "underline" : "none",
                    fontStyle: response.Isitalic ? "italic" : "normal",
                  },
                }}
                icon={
                  hasIcon ? (
                    <i
                      className={response.BarButtonCls}
                      style={{
                        fontSize: `${response.FontSize}px`,
                        color: `${response.FontColor}`,
                        backgroundColor: `${response.Bgcolor}`,
                        fontWeight: response.IsBold ? "bold" : "normal",
                      }}
                    />
                  ) : undefined
                }
                label={getLabel(response, hasIcon)}
                iconPosition="start"
                onClick={(e) => {
                  setEdit(!edit);
                  setValue(13);
                }}
              />
            </Tooltip>
          );
        }
        break;
      default:
        return null;
    }
  };

  // Update your socket connection useEffect
  useEffect(() => {
    if (!socketURL || !isSocketCall) {
      // Clean up existing connection if it exists
      if (connection) {
        connection.stop();
        setConnection(null);
      }
      return;
    }

    const url = typeof socketURL === "string" ? socketURL : "";
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: true,
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Configure aggressive keepalive settings
    newConnection.serverTimeoutInMilliseconds = 60000; // 1 minute
    newConnection.keepAliveIntervalInMilliseconds = 15000; // 15 seconds

    // Handle incoming record IDs
    newConnection.on("ReceiveNumber", async (data) => {
      try {
        const recordNo = data?.recordNo || data;
        if (recordNo) {
          const recordId = recordNo.toString();
          setSocketRecordId(recordId);
          console.log("Received record ID from socket:", recordId);

          // Automatically load the profile information when a new record comes in
          if (moduleID) {
            handleProfileInformation(recordId, moduleID);
          }
        }
      } catch (error) {
        console.error("Error processing received number:", error);
      }
    });

    newConnection.onreconnecting(() => {
      setConnectionStatus("Reconnecting...");
      console.log("Connection reconnecting...");
    });

    newConnection.onreconnected(() => {
      setConnectionStatus("Connected");
      console.log("Connection reestablished");
    });

    newConnection.onclose((error) => {
      setConnectionStatus("Disconnected");
      console.log("Connection closed", error);
      // Attempt to reconnect after delay
      setTimeout(() => startConnection(newConnection), 5000);
    });

    const emailId = localStorage.getItem("username");
    const userPayload = {
      UserID: emailId,
      ReferID: localStorage.getItem("username"),
      Token: localStorage.getItem("token"),
    };
    const jsonString = JSON.stringify(userPayload);
    const gzipped = Pako.gzip(jsonString);
    const keyBytes = Buffer.from(encryptionKey.slice(0, 16), "utf8");
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv("aes-128-cbc", keyBytes, iv);
    const encrypted = Buffer.concat([cipher.update(gzipped), cipher.final()]);
    const base64Result = encrypted.toString("base64");
    const encodedEmail = encodeURIComponent(base64Result);
    console.log("encodedEmailencodedEmailencodedEmail", base64Result);
    const startConnection = async (conn: signalR.HubConnection) => {
      try {
        if (conn.state === signalR.HubConnectionState.Disconnected) {
          await conn.start();
          setConnectionStatus("Connected");
          console.log("Connection started successfully");

          // Invoke the server method with encrypted payload
          await conn.invoke("GetNumber", encodedEmail);
        }
      } catch (err) {
        console.error("Connection failed:", err);
        setConnectionStatus("Failed. Retrying...");
        // Retry after delay
        setTimeout(() => startConnection(conn), 5000);
      }
    };

    // Start the connection
    startConnection(newConnection);
    setConnection(newConnection);

    // Cleanup function
    return () => {
      if (newConnection) {
        newConnection.off("ReceiveNumber");
        newConnection.stop();
      }
    };
  }, [socketURL, isSocketCall]);

  // Add this to track connection status changes
  useEffect(() => {
    if (connection) {
      console.log(`Connection state changed to: ${connection.state}`);
    }
  }, [connection?.state]);
  // Add these state variables to AutoCallPage
  const [reportId, setReportId] = useState<any>(null);
  const [reportsArr, setReportsArr] = useState<any>([]);
  const token = useSelector((state: any) => state?.authReducer?.token);
  // Add this useEffect to fetch the report data
  useEffect(() => {
    const getReportDetails = () => {
      const Params = {
        Userid: localStorage.getItem("username"),
        ReportID: menuID,
      };
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetDynamicReportDetail",
          Params,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        )
        .then(async (response) => {
          if (response.status === 200 || response.status === 201) {
            setReportData(response.data);
            console.log("response.data", response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching report details:", error);
        });
    };

    if (token && mainMenuID && menuID) {
      getReportDetails();
    }
  }, [token, mainMenuID, menuID]);

  // Add this function in AutoCallPage
  const handleSearchFieldResize = (
    e: any,
    direction: any,
    ref: any,
    d: any,
    field: any,
  ) => {
    console.log("Resizing search field:", field.FieldName);

    const newWidth = ref.style.width;
    const newHeight = ref.style.height;

    setSearchFieldPositions((prev: any) => ({
      ...prev,
      [field.FieldID]: {
        ...prev[field.FieldID],
        Width: newWidth,
        Height: newHeight,
      },
    }));

    // Also update the filterFields array
    setFilterFields((prev: any[]) =>
      prev.map((f) =>
        f.FieldID === field.FieldID
          ? {
              ...f,
              SearchWidth: newWidth,
              SearchHeight: newHeight,
              Width: newWidth,
              Height: newHeight,
            }
          : f,
      ),
    );

    // Call API to save the new size
    updateSearchFieldPosition(field.FieldID, {
      Width: newWidth,
      Height: newHeight,
      Rownum: searchFieldPositions[field.FieldID]?.Rownum || 0,
      Colnum: searchFieldPositions[field.FieldID]?.Colnum || 0,
    });
  };
  // In AutoCallPage component - update the updateSearchFieldPosition function
  const updateSearchFieldPosition = async (
    fieldID: string,
    positionData: any,
  ) => {
    console.log("Updating position for search field:", fieldID, positionData);
    try {
      const data = {
        Userid: localStorage.getItem("username"),
        ModuleId: menuID,
        Type: isSearchDrag ? "SEARCH" : "",
        fields: [
          {
            FieldID: fieldID,
            // For search fields, use SearchRownum and SearchColnum
            SearchRownum: positionData.Rownum,
            SearchColnum: positionData.Colnum,
            SearchWidth: positionData.Width,
            SearchHeight: positionData.Height,
          },
        ],
      };

      console.log("Updating search field position:", data);

      const response = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/Updatefieldproperty",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("Field position updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating field position:", error);
      throw error;
    }
  };

  // In AutoCallPage component - update moveSearchBox function
  const moveSearchBox = useCallback(
    (fieldID: string, left: number, top: number) => {
      console.log("Moving search field:", fieldID, left, top);

      // Update positions state
      setSearchFieldPositions((prev: any) => ({
        ...prev,
        [fieldID]: {
          ...prev[fieldID],
          Rownum: left,
          Colnum: top,
        },
      }));

      // Update filterFields with search-specific keys
      setFilterFields((prev: any[]) =>
        prev.map((field) =>
          field.FieldID === fieldID
            ? {
                ...field,
                SearchRownum: left,
                SearchColnum: top,
                Rownum: left,
                Colnum: top,
                PDFRownum: field.PDFRownum || left,
                PDFColnum: field.PDFColnum || top,
              }
            : field,
        ),
      );

      // Call API with search-specific keys
      updateSearchFieldPosition(fieldID, {
        Rownum: left,
        Colnum: top,
        Width: searchFieldPositions[fieldID]?.Width || "100%",
        Height: searchFieldPositions[fieldID]?.Height || "38px",
      });
    },
    [searchFieldPositions],
  );
  const outerTabType = information?.Data?.[0]?.outertabtype;
  console.log("outerTabType", outerTabType);
  const isOuterTabNested = outerTabType?.toLowerCase() === "nested";
  console.log("isOuterTabNested", isOuterTabNested);
  // Create drop handler
  // const [, drop] = useDrop(
  //   () => ({
  //     accept: "box",
  //     drop(item: any, monitor) {
  //       const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
  //       const left = Math.round(item.left + delta.x);
  //       const top = Math.round(item.top + delta.y);
  //       moveSearchBox(item.id, left, top);
  //       return undefined;
  //     },
  //   }),
  //   [moveSearchBox]
  // );
  const formattings = information?.Data?.[0];
  const getTabStyle = (isActive: boolean) => ({
    color: isActive
      ? formattings?.ActiveColor
      : formattings?.InActiveColor || formattings?.fontcolor,

    fontFamily: formattings?.FontName || "inherit",
    fontSize: formattings?.FontSize ? `${formattings.FontSize}px` : "12px",
    fontWeight: formattings?.Isbold ? "700" : "400",
    fontStyle: formattings?.IsItalic ? "italic" : "normal",
    textDecoration: formattings?.IsUnderline ? "underline" : "none",
    icon: formattings?.Clsname,
    height: formattings?.Height ? `${formattings.Height}px` : "auto",
    width: formattings?.Width ? `${formattings.Width}px` : "100%",
  });

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <ConfirmProvider>
          <DndProvider backend={HTML5Backend}>
            <div>
              <div className="h-full relative">
                {leftTabs?.length > 1 && !isOuterTabNested && (
                  <div
                    ref={sidebarRef}
                    className={`h-full md:flex md:w-60 md:flex-col md:absolute md:inset-y-0 overflow-y-auto w-60 ${
                      sidebar ? "z-[99] absolute" : "hidden"
                    }`}
                    style={{
                      backgroundColor: `${information?.Data?.[0]?.Bgcolor}`,
                    }}
                  >
                    <div>
                      <div
                        className="space-y-2 py-4 flex flex-col h-full text-white mt-14 overflow-y-auto"
                        style={{
                          backgroundColor: `${information?.Data?.[0]?.Bgcolor}`,
                        }}
                      >
                        <div className="px-3 py-2 flex-1">
                          <div className="space-y-1">
                            <div
                              onClick={() => setSideBar(!sidebar)}
                              className="bg-red-500 text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-red-300 rounded-lg transition !md:hidden"
                              style={{ display: isMobile ? "block" : "none" }}
                            >
                              <div className="flex items-center flex-1 uppercase">
                                CANCEL
                              </div>
                            </div>
                            {information && (
                              <OuterAdvancedTabs
                                information={information}
                                activeTab={tab}
                                onTabChange={(tabName) => {
                                  if (value === 4) setValue("");
                                  setTab(tabName);
                                }}
                                tabVisibility={tabVisibility}
                                isDrag={isDrag}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={
                    leftTabs?.length > 1 && !isOuterTabNested ? "md:ml-64" : ""
                  }
                >
                  {barButtons?.length > 0 && (
                    <Box sx={{}}>
                      <AppBar
                        position="static"
                        sx={{
                          backgroundColor: information?.Barbuttonbgcolor || "",
                        }}
                      >
                        <Tabs
                          value={value}
                          onChange={(e, val: any) => handleChange(e, val)}
                          indicatorColor="secondary"
                          textColor="inherit"
                          variant={isMobile ? "scrollable" : "standard"}
                          aria-label="full width tabs example"
                          style={{
                            backgroundColor: `${information?.Barbuttonbgcolor}`,
                          }}
                          sx={{
                            gap: "0px!important",
                            margin: "0px!important",
                            padding: "0px!important",
                            zIndex: "",
                          }}
                        >
                          {barButtons.map((response: any) => {
                            return getTabs(response);
                          })}
                          {/* {editBtn && (
                            <Tooltip
                              placement="top"
                              overlay={<Label>EDIT</Label>}
                            >
                              <Tab
                                sx={{ minWidth: "59px!important" }}
                                icon={
                                  <EditCalendarIcon
                                    style={{
                                      color: `${information?.Data?.[0]?.fontcolor}`,
                                    }}
                                  />
                                }
                                iconPosition="start"
                                onClick={(e) => {
                                  setEdit(!edit);
                                  setValue(13);
                                }}
                              />
                            </Tooltip>
                          )} */}
                        </Tabs>
                      </AppBar>
                    </Box>
                  )}
                  {/* OUTER TABS — nested variant renders here, below bar buttons */}
                  {leftTabs?.length > 1 && isOuterTabNested && information && (
                    <div
                      style={{
                        backgroundColor: information?.Data?.[0]?.Bgcolor || "",
                        padding: "8px",
                        borderBottom: `1px solid ${
                          information?.Data?.[0]?.ActivetabBordercolor ||
                          "#e0e0e0"
                        }`,
                      }}
                    >
                      <OuterAdvancedTabs
                        information={information}
                        activeTab={tab}
                        onTabChange={(tabName) => {
                          if (value === 4) setValue("");
                          setTab(tabName);
                        }}
                        tabVisibility={tabVisibility}
                        isDrag={isDrag}
                      />
                    </div>
                  )}
                  <Modal isOpen={openModal}>
                    <ModalHeader>Manual Dial</ModalHeader>
                    <ModalBody className="flex flex-col">
                      <FormGroup>
                        <Label for={"manualDial"} className="bold max-w-fit">
                          Add Number
                        </Label>
                        <Input
                          id={"dial"}
                          name={"manualDial"}
                          value={manualDialVal}
                          placeholder={"Enter the number"}
                          type={"text"}
                          onChange={(e) => setManualDialVal(e.target.value)}
                        />
                      </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="primary"
                        onClick={async () => {
                          try {
                            const result = await axios.post(
                              `https://logpanel.insurancepolicy4u.com/api/Login/DialLead`,
                              {
                                Userid: localStorage.getItem("username"),
                                Value: manualDialVal,
                              },
                              {
                                headers: {
                                  Authorization: `Bearer ${localStorage.getItem(
                                    "token",
                                  )}`,
                                },
                              },
                            );

                            if (result) {
                              setOpenModal(!openModal);
                            }
                          } catch (error) {
                            console.log("error", error);
                          }
                        }}
                      >
                        Submit
                      </Button>
                      <Button
                        color="primary"
                        onClick={() => setOpenModal(!openModal)}
                      >
                        Close
                      </Button>
                    </ModalFooter>
                  </Modal>

                  {isAddNewField && (
                    <AddNewField
                      isAddNewField={isAddNewField}
                      setIsAddNewField={setIsAddNewField}
                    />
                  )}

                  <Modal isOpen={faqModal}>
                    <ModalHeader>FAQ's Type</ModalHeader>
                    <ModalBody className="flex flex-col">
                      <div className="flex flex-end w-full flex-1  border">
                        <div className="w-full flex gap-x-2">
                          <Select
                            options={faqData?.FaqTypes?.map((response: any) => {
                              const object = {
                                label: response.Type,
                                value: response.Type,
                              };
                              return object;
                            })}
                            className="!w-1/2"
                            value={faqType}
                            onChange={(e: any) => setFaqType(e)}
                            placeholder="Select an type"
                          />

                          <Input
                            id={"Search"}
                            name={"Search FAQ"}
                            value={faqSearch}
                            placeholder={"Search"}
                            type={"text"}
                            className="w-1/2"
                            onChange={(e) => setFaqSearch(e.target.value)}
                          />
                        </div>
                      </div>

                      <Card>
                        {faqDataResult &&
                          faqDataResult &&
                          faqDataResult.length > 0 &&
                          faqDataResult.map((faq: any) => {
                            return (
                              <>
                                <Accordion sx={{ marginTop: "10px" }}>
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                    sx={{
                                      backgroundColor: "#2072AF",
                                      color: "#fff",
                                    }}
                                  >
                                    {faq?.Question}
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    {faq?.Answer}
                                  </AccordionDetails>
                                </Accordion>
                              </>
                            );
                          })}
                      </Card>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="primary"
                        onClick={() => setFaqModal(!faqModal)}
                      >
                        Close
                      </Button>
                    </ModalFooter>
                  </Modal>

                  <CustomTabPanel value={value} index={4}>
                    <Button onClick={() => setIsCardView(!isCardView)}>
                      Is Card View
                    </Button>
                    <SearchDropArea
                      isDrag={isDrag}
                      onDrop={moveSearchBox} // Your moveSearchBox function
                    >
                      <div className="flex px-2 space-x-2 items-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filterFields.map((field) => {
                            const fieldPosition = searchFieldPositions[
                              field.FieldID
                            ] || {
                              Rownum: 0,
                              Colnum: 0,
                              Width: "100%",
                              Height: "38px",
                            };
                            const fieldStyle: CSSProperties = {
                              position: "absolute",
                              cursor: isDrag ? "move" : "default",
                              border: isDrag ? "1px dashed gray" : "0px",
                              backgroundColor: isDrag ? "white" : "transparent",
                              paddingLeft: isDrag ? "0.5rem" : "0rem",
                            };

                            switch (field.FieldType) {
                              case "LABEL":
                                return (
                                  <LableField
                                    key={field.FieldID}
                                    style={fieldStyle}
                                    field={{
                                      ...field,
                                      Rownum: fieldPosition.Rownum,
                                      Colnum: fieldPosition.Colnum,
                                      Width: fieldPosition.Width,
                                      Height: fieldPosition.Height,
                                      PDFRownum:
                                        fieldPosition.PDFRownum ||
                                        fieldPosition.Rownum,
                                      PDFColnum:
                                        fieldPosition.PDFColnum ||
                                        fieldPosition.Colnum,
                                      PDFWidth:
                                        fieldPosition.PDFWidth ||
                                        fieldPosition.Width,
                                      PDFHeight:
                                        fieldPosition.PDFHeight ||
                                        fieldPosition.Height,
                                    }}
                                    isModify={true}
                                    saveData={searchValues}
                                    information={information}
                                    isDrag={isSearchDrag}
                                    isSearch={true}
                                    onResize={handleSearchFieldResize}
                                  />
                                );
                              case "BOX":
                                return (
                                  <BoxField
                                    style={fieldStyle}
                                    key={field.FieldID}
                                    field={{
                                      ...field,
                                      Rownum: fieldPosition.Rownum,
                                      Colnum: fieldPosition.Colnum,
                                      Width: fieldPosition.Width,
                                      Height: fieldPosition.Height,
                                      PDFRownum:
                                        fieldPosition.PDFRownum ||
                                        fieldPosition.Rownum,
                                      PDFColnum:
                                        fieldPosition.PDFColnum ||
                                        fieldPosition.Colnum,
                                      PDFWidth:
                                        fieldPosition.PDFWidth ||
                                        fieldPosition.Width,
                                      PDFHeight:
                                        fieldPosition.PDFHeight ||
                                        fieldPosition.Height,
                                    }}
                                    isModify={true}
                                    saveData={searchValues}
                                    handleInputChange={(
                                      e: React.ChangeEvent<HTMLInputElement>,
                                    ) => handleSearchInputChange(e, field)}
                                    information={information}
                                    isDrag={isSearchDrag}
                                    onResize={handleSearchFieldResize}
                                  />
                                );
                              case "DATE":
                                return (
                                  <DateField
                                    style={fieldStyle}
                                    field={{
                                      ...field,
                                      Rownum: fieldPosition.Rownum,
                                      Colnum: fieldPosition.Colnum,
                                      Width: fieldPosition.Width,
                                      Height: fieldPosition.Height,
                                      PDFRownum:
                                        fieldPosition.PDFRownum ||
                                        fieldPosition.Rownum,
                                      PDFColnum:
                                        fieldPosition.PDFColnum ||
                                        fieldPosition.Colnum,
                                      PDFWidth:
                                        fieldPosition.PDFWidth ||
                                        fieldPosition.Width,
                                      PDFHeight:
                                        fieldPosition.PDFHeight ||
                                        fieldPosition.Height,
                                    }}
                                    isModify={true}
                                    searchValues={searchValues}
                                    setSearchValues={setSearchValues}
                                    information={information}
                                    isDrag={isSearchDrag}
                                    isSearch={true}
                                    onChange={(
                                      dates: [Date | null, Date | null],
                                    ) => {
                                      setSearchValues({
                                        ...searchValues,
                                        [field.FieldName]:
                                          dates[0] && dates[1]
                                            ? `${moment(dates[0]).format("YYYY-MM-DD")}|${moment(dates[1]).format("YYYY-MM-DD")}`
                                            : "",
                                      });
                                    }}
                                    onResize={handleSearchFieldResize}
                                  />
                                );
                              // In AutoCallPage component, update the case for 'DROPDOWN' in your search fields render
                              case "DROPDOWN":
                                const dropdownField = filterFields.find(
                                  (f) => f.FieldID === field.FieldID,
                                );
                                const dropdownOptions =
                                  dropdownField?.DropdownArray || [];

                                // Get the actual field configuration
                                const searchDropdownField = filterFields.find(
                                  (f) => f.FieldID === field.FieldID,
                                );

                                return (
                                  <DropDownField
                                    style={fieldStyle}
                                    key={field.FieldID}
                                    field={{
                                      ...field,
                                      Rownum: fieldPosition.Rownum,
                                      Colnum: fieldPosition.Colnum,
                                      Width: fieldPosition.Width,
                                      Height: fieldPosition.Height,
                                      PDFRownum:
                                        fieldPosition.PDFRownum ||
                                        fieldPosition.Rownum,
                                      PDFColnum:
                                        fieldPosition.PDFColnum ||
                                        fieldPosition.Colnum,
                                      PDFWidth:
                                        fieldPosition.PDFWidth ||
                                        fieldPosition.Width,
                                      PDFHeight:
                                        fieldPosition.PDFHeight ||
                                        fieldPosition.Height,
                                      // DropdownArray: dropdownOptions,
                                      // FieldName: field.FieldName,
                                      // FieldID: field.FieldID,
                                      // FieldType: 'DROPDOWN',
                                      // IsFieldNamePrint: true,
                                      // IsMandatory: false,
                                      // // Copy all properties from the original field
                                      // ...searchDropdownField,
                                      // // Ensure APIURL is included
                                      // APIURL: searchDropdownField?.APIURL || field.APIURL,
                                      // apifields: searchDropdownField?.apifields || field.apifields,
                                      // ServerName: searchDropdownField?.ServerName || field.ServerName,
                                      // Dbname: searchDropdownField?.Dbname || field.Dbname,
                                      // Tabname: searchDropdownField?.Tabname || field.Tabname,
                                      // Colname: searchDropdownField?.Colname || field.Colname,
                                      // TextAlignment: 'left',
                                      // TextFontColor: '#000000',
                                      // Fontname: 'inherit',
                                      // TextFontSize: 14,
                                      // Fieldbgcolor: '#ffffff',
                                      // IsReadOnly: false,
                                      // ClsIcon: '',
                                      // MWidth: '100%',
                                      // MHeight: '38px',
                                    }}
                                    isModify={true}
                                    isDrag={isSearchDrag}
                                    isSearch={true}
                                    searchValues={searchValues}
                                    setSearchValues={setSearchValues}
                                    promiseOptions={(inputValue: string) => {
                                      return new Promise((resolve) => {
                                        // Pass the field to AddDropDownData
                                        AddDropDownData(
                                          inputValue,
                                          searchDropdownField || field,
                                        )
                                          .then((options) => resolve(options))
                                          .catch(() => resolve([]));
                                      });
                                    }}
                                    handleInputChange={(
                                      selectedOption: any,
                                    ) => {
                                      handleDropdownChange(
                                        selectedOption,
                                        field,
                                      );

                                      // If dropdown has childfields, trigger their refresh
                                      if (
                                        searchDropdownField?.childfields &&
                                        searchDropdownField.childfields.length >
                                          0
                                      ) {
                                        handleDropdownChildFields(
                                          selectedOption,
                                          searchDropdownField.childfields,
                                        );
                                      }
                                    }}
                                    information={information}
                                    isMobile={isMobile}
                                    onResize={handleSearchFieldResize}
                                  />
                                );
                              case "BUTTON":
                                return (
                                  <ButtonField
                                    style={fieldStyle}
                                    key={field.FieldID}
                                    field={{
                                      ...field,
                                      Rownum: fieldPosition.Rownum,
                                      Colnum: fieldPosition.Colnum,
                                      Width: fieldPosition.Width,
                                      Height: fieldPosition.Height,
                                      PDFRownum:
                                        fieldPosition.PDFRownum ||
                                        fieldPosition.Rownum,
                                      PDFColnum:
                                        fieldPosition.PDFColnum ||
                                        fieldPosition.Colnum,
                                      PDFWidth:
                                        fieldPosition.PDFWidth ||
                                        fieldPosition.Width,
                                      PDFHeight:
                                        fieldPosition.PDFHeight ||
                                        fieldPosition.Height,
                                      ValueType: "SEARCH", // ← Add this to override the ValueType
                                      onClick: handleSearch, // ← Pass the search handler
                                    }}
                                    isModify={true}
                                    saveData={searchValues}
                                    information={information}
                                    isDrag={isSearchDrag}
                                    onClick={handleSearch}
                                    onResize={handleSearchFieldResize}
                                    setLoading={setLoading}
                                  />
                                );
                              default:
                                return null;
                            }
                          })}
                        </div>
                      </div>

                      {isCardView ? (
                        <div
                          style={{
                            position: "relative",
                            height: "100vh",
                            overflow: "auto",
                            top: "30px",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: `repeat(${cardViewData[0].Gridcnt}, 1fr)`,
                              gap: "20px",
                              padding: "20px",
                            }}
                          >
                            {cardViewData.map(
                              (data: any, dataIndex: number) => {
                                return data?.tableArray?.map(
                                  (response: any, index: number) => {
                                    return (
                                      <Card
                                        key={`${dataIndex}-${index}`}
                                        style={{
                                          height: data.Height
                                            ? Number(
                                                data.Height.split("px")[0],
                                              ) + 20
                                            : 200,
                                          width: "100%",
                                        }}
                                      >
                                        <CardHeader>
                                          <CardTitle>
                                            {data.FieldName}
                                          </CardTitle>
                                        </CardHeader>

                                        <div
                                          style={{
                                            position: "relative",
                                            width: "100%",
                                            height: "100%",
                                            backgroundColor: "white",
                                          }}
                                        >
                                          {data?.cardFields?.map(
                                            (res: any, i: number) => {
                                              const rownum =
                                                res.CardRownum ||
                                                res.Rownum ||
                                                0;
                                              const colnum =
                                                res.CardColnum ||
                                                res.Colnum ||
                                                0;

                                              return (
                                                <div
                                                  key={i}
                                                  style={{
                                                    position: "absolute",
                                                    top: `${colnum}px`,
                                                    left: `${rownum}px`,
                                                    height:
                                                      res.CardHeight ||
                                                      res.Height ||
                                                      "auto",
                                                    width:
                                                      res.CardWidth ||
                                                      res.Width ||
                                                      "100%",
                                                    padding: "2px",
                                                  }}
                                                >
                                                  {response[res.Colname] || ""}
                                                </div>
                                              );
                                            },
                                          )}
                                        </div>
                                      </Card>
                                    );
                                  },
                                );
                              },
                            )}
                          </div>

                          {cardViewData.length === 0 && (
                            <div
                              style={{
                                textAlign: "center",
                                color: "#666",
                                marginTop: "200px",
                              }}
                            >
                              <h3>No card data available</h3>
                              <p>
                                Perform a search with card view configuration
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          {/* {Object.keys(searchLeadData).map((key: any) => {
                        return (
                          <MainTable
                            title={""}
                            columns={columnsSearchLead}
                            TableArray={searchLeadData?.tables || []}
                            IsDetailPopupOpen={searchLeadData?.isDetailPopupOpen || false}
                            handleTableLinkClick={handleTableLinkClick}
                            menuID={menuID}
                          />
                        );
                      })} */}
                          {isFileUpload && (
                            <ExcelUploadUtility
                              reportData={reportData}
                              token={token}
                            />
                          )}
                          {searchLeadData?.tables && (
                            <div>
                              {/* <div>
                              <MainTable
                                title={"Record Table"}
                                columns={columnsSearchLead}
                                TableArray={searchLeadData?.tables || []}
                                tableFooter={searchLeadData?.tableWidth || []}
                                IsDetailPopupOpen={searchLeadData?.isDetailPopupOpen || false}
                                handleTableLinkClick={handleTableLinkClick}
                                menuID={menuID}
                                editBtn={edit}
                                setEditBtn={setEdit}
                                handleSaveData={handleSaveData}
                                reportData={reportData}
                                onChangeInput={onChangeInput}
                                promiseOptions={promiseOptions}
                                dropDownArray={dropDownArray}
                                onInputChange={onInputChange}
                                loadingDropdown={loadingDropdown}
                                defaultVisible={defaultVisible || searchLeadData?.defaultVisibleSearch}
                                information={information}
                                setReportData={setReportData}
                                filename={filename}
                              />
                            </div> */}
                              <div>
                                <NewTablePage
                                  title={"Record Table"}
                                  columns={columnsSearchLead}
                                  TableArray={searchLeadData?.tables || []}
                                  tableFooter={searchLeadData?.tableWidth || []}
                                  IsDetailPopupOpen={
                                    searchLeadData?.isDetailPopupOpen || false
                                  }
                                  handleTableLinkClick={handleTableLinkClick}
                                  menuID={menuID}
                                  editBtn={edit}
                                  setEditBtn={setEdit}
                                  handleSaveData={handleDirectSave}
                                  reportData={reportData}
                                  onChangeInput={onChangeInput}
                                  promiseOptions={promiseOptions}
                                  dropDownArray={dropDownArray}
                                  onInputChange={onInputChange}
                                  loadingDropdown={loadingDropdown}
                                  defaultVisible={
                                    defaultVisible ||
                                    searchLeadData?.defaultVisibleSearch
                                  }
                                  information={information}
                                  filename={filename}
                                  ischeckBoxReq={true} // Enable row selection if needed
                                  tableFormatting={information?.tableFormatting}
                                  orientation={information?.orientation}
                                  headerRows={information?.headerRows}
                                  footerRows={information?.footerRows}
                                  tableheaderfooterCSS={
                                    information?.tableheaderfooterCSS
                                  }
                                  tableBtnInfo={tableBtnInfo}
                                  isFreezeHeader={
                                    searchLeadData?.isFreezeHeader
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </SearchDropArea>
                  </CustomTabPanel>
                  {
                    <div className={iframeShow ? "block" : "hidden"}>
                      <iframe
                        id={"myIFrame"}
                        style={{ height: "70vh", width: "100%" }}
                        src={iframeUrl}
                        allow="camera; microphone"
                      ></iframe>
                    </div>
                  }
                  {value !== 4 &&
                    leftTabs &&
                    leftTabs.map((key: any, index: number) => {
                      let componentToRender = null;
                      switch (tab) {
                        case "UserUploadedFiles":
                          if (key === "UserUploadedFiles" && information[key])
                            componentToRender = (
                              <UserUploadFiles
                                key={index}
                                UserUploadedFilesDetails={information[key]}
                                recordID={currentRecordID}
                              />
                            );
                          break;
                        case "MainCol":
                          if (key === "MainCol" && information[key])
                            componentToRender = (
                              <div>
                                <Input
                                  key={index}
                                  value={information[key]}
                                  placeholder="MainCol"
                                />
                              </div>
                            );
                          break;
                        default:
                          if (tab === key) {
                            let pos =
                              information &&
                              information["Data"] &&
                              information["Data"].find(
                                (dta: any, index: number) =>
                                  dta.Tabname === tab,
                              );
                            if (
                              pos &&
                              information &&
                              information["Data"] &&
                              information["Data"][0] &&
                              Object.keys(information["Data"][0] === "Tabname")
                            ) {
                              if (pos) {
                                componentToRender = (
                                  <PersonalDetails
                                    ref={personalDetailsRef}
                                    newFieldValues={newFieldValues}
                                    buttonMaster={buttonMaster}
                                    isOpen={isModalOpen}
                                    isModify={
                                      pos?.IsReport
                                        ? true
                                        : isModify || isAddLead
                                    }
                                    handleNext={handleNext}
                                    handleAutoCallParent={({
                                      ValueType,
                                      recordID,
                                      mainColValue,
                                      moduleID,
                                      isEdit,
                                    }: any) => {
                                      handleProfileInformation(
                                        recordID,
                                        moduleID,
                                        false,
                                        ValueType,
                                        mainColValue,
                                      );
                                    }}
                                    information={information}
                                    menuID={
                                      moduleID ? moduleID : Number(menuID)
                                    }
                                    key={index}
                                    mainColField={mainColField}
                                    SearchText={searchLeadVal}
                                    groupDetails={pos?.addmoregroupslist}
                                    personalDetails={pos?.Fields}
                                    currentRecordID={currentRecordID}
                                    handleProfileInformation={
                                      handleProfileInformation
                                    }
                                    isAccordian={pos?.IsAccordion}
                                    edit={edit}
                                    setApiCall={setApiCall}
                                    setEdit={setEdit}
                                    isDrag={isDrag}
                                    handleTableLinkClick={handleTableLinkClick}
                                    searchLeadData={searchLeadData}
                                    defaultVisible={defaultVisible}
                                    reportData={reportData}
                                    onChangeInput={onChangeInput}
                                    promiseOptions={promiseOptions}
                                    dropDownArray={dropDownArray}
                                    onInputChange={onInputChange}
                                    loadingDropdown={loadingDropdown}
                                    isPDFPreviewOpen={isPDFPreviewOpen}
                                    selectedPdfSettings={selectedPdfSettings}
                                    setSelectedPdfSettings={
                                      setSelectedPdfSettings
                                    }
                                    handleApplyPDFSettings={
                                      handleApplyPDFSettings
                                    }
                                    handleClosePDFPreview={
                                      handleClosePDFPreview
                                    }
                                    handleSaveData={handleSaveData}
                                    saveData={getCurrentSaveData()}
                                    setSaveData={setCurrentSaveData}
                                    currentRecordContext={currentRecordContext}
                                    isdisabled={isDisable}
                                    handleDirectSave={handleDirectSave}
                                    handleTableSelectionChange={
                                      handleTableSelectionChange
                                    }
                                    tableBtnInfo={tableBtnInfo}
                                    leftTabs={leftTabs}
                                    updateTabVisibility={updateTabVisibility}
                                    autopopupdrawer={autopopupdrawer}
                                  />
                                );
                              }
                            } else if (key) {
                              if (
                                information[key] !== null &&
                                Array.isArray(information[key])
                              ) {
                                componentToRender = information[key] && (
                                  <Commissions
                                    key={index}
                                    commissionDetails={information[key]}
                                  />
                                );
                              }
                            }
                          }
                          break;
                      }
                      return componentToRender;
                    })}
                </div>
              </div>
              {information?.pdfsizes && (
                <PDFSizeModal
                  isOpen={isPDFSizeModalOpen}
                  toggle={togglePDFSizeModal}
                  pdfSizes={information.pdfsizes} // Replace with your actual pdfSizes data
                  selectedSettings={selectedPdfSettings}
                  onSelectSettings={setSelectedPdfSettings}
                  onApply={handleApplyPDFSettings}
                />
              )}
            </div>
          </DndProvider>
        </ConfirmProvider>
      )}
    </>
  );
};

export default AutoCallPage;
