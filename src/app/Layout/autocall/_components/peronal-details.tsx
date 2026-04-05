import { handleSubmit } from "@/app/Layout/user-profile/_components/hooks";
import MainTable from "@/utils/table";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Drawer,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import axios from "axios";
import update from "immutability-helper";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/router";
import Tooltip from "rc-tooltip";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { XYCoord, useDrop } from "react-dnd";
import { Step, Stepper } from "react-form-stepper";
import { AiFillEdit, AiFillInfoCircle } from "react-icons/ai";
import Select, { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { ToastContainer, toast } from "react-toastify";
import {
  Button,
  Card,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";
import AutoCallPage from "..";
import { AddNewField } from "./AddNewField";
import { RenderFields } from "./renderFields";
import { RenderFieldsAddMore } from "./renderFieldsAddMore";
import { TableField } from "./Fields/Table";
import { useSelector } from "react-redux";
import { useBackground } from "../../Mailbox/utils/pagebackground";
import PDFPreviewModal from "../../Common/PdfPreviwe";
import NewTablePage from "@/utils/newTable";
import { DynamicAdvancedTabs } from "./AdvanceTabWrapper";
import { BoxComponent } from "./dnd/Box";
import { StandaloneFields } from "./NonAddmoreFields";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomLabel = memo(({ commissionTab }: any) => (
  <div style={{ width: "100%", height: "30px", padding: "10px" }} className="">
    {commissionTab?.tabname === "" ? "NONE" : commissionTab?.tabname}
  </div>
));
CustomLabel.displayName = "CustomLabel";

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      className="w-full"
    >
      {value === index && (
        <Box sx={{ p: 3, width: "100%" }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Menu = (props: any) => {
  const {
    children,
    selectProps: { inputValue, menuIsOpen, options, value },
  } = props;

  const filteredOptions = options.filter((option: any) => {
    return (
      !inputValue ||
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  });

  return (
    <components.Menu {...props}>
      {filteredOptions.length ? children : <div>No options</div>}
    </components.Menu>
  );
};

const PersonalDetails = ({
  personalDetails,
  groupDetails,
  currentRecordID,
  mainColField,
  handleProfileInformation,
  isAccordian,
  edit,
  setApiCall,
  newFieldValues,
  setEdit,
  information,
  isDrag,
  menuID,
  buttonMaster,
  handleNext,
  handleAutoCallParent,
  isModify,
  isOpen,
  searchLeadVal,
  handleTableLinkClick,
  searchLeadData,
  defaultVisible,
  reportData,
  onChangeInput,
  dropDownArray,
  loadingDropdown,
  handleApplyPDFSettings,
  isPDFPreviewOpen,
  selectedPdfSettings,
  handleClosePDFPreview,
  handleSaveData,
  saveData,
  setSaveData,
  currentRecordContext,
  isdisable,
  handleDirectSave,
  tableBtnInfo,
  leftTabs,
  updateTabVisibility,
  autopopupdrawer,
}: any) => {
  const router = useRouter();
  const apiCalledTabsRef = useRef<Set<string>>(new Set());
  const isValidatingRef = useRef(false);
  const lastValidationTimeRef = useRef(0);
  const { menuIDQuery } = router.query;
  const editorRef = useRef(null);
  const [value, setValue] = useState<any>();
  const [valueEditTab, setValueEditTab] = useState<any>(0);
  const [updatedPersonalDetails, setUpdatedPersonalDetails] = useState<any>([]);
  const [columnSelect, setColumnSelect] = useState("");
  const [loadDatabase, setLoadDatabase] = useState([]);
  const [loadColName, setLoadColName] = useState([]);
  const [serverList, setServerList] = useState<any>([]);
  const [formulaModal, setFormulaModal] = useState(false);
  const [formulaIndex, setFormulaIndex] = useState(false);
  const [editIndex, setEditIndex] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<any>([]);
  const [fullview, setFullView] = useState<any>([]);
  const [editValue, setEditValue] = useState("");
  const [savePersonalData, setSavePersonalData] = useState<any>([]);
  const [tooltipOpen, setTooltipOpen] = useState([false]);
  const [loading, setLoading] = useState(false);
  const [hideSubmit, setHideSubmit] = useState(false);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [vTimelineData, setVTimelineData] = useState<any[]>([]);
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [tableEditMode, setTableEditMode] = useState(false);
  const [addMoreSaveData, setAddMoreSaveData] = useState<{
    [key: string]: any;
  }>({});
  // ✅ CRITICAL FIX: Add selectedRowsByTable state to PersonalDetails (moved from RenderFields)
  const [selectedRowsByTable, setSelectedRowsByTable] = useState<{
    [key: string]: any[];
  }>({});

  // Callback to update selected rows from child tables
  const handleTableSelectionChanged = (
    fieldID: string,
    selectedRows: any[],
  ) => {
    setSelectedRowsByTable((prev) => {
      const newState = { ...prev, [fieldID]: selectedRows };
      // Log for debugging
      console.log(`✅ Updated selectedRowsByTable for fieldID ${fieldID}:`, {
        count: selectedRows.length,
        state: newState,
      });
      return newState;
    });
  };

  const confirm = useConfirm();
  const toggle = (index: number) => {
    const updatedToolTip = [...tooltipOpen];
    updatedToolTip[index] = !updatedToolTip[index];
    setTooltipOpen(updatedToolTip);
  };
  const [selectedDatabase, setSelectedDatabase] = useState({
    value: "",
    label: "",
  });
  const [databaseTables, setDatabaseTables] = useState<
    Array<{ Tablename: string; DbName: string }>
  >([]);
  const [selectedTables, setSelectedTables] = useState<
    Array<{ value: string; label: string; dbName: string }>
  >([]);
  const [selectedServer, setSelectedServer] = useState({
    value: "",
    label: "",
  });
  const [openDrawer, setOpenDrawer] = useState(false);
  const [calculatorData, setCalculatorData] = useState();
  const [editAutoCallData, setEditAutoCallData] = useState<any>();
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<any>();
  const [isEditNewField, setIsEditNewField] = useState<boolean>(false);
  const [editFieldData, setEditFieldData] = useState<any>(null);
  const [tableMetadata, setTableMetadata] = useState({
    isDetailPopupOpen: false,
    moduleID: null,
    fieldID: null,
    defaultVisible: false,
    tablebuttons: [],
    tableWidth: [],
    ischeckBoxReq: false,
    headerData: [],
    footerData: [],
    filename: null,
    logo: {},
    tableproperty: [],
    outsideBorder: false,
    insideBorder: false,
    tableFormatting: [],
    orientation: null,
    headerRows: [],
    footerRows: [],
    tableheaderfooterCSS: null,
    pageitemscnt: 0,
    isPagination: false,
    chartData: [],
    chartIds: [],
    chartType: "",
    isFreezeHeader: false,
    popupdrawersettings: {
      IsPopup: true,
      IsSidedrawer: false,
      popheight: "",
      popupwidth: "",
      Pos_Trans: "",
    },
  });
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const style = {
    backgroundColor: updatedPersonalDetails?.[value]?.Values?.[0]?.Bgcolor,
    color: updatedPersonalDetails?.[value]?.Values?.[0]?.fontcolor,
    fontStyle: updatedPersonalDetails?.[value]?.Values?.[0]?.Fontname,
    fontSize: updatedPersonalDetails?.[value]?.Values?.[0]?.FontSize,
  };

  const [mobileLayout, setMobileLayout] = useState(false);
  const [mandatoryFieldErrors, setMandatoryFieldErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentTabWithErrors, setCurrentTabWithErrors] = useState<
    string | null
  >(null);
  const [tabChangeAttempted, setTabChangeAttempted] = useState(false);

  const validateCurrentTabMandatoryFields = () => {
    if (!updatedPersonalDetails[value]?.Values) {
      return { isValid: true, errors: {} };
    }

    const errors: { [key: string]: boolean } = {};
    const currentTabFields = updatedPersonalDetails[value]?.Values;
    let hasErrors = false;

    currentTabFields.forEach((field: any) => {
      if (field.IsMandatory && field.DefaultVisible !== false) {
        const fieldValue = saveData[field.FieldName];
        const isEmpty =
          fieldValue === undefined ||
          fieldValue === null ||
          fieldValue === "" ||
          (typeof fieldValue === "string" && fieldValue.trim() === "");

        if (isEmpty) {
          errors[field.FieldID] = true;
          hasErrors = true;
        }
      }
    });

    return { isValid: !hasErrors, errors };
  };

  // Update saveData to track field changes
  useEffect(() => {
    if (tabChangeAttempted) {
      const validation = validateCurrentTabMandatoryFields();
      setMandatoryFieldErrors(validation.errors);
    }
  }, [saveData, value, tabChangeAttempted]);

  // Add this useEffect for responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth <= 768;
      setMobileLayout(isMobileView);
    };
    // Check immediately
    checkMobile();
    // Add event listener
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // CRITICAL FIX: Find which Data object contains the current personalDetails
  useEffect(() => {
    if (!information?.Data || !personalDetails) {
      return;
    }

    let foundIndex = -1;

    // Search through all Data objects to find which one contains our personalDetails
    information.Data.forEach((dataObj: any, dataIndex: number) => {
      if (dataObj?.Fields) {
        // Check if this Data object's Fields match our personalDetails
        const isMatch =
          JSON.stringify(dataObj.Fields) === JSON.stringify(personalDetails);

        if (isMatch) {
          foundIndex = dataIndex;
        }
      }
    });

    if (foundIndex !== -1 && foundIndex !== currentDataIndex) {
      setCurrentDataIndex(foundIndex);
    } else if (foundIndex === -1) {
      console.log(" No matching Data object found for current personalDetails");
    }
  }, [personalDetails, information?.Data]);

  const handleTableEditClick = () => {
    setTableEditMode(!tableEditMode);
    // Don't change the main edit state
  };
  // Update timeline data using the correct Data index
  useEffect(() => {
    if (!information?.Data?.[currentDataIndex]) {
      setTimelineData([]);
      setVTimelineData([]);
      return;
    }

    const currentData = information.Data[currentDataIndex];

    // Get timeline data from current Data object and current nested tab
    const timelineDatas =
      currentData?.Fields?.[value]?.Values?.[0]?.TimelineData || [];
    const vtimelineData =
      currentData?.Fields?.[value]?.Values?.[0]?.TimelineData || [];
    setTimelineData(timelineDatas);
    setVTimelineData(vtimelineData);
  }, [information, value, currentDataIndex]);

  // Alternative approach: Find by tab name if the above doesn't work
  useEffect(() => {
    if (!information?.Data || !updatedPersonalDetails?.[value]) return;

    // Get the current nested tab name
    const currentNestedTabName = updatedPersonalDetails[value]?.TabAliasName;

    if (currentNestedTabName) {
      let foundIndex = -1;

      information.Data.forEach((dataObj: any, dataIndex: number) => {
        dataObj?.Fields?.forEach((fieldGroup: any, fieldIndex: number) => {
          if (fieldGroup?.TabAliasName === currentNestedTabName) {
            foundIndex = dataIndex;
          }
        });
      });

      if (foundIndex !== -1 && foundIndex !== currentDataIndex) {
        setCurrentDataIndex(foundIndex);
      }
    }
  }, [value, updatedPersonalDetails, information?.Data]);

  const { pageBackgroundImage, pageBackgroundColor } = useBackground();
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const pxToPt = (px: number) => (px * 72) / 96;
  const ptToPx = (pt: number) => (pt * 96) / 72;

  const getDimensions = () => {
    let heightPx: number;
    let widthPx: number;

    if (!selectedPdfSettings || !selectedPdfSettings.size) {
      heightPx =
        window.innerHeight *
        (Number(information.Data[0]?.PageHeight || 100) / 100);
      widthPx = window.innerWidth; // fallback
    } else {
      const { size, orientation } = selectedPdfSettings;

      // Convert pt to px
      const sizeHeightPx = ptToPx(size.PageHeight);
      const sizeWidthPx = ptToPx(size.PageWidth);

      if (orientation === "portrait") {
        heightPx = sizeHeightPx;
        widthPx = sizeWidthPx;
      } else {
        // For landscape, swap width and height
        heightPx = sizeWidthPx;
        widthPx = sizeHeightPx;
      }
    }

    const heightPt = pxToPt(heightPx);
    const widthPt = pxToPt(widthPx);

    return {
      heightPx,
      widthPx,
      heightPt,
      widthPt,
      style: {
        height: `${heightPx}px`,
        width: `${widthPx}px`,
      },
    };
  };

  const dimensions = getDimensions();

  useEffect(() => {
    setValue(0);
    if (personalDetails) {
      setUpdatedPersonalDetails(personalDetails);
    }
  }, [personalDetails]);

  useEffect(() => {
    setUploadedFiles(information?.UserUploadedFiles || []);
  }, [information]);
  const updateFieldData = (id: string, updatedData: any) => {
    const fieldData = updatedData[value].Values.find(
      (res: any) => res.FieldID === id,
    );
    const fieldsArray = isPDFPreviewOpen
      ? [
          {
            FieldID: fieldData.FieldID,
            PDFRownum: fieldData.PDFRownum,
            PDFColnum: fieldData.PDFColnum,
            PDFHeight: fieldData.PDFHeight,
            PDFWidth: fieldData.PDFWidth,
          },
        ]
      : [
          {
            FieldID: fieldData.FieldID,
            Rownum: fieldData.Rownum,
            Colnum: fieldData.Colnum,
            Width: fieldData.Width,
            Height: fieldData.Height,
          },
        ];

    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/Updatefieldproperty",
        {
          Userid: localStorage.getItem("username"),
          ModuleId: menuIDQuery || menuID,
          Type: isPDFPreviewOpen ? "PDF" : "",
          fields: fieldsArray,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      .then((response) => {});
  };

  useEffect(() => {
    if (buttonMaster?.buttonFields?.[0]?.FieldID) {
      handleButtonMaster(buttonMaster);
    }
  }, [buttonMaster]);

  useEffect(() => {
    if (handleNext?.buttonFields?.[0]?.FieldID) {
      handleNextButton(handleNext);
    }
  }, [handleNext]);

  const handleNextButton = (buttonMaster: any) => {
    const newArray: any = [];
    updatedPersonalDetails.map((resData: any) => {
      resData?.Values.map((res: any) => {
        buttonMaster.buttonFields.map((response: any) => {
          if (Number(res.FieldID) === response.FieldID) {
            newArray.push({
              FieldID: res.FieldID,
              FieldName: res.FieldName,
              FieldValue: saveData[res.FieldName],
            });
          }
        });
      });
    });
    updatedPersonalDetails.map((resData: any) => {
      resData?.Values.map((res: any) => {
        if (Number(newArray[0].FieldID) === Number(res.FieldID)) {
          handleAutoCallParent({
            ValueType: handleNext?.ValueType,
            recordID: res.FieldValue,
          });
        }
      });
    });
  };

  const handleButtonMaster = (buttonMaster: any) => {
    const newArray: any = [];
    updatedPersonalDetails.map((resData: any) => {
      resData?.Values.map((res: any) => {
        buttonMaster.buttonFields.map((response: any) => {
          if (Number(res.FieldID) === response.FieldID) {
            newArray.push({
              FieldID: res.FieldID,
              FieldName: res.FieldName,
              FieldValue: saveData[res.FieldName],
            });
          }
        });
      });
    });
    updatedPersonalDetails.map((resData: any) => {
      resData?.Values.map((res: any) => {
        if (Number(newArray[0].FieldID) === Number(res.FieldID)) {
          setModalData({
            app_id: res.FieldValue,
            ModuleID: res.Linkmoduleid,
            width: buttonMaster.PopupWidth,
            height: buttonMaster.PopupHeight,
            IsPopUpOpen: res.IsPopUpOpen,
            SideDrawerPos: res.SideDrawerPos,
            SideDrawerWidth: res.SideDrawerWidth,
          });
          setIsModalOpen(true);
        }
      });
    });
  };

  const moveBox = useCallback(
    (id: string, left: number, top: number) => {
      // Get container dimensions
      const container = document.querySelector(".field-container");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const fieldElement = document.querySelector(`[data-field-id="${id}"]`);

      // Get field dimensions from the field data
      const field = updatedPersonalDetails[value]?.Values?.find(
        (f: any) => f.FieldID === id,
      );
      if (!field) return;

      // Get field width and height (parse px values)
      const fieldWidth = parseInt(
        String(field.Width || "100").replace("px", ""),
      );
      const fieldHeight = parseInt(
        String(field.Height || "38").replace("px", ""),
      );

      // Calculate boundaries
      const minLeft = 0;
      const maxLeft = containerRect.width - fieldWidth;
      const minTop = 0;
      const maxTop = containerRect.height - fieldHeight;

      // Constrain the position
      const constrainedLeft = Math.max(minLeft, Math.min(left, maxLeft));
      const constrainedTop = Math.max(minTop, Math.min(top, maxTop));

      const updatedData = updatedPersonalDetails.map(
        (detail: any, index: number) =>
          index === value // Ensures we update the correct `value`
            ? {
                ...detail,
                Values: detail.Values.map((tab: any) =>
                  tab.FieldID === id
                    ? update(tab, {
                        // Update appropriate coordinate system
                        ...(isPDFPreviewOpen
                          ? {
                              PDFColnum: { $set: constrainedTop },
                              PDFRownum: { $set: constrainedLeft },
                            }
                          : {
                              Colnum: { $set: constrainedTop },
                              Rownum: { $set: constrainedLeft },
                            }),
                      })
                    : tab,
                ),
              }
            : detail,
      );

      updateFieldData(id, updatedData);
      setUpdatedPersonalDetails(updatedData); // Update state with new data
    },
    [
      updatedPersonalDetails,
      setUpdatedPersonalDetails,
      value,
      isPDFPreviewOpen,
    ], // Ensure correct dependencies
  );

  const [, drop] = useDrop(
    () => ({
      accept: "box",
      drop(item: any, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
        let left = Math.round(item.left + delta.x);
        let top = Math.round(item.top + delta.y);

        // Get container dimensions
        const container = document.querySelector(".field-container");
        if (container) {
          const containerRect = container.getBoundingClientRect();

          // Get field dimensions from the item or from state
          const field = updatedPersonalDetails[value]?.Values?.find(
            (f: any) => f.FieldID === item.id,
          );
          if (field) {
            const fieldWidth = parseInt(
              String(field.Width || "100").replace("px", ""),
            );
            const fieldHeight = parseInt(
              String(field.Height || "38").replace("px", ""),
            );

            // Constrain the position
            left = Math.max(
              0,
              Math.min(left, containerRect.width - fieldWidth),
            );
            top = Math.max(
              0,
              Math.min(top, containerRect.height - fieldHeight),
            );
          }
        }

        moveBox(item.id, left, top);
        return undefined;
      },
    }),
    [moveBox, updatedPersonalDetails, value],
  );

  useEffect(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  useEffect(() => {
    setUploadedFiles(information?.UserUploadedFiles);
  }, [information]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (updatedPersonalDetails.length - 1 !== newValue) {
      handleSubmit({
        Details: updatedPersonalDetails[newValue]?.Values,
        saveData: saveData,
        main: mainColField,
        moduleID: menuIDQuery || menuID,
        setSavePersonalData,
        newValue,
        savePersonalData,
        length: updatedPersonalDetails?.length,
        currentRecordID,
        setLoading,
        isOpen,
        information,
      });
    }
  };

  useEffect(() => {
    apiCalledTabsRef.current = new Set();
  }, [currentRecordID]);

  // In PersonalDetails component, add a useEffect to listen for chart data changes
  useEffect(() => {
    if (tableMetadata.chartData && tableMetadata.chartIds) {
      const newDetails = [...updatedPersonalDetails];

      tableMetadata.chartIds.forEach((chartInfo: any) => {
        const chartFieldID = chartInfo.FieldID;

        newDetails.forEach((tab: any) => {
          tab?.Values?.forEach((fieldItem: any) => {
            if (
              fieldItem.FieldID == chartFieldID &&
              fieldItem.FieldType === "CHART"
            ) {
              // Update the chart with new data
              fieldItem.ChartData = tableMetadata.chartData;
              // You might want to update ValueType if provided
              if (tableMetadata.chartType) {
                fieldItem.ValueType = tableMetadata.chartType;
              }
            }
          });
        });
      });

      setUpdatedPersonalDetails(newDetails);
    }
  }, [tableMetadata.chartData, tableMetadata.chartIds]);

  const handleChangeEdit = (event: React.SyntheticEvent, newValue: number) => {
    setValueEditTab(newValue);
  };

  const handleChangeAccordian =
    (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      if (panel === value) {
        setValue(-1);
      } else {
        setValue(panel);
      }
    };

  // Get the current tab's background color from nestdtabsecbgcolor
  const getCurrentTabBgColor = () => {
    // If no personalDetails or value is not set, return default
    if (
      !updatedPersonalDetails?.length ||
      value === undefined ||
      value === null
    ) {
      return information?.Data?.[0]?.Fields?.[0]?.Bgcolor || "#ffffff";
    }

    // Get the current nested tab data from updatedPersonalDetails
    const currentNestedTab = updatedPersonalDetails[value];

    if (currentNestedTab) {
      // First check if nestdtabsecbgcolor exists directly on the nested tab
      if (currentNestedTab.Bgcolor) {
        return currentNestedTab.Bgcolor;
      }

      // If not, check in the Values array (since Fields is an array of Values)
      if (currentNestedTab.Values && currentNestedTab.Values.length > 0) {
        // Look for nestdtabsecbgcolor in the first field of the nested tab
        const firstField = currentNestedTab.Values[0];
        if (firstField?.Bgcolor) {
          return firstField.Bgcolor;
        }
      }
    }

    // Fallback: Try to find by scanning all Data objects
    if (information?.Data) {
      for (const dataObj of information.Data) {
        if (dataObj?.Fields) {
          for (const fieldGroup of dataObj.Fields) {
            // Check if this field group's Nestedtab matches the active nested tab
            if (fieldGroup.Nestedtab === currentNestedTab?.Nestedtab) {
              if (fieldGroup.Bgcolor) {
                return fieldGroup.Bgcolor;
              }
            }
          }
        }
      }
    }
  };

  // Get the current tab's text color
  const getCurrentTabFontColor = () => {
    const currentTab = updatedPersonalDetails?.[value];
    const firstFieldFontColor = currentTab?.Values?.[0]?.fontcolor;
    const infoFontColor =
      information?.Data?.[currentDataIndex]?.Fields?.[value]?.Values?.[0]
        ?.fontcolor;

    return firstFieldFontColor || infoFontColor || "#000000";
  };

  // Get the current tab's font family
  const getCurrentTabFontFamily = () => {
    const currentTab = updatedPersonalDetails?.[value];
    const firstFieldFont = currentTab?.Values?.[0]?.Fontname;
    const infoFont =
      information?.Data?.[currentDataIndex]?.Fields?.[value]?.Values?.[0]
        ?.Fontname;

    return firstFieldFont || infoFont || "inherit";
  };

  const promiseOptions = (
    inputValue: string,
    i?: number,
    isAddMore?: boolean,
  ) => {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve(AddDropDownData(inputValue, i, isAddMore));
      }, 1000);
    });
  };

  const AddDropDownData = async (
    text: any,
    i?: number,
    isAddMore?: boolean,
  ) => {
    try {
      const columnsData = updatedPersonalDetails[value].Values.find(
        (reportCol: any) => Number(reportCol.FieldID) === Number(columnSelect),
      );
      if (!columnsData) {
        return [];
      }
      const dynamicPayload = buildDynamicPayload(
        columnsData,
        null,
        isAddMore,
        i,
      );
      if (!dynamicPayload.Colname) {
        return;
      }
      const data = {
        ...dynamicPayload,
        Userid: localStorage.getItem("username"),
        SearchText: text,
      };
      const res = await axios.post(columnsData.APIURL, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res?.data?.colvalues) {
        const options = res.data.colvalues.map((value: any) => ({
          value: value.Colvalue,
          label: value.colvaluesAlias,
          fieldnamechange: value.fieldnamechange,
          visibilityfields: value.visibilityfields,
          OuterTabVisibility: value.OuterTabVisibility || [],
        }));
        return options;
      }
    } catch (error) {
      return [];
    }
  };
  const calculateFormula = (
    formula: any,
    data: any,
    personalDetails: any,
    addMoreIndex?: number,
  ) => {
    if (!formula || !Array.isArray(formula)) {
      return null;
    }

    // Create a comprehensive data object with ALL field values
    const allValues: any = { ...data };

    // If we're in add-more context and have an index, add add-more values
    if (addMoreIndex !== undefined) {
      personalDetails.forEach((tab: any) => {
        tab.Values.forEach((field: any) => {
          if (
            field.IsAddMore &&
            field.addmorevalues &&
            field.addmorevalues[addMoreIndex]
          ) {
            allValues[field.FieldName] =
              field.addmorevalues[addMoreIndex].FieldValue || "0";
            if (field.Colname) {
              allValues[field.Colname] =
                field.addmorevalues[addMoreIndex].FieldValue || "0";
            }
            if (field.ReadColname) {
              allValues[field.ReadColname] =
                field.addmorevalues[addMoreIndex].FieldValue || "0";
            }
          }
        });
      });
    }

    // Check if it's a single label formula (simple field reference or function)
    if (formula.length === 1 && formula[0].label) {
      const label = formula[0].label.trim();

      // Check if it's a SUM function first
      if (label.toLowerCase().startsWith("sum(")) {
        const fieldNameMatch = label.match(/sum\((.+)\)/i);
        if (fieldNameMatch) {
          const fieldName = fieldNameMatch[1].trim();

          // Find the field and calculate sum of all add-more rows across ALL tabs
          let totalSum = 0;

          personalDetails.forEach((tab: any) => {
            tab.Values.forEach((field: any) => {
              if (
                field.FieldName === fieldName ||
                field.Colname === fieldName ||
                field.ReadColname === fieldName
              ) {
                if (field.IsAddMore && field.addmorevalues) {
                  // Sum all add-more values for this field
                  totalSum = field.addmorevalues.reduce(
                    (sum: number, item: any) => {
                      return sum + (Number(item.FieldValue) || 0);
                    },
                    0,
                  );
                } else {
                  // Regular field value
                  totalSum = Number(allValues[field.FieldName]) || 0;
                }
              }
            });
          });

          return totalSum;
        }
      }

      // Try to find the field by Colname (case-insensitive) - simple field reference
      let foundFieldValue: unknown = null;

      // First, try to find in allValues (which includes saveData and add-more values)
      for (const [key, value] of Object.entries(allValues)) {
        if (key.toLowerCase() === label.toLowerCase()) {
          foundFieldValue = value;
          break;
        }
      }

      // If not found, search through personalDetails by Colname across ALL tabs
      if (foundFieldValue === null) {
        personalDetails.forEach((tab: any) => {
          tab.Values.forEach((field: any) => {
            if (
              field.Colname &&
              field.Colname.toLowerCase() === label.toLowerCase()
            ) {
              // For add-more fields with specific index
              if (
                addMoreIndex !== undefined &&
                field.IsAddMore &&
                field.addmorevalues &&
                field.addmorevalues[addMoreIndex]
              ) {
                foundFieldValue = field.addmorevalues[addMoreIndex].FieldValue;
              } else {
                foundFieldValue =
                  allValues[field.FieldName] || field.FieldValue;
              }
            }
            // Also check ReadColname as fallback
            if (
              foundFieldValue === null &&
              field.ReadColname &&
              field.ReadColname.toLowerCase() === label.toLowerCase()
            ) {
              if (
                addMoreIndex !== undefined &&
                field.IsAddMore &&
                field.addmorevalues &&
                field.addmorevalues[addMoreIndex]
              ) {
                foundFieldValue = field.addmorevalues[addMoreIndex].FieldValue;
              } else {
                foundFieldValue =
                  allValues[field.FieldName] || field.FieldValue;
              }
            }
            // Also check FieldName as fallback
            if (
              foundFieldValue === null &&
              field.FieldName &&
              field.FieldName.toLowerCase() === label.toLowerCase()
            ) {
              if (
                addMoreIndex !== undefined &&
                field.IsAddMore &&
                field.addmorevalues &&
                field.addmorevalues[addMoreIndex]
              ) {
                foundFieldValue = field.addmorevalues[addMoreIndex].FieldValue;
              } else {
                foundFieldValue =
                  allValues[field.FieldName] || field.FieldValue;
              }
            }
          });
        });
      }

      // If found, return the value (convert to number if it looks like a number)
      if (
        foundFieldValue !== null &&
        foundFieldValue !== undefined &&
        foundFieldValue !== ""
      ) {
        // Try to convert to number if it's a numeric string
        const numValue = Number(foundFieldValue);
        return isNaN(numValue) ? foundFieldValue : numValue;
      }

      // If not found, return empty string
      return "";
    }

    // Original logic for complex formulas with operators
    const expressionParts = formula.map((part: any) => {
      if (typeof part === "object" && part.label !== undefined) {
        // Skip empty labels
        if (
          part.label === "" ||
          part.label === null ||
          part.label === undefined
        ) {
          return "";
        }

        // Check if it's a numeric value
        if (!isNaN(part.label)) {
          return part.label;
        }

        // Check if it's an operator or special character
        const operators = [
          "+",
          "-",
          "*",
          "/",
          "(",
          ")",
          "[",
          "]",
          "{",
          "}",
          "sum(",
          ")",
        ];
        if (operators.includes(part.label.trim())) {
          return part.label;
        }

        // Handle SUM function
        if (part.label.toLowerCase().startsWith("sum(")) {
          const fieldNameMatch = part.label.match(/sum\((.+)\)/i);
          if (fieldNameMatch) {
            const fieldName = fieldNameMatch[1].trim();

            // Find the field and calculate sum of all add-more rows across ALL tabs
            let totalSum = 0;

            personalDetails.forEach((tab: any) => {
              tab.Values.forEach((field: any) => {
                if (
                  field.FieldName === fieldName ||
                  field.Colname === fieldName ||
                  field.ReadColname === fieldName
                ) {
                  if (field.IsAddMore && field.addmorevalues) {
                    // Sum all add-more values for this field
                    totalSum = field.addmorevalues.reduce(
                      (sum: number, item: any) => {
                        return sum + (Number(item.FieldValue) || 0);
                      },
                      0,
                    );
                  } else {
                    // Regular field value
                    totalSum = Number(allValues[field.FieldName]) || 0;
                  }
                }
              });
            });

            return totalSum;
          }
        }

        // Find the field that has this colname or fieldname
        let fieldName = null;
        let fieldValue = null;

        personalDetails.forEach((tab: any) => {
          tab.Values.forEach((field: any) => {
            if (
              field.Colname === part.label ||
              field.FieldName === part.label ||
              field.ReadColname === part.label
            ) {
              fieldName = field.FieldName;

              // For add-more fields with specific index
              if (
                addMoreIndex !== undefined &&
                field.IsAddMore &&
                field.addmorevalues &&
                field.addmorevalues[addMoreIndex]
              ) {
                fieldValue = field.addmorevalues[addMoreIndex].FieldValue;
              } else {
                fieldValue = allValues[field.FieldName];
              }
            }
          });
        });

        if (fieldName && allValues[fieldName] !== undefined) {
          const value = allValues[fieldName] || 0;
          return value;
        } else if (fieldValue !== null) {
          return fieldValue || 0;
        } else {
          return "0";
        }
      } else {
        return part.label || part || "";
      }
    });

    // Join and clean up the expression
    let expression = expressionParts.join(" ").replace(/\s+/g, " ").trim();

    // Remove any double spaces and ensure proper formatting
    expression = expression.replace(/\s*([+\-*/()])\s*/g, " $1 ");

    // Handle sum function in expression
    expression = expression.replace(
      /sum\s*\(\s*(\w+)\s*\)/gi,
      (match, fieldName) => {
        let totalSum = 0;
        // Search across ALL tabs for the field
        personalDetails.forEach((tab: any) => {
          tab.Values.forEach((field: any) => {
            // Match by FieldName, Colname, or ReadColname
            if (
              field.FieldName === fieldName ||
              field.Colname === fieldName ||
              field.ReadColname === fieldName
            ) {
              if (field.IsAddMore && field.addmorevalues) {
                totalSum = field.addmorevalues.reduce(
                  (sum: number, item: any) => {
                    return sum + (Number(item.FieldValue) || 0);
                  },
                  0,
                );
              } else {
                // Try to get from allValues first, then fallback to field value
                totalSum =
                  Number(allValues[field.FieldName]) ||
                  Number(field.FieldValue) ||
                  0;
              }
            }
          });
        });
        return totalSum.toString();
      },
    );

    try {
      if (!expression || expression.trim() === "" || expression === "0") {
        return 0;
      }

      const result = new Function("return " + expression)();
      return isNaN(result) ? 0 : result;
    } catch (error) {
      console.error(
        "Error evaluating formula:",
        error,
        "Expression:",
        expression,
      );
      return 0;
    }
  };

  const applyAllFormulas = (
    currentData: any,
    personalDetails: any,
    addMoreIndex?: number,
  ) => {
    const calculatedData = { ...currentData };

    // We might need multiple passes for dependent formulas
    let hasChanges = true;
    let maxIterations = 5;
    let iteration = 0;

    while (hasChanges && iteration < maxIterations) {
      hasChanges = false;
      iteration++;

      // Process ALL tabs and fields
      personalDetails.forEach((tab: any) => {
        tab.Values.forEach((field: any) => {
          if (field.IsFormulaApply && !field.IsAddMore && field.Formula) {
            try {
              const oldValue = calculatedData[field.FieldName];
              const calculatedValue = calculateFormula(
                field.Formula,
                calculatedData,
                personalDetails,
                addMoreIndex,
              );

              if (calculatedValue !== null && calculatedValue !== undefined) {
                const newValue = Number(calculatedValue) || 0;
                if (newValue !== oldValue) {
                  calculatedData[field.FieldName] = newValue;
                  hasChanges = true;
                }
              }
            } catch (error) {
              console.error(
                `Error calculating formula for ${field.FieldName}:`,
                error,
              );
            }
          }
        });
      });
    }
    return calculatedData;
  };

  useEffect(() => {
    if (
      Object.keys(saveData).length > 0 &&
      updatedPersonalDetails?.length > 0
    ) {
      const updatedData = applyAllFormulas(saveData, updatedPersonalDetails);
      if (JSON.stringify(updatedData) !== JSON.stringify(saveData)) {
        setSaveData(updatedData);
      }
    }
  }, [saveData, updatedPersonalDetails]);

  // Update handleInputChange function to handle tab visibility
  const handleInputChange = (e: any, isDropdown: boolean) => {
    if (isDropdown) {
      const updatedPersonalDetailsData = [...updatedPersonalDetails];
      const dynamicFieldArray: any = [...(e.target.dropdownSplitData || [])];

      // Get TabVisibility from the dropdown response
      const tabVisibilityData = e.target.TabVisibility || [];
      const outerTabVisibilityData = e.target.OuterTabVisibility || [];

      // Call parent function to update outer tab visibility
      if (updateTabVisibility && outerTabVisibilityData.length > 0) {
        updateTabVisibility(outerTabVisibilityData);
      }

      // Update field names and visibility across ALL tabs
      updatedPersonalDetailsData.forEach((tab: any, tabIndex: number) => {
        // Update tab visibility based on TabVisibility array
        tabVisibilityData.forEach((tabVisibility: any) => {
          // Compare tab names (case-insensitive)
          const tabNameMatches =
            tab.TabAliasName?.toLowerCase() ===
            tabVisibility.Tabname?.toLowerCase();
          const nestedTabMatches =
            tab.Nestedtab?.toLowerCase() ===
            tabVisibility.Tabname?.toLowerCase();

          if (tabNameMatches || nestedTabMatches) {
            tab.DefaultVisible = tabVisibility.IsVisible;
          }
        });

        tab.Values.forEach((response: any) => {
          // Update field names
          e?.target?.fieldnamechange?.forEach((responseData: any) => {
            if (responseData.FieldID === Number(response.FieldID)) {
              const isUploadedFilesTable =
                response.FieldType === "TABLE" &&
                response.FieldName === "Uploaded Files";
              if (isUploadedFilesTable) {
                console.log(
                  `Skipping FieldName update for "Uploaded Files" table - FieldID: ${response.FieldID}`,
                );
              } else {
                response.FieldName = responseData.FieldName;
              }
            }
          });
          // Update visibility
          e?.target?.visibilityfields?.forEach((responseData: any) => {
            if (responseData.FieldID === Number(response.FieldID)) {
              response.DefaultVisible = responseData.IsDisplay;
            }
          });
        });
      });
      let newSaveData = { ...saveData };

      if (dynamicFieldArray.length > 0) {
        const updatedValues = e.target.value.split("|");

        // Update main field
        newSaveData[e.target.name] = updatedValues[0];
        // Update dependent fields from DropDownSplitData across ALL tabs
        dynamicFieldArray.forEach((splitField: any) => {
          let fieldUpdated = false;
          updatedPersonalDetailsData.forEach((tab: any) => {
            tab.Values.forEach((field: any) => {
              if (Number(field.FieldID) === Number(splitField.FieldID)) {
                const fieldValue = updatedValues[splitField.Index] || "";
                newSaveData[field.FieldName] = fieldValue;
                fieldUpdated = true;
              }
            });
          });
        });
      } else {
        // Simple dropdown without split data
        newSaveData[e.target.name] = e.target.value;
      }

      // Handle child fields across ALL tabs
      if (e?.target?.childfields?.length > 0) {
        e.target.childfields.forEach((resData: any) => {
          updatedPersonalDetailsData.forEach((tab: any) => {
            tab.Values.forEach((response: any) => {
              if (resData.FieldID === Number(response.FieldID)) {
                getDropdownValueFromSelection(response, newSaveData);
              }
            });
          });
        });
      }

      // Apply formulas immediately after dropdown selection across ALL tabs
      newSaveData = applyAllFormulas(newSaveData, updatedPersonalDetailsData);

      updatedPersonalDetailsData.forEach((tab: any, tabIndex: number) => {
        // Check against all possible tab identifiers
        const tabNameMatches =
          tab.TabAliasName?.toLowerCase() === tab.TabName?.toLowerCase() ||
          tab.Nestedtab?.toLowerCase() === tab.TabName?.toLowerCase();

        outerTabVisibilityData.forEach((tabVisibility: any) => {
          // Check if this tab matches the Tabname from OuterTabVisibility
          const matchesTabName =
            tab.TabAliasName?.toLowerCase() ===
              tabVisibility.Tabname?.toLowerCase() ||
            tab.Nestedtab?.toLowerCase() ===
              tabVisibility.Tabname?.toLowerCase() ||
            tab.Tabname?.toLowerCase() === tabVisibility.Tabname?.toLowerCase();

          if (matchesTabName) {
            console.log(
              `Setting OuterTab visibility for ${tab.TabAliasName}: ${tabVisibility.IsVisible}`,
            );
            tab.DefaultVisible = tabVisibility.IsVisible;
          }
        });
      });

      setSaveData(newSaveData);
      setUpdatedPersonalDetails(updatedPersonalDetailsData);
    } else {
      let newSaveData = {
        ...saveData,
        [e.target.name]: e.target.value,
      };
      // Apply formulas for regular input changes across ALL tabs
      newSaveData = applyAllFormulas(newSaveData, updatedPersonalDetails);

      setSaveData(newSaveData);
    }
  };

  const AddMoreEvaluateFormula = (
    details: any,
    formula: any,
    i: number,
    calculatedData: any,
    addMoreData?: any,
  ) => {
    if (!formula) {
      return;
    }
    // Create a simple expression evaluator
    const tokens = formula.map((f: any) => f.label);
    let expression = tokens.join(" ");
    // Replace field labels with their values
    tokens.forEach((token: any) => {
      details.map((res: any) => {
        const field = res?.Values.find(
          (v: any) => v.Colname === token && v.Colname !== "",
        );
        if (field) {
          const value =
            field?.addmorevalues?.length > 0
              ? Number(field.addmorevalues[i]?.FieldValue)
              : Number(calculatedData[field?.FieldName]);
          expression = expression.replace(token, Number(value || 0));
        }
      });
    });

    try {
      return eval(expression);
    } catch (error) {
      return 0;
    }
  };

  useEffect(() => {
    setValue(0);
    if (personalDetails) {
      setUpdatedPersonalDetails(personalDetails);
    }
  }, [personalDetails]);

  useEffect(() => {
    getDropdownValues(updatedPersonalDetails);
  }, [personalDetails, value]);

  useEffect(() => {
    if (newFieldValues.length > 0) {
      setSaveData((prev: any) => {
        const newSaveData = { ...prev };
        newFieldValues.forEach((res: any) => {
          if (res.FieldName && res.FieldValue !== "") {
            newSaveData[res.FieldName] = res.FieldValue;
          }
        });
        return newSaveData;
      });
    }
  }, [newFieldValues]);
  function buildDynamicPayload(
    field: any,
    state?: any,
    isAddMore?: boolean,
    addMoreIndex?: number,
  ) {
    let updatedSavedData: any = null;
    if (state) {
      updatedSavedData = { ...state };
    } else {
      updatedSavedData = { ...saveData };
    }
    const payload: any = {};
    const arrays: any = {};

    if (!field.apifields) return {};

    for (const config of field.apifields) {
      const { KeyName, KeyValue, KeyType, ArrayName, IsParent } = config;

      if (KeyType === "ELEMENT") {
        if (!ArrayName) {
          // Simple key-value
          payload[KeyName] = field[KeyValue] ?? "";
        } else {
          // Array element - we'll construct array later
          if (!arrays[ArrayName]) arrays[ArrayName] = [];
          arrays[ArrayName].push({
            [KeyName]: field[KeyValue] ?? "",
          });
        }
      } else if (KeyType === "ARRAY") {
        // Placeholder for array, to be filled
        payload[KeyName] = [];
      }
    }

    // Special case: populate parentFields if defined
    if (field.parentFields && Array.isArray(field.parentFields)) {
      const parentArray = [];

      for (const parent of field.parentFields) {
        const entry: any = {};

        for (const config of field.apifields) {
          if (config.ArrayName === "parentFields") {
            const val = parent[config.KeyValue] ?? field[config.KeyValue] ?? "";
            entry[config.KeyName] = val;
          }
        }
        updatedPersonalDetails.map((redData: any) => {
          return redData.Values.map((response: any) => {
            if (Number(entry.ParentID) === Number(response.FieldID)) {
              entry.ParentID = response.FieldID;

              // Check if this is an add-more field and we're in add-more context
              if (
                isAddMore &&
                addMoreIndex !== undefined &&
                response.IsAddMore &&
                response.AddMoreGroup
              ) {
                // Get value from addmorevalues array
                const addMoreValue =
                  response.addmorevalues?.[addMoreIndex]?.FieldValue || "";
                entry.ParentValue = addMoreValue;
              } else {
                // Regular field - get from saveData
                entry.ParentValue = updatedSavedData[response.FieldName] || "";
              }
            }
          });
        });
        parentArray.push(entry);
      }

      payload["parentFields"] = parentArray;
    }

    return payload;
  }

  const getDropdownValues = (updatedPersonalDetailsData: any) => {
    const newDetails = [...updatedPersonalDetailsData];
    let colData: any = [];
    newDetails.map((res: any, index: any) => {
      if (index === value) {
        res.Values.filter(async (response: any) => {
          if (response.FieldType === "DROPDOWN") {
            const dynamicPayload = buildDynamicPayload(response);
            if (!dynamicPayload.Colname) {
              return;
            }
            const data = {
              ...dynamicPayload,
              Userid: localStorage.getItem("username"),
              SearchText: searchLeadVal,
            };

            const res: any = await axios.post(response.APIURL, data, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            if (res?.data?.colvalues) {
              colData = [...res?.data?.colvalues];
              const options = res.data.colvalues.map((value: any) => ({
                value: value.Colvalue,
                label: value.colvaluesAlias,
                fieldnamechange: value.fieldnamechange,
                visibilityfields: value.visibilityfields,
                TabVisibility: value.TabVisibility || [],
                OuterTabVisibility: value.OuterTabVisibility || [],
              }));
              response.DropdownArray = options;
              response.childfields = res?.data?.childfields;
            }
          }
        });
      }
    });
    if (newDetails.length > 0) {
      const groupedFields = newDetails?.[value]?.Values?.reduce(
        (acc: any, field: any) => {
          if (!acc[field.AddMoreGroup]) {
            acc[field.AddMoreGroup] = [];
          }
          acc[field.AddMoreGroup].push(field);
          return acc;
        },
        {},
      );
      if (groupedFields) {
        {
          Object?.entries(groupedFields)?.map(
            ([groupName, fieldsInGroup]: any) => {
              newDetails?.[value]?.Values.map((res: any) => {
                if (res.AddMoreGroup === groupName) {
                  res.addmorevalues =
                    res.addmorevalues?.length === 0
                      ? [
                          {
                            ValIndex: 1,
                            FieldValue: res.FieldValue,
                            FieldID: res.FieldID,
                            FieldName: res.FieldName,
                            FieldType: res.FieldType,
                          },
                        ]
                      : res.addmorevalues;
                }
              });
            },
          );
        }
      }
    }
    // setUpdatedPersonalDetails(newDetails);
  };

  const getDropdownValueFromSelection = (responseData: any, state: any) => {
    const newDetails = [...updatedPersonalDetails];

    // Search across ALL tabs for the field
    newDetails.forEach((tab: any, tabIndex: number) => {
      tab.Values.filter(async (response: any) => {
        if (response.FieldType === "DROPDOWN") {
          if (Number(response.FieldID) === Number(responseData.FieldID)) {
            const dynamicPayload = buildDynamicPayload(response, state);
            if (!dynamicPayload.Colname) {
              return;
            }
            const data = {
              ...dynamicPayload,
              Userid: localStorage.getItem("username"),
              SearchText: searchLeadVal,
            };

            const res: any = await axios.post(response.APIURL, data, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            if (res?.data?.colvalues) {
              const options = res.data.colvalues.map((value: any) => ({
                value: value.Colvalue,
                label: value.colvaluesAlias,
                fieldnamechange: value.fieldnamechange,
                visibilityfields: value.visibilityfields,
              }));
              response.DropdownArray = options;
              response.childfields = res?.data?.childfields;
            }
          }
        }
      });
    });

    setUpdatedPersonalDetails(newDetails);
  };
  const onInputChange = (FieldName: any) => {
    setColumnSelect(FieldName);
  };

  const getCalculatorData = async (url: string, data: any) => {
    try {
      let result = await axios.post(url, JSON.parse(data), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (result?.data) {
        setCalculatorData(result?.data?.Data);
        setOpenDrawer(!openDrawer);
      }
    } catch (error) {}
  };

  // Handling the selection change
  const handleSelectChangeAddMore = (
    selectedOption: any,
    field: any,
    valueKey: any,
    detailsState: any,
    currentIndex: any,
  ) => {
    // Split the selected value by pipe delimiter
    const splitValues = selectedOption.value.split("|");

    // Creating a deep clone of the state
    const nextState = JSON.parse(JSON.stringify(detailsState));

    // Getting the current tab's values
    const tabValues = nextState[valueKey].Values;

    // First, updating the main dropdown field
    const mainFieldIndex = tabValues.findIndex(
      (item: any) => Number(item.FieldID) === Number(field.FieldID),
    );

    if (mainFieldIndex !== -1) {
      if (!tabValues[mainFieldIndex].addmorevalues) {
        tabValues[mainFieldIndex].addmorevalues = [];
      }

      // Ensure addmorevalues array exists for this index
      if (!tabValues[mainFieldIndex].addmorevalues[currentIndex]) {
        tabValues[mainFieldIndex].addmorevalues[currentIndex] = {
          FieldValue: "",
          FieldID: field.FieldID,
          FieldName: field.FieldName,
        };
      }

      // Update the value
      tabValues[mainFieldIndex].addmorevalues[currentIndex].FieldValue =
        splitValues[0] || "";
      console.log(`  Set ${field.FieldName} to: "${splitValues[0]}"`);
    }

    // Update all fields in DropDownSplitData
    if (field.DropDownSplitData && field.DropDownSplitData.length > 0) {
      field.DropDownSplitData.forEach((splitField: any) => {
        const fieldId = splitField.FieldID;
        const splitIndex = splitField.Index;

        // Get the value at this specific index
        let splitValue = "";
        if (splitIndex >= 0 && splitIndex < splitValues.length) {
          splitValue = splitValues[splitIndex] || "";
        }
        // Find this field in the tab values
        const fieldIndex = tabValues.findIndex(
          (item: any) => Number(item.FieldID) === Number(fieldId),
        );

        if (fieldIndex !== -1) {
          console.log(`    Found field: ${tabValues[fieldIndex].FieldName}`);

          // Initialize addmorevalues if needed
          if (!tabValues[fieldIndex].addmorevalues) {
            tabValues[fieldIndex].addmorevalues = [];
          }

          // Ensure addmorevalues array exists for this index
          if (!tabValues[fieldIndex].addmorevalues[currentIndex]) {
            tabValues[fieldIndex].addmorevalues[currentIndex] = {
              FieldValue: "",
              FieldID: fieldId,
              FieldName: tabValues[fieldIndex].FieldName,
            };
          }

          // Update the value
          tabValues[fieldIndex].addmorevalues[currentIndex].FieldValue =
            splitValue;
          // Handle calculation API call if needed
          if (tabValues[fieldIndex].IscalcapiCall) {
            handleCalculateData(
              tabValues[fieldIndex],
              currentIndex,
              splitValue,
            );
          }
        } else {
          console.log(
            `    WARNING: FieldID ${fieldId} not found in tab values!`,
          );
        }
      });
    }

    tabValues.forEach((item: any) => {
      if (item.addmorevalues && item.addmorevalues[currentIndex]) {
        console.log(
          `  ${item.FieldName}: "${item.addmorevalues[currentIndex].FieldValue}"`,
        );
      }
    });

    // Update the state
    setUpdatedPersonalDetails(nextState);

    // Update saveData
    const updatedSaveData = { ...saveData };

    tabValues.forEach((item: any) => {
      if (item.addmorevalues && item.addmorevalues[currentIndex]) {
        updatedSaveData[item.FieldName] =
          item.addmorevalues[currentIndex].FieldValue;
      }
    });

    setSaveData(updatedSaveData);
  };

  const evaluateFormula = (details: any, formula: any, i: number) => {
    if (!formula) {
      return;
    }
    // Create a simple expression evaluator
    const tokens = formula.map((f: any) => f.label);
    let expression = tokens.join(" ");
    // Replace field labels with their values
    tokens.forEach((token: any) => {
      details.map((res: any) => {
        const field = res?.Values.find((v: any) => v.Colname === token);
        if (field) {
          const value =
            field?.addmorevalues?.length > 0
              ? Number(field.addmorevalues[i]?.FieldValue) || 0
              : saveData[field?.FieldName] || 0;
          expression = expression.replace(token, value);
        }
      });
    });
    try {
      return eval(expression);
    } catch (error) {
      console.error("Error evaluating formula:", error);
      return 0;
    }
  };

  const handleCalculateData = async (field: any, i: number, value: any) => {
    const FinalValue =
      Number(value) > Number(field?.addmorevalues[i]?.FieldValue)
        ? Math.abs(Number(value) - Number(field?.addmorevalues[i]?.FieldValue))
        : -(Number(field?.addmorevalues[i]?.FieldValue) - Number(value));
    const nextState = [...updatedPersonalDetails];
    nextState.map((res: any) => {
      res.Values.map(async (response: any) => {
        if (response.FieldID === field.ParentIDFormula) {
          const data = {
            Userid: localStorage.getItem("username"),
            ModuleID: Number(menuIDQuery || menuID),
            FieldID: field.FieldID,
            OldValue: saveData[response.FieldName],
            Value: FinalValue,
          };
          axios
            .post(
              "https://logpanel.insurancepolicy4u.com/api/Login/Calculate",
              data,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              },
            )
            .then((responseData: any) => {
              const newState = [...updatedPersonalDetails];
              newState.map((res: any) => {
                res.Values.map(async (response: any) => {
                  if (response.FieldID === field.ParentIDFormula) {
                    let state = {
                      ...saveData,
                      [response.FieldName]: Number(responseData.data.Value),
                    };
                    setSaveData((prev: any) => ({
                      ...prev,
                      [response.FieldName]: Number(responseData.data.Value),
                    }));
                  }
                });
              });
            });
        }
      });
    });
  };

  useEffect(() => {
    const nextState = [...updatedPersonalDetails];
    if (nextState?.length > 0 && nextState[value]?.Values) {
      nextState[value].Values.forEach((res: any) => {
        if (saveData[res.FieldName] !== undefined) {
          // Handle file objects specifically
          res.FieldValue =
            typeof saveData[res.FieldName] === "object"
              ? saveData[res.FieldName]
              : saveData[res.FieldName];
        }
      });
      setUpdatedPersonalDetails(nextState);
    }
  }, [saveData, value]);
  const handleExcelFileUpload = async (field: any) => {
    // 1. Find the main column value
    const mainCol = updatedPersonalDetails[0]?.Values?.find(
      (res: any) => res.IsMainCol,
    );
    const recordId = mainCol?.FieldValue || currentRecordID;
    const newArray: any = [];
    information.Data.forEach((dataObj: any) => {
      dataObj?.Fields?.forEach((fieldGroup: any) => {
        fieldGroup?.Values?.forEach((res: any) => {
          field.buttonFields.forEach((response: any) => {
            if (
              Number(res.FieldID) === response.FieldID &&
              saveData[res.FieldName]
            ) {
              newArray.push({
                FieldID: res.FieldID,
                FieldName: res.FieldName,
                FieldValue: saveData[res.FieldName],
              });
            }
          });
        });
      });
    });
    // 2. Initialize the payload with basic data
    const payload: any = {
      Userid: localStorage.getItem("username"),
      ModuleID: Number(menuIDQuery || menuID),
      RecordID: recordId,
      CreatedBy: saveData.CreatedBy || localStorage.getItem("username"),
      FileName: saveData?.Filepath?.Filename || saveData?.Upload?.Filename,
      Base64string:
        saveData?.Filepath?.base64string.split(",")[1] ||
        saveData?.Upload?.base64string.split(",")[1],
      PostedJson: newArray,
    };

    // 3. Handle buttonFields configuration
    if (field.buttonFields && field.buttonFields.length > 0) {
      let fileFound = false;

      field.buttonFields.forEach((buttonField: any) => {
        // Find the field definition in personal details
        const fieldDef = updatedPersonalDetails[value]?.Values?.find(
          (res: any) => Number(res.FieldID) === buttonField.FieldID,
        );

        if (fieldDef) {
          // Get the actual value from saveData using FieldName
          const fieldValue = saveData[fieldDef.FieldName];

          // Special handling for file upload fields
          if (fieldDef.FieldType === "UPLOAD" && fieldValue?.base64string) {
            payload.FileName = fieldValue.Filename;
            payload.Base64string = fieldValue.base64string.split(",")[1] || "";
            fileFound = true;
          }
          // Add other fields to payload
          else if (fieldValue !== undefined) {
            // Use the FieldName as the key unless KeyName is specified
            const payloadKey = buttonField.KeyName || fieldDef.FieldName;
            payload[payloadKey] = fieldValue;
          }
        }
      });

      // if (!fileFound) {
      //   toast.error("No file selected for upload!", { style: { top: 80 } });
      //   return;
      // }
    }
    // Fallback to direct field value if no buttonFields
    else if (field.FieldValue?.base64string) {
      payload.FileName = field.FieldValue.Filename;
      payload.Base64string = field.FieldValue.base64string.split(",")[1] || "";
    } else {
      toast.error("No file selected for upload!", { style: { top: 80 } });
      return;
    }

    // 4. Add DocumentName from saveData if available
    if (saveData.DocumentName) {
      payload.DocumentName = saveData.DocumentName;
    }

    // 5. Add InputType if available
    if (saveData.ReportType) {
      payload.InputType = saveData.ReportType;
    }
    try {
      setLoading(true);
      const result = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UploadFile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (result.data) {
        setUploadedFiles(result.data.files);
        toast.success("File uploaded successfully", { style: { top: 80 } });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file", { style: { top: 80 } });
    } finally {
      setLoading(false);
    }
  };
  const moveCardBox = useCallback(
    (id: string, left: number, top: number, cardFieldId: string) => {
      // Find the card field to get its dimensions and position
      const cardField = updatedPersonalDetails[value]?.Values.find(
        (f: any) => f.FieldID === cardFieldId,
      );

      if (!cardField) return;

      // Get card dimensions
      const cardWidth =
        parseInt(cardField.Width?.toString().replace("px", "")) || 300;
      const cardHeight =
        parseInt(cardField.Height?.toString().replace("px", "")) || 200;

      // Find the field being moved to get its dimensions
      const movedField = cardField.CardFields?.find(
        (cf: any) => cf.FieldID === id,
      );
      const fieldWidth = movedField
        ? parseInt(movedField.Width?.toString().replace("px", "")) || 50
        : 50;
      const fieldHeight = movedField
        ? parseInt(movedField.Height?.toString().replace("px", "")) || 30
        : 30;

      // Ensure positions are within bounds
      const boundedLeft = Math.max(0, Math.min(left, cardWidth - fieldWidth));
      const boundedTop = Math.max(0, Math.min(top, cardHeight - fieldHeight));

      console.log("Moving card field:", {
        id,
        left,
        top,
        boundedLeft,
        boundedTop,
        cardWidth,
        cardHeight,
      });

      const updatedData = updatedPersonalDetails.map(
        (detail: any, index: number) =>
          index === value
            ? {
                ...detail,
                Values: detail.Values.map((tab: any) =>
                  tab.FieldID === cardFieldId
                    ? {
                        ...tab,
                        CardFields: tab.CardFields.map((cardFieldItem: any) =>
                          cardFieldItem.FieldID === id
                            ? {
                                ...cardFieldItem,
                                CardRownum: left,
                                CardColnum: top,
                              }
                            : cardFieldItem,
                        ),
                      }
                    : tab,
                ),
              }
            : detail,
      );

      // Update immediately in state for responsive UI
      setUpdatedPersonalDetails(updatedData);

      // Then update via API
      updateCardFieldData(id, boundedLeft, boundedTop, cardFieldId, cardField);
    },
    [
      updatedPersonalDetails,
      setUpdatedPersonalDetails,
      value,
      menuIDQuery,
      menuID,
    ],
  );
  // Add this function to update card field positions via API
  const updateCardFieldData = (
    fieldId: string,
    left: number,
    top: number,
    cardFieldId: string,
    cardField: any,
  ) => {
    // Find the specific card field being moved
    const cardFieldData = cardField?.CardFields?.find(
      (cf: any) => cf.FieldID === fieldId,
    );

    // Get the field's width and height
    const fieldWidth = cardFieldData?.Width || "100px";
    const fieldHeight = cardFieldData?.Height || "30px";

    // Ensure values are integers (remove 'px' if present)
    const widthValue = parseInt(fieldWidth.toString().replace("px", "")) || 100;
    const heightValue =
      parseInt(fieldHeight.toString().replace("px", "")) || 30;

    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/Updatefieldproperty",
        {
          Userid: localStorage.getItem("username"),
          ModuleId: menuIDQuery || menuID,
          Type: "CARD",
          fields: [
            {
              FieldID: fieldId,
              CardRownum: Math.round(left), // Ensure integer
              CardColnum: Math.round(top), // Ensure integer
              Width: widthValue,
              Height: heightValue,
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      .then((response) => {
        console.log("Card field position updated:", response.data);
      })
      .catch((error) => {
        console.error("Error updating card field position:", error);
      });
  };

  const [, cardDrop] = useDrop(
    () => ({
      accept: "cardBox",
      drop(item: any, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);
        moveCardBox(item.id, left, top, item.cardFieldId);
        return undefined;
      },
    }),
    [moveCardBox],
  );

  const getCardFields = (field: any, cardField: any) => {
    return updatedPersonalDetails[value]?.Values.map((res: any, i: number) => {
      if (Number(res.FieldID) === Number(field.FieldID)) {
        // Use CardRownum and CardColnum for positioning within the card
        const cardLeft =
          res.CardRownum !== undefined ? res.CardRownum : res.Rownum || 0;
        const cardTop =
          res.CardColnum !== undefined ? res.CardColnum : res.Colnum || 0;

        return (
          <div
            key={res.FieldID}
            style={{
              position: "absolute",
              top: `${cardTop}px`,
              left: `${cardLeft}px`,
              width: res.Width || "auto",
              height: res.Height || "auto",
            }}
          >
            {renderFieldsCard(res, i, true)}
          </div>
        );
      }
    });
  };

  const onResize = (e: any, direction: any, ref: any, d: any, field: any) => {
    const newRefWidth = ref.style.width;
    const newRefHeight = ref.style.height;
    const updatedFieldArray = [...updatedPersonalDetails];
    const container = document.querySelector(".field-container");

    let newWidth = newRefWidth;
    let newHeight = newRefHeight;

    // Check boundaries if container exists
    if (container && field) {
      const containerRect = container.getBoundingClientRect();
      const fieldElement = document.querySelector(
        `[data-field-id="${field.FieldID}"]`,
      );

      if (fieldElement instanceof HTMLElement) {
        const fieldRect = fieldElement.getBoundingClientRect();
        const fieldLeft =
          parseFloat(fieldElement.style.left) || field.Rownum || 0;
        const fieldTop =
          parseFloat(fieldElement.style.top) || field.Colnum || 0;

        // Ensure field doesn't exceed container boundaries when resized
        if (fieldLeft + parseInt(newRefWidth) > containerRect.width) {
          newWidth = `${containerRect.width - fieldLeft}px`;
        }
        if (fieldTop + parseInt(newRefHeight) > containerRect.height) {
          newHeight = `${containerRect.height - fieldTop}px`;
        }
      }
    }

    updatedFieldArray[value].Values.map((res: any) => {
      if (Number(res.FieldID) === Number(field.FieldID)) {
        if (isPDFPreviewOpen) {
          // Update PDF dimensions in PDF mode
          res.PDFWidth = newWidth;
          res.PDFHeight = newHeight;
        } else {
          // Update screen dimensions in normal mode
          res.Width = newWidth;
          res.Height = newHeight;
        }

        const payloadType = isPDFPreviewOpen ? "PDF" : "";
        const fieldsArray = isPDFPreviewOpen
          ? [
              {
                FieldID: res.FieldID,
                PDFRownum: res.PDFRownum,
                PDFColnum: res.PDFColnum,
                PDFWidth: res.PDFWidth,
                PDFHeight: res.PDFHeight,
              },
            ]
          : [
              {
                FieldID: res.FieldID,
                Rownum: res.Rownum,
                Colnum: res.Colnum,
                Width: newWidth,
                Height: newHeight,
              },
            ];

        axios
          .post(
            "https://logpanel.insurancepolicy4u.com/api/Login/Updatefieldproperty",
            {
              Userid: localStorage.getItem("username"),
              ModuleId: menuIDQuery || menuID,
              Type: payloadType,
              fields: fieldsArray,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          )
          .then((response) => {});
      }
    });

    setUpdatedPersonalDetails(updatedFieldArray);
  };

  const renderFieldsCard = (field: any, i: number, isCardField = false) => {
    switch (field?.FieldType) {
      case "LABEL":
        return field.DefaultVisible ? (
          <div key={i} className="">
            <FormGroup
              key={field?.FieldName}
              style={{
                textAlign: field.Align,
                display: "flex",
                flexDirection: field.LabelDirection,
              }}
            >
              {field.IsFieldNamePrint ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: field.Align,
                    width: "100%",
                    gap: 4,
                    border: isCardField ? "1px dashed red" : "none",
                    padding: isCardField ? 4 : 0,
                  }}
                >
                  <Label
                    for={field?.FieldName}
                    className="bold max-w-fit"
                    style={{
                      color: field.fontcolor,
                      backgroundColor: field.Bgcolor,
                      fontWeight: field.IsBold ? 700 : "normal",
                      textDecoration: field.IsUnderline ? "underline" : "none",
                      fontStyle: field.IsItallic ? "italic" : "normal",
                      fontSize: `${field.FontSize}px`,
                      fontFamily: field.Fontname,
                    }}
                  >
                    {field?.FieldName}{" "}
                    {field.IsMandatory ? (
                      <span style={{ color: "red" }}>*</span>
                    ) : null}
                  </Label>
                  <p
                    style={{
                      backgroundColor: field.TextBgcolor,
                      fontSize: `${field.TextFontSize}px`,
                      color: field.TextFontColor,
                      margin: 0,
                      fontWeight: field.IsTextBold ? 700 : "normal",
                      textDecoration: field.IsTextUnderLine
                        ? "underline"
                        : "none",
                      fontStyle: field.IsTextItalic ? "italic" : "normal",
                      height: `${Number(
                        field?.Height?.toString().split("px")[0] || 100,
                      )}px`,
                      border: "1px dashed",
                    }}
                  >
                    {field.FieldValue}
                  </p>
                  {field.ToolTip && (
                    <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                      <div
                        style={{
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                        }}
                      >
                        <AiFillInfoCircle
                          style={{
                            marginBottom: 2,
                            marginLeft: 10,
                            cursor: "pointer",
                          }}
                        />
                        {isDrag && field.IsEdit && (
                          <AiFillEdit
                            onClick={() => {
                              setModalData({
                                app_id: field.FieldID,
                                ModuleID: information.Data[0]?.StrucureModuleID,
                                IsPopUpOpen: field.IsPopUpOpen,
                                SideDrawerPos: field.SideDrawerPos,
                                SideDrawerWidth: field.SideDrawerWidth,
                              });
                              setIsModalOpen(true);
                            }}
                            style={{
                              marginBottom: 2,
                              marginLeft: 10,
                              cursor: "pointer",
                            }}
                          />
                        )}
                      </div>
                    </Tooltip>
                  )}
                </div>
              ) : null}
            </FormGroup>
          </div>
        ) : null;
      case "BOX":
        return (
          <Label
            for={field?.FieldName}
            className="bold max-w-fit"
            style={{
              backgroundColor: field.TextBgcolor,
              fontSize: `${field.TextFontSize}px`,
              color: field.TextFontColor,
              margin: 0,
              fontWeight: field.IsTextBold ? 700 : "normal",
              textDecoration: field.IsTextUnderLine ? "underline" : "none",
              fontStyle: field.IsTextItalic ? "italic" : "normal",
              fontFamily: field.Fontname,
              border: "1px dashed",
            }}
          >
            {saveData[field.FieldName]}
          </Label>
        );
      case "DROPDOWN":
        return (
          <Label
            for={field?.FieldName}
            className="bold max-w-fit"
            style={{
              color: field.fontcolor,
              backgroundColor: field.Bgcolor,
              width: field.Width,
              fontWeight: field.IsBold ? 700 : "normal",
              textDecoration: field.IsUnderline ? "underline" : "none",
              fontStyle: field.IsItallic ? "italic" : "normal",
              fontSize: `${field.FontSize}px`,
              fontFamily: field.Fontname,
              border: "1px dashed",
            }}
          >
            {saveData[field.FieldName]}
          </Label>
        );
      case "TEXTAREA":
        return (
          <Label
            for={field?.FieldName}
            className="bold max-w-fit"
            style={{
              color: field.fontcolor,
              backgroundColor: field.Bgcolor,
              width: field.Width,
              fontWeight: field.IsBold ? 700 : "normal",
              textDecoration: field.IsUnderline ? "underline" : "none",
              fontStyle: field.IsItallic ? "italic" : "normal",
              fontSize: `${field.FontSize}px`,
              fontFamily: field.Fontname,
              border: "1px dashed",
            }}
          >
            {saveData[field.FieldName]}
          </Label>
        );
      case "DATE":
        return (
          <Label
            for={field?.FieldName}
            className="bold max-w-fit"
            style={{
              color: field.fontcolor,
              backgroundColor: field.Bgcolor,
              width: field.Width,
              fontWeight: field.IsBold ? 700 : "normal",
              textDecoration: field.IsUnderline ? "underline" : "none",
              fontStyle: field.IsItallic ? "italic" : "normal",
              fontSize: `${field.FontSize}px`,
              fontFamily: field.Fontname,
              border: "1px dashed",
            }}
          >
            {saveData[field.FieldName]}
          </Label>
        );
      case "UPLOAD":
        return (
          <Label
            for={field?.FieldName}
            className="bold max-w-fit"
            style={{
              color: field.fontcolor,
              backgroundColor: field.Bgcolor,
              width: field.Width,
              fontWeight: field.IsBold ? 700 : "normal",
              textDecoration: field.IsUnderline ? "underline" : "none",
              fontStyle: field.IsItallic ? "italic" : "normal",
              fontSize: `${field.FontSize}px`,
              fontFamily: field.Fontname,
            }}
          >
            {saveData[field.FieldName]}
          </Label>
        );
      case "BUTTON":
        return (
          <Label
            for={field?.FieldName}
            className="bold max-w-fit"
            style={{
              color: field.fontcolor,
              backgroundColor: field.Bgcolor,
              width: field.Width,
              height: field.Height,
              fontWeight: field.IsBold ? 700 : "normal",
              textDecoration: field.IsUnderline ? "underline" : "none",
              fontStyle: field.IsItallic ? "italic" : "normal",
              fontSize: `${field.FontSize}px`,
              fontFamily: field.Fontname,
              border: "1px dashed",
            }}
          >
            {saveData[field.FieldName]}
          </Label>
        );
      case "TEXTEDITOR":
        return (
          <Label
            for={field?.FieldName}
            className="bold max-w-fit"
            style={{
              color: field.fontcolor,
              backgroundColor: field.Bgcolor,
              width: field.Width,
              fontWeight: field.IsBold ? 700 : "normal",
              textDecoration: field.IsUnderline ? "underline" : "none",
              fontStyle: field.IsItallic ? "italic" : "normal",
              fontSize: `${field.FontSize}px`,
              fontFamily: field.Fontname,
              border: "1px dashed",
            }}
          >
            {saveData[field.FieldName]}
          </Label>
        );
      case "IMAGE":
        return (
          <div style={{ width: field.Width, height: field.Height }}>
            <img
              src={field.ControlImageUrl}
              style={{
                height: `100%`,
                width: `100%`,
                border: "1px dashed",
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const columns =
    updatedPersonalDetails &&
    updatedPersonalDetails[value] &&
    updatedPersonalDetails[value]?.ds &&
    updatedPersonalDetails[value]?.ds &&
    updatedPersonalDetails[value]?.ds?.length > 0
      ? Object.keys(updatedPersonalDetails[value]?.ds[0]).map((column: any) => {
          const isKeyColumn =
            column.toLowerCase() ===
            (updatedPersonalDetails &&
              updatedPersonalDetails[value] &&
              updatedPersonalDetails[value]?.KeyName.toLowerCase());
          return {
            name: column,
            selector: isKeyColumn
              ? (row: any) => (
                  <div
                    style={{ color: "#0088ff", cursor: "pointer" }}
                    onClick={() => {
                      handleProfileInformation(row[column]);
                    }}
                  >
                    {row[column]}
                  </div>
                )
              : column,
            sortable: true,
            wrap: true,
            reorder: true,
          };
        })
      : [];

  const values = updatedPersonalDetails?.[value]?.Values || [];

  const showSubmit =
    !hideSubmit &&
    updatedPersonalDetails?.[value]?.IsAddMore &&
    values.some((val: any) => val.ValueType === "SUBMIT" && val.DefaultVisible);

  const showNext =
    !hideSubmit &&
    updatedPersonalDetails?.[value]?.IsAddMore &&
    !showSubmit && // prevent showing NEXT if SUBMIT is present
    values.some((val: any) => val.ValueType !== "SUBMIT" && val.DefaultVisible);

  const columnsTable =
    updatedPersonalDetails &&
    updatedPersonalDetails[value] &&
    updatedPersonalDetails[value]?.TableData &&
    updatedPersonalDetails[value]?.TableData &&
    updatedPersonalDetails[value]?.TableData?.length > 0
      ? Object.keys(updatedPersonalDetails[value]?.TableData?.[0]).map(
          (key) => ({
            name: key.replace("VC_", "").replace(/-/g, " "),
            selector: (row: any) => row[key],
            sortable: true,
            wrap: true,
            reorder: true,
          }),
        )
      : [];

  const getDatabase = (serverName: any) => {
    // setLoading(true)
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/LoadDatabases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        Userid: localStorage.getItem("username"),
        product: "LoadDatabases",
        type: serverName,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setLoadDatabase(response?.Databases);
        // setLoading(false)
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getDatabaseTables = (servername: any, dbName: any) => {
    fetch(
      "https://logpanel.insurancepolicy4u.com/api/Login/LoadDatabaseTables",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          Userid: localStorage.getItem("username"),
          product: "LoadDatabaseTables",
          type: servername,
          databaseName: dbName,
        }),
      },
    )
      .then((response) => response.json())
      .then((response) => {
        const newTable = response?.Tables?.map((res: any) => {
          return {
            Tablename: res?.Tablename,
            DbName: selectedDatabase.value,
          };
        });
        setDatabaseTables(newTable);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getDatabaseColumns = (
    serverName: any,
    DbName: string,
    MenuDbTableName: any,
  ) => {
    const Params = {
      Userid: localStorage.getItem("username"),
      product: "LoadDatabaseTableColumn",
      type: serverName ? serverName : selectedServer?.value,
      databaseName: DbName,
      tablelist:
        MenuDbTableName && Array.isArray(MenuDbTableName)
          ? MenuDbTableName.map((res: any) => {
              if (res) {
                return { tableName: res };
              }
            })
          : [{ tableName: MenuDbTableName }],
    };

    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/LoadDatabaseTableColumns",
        Params,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        setLoadColName(response?.data?.ColumnsList);
      })
      .catch((error) => {});
  };

  const getServerList = () => {
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetServerListAPI",
        {
          Userid: localStorage.getItem("username"),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      .then((response) => {
        setServerList(response.data.ServerList);
      })
      .catch((error) => {});
  };

  useEffect(() => {
    if (edit) {
      getServerList();
    }
  }, [edit]);

  const handleEditSubmitFunction = async () => {
    try {
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsModuleWise",
          {
            Userid: localStorage.getItem("username"),
            Fields: editAutoCallData[valueEditTab]?.data,
            IsFileUpload: false,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )
        .then((response) => {
          if (response.data === "Success") {
            toast.success("Data Saved !!", { style: { top: 80 } });
          }
          // router.reload();
          setApiCall(true);
          setEdit(!edit);
          // handleProfileInformation(mainMenuID)
        })
        .catch((error) => {});
    } catch (error) {
      console.log("error", error);
    }
  };

  const editAutoCallColumns = useMemo(() => {
    const columns =
      editAutoCallData &&
      editAutoCallData[valueEditTab] &&
      editAutoCallData[valueEditTab].data &&
      Object.keys(editAutoCallData[valueEditTab].data[0]).map(
        (column: string, i: number) => {
          if (column === "Seqno") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div
                  // style={{ color: "#0088ff", cursor: "pointer", width: "150px !important", minWidth: "150px" }}
                  >
                    {row.Seqno}
                  </div>
                );
              },
              cell: (row: any, index: number) => {
                return (
                  <Input
                    value={row[column]}
                    name="Seqno"
                    placeholder="Seqno"
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.target.value;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                    className="w-full"
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
            };
          }
          if (column === "Width") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div
                  // style={{ color: "#0088ff", cursor: "pointer", width: "150px !important", minWidth: "150px" }}
                  >
                    {row.Seqno}
                  </div>
                );
              },
              cell: (row: any, index: number) => {
                return (
                  <Input
                    value={row[column]}
                    name="Width"
                    placeholder="Width"
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.target.value;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                    className="w-full"
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
            };
          } else if (column === "ModuleName") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Input
                    value={row[column]}
                    name="Module Name"
                    placeholder="Module Name"
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.target.value;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                    className="w-[150px]"
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "150px",
            };
          } else if (column === "FieldName") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Input
                    value={row[column]}
                    name="Field Name"
                    placeholder="Field Name"
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.target.value;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                    className="w-[150px]"
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "FieldType") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Select
                    className="w-full"
                    placeholder="Select FieldType"
                    value={{
                      value: row[column],
                      label: row[column],
                    }}
                    // defaultValue={res?.ServerName}
                    options={[
                      { value: "BOX", label: "BOX" },
                      { value: "DROPDOWN", label: "DROPDOWN" },
                      { value: "DATE", label: "DATE" },
                      { value: "TEXTAREA", label: "TEXTAREA" },
                    ].map((res: any) => {
                      return { value: res.value, label: res.label };
                    })}
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.value;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "ServerName") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Select
                    className="w-[200px]"
                    placeholder="Select Server"
                    value={{
                      value: row[column],
                      label: row[column],
                    }}
                    // defaultValue={res?.ServerName}
                    options={
                      serverList &&
                      serverList.length > 0 &&
                      serverList.map((res: any) => {
                        return { value: res.ServerName, label: res.ServerName };
                      })
                    }
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.value;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "Dbname") {
            return {
              name: column,
              selector: (row: any, index: number) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <div onClick={() => getDatabase(row?.ServerName)}>
                    <Select
                      options={loadDatabase?.map((res: any) => {
                        const object = {
                          value: res?.DatabaseName,
                          label: res?.DatabaseName,
                        };
                        return object;
                      })}
                      onInputChange={() => getDatabase(row?.ServerName)}
                      value={{
                        value: row[column],
                        label: row[column],
                      }}
                      onChange={(e: any) => {
                        let newValue = row[column];
                        newValue = e.value;
                        const updatedData = [...editAutoCallData];
                        let j = 0;
                        for (
                          j;
                          j < updatedData[valueEditTab].data.length;
                          j++
                        ) {
                          if (
                            updatedData[valueEditTab].data[j]?.FieldID ===
                            row?.FieldID
                          ) {
                            break;
                          }
                        }
                        updatedData[valueEditTab].data[j][column] = newValue;
                        setEditAutoCallData(updatedData);
                      }}
                    />
                  </div>
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "TabName") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <div
                    className="w-full"
                    onClick={() =>
                      getDatabaseTables(row?.ServerName, row?.Dbname)
                    }
                  >
                    <Select
                      options={databaseTables?.map((res: any) => {
                        const object = {
                          value: res.Tablename,
                          label: res.Tablename,
                          dbName: res.DbName,
                        };
                        return object;
                      })}
                      onInputChange={() =>
                        getDatabaseTables(row?.ServerName, row?.Dbname)
                      }
                      value={{
                        value: row[column],
                        label: row[column],
                        dbName: row?.Dbname,
                      }}
                      onChange={(e: any) => {
                        let newValue = row[column];
                        newValue = e.value;
                        const updatedData = [...editAutoCallData];
                        let j = 0;
                        for (
                          j;
                          j < updatedData[valueEditTab].data.length;
                          j++
                        ) {
                          if (
                            updatedData[valueEditTab].data[j]?.FieldID ===
                            row?.FieldID
                          ) {
                            break;
                          }
                        }
                        updatedData[valueEditTab].data[j][column] = newValue;
                        setEditAutoCallData(updatedData);
                      }}
                    />
                  </div>
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "Colname") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <div
                    className="w-full"
                    onClick={() =>
                      getDatabaseColumns(
                        row?.ServerName,
                        row?.Dbname,
                        row?.TabName,
                      )
                    }
                  >
                    <Select
                      className="w-full"
                      placeholder="Select ColName"
                      value={{
                        value: row?.Colname,
                        label: row?.Colname,
                      }}
                      onInputChange={() =>
                        getDatabaseColumns(
                          row?.ServerName,
                          row?.Dbname,
                          row?.TabName,
                        )
                      }
                      // defaultValue={res?.ServerName}
                      options={loadColName.map((res: any) => {
                        return { value: res.Colname, label: res.Colname };
                      })}
                      onChange={(e: any) => {
                        let newValue = row[column];
                        newValue = e.value;
                        const updatedData = [...editAutoCallData];
                        let j = 0;
                        for (
                          j;
                          j < updatedData[valueEditTab].data.length;
                          j++
                        ) {
                          if (
                            updatedData[valueEditTab].data[j]?.FieldID ===
                            row?.FieldID
                          ) {
                            break;
                          }
                        }
                        updatedData[valueEditTab].data[j][column] = newValue;
                        setEditAutoCallData(updatedData);
                      }}
                    />
                  </div>
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "IsActive") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Select
                    className="w-full"
                    placeholder="Select isActive"
                    value={{
                      value: row[column] === true ? "YES" : "NO",
                      label: row[column] === true ? "YES" : "NO",
                    }}
                    // defaultValue={res?.ServerName}
                    options={["YES", "NO"].map((res: any) => {
                      return { value: res, label: res };
                    })}
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.value === "YES" ? true : false;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "IsMainCol") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Select
                    className="w-full"
                    placeholder="Select IsMainCol"
                    value={{
                      value: row[column] === true ? "YES" : "NO",
                      label: row[column] === true ? "YES" : "NO",
                    }}
                    // defaultValue={res?.ServerName}
                    options={["YES", "NO"].map((res: any) => {
                      return { value: res, label: res };
                    })}
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.value === "YES" ? true : false;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "IsFormulaApply") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Select
                    className="w-full"
                    placeholder="Select IsFormulaApply"
                    value={{
                      value: row[column] === true ? "YES" : "NO",
                      label: row[column] === true ? "YES" : "NO",
                    }}
                    // defaultValue={res?.ServerName}
                    options={["YES", "NO"].map((res: any) => {
                      return { value: res, label: res };
                    })}
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.value === "YES" ? true : false;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                      // setEditIndex(index)
                      setFormulaModal(e.value === "YES" ? true : false);

                      let formulaOption =
                        row?.Formula &&
                        row?.Formula.map((res: any) => {
                          return { value: res?.label, label: res?.label };
                        });
                      if (formulaOption) {
                        setSelectedOptions(formulaOption);
                      }
                      setFormulaIndex(row?.FieldID);
                    }}
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "ReadServername") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Select
                    className="w-[200px]"
                    placeholder="Select ReadServername"
                    value={{
                      value: row[column],
                      label: row[column],
                    }}
                    // defaultValue={res?.ServerName}
                    options={
                      serverList &&
                      serverList.length > 0 &&
                      serverList.map((res: any) => {
                        return { value: res.ServerName, label: res.ServerName };
                      })
                    }
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.value;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "ReadDbname") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <div className="w-[200px]">
                    <Select
                      options={loadDatabase?.map((res: any) => {
                        return {
                          value: res?.DatabaseName,
                          label: res?.DatabaseName,
                        };
                      })}
                      // options={serverList && serverList.length > 0 && serverList.map((res: any) => { return { value: res.ServerName, label: res.ServerName } })}
                      onInputChange={() => getDatabase(row?.ReadServername)}
                      // defaultValue={res?.ReadDBName}
                      value={{
                        value: row[column],
                        label: row[column],
                      }}
                      onChange={(e: any) => {
                        let newValue = row[column];
                        newValue = e.value;
                        const updatedData = [...editAutoCallData];
                        let j = 0;
                        for (
                          j;
                          j < updatedData[valueEditTab].data.length;
                          j++
                        ) {
                          if (
                            updatedData[valueEditTab].data[j]?.FieldID ===
                            row?.FieldID
                          ) {
                            break;
                          }
                        }
                        updatedData[valueEditTab].data[j][column] = newValue;
                        setEditAutoCallData(updatedData);
                      }}
                    />
                  </div>
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "ReadTablename") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <div className="w-[200px]">
                    <Select
                      options={databaseTables?.map((res: any) => {
                        const object = {
                          value: res.Tablename,
                          label: res.Tablename,
                          dbName: res.DbName,
                        };
                        return object;
                      })}
                      onInputChange={() =>
                        getDatabaseTables(row?.ReadServername, row?.ReadDbname)
                      }
                      // isMulti
                      // closeMenuOnSelect={false}
                      // defaultValue={row?.ReadtableName}
                      value={{
                        value: row?.ReadTablename,
                        label: row?.ReadTablename,
                        dbName: row.ReadDBname,
                      }}
                      onChange={(e: any) => {
                        let newValue = row[column];
                        newValue = e.value;
                        const updatedData = [...editAutoCallData];
                        let j = 0;
                        for (
                          j;
                          j < updatedData[valueEditTab].data.length;
                          j++
                        ) {
                          if (
                            updatedData[valueEditTab].data[j]?.FieldID ===
                            row?.FieldID
                          ) {
                            break;
                          }
                        }
                        updatedData[valueEditTab].data[j][column] = newValue;
                        setEditAutoCallData(updatedData);
                      }}
                    />
                  </div>
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "Readcolname") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <div className="w-[200px]">
                    <Select
                      placeholder="Select ColName"
                      value={{
                        value: row[column],
                        label: row[column],
                      }}
                      onInputChange={() =>
                        getDatabaseColumns(
                          row?.ReadServername,
                          row?.ReadDbname,
                          row?.ReadTablename,
                        )
                      }
                      // defaultValue={res?.ServerName}
                      options={loadColName.map((res: any) => {
                        return { value: res.ColumnName, label: res.ColumnName };
                      })}
                      onChange={(e: any) => {
                        let newValue = row[column];
                        newValue = e.value;
                        const updatedData = [...editAutoCallData];
                        let j = 0;
                        for (
                          j;
                          j < updatedData[valueEditTab].data.length;
                          j++
                        ) {
                          if (
                            updatedData[valueEditTab].data[j]?.FieldID ===
                            row?.FieldID
                          ) {
                            break;
                          }
                        }
                        updatedData[valueEditTab].data[j][column] = newValue;
                        setEditAutoCallData(updatedData);
                      }}
                    />
                  </div>
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "IsFieldNamePrint") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Select
                    className="w-full"
                    placeholder="Select IsFieldNamePrint"
                    value={{
                      value: row[column] === true ? "YES" : "NO",
                      label: row[column] === true ? "YES" : "NO",
                    }}
                    // defaultValue={res?.ServerName}
                    options={["YES", "NO"].map((res: any) => {
                      return { value: res, label: res };
                    })}
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.value === "YES" ? true : false;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          } else if (column === "IsWatermarkPrint") {
            return {
              name: column,
              selector: (row: any) => {
                return <div>{row[column]}</div>;
              },
              cell: (row: any, index: number) => {
                return (
                  <Select
                    className="w-full"
                    placeholder="Select IsWatermarkPrint"
                    value={{
                      value: row[column] === true ? "YES" : "NO",
                      label: row[column] === true ? "YES" : "NO",
                    }}
                    // defaultValue={res?.ServerName}
                    options={["YES", "NO"].map((res: any) => {
                      return { value: res, label: res };
                    })}
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.value === "YES" ? true : false;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
              width: "200px",
            };
          }
          if (column === "WatermarkText") {
            return {
              name: column,
              selector: (row: any) => {
                return (
                  <div
                  // style={{ color: "#0088ff", cursor: "pointer", width: "150px !important", minWidth: "150px" }}
                  >
                    {row.Seqno}
                  </div>
                );
              },
              cell: (row: any, index: number) => {
                return (
                  <Input
                    value={row[column]}
                    name="WatermarkText"
                    placeholder="WatermarkText"
                    onChange={(e: any) => {
                      let newValue = row[column];
                      newValue = e.target.value;
                      const updatedData = [...editAutoCallData];
                      let j = 0;
                      for (j; j < updatedData[valueEditTab].data.length; j++) {
                        if (
                          updatedData[valueEditTab].data[j]?.FieldID ===
                          row?.FieldID
                        ) {
                          break;
                        }
                      }
                      updatedData[valueEditTab].data[j][column] = newValue;
                      setEditAutoCallData(updatedData);
                    }}
                    className="w-full"
                  />
                );
              },
              sortable: true,
              wrap: true,
              reorder: true,
            };
          } else {
            return {
              name: column,
              selector: (row: any, index: number) => {
                const cellValue = row[column];
                if (typeof cellValue === "object" && cellValue !== null) {
                  const cellString = JSON.stringify(cellValue, null, 2);
                  return (
                    <pre
                      onDoubleClick={() =>
                        setFullView((prev: any) => {
                          const newValue = `${index}${i}`;
                          if (prev.includes(newValue)) {
                            return prev.filter(
                              (item: any) => item !== newValue,
                            );
                          } else {
                            return [...prev, newValue];
                          }
                        })
                      }
                    >
                      {fullview.includes(`${index}${i}`)
                        ? cellString
                        : cellString.length > 30
                          ? cellString.slice(0, 30) + "..."
                          : cellString}
                    </pre>
                  );
                } else {
                  return (
                    <div
                      onDoubleClick={() =>
                        setFullView((prev: any) => {
                          const newValue = `${index}${i}`;
                          if (prev.includes(newValue)) {
                            return prev.filter(
                              (item: any) => item !== newValue,
                            );
                          } else {
                            return [...prev, newValue];
                          }
                        })
                      }
                    >
                      {fullview.includes(`${index}${i}`)
                        ? cellValue
                        : cellValue && cellValue?.length > 30
                          ? cellValue.slice(0, 30) + "..."
                          : cellValue}
                    </div>
                  );
                }
              },
              sortable: true,
              wrap: true,
              reorder: true,
            };
          }
        },
      );

    return columns;
  }, [
    editAutoCallData,
    valueEditTab,
    loadDatabase,
    loadColName,
    databaseTables,
    fullview,
  ]);

  const handleSelectChange = (option: any) => {
    if (option) {
      setSelectedOptions([...selectedOptions, option[0]]);
    }
  };

  const handleCreateOption = (inputValue: any) => {
    const newOption = { value: inputValue, label: inputValue };
    setSelectedOptions([...selectedOptions, newOption]);
  };

  const customFilterOption = (option: any, inputValue: any) => {
    return option?.label?.toLowerCase().includes(inputValue.toLowerCase());
  };

  const handleEditOption = (index: any) => {
    setEditIndex(index);
    setEditValue(selectedOptions[index]?.label);
  };
  const handleSaveEdit = () => {
    const updatedOptions = selectedOptions.map((option: any, index: any) => {
      if (index === editIndex) {
        return { value: editValue, label: editValue };
      }
      return option;
    });
    setSelectedOptions(updatedOptions);
    setEditIndex(null);
    setEditValue("");
  };

  const groupedFields = updatedPersonalDetails?.[value]?.Values?.reduce(
    (acc: any, field: any) => {
      if (!acc[field?.AddMoreGroup]) {
        acc[field?.AddMoreGroup] = [];
      }
      acc[field?.AddMoreGroup].push(field);
      return acc;
    },
    {},
  );

  const tableModuleID =
    updatedPersonalDetails[value]?.Values?.find((field: any) => field?.ModuleID)
      ?.ModuleID ||
    menuIDQuery ||
    menuID;

  const tableButtonID =
    updatedPersonalDetails[value]?.Values?.find((field: any) => field?.FieldID)
      ?.FieldID || 0;

  useEffect(() => {
    if (!personalDetails?.length || !defaultVisible) {
      setValue(0);
      setUpdatedPersonalDetails(personalDetails || []);
      return;
    }
    const defaultTabIndex = personalDetails.findIndex((commissionTab: any) => {
      const tabAliasName = commissionTab?.TabAliasName?.trim().toLowerCase();
      const defaultVisibleLower = defaultVisible?.trim().toLowerCase();
      return tabAliasName === defaultVisibleLower;
    });
    setValue(defaultTabIndex !== -1 ? defaultTabIndex : 0);
    setUpdatedPersonalDetails(personalDetails);
  }, [personalDetails, defaultVisible]);

  const pageBackgroundcolor = sessionStorage.getItem("pageBackgroundcolor");
  const pageBackgroundimage = sessionStorage.getItem("pageBackgroundimage");
  const nonAddMoreFields = updatedPersonalDetails[value]?.Values?.filter(
    (field: any) => !field.IsAddMore,
  );

  // In PersonalDetails component, before the return statement
  const visibleTabs = updatedPersonalDetails.filter(
    (tab: any) => tab.DefaultVisible !== false,
  );
  const visibleTabIndices = updatedPersonalDetails
    .map((tab: any, index: number) =>
      tab.DefaultVisible !== false ? index : -1,
    )
    .filter((index: number) => index !== -1);

  // Find the current visible tab index
  const currentVisibleTabIndex = visibleTabs.findIndex(
    (tab: any) => updatedPersonalDetails.indexOf(tab) === value,
  );

  // Handle API call on nested tab change
  const handleNestedTabAPICall = async (tabData: any) => {
    // Check if API call is required for this tab
    if (!tabData.IsAPICall || !tabData.APIURL) {
      return;
    }
    // Create a unique key for this tab's API call
    const tabKey = `${tabData.TabAliasName || tabData.Nestedtab || tabData.Tabid}_${currentRecordID}`;

    // If already called for this tab+record combination, skip
    if (apiCalledTabsRef.current.has(tabKey)) {
      return;
    }

    // Mark as called BEFORE the async call to prevent concurrent duplicate calls
    apiCalledTabsRef.current.add(tabKey);
    try {
      setLoading(true);

      // Build the payload with the same structure as button click
      const newArray: any = [];

      // Collect data from buttonFields
      if (tabData.buttonFields && tabData.buttonFields.length > 0) {
        information.Data.forEach((dataObj: any) => {
          dataObj?.Fields?.forEach((fieldGroup: any) => {
            fieldGroup?.Values?.forEach((res: any) => {
              tabData.buttonFields.forEach((response: any) => {
                if (Number(res.FieldID) === response.FieldID) {
                  newArray.push({
                    FieldID: res.FieldID,
                    FieldName: res.FieldName,
                    FieldValue: saveData[res.FieldName],
                  });
                }
              });
            });
          });
        });
      }

      // Build the API request payload
      const data = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuIDQuery || menuID,
        PostedJson: newArray,
        ButtonID: tabData.Tabid, // Use Tabid instead of ButtonID
      };

      // Make the API call
      const result = await axios.post(tabData.APIURL, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (result?.data && result.data.Message !== "Invalid Request") {
        // Update the table/chart data with the response
        const newUpdatedDetails = [...updatedPersonalDetails];

        // Find the current tab
        const currentTabIndex = newUpdatedDetails.findIndex(
          (res: any) =>
            res.TabAliasName?.toLowerCase() ===
            tabData.TabAliasName?.toLowerCase(),
        );

        if (currentTabIndex !== -1) {
          // Handle table data update
          if (result.data.Table && Array.isArray(result.data.Table)) {
            const tableFieldID = result.data.FieldID;
            const tableField = newUpdatedDetails[currentTabIndex].Values.find(
              (f: any) => f.FieldID == tableFieldID && f.FieldType === "TABLE",
            );

            if (tableField) {
              tableField.buttonFields = result.data.Table;
              tableField.TableData = result.data.Table;
            }
          }

          // Handle chart data update
          if (result.data.ChartData && result.data.Chartids) {
            const chartIds = result.data.Chartids;
            chartIds.forEach((chartInfo: any, index: number) => {
              const chartFieldID = chartInfo.FieldID;
              const chartField = newUpdatedDetails[currentTabIndex].Values.find(
                (f: any) =>
                  f.FieldID == chartFieldID && f.FieldType === "CHART",
              );

              if (chartField) {
                if (result.data.ChartData.length > index) {
                  chartField.ChartData = [result.data.ChartData[index]];
                } else if (result.data.ChartData.length > 0) {
                  chartField.ChartData = result.data.ChartData;
                }

                if (chartInfo.ChartType) {
                  chartField.ValueType = chartInfo.ChartType;
                }
                if (chartInfo.ChartTitle) {
                  chartField.FieldName = chartInfo.ChartTitle;
                }
              }
            });
          }

          // Update table metadata if provided
          if (result.data.TableWidth || result.data.FieldID) {
            setTableMetadata({
              isDetailPopupOpen: result.data.IsDetailPopupOpen || false,
              moduleID: result.data.Table?.[0]?.ModuleID || null,
              fieldID: result.data.FieldID || null,
              defaultVisible: result.data.DefaultTabSelected || null,
              tablebuttons: result.data.tablebuttons || null,
              tableWidth: result.data.TableWidth || null,
              ischeckBoxReq: result.data.IscheckBoxReq || null,
              headerData: result.data.HeaderData || null,
              footerData: result.data.FooterData || null,
              filename: result.data.Filename || null,
              logo: result.data.logo || null,
              tableproperty: result.data.tableproperty || null,
              outsideBorder: result.data.outsideBorder || null,
              insideBorder: result.data.InsideBorder || null,
              orientation: result.data.Orientation || null,
              tableFormatting: result.data.TableFormatting || null,
              headerRows: result.data.HeaderRows || null,
              footerRows: result.data.FooterRows || null,
              tableheaderfooterCSS: result.data || null,
              pageitemscnt: result.data.Pageitemscnt || null,
              isPagination: result.data.IsPagination || null,
              chartData: result.data.ChartData || null,
              chartIds: result.data.Chartids || null,
              chartType: result.data.ChartType || "",
              isFreezeHeader: result.data.IsFreezeHeader || false,
              popupdrawersettings: result.data.popupdrawersettings || null,
            });
          }

          // Update other fields in saveData by matching FieldID (same as ButtonField logic)
          const updatedSaveData = { ...saveData };
          result?.data?.fields?.forEach((responseField: any) => {
            if (!responseField.IsAddMore) {
              newUpdatedDetails.forEach((responseData: any) => {
                responseData?.Values?.forEach((formField: any) => {
                  if (
                    Number(formField.FieldID) === Number(responseField.FieldID)
                  ) {
                    updatedSaveData[formField.FieldName] = responseField.Value;
                    formField.FieldValue = responseField.Value;
                    formField.DefaultVisible = responseField.Visibility;
                    if (formField.FieldType === "IMAGE") {
                      formField.ControlImageUrl = responseField.Value;
                    }
                  }
                });
              });
            } else if (responseField.IsAddMore) {
              newUpdatedDetails.forEach((resData: any) => {
                if (resData.IsAddMore) {
                  resData.Values?.forEach((formField: any) => {
                    if (
                      Number(formField.FieldID) ===
                      Number(responseField.FieldID)
                    ) {
                      formField.DefaultVisible = responseField.Visibility;
                      formField.addmorevalues = [
                        ...responseField.addmorevalues,
                      ];
                    }
                  });
                }
              });
            }
          });
          setSaveData(updatedSaveData);

          setUpdatedPersonalDetails(newUpdatedDetails);
        }
      }
    } catch (error) {
      console.error("Error calling API on tab change:", error);
      toast.error("Error loading tab data", { style: { top: 80 } });
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change for visible tabs
  const handleTabChangeForVisible = (newVisibleIndex: number) => {
    // Validate current tab before allowing change
    const validation = validateCurrentTabMandatoryFields();

    if (!validation.isValid) {
      setMandatoryFieldErrors(validation.errors);
      setCurrentTabWithErrors(updatedPersonalDetails[value]?.TabAliasName);

      toast.error(
        `Please fill all mandatory fields in current tab before switching`,
        {
          style: { top: 80 },
          autoClose: 3000,
        },
      );

      // Highlight the error
      setTimeout(() => {
        const firstErrorField = Object.keys(validation.errors)[0];
        if (firstErrorField) {
          const errorElement = document.querySelector(
            `[data-field-id="${firstErrorField}"]`,
          );
          if (errorElement) {
            errorElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }, 100);

      return; // Prevent tab change
    }

    // Clear errors if validation passes
    setMandatoryFieldErrors({});
    setCurrentTabWithErrors(null);

    const originalIndex = visibleTabIndices[newVisibleIndex];
    if (originalIndex !== undefined) {
      const selectedTab = updatedPersonalDetails[originalIndex];

      // Call the API handler if needed
      if (selectedTab) {
        handleNestedTabAPICall(selectedTab);
      }

      // Change the active tab
      setTabChangeAttempted(true);
      setValue(originalIndex);
    }
  };

  // Add this function in PersonalDetails component
  const handleTableDataUpdate = (updatedData: any[], tableFieldID?: string) => {
    const nextState = [...updatedPersonalDetails];

    // Find and update the table field
    nextState.forEach((tab, tabIndex) => {
      if (tabIndex === value) {
        tab.Values = tab.Values.map((field: any) => {
          // If specific table field ID provided, update only that
          if (tableFieldID && field.FieldID === tableFieldID) {
            return {
              ...field,
              buttonFields: updatedData,
              TableData: updatedData,
            };
          }
          // Otherwise update all TABLE fields
          else if (field.FieldType === "TABLE") {
            return {
              ...field,
              buttonFields: updatedData,
              TableData: updatedData,
            };
          }
          return field;
        });
      }
    });

    setUpdatedPersonalDetails(nextState);
  };

  useEffect(() => {
    if (tableEditMode) {
      setTableEditMode(false);
    }
  }, [value]);

  const handleSubmitDirectlyInPersonalDetails = async () => {
    setIsButtonLoading(true);

    try {
      console.log("🚀 Starting submission from PersonalDetails...");

      // Get the isUpdateTabWise flag from information prop
      const isUpdateTabWiseFlag =
        information?.Data?.[0]?.IsUpdateTabWise || false;
      console.log("🔍 IsUpdateTabWise flag:", isUpdateTabWiseFlag);

      // Step 1: Track processed add-more fields to avoid duplicates
      const processedAddMoreFields = new Set();
      let fieldData: any[] = [];

      // Function to add a field to fieldData
      const addField = (
        fld: any,
        fieldValue: any,
        tabIndex?: number,
        isAddMore = false,
        addMoreIndex?: number,
      ) => {
        // For add-more fields, we need to handle them differently
        if (isAddMore) {
          // Create a unique key for this add-more field (based on FieldID + AddMoreGroup)
          const addMoreKey = `${fld.FieldID}_${fld.AddMoreGroup}`;

          // If we haven't processed this add-more field yet, create a new entry
          if (!processedAddMoreFields.has(addMoreKey)) {
            processedAddMoreFields.add(addMoreKey);

            // Collect ALL rows for this add-more field
            const allRows =
              fld.addmorevalues?.map((res: any) => ({
                ValIndex: res.ValIndex,
                Value: res.FieldValue || "",
              })) || [];

            fieldData.push({
              FieldName: fld.FieldName,
              FieldID: fld.FieldID,
              FieldValue: "", // Empty for add-more fields at parent level
              Colname: fld.Colname || fld.FieldName,
              IsAddMore: true,
              AddMoreGroup: fld.AddMoreGroup || "",
              addmorevalues: allRows,
              // Add ValIndex only if it's a specific row (for backward compatibility)
              ...(addMoreIndex !== undefined && { ValIndex: addMoreIndex + 1 }),
            });

            console.log(
              `✅ Added add-more field ${fld.FieldName} with ${allRows.length} rows`,
            );
          }
          // Skip if already processed (no duplicate)
          return;
        }

        // Regular (non-add-more) field
        fieldData.push({
          FieldName: fld.FieldName,
          FieldID: fld.FieldID,
          FieldValue: fieldValue,
          Colname: fld.Colname || fld.FieldName,
          IsAddMore: false,
          AddMoreGroup: "",
          addmorevalues: [],
        });

        console.log(`✅ Added regular field: ${fld.FieldName} = ${fieldValue}`);
      };

      if (isUpdateTabWiseFlag) {
        console.log(
          "📋 Collecting ONLY current tab fields (IsUpdateTabWise = true)",
        );
        console.log("📋 Current tab value:", value);

        // Collect ONLY current tab's fields
        const currentTab = updatedPersonalDetails[value];
        if (currentTab?.Values) {
          currentTab.Values.forEach((fld: any) => {
            // Skip BUTTON, UPLOAD, TABLE, CHART, etc. for regular field data
            if (
              ![
                "BUTTON",
                "UPLOAD",
                "TABLE",
                "CHART",
                "IFRAME",
                "TIMELINE",
                "TIMELINEV",
              ].includes(fld.FieldType)
            ) {
              // Handle ADD-MORE fields specially - add once with all rows
              if (fld.IsAddMore) {
                addField(fld, "", value, true);
              }
              // Handle regular (non-add-more) fields
              else {
                let fieldValue = saveData[fld.FieldName];
                if (fieldValue === undefined || fieldValue === null) {
                  fieldValue = "";
                }
                addField(fld, fieldValue, value, false);
              }
            }
          });
        }
      } else {
        console.log("📋 Collecting ALL tabs fields (IsUpdateTabWise = false)");

        // Collect ALL fields from ALL tabs
        updatedPersonalDetails.forEach((tab: any, tabIndex: number) => {
          console.log(
            `📋 Tab ${tabIndex}: ${tab.TabAliasName || tab.Nestedtab || "Unnamed Tab"}`,
          );

          if (tab?.Values) {
            tab.Values.forEach((fld: any) => {
              // Skip BUTTON, UPLOAD, TABLE, CHART, etc. for regular field data
              if (
                ![
                  "BUTTON",
                  "UPLOAD",
                  "TABLE",
                  "CHART",
                  "IFRAME",
                  "TIMELINE",
                  "TIMELINEV",
                ].includes(fld.FieldType)
              ) {
                // Handle ADD-MORE fields specially - add once with all rows
                if (fld.IsAddMore) {
                  addField(fld, "", tabIndex, true);
                }
                // Handle regular (non-add-more) fields
                else {
                  let fieldValue = saveData[fld.FieldName];
                  if (fieldValue === undefined || fieldValue === null) {
                    fieldValue = "";
                  }
                  addField(fld, fieldValue, tabIndex, false);
                }
              }
            });
          }
        });
      }

      console.log("📦 Total fields collected:", fieldData.length);

      // Log add-more fields for verification
      const addMoreFields = fieldData.filter((f) => f.IsAddMore);
      console.log(
        "📊 Add-more fields:",
        addMoreFields.map((f) => ({
          FieldName: f.FieldName,
          AddMoreGroup: f.AddMoreGroup,
          RowCount: f.addmorevalues.length,
          Rows: f.addmorevalues,
        })),
      );

      // Step 2: Collect table data (keep your existing table collection logic)
      const collectTableData = () => {
        const allTableData: any[] = [];
        const processedTableIDs = new Set();

        const getValue = (row: any, key: string) => {
          if (row[key] === undefined || row[key] === null) {
            return "";
          }
          return String(row[key]);
        };

        updatedPersonalDetails.forEach((tab: any) => {
          if (tab?.Values) {
            tab.Values.forEach((field: any) => {
              if (
                field.FieldType === "TABLE" &&
                !processedTableIDs.has(field.FieldID)
              ) {
                const tableFieldID = field.FieldID;
                const currentTableData =
                  field.buttonFields || field.TableData || field.ds || [];

                if (currentTableData.length > 0) {
                  const firstRow = currentTableData[0];
                  if (firstRow) {
                    const columnNames = Object.keys(firstRow).filter(
                      (colName) =>
                        ![
                          "select",
                          "id",
                          "actions",
                          "__isNew",
                          "__modified",
                          "__originalData",
                          "__originalId",
                          "__originalIndex",
                          "__addedTimestamp",
                          "__persistent",
                        ].includes(colName) && !colName.startsWith("_"),
                    );

                    if (columnNames.length > 0) {
                      const tableData = {
                        FieldID: tableFieldID,
                        TableName: field.FieldName,
                        Cols: columnNames.map((colName) => ({
                          Colname: colName,
                          Values: currentTableData.map((row: any) => ({
                            Values: getValue(row, colName),
                          })),
                        })),
                      };
                      allTableData.push(tableData);
                    }
                  }
                }
                processedTableIDs.add(tableFieldID);
              }
            });
          }
        });
        return allTableData;
      };

      const tableData = collectTableData();
      console.log("📊 Total tables collected:", tableData.length);

      // Step 3: Prepare the payload
      let submitData: any = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuIDQuery || menuID ? Number(menuIDQuery || menuID) : 0,
        Operation: isOpen ? "UPDATE" : currentRecordID ? "INSERT" : "UPDATE",
        fieldsDatanew: fieldData,
      };

      // Add table data if exists
      if (tableData && tableData.length > 0) {
        submitData.tabledata = tableData.map((table: any) => ({
          FieldID: table.FieldID,
          Cols: table.Cols.map((col: any) => ({
            Colname: col.Colname,
            Values: col.Values.map((val: any) => ({
              Values: isNumericField(col.Colname)
                ? (Number(val.Values) || 0).toString()
                : val.Values,
            })),
          })),
        }));
      }

      function isNumericField(colName: string): boolean {
        const numericFields = [
          "Amount",
          "Quantity",
          "Price",
          "Total",
          "Amounts",
          "Quantities",
          "Prices",
          "Totals",
          "Cost",
          "Rate",
          "Discount",
          "Tax",
          "Commission",
          "Fee",
          "Charges",
          "Value",
          "Weight",
          "Volume",
          "Length",
          "Width",
          "Height",
          "Count",
          "Number",
          "Qty",
          "Amt",
        ];
        return numericFields.some((field) =>
          colName.toLowerCase().includes(field.toLowerCase()),
        );
      }

      console.log("🚀 Final payload structure:", {
        totalFields: submitData.fieldsDatanew?.length || 0,
        regularFields:
          submitData.fieldsDatanew?.filter((f: any) => !f.IsAddMore).length ||
          0,
        addMoreFields:
          submitData.fieldsDatanew?.filter((f: any) => f.IsAddMore).length || 0,
        totalTables: submitData.tabledata?.length || 0,
      });

      // Step 4: Make API call
      console.log("📤 Making API call to UpdateDynamicFieldsValuesNew...");
      let res = await axios.post(
        `https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsValuesNew`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      // Step 5: Handle response
      const responseData = res.data;
      console.log("📥 API Response:", responseData);

      const isSuccess =
        (responseData?.Resp && responseData.Resp.toLowerCase() === "success") ||
        res.status === 200 ||
        res.status === 201;

      if (isSuccess) {
        console.log("✅ API Success Response");
        toast.success("Data submitted successfully!", {
          position: "top-right",
          autoClose: 2000,
          style: { top: "50px" },
          className: "toast-mobile",
        });

        // Get main column value
        const mainColValue = fieldData.find((res: any) => res.IsMain);
        const mainColVal = mainColValue?.FieldValue || currentRecordID;

        // Call handleProfileInformation to refresh data
        handleProfileInformation(
          mainColVal,
          menuID,
          false,
          "SUBMIT",
          mainColVal,
        );
      } else {
        const errorMessage = responseData?.Resp || "Submission failed";
        console.error("❌ API Error:", errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 2000,
          style: { top: "50px" },
        });
      }
    } catch (error: any) {
      console.error("❌ API Exception:", error);
      console.error("❌ Error details:", error.response?.data || error.message);
      const errorMessage =
        error?.response?.data?.Message ||
        error?.message ||
        "An error occurred during submission";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 2000,
        style: { top: "50px" },
      });

      if (error.response?.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    } finally {
      setIsButtonLoading(false);
    }
  };

  const standaloneFields =
    updatedPersonalDetails[value]?.Values?.filter(
      (field: any) => !field.IsAddMore && field.DefaultVisible !== false,
    ) || [];

  // Get add-more fields (for the table)
  const addMoreFields =
    updatedPersonalDetails[value]?.Values?.filter(
      (field: any) => field.IsAddMore && field.DefaultVisible !== false,
    ) || [];

  // Group add-more fields by AddMoreGroup
  const groupedFields2 = addMoreFields.reduce((acc: any, field: any) => {
    if (!acc[field.AddMoreGroup]) {
      acc[field.AddMoreGroup] = [];
    }
    acc[field.AddMoreGroup].push(field);
    return acc;
  }, {});

  return (
    <>
      {isEditNewField && (
        <AddNewField
          isAddNewField={isEditNewField}
          setIsAddNewField={setIsEditNewField}
          editData={editFieldData}
          menuID={menuIDQuery || menuID}
        />
      )}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
      />
      {modalData?.IsPopUpOpen ? (
        <Modal
          isOpen={isModalOpen}
          centered
          closeOnEsc
          backdrop={false}
          fullscreen={true}
          onClose={() => {
            setIsModalOpen(false);
            setModalData(null);
          }}
        >
          <ModalBody>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 5,
              }}
            >
              <Button
                className="b0"
                onClick={() => {
                  setIsModalOpen(false);
                  setModalData(null);
                }}
              >
                Cancel
              </Button>
            </div>
            <div>
              <AutoCallPage
                recordID={modalData?.app_id}
                moduleID={modalData?.ModuleID}
                isModalOpen={isModalOpen}
              />
            </div>
          </ModalBody>
        </Modal>
      ) : (
        <Drawer
          anchor={modalData?.SideDrawerPos?.toLowerCase()}
          open={isModalOpen}
          sx={{
            "& .MuiDrawer-paper": {
              width: `${modalData?.SideDrawerWidth || 100}%`,
            },
          }}
          onClose={() => {
            setIsModalOpen(false);
            setModalData(null);
          }}
        >
          <AutoCallPage
            recordID={modalData?.app_id}
            moduleID={modalData?.ModuleID}
            isModalOpen={isModalOpen}
          />
        </Drawer>
      )}

      <Modal isOpen={formulaModal}>
        <ModalHeader>Add Formula</ModalHeader>

        <ModalBody>
          <FormGroup>
            <Label
              style={{
                fontWeight: 700,
              }}
            >
              Formula
            </Label>
            <CreatableSelect
              components={{
                Menu,
              }}
              options={updatedPersonalDetails?.[value]?.Values?.map(
                (col: any) => {
                  return {
                    value: col?.FieldName,
                    label: col?.FieldName,
                  };
                },
              )}
              value={null} // This ensures that the input field is always empty
              onChange={handleSelectChange}
              isMulti={true}
              placeholder="Select or create an option..." // menuIsOpen={true}
              controlShouldRenderValue={false} // This keeps the input field empty
              onCreateOption={handleCreateOption}
              filterOption={customFilterOption}
              formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
            />
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {selectedOptions &&
                selectedOptions.length > 0 &&
                selectedOptions.map((option: any, index: any) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      margin: "5px",
                      padding: "5px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {index === editIndex ? (
                      <>
                        <CreatableSelect
                          options={updatedPersonalDetails[value].Values.map(
                            (col: any) => {
                              return {
                                value: col?.FieldName,
                                label: col?.FieldName,
                              };
                            },
                          )}
                          value={{
                            value: editValue,
                            label: editValue,
                          }}
                          onChange={(e: any) => setEditValue(e.value)}
                        />
                        <button onClick={handleSaveEdit}>Save</button>
                      </>
                    ) : (
                      <>
                        {option?.label}
                        <span
                          style={{
                            marginLeft: "5px",
                            cursor: "pointer",
                            color: "#007bff",
                          }}
                          onClick={() => handleEditOption(index)}
                        >
                          &#9998;
                        </span>
                        <span
                          style={{
                            marginLeft: "5px",
                            cursor: "pointer",
                            color: "#ff0000",
                          }}
                          onClick={() =>
                            setSelectedOptions(
                              selectedOptions.filter(
                                (_: any, i: any) => i !== index,
                              ),
                            )
                          }
                        >
                          &#x2715;
                        </span>
                      </>
                    )}
                  </div>
                ))}
            </div>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            style={style}
            onClick={() => {
              const updatedData = [...editAutoCallData]; // updatedData[valueEditTab].data[index][column] = newValue;
              // const newSelectOptions = selectedOptions.filter((flt: any) => flt?.label).map(({ label }:any) => {"label":label});

              const newSelectOptions = selectedOptions
                .filter((flt: any) => flt?.label)
                .map(({ label }: any) => ({
                  label,
                }));
              let j = 0;

              for (j; j < updatedData[valueEditTab].data.length; j++) {
                if (
                  updatedData[valueEditTab].data[j]?.FieldID === formulaIndex
                ) {
                  break;
                }
              }

              if (newSelectOptions && newSelectOptions.length > 0) {
                updatedData[valueEditTab].data[j]["Formula"] = [
                  ...newSelectOptions,
                ];
              } else {
                updatedData[valueEditTab].data[j]["Formula"] = null;
              }

              setEditAutoCallData(updatedData);
              setFormulaModal(!formulaModal);
            }}
          >
            Submit
          </Button>
          <Button onClick={() => setFormulaModal(!formulaModal)}>Cancel</Button>
        </ModalFooter>
      </Modal>
      <Drawer
        open={openDrawer}
        anchor="right"
        onClose={() => setOpenDrawer(!openDrawer)}
      >
        <PersonalDetails
          newFieldValues={newFieldValues}
          information={information}
          key={0}
          mainColField={mainColField}
          groupDetails={[]} //@ts-ignore
          personalDetails={calculatorData?.[0]?.Fields as any}
          currentRecordID={currentRecordID}
          handleProfileInformation={handleProfileInformation}
          isAccordian={false}
          edit={edit}
          setApiCall={setApiCall}
          setEdit={setEdit}
          isDrag={isDrag}
        />
      </Drawer>
      <div
      // ref={isDrag ? drop : containerRef}
      >
        <PDFPreviewModal
          isPDFPreviewOpen={isPDFPreviewOpen}
          toggle={handleClosePDFPreview}
          pdfSettings={
            selectedPdfSettings ||
            (information?.pdfsizes?.length > 0
              ? { size: information.pdfsizes[0], orientation: "portrait" }
              : {
                  size: { PageType: "A4", PageWidth: "595", PageHeight: "842" },
                  orientation: "portrait",
                })
          }
          updatedPersonalDetails={updatedPersonalDetails}
          value={value}
          isDrag={isDrag}
          onResize={onResize}
          setModalData={setModalData}
          setIsModalOpen={setIsModalOpen}
          saveData={saveData}
          information={information}
          isOpen={isOpen}
          loading={loading}
          promiseOptions={promiseOptions}
          handleInputChange={handleInputChange}
          onInputChange={onInputChange}
          setColumnSelect={setColumnSelect}
          handleCalculateData={handleCalculateData}
          calculateFormula={calculateFormula}
          isModify={isModify}
          setValue={setValue}
          mainColField={mainColField}
          menuID={menuID}
          menuIDQuery={menuIDQuery}
          currentRecordID={currentRecordID}
          setUpdatedPersonalDetails={setUpdatedPersonalDetails}
          setHideSubmit={setHideSubmit}
          handleProfileInformation={handleProfileInformation}
          setLoading={setLoading}
          setSavePersonalData={setSavePersonalData}
          savePersonalData={savePersonalData}
          handleSubmit={handleSubmit}
          handleExcelFileUpload={handleExcelFileUpload}
          getCalculatorData={getCalculatorData}
          confirm={confirm}
          isMobile={isMobile}
          setSaveData={setSaveData}
          editorRef={editorRef}
          getCardFields={getCardFields}
          handleTableLinkClick={handleTableLinkClick}
          tableMetadata={tableMetadata}
          setTableMetadata={setTableMetadata}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          timelineData={timelineData}
          vTimelineData={vTimelineData}
          setEdit={setEdit}
          edit={edit}
          reportData={reportData}
          onChangeInput={onChangeInput}
          dropDownArray={dropDownArray}
          loadingDropdown={loadingDropdown}
          selectedPdfSettings={selectedPdfSettings}
          drop={drop}
          tableproperty={tableMetadata.tableproperty}
          tableheaderfooterCSS={tableMetadata.tableheaderfooterCSS}
        />
      </div>
      {!edit ? (
        <Form
          style={{
            height: `${information.Data[0].PageHeight}vh`,
          }}
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
        >
          {!!isAccordian ? (
            <div
              className="mt-3"
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {updatedPersonalDetails &&
                updatedPersonalDetails.length > 0 &&
                updatedPersonalDetails
                  .filter(
                    (commissionTab: any) =>
                      commissionTab.DefaultVisible !== false,
                  ) // Filter out hidden tabs
                  .map((commissionTab: any, i: number) => {
                    const tabIndex =
                      updatedPersonalDetails.indexOf(commissionTab);
                    return (
                      <Accordion
                        expanded={value === tabIndex}
                        onChange={handleChangeAccordian(tabIndex)}
                        key={i}
                        disableGutters
                        square
                        sx={{
                          position: "relative",
                          zIndex: value === tabIndex ? 10 : 1,
                          overflow: "visible",
                          "& .MuiAccordionSummary-root": {
                            minHeight: "64px",
                          },
                          "& .MuiAccordionDetails-root": {
                            padding: "16px",
                            overflow: "visible",
                          },
                          "& .MuiAccordion-root": {
                            height: "auto",
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls={`panel${tabIndex}bh-content`}
                          id={`panel${tabIndex}bh-header`}
                        >
                          <Typography>{commissionTab?.Nestedtab}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ padding: "16px" }}>
                          <div
                            className="w-full field-container MuiAccordion-root-container"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              flexWrap: "wrap",
                              position: "relative",
                              height: "auto",
                              minHeight: "100vh", // Added to dynamic height
                              overflowY: "scroll",
                            }}
                            ref={drop}
                          >
                            <RenderFields
                              updatedPersonalDetails={updatedPersonalDetails}
                              value={value}
                              isDrag={isDrag}
                              onResize={onResize}
                              setModalData={setModalData}
                              setIsModalOpen={setIsModalOpen}
                              saveData={saveData}
                              information={information}
                              isOpen={isOpen}
                              promiseOptions={promiseOptions}
                              handleInputChange={handleInputChange}
                              onInputChange={onInputChange}
                              setColumnSelect={setColumnSelect}
                              handleCalculateData={handleCalculateData}
                              calculateFormula={calculateFormula}
                              isModify={isModify}
                              setValue={setValue}
                              mainColField={mainColField}
                              menuID={menuID}
                              menuIDQuery={menuIDQuery}
                              currentRecordID={currentRecordID}
                              setUpdatedPersonalDetails={
                                setUpdatedPersonalDetails
                              }
                              setHideSubmit={setHideSubmit}
                              handleProfileInformation={
                                handleProfileInformation
                              }
                              setLoading={setLoading}
                              setSavePersonalData={setSavePersonalData}
                              savePersonalData={savePersonalData}
                              handleSubmit={handleSubmit}
                              handleExcelFileUpload={handleExcelFileUpload}
                              getCalculatorData={getCalculatorData}
                              confirm={confirm}
                              isMobile={mobileLayout}
                              setSaveData={setSaveData}
                              editorRef={editorRef}
                              getCardFields={getCardFields}
                              handleTableLinkClick={handleTableLinkClick}
                              tableMetadata={tableMetadata}
                              setTableMetadata={setTableMetadata}
                              uploadedFiles={uploadedFiles}
                              setUploadedFiles={setUploadedFiles}
                              timelineData={timelineData}
                              vTimelineData={vTimelineData}
                              edit={tableEditMode}
                              setEdit={setTableEditMode}
                              reportData={reportData}
                              onChangeInput={onChangeInput}
                              dropDownArray={dropDownArray}
                              loadingDropdown={loadingDropdown}
                              handleSaveData={handleSaveData}
                              handleDirectSave={handleDirectSave}
                              parentTabVisible={
                                updatedPersonalDetails[value]
                                  ?.DefaultVisible !== false
                              }
                              tableBtnInfo={tableBtnInfo}
                              mandatoryFieldErrors={mandatoryFieldErrors}
                              currentTabWithErrors={currentTabWithErrors}
                              autopopupdrawer={autopopupdrawer}
                              cardDrop={cardDrop}
                              // ✅ CRITICAL FIX: Pass selected rows state and callback
                              selectedRowsByTable={selectedRowsByTable}
                              onTableSelectionChanged={
                                handleTableSelectionChanged
                              }
                            />
                          </div>
                          {updatedPersonalDetails[value]?.ds !== null && (
                            <NewTablePage
                              title=""
                              columns={columns}
                              TableArray={updatedPersonalDetails[value]?.ds}
                            />
                          )}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
            </div>
          ) : (
            <>
              {updatedPersonalDetails && updatedPersonalDetails.length > 1 && (
                <div className="w-full justify-between items-center flex">
                  {information?.Data?.[0]?.IsStepper ? (
                    <Stepper
                      activeStep={value}
                      style={{
                        width: "100%",
                      }}
                      onClick={(e) => e.preventDefault()}
                    >
                      {updatedPersonalDetails.map(
                        (commissionTab: any, i: number) => (
                          <Step
                            key={i}
                            label={commissionTab?.TabAliasName}
                            onClick={(e) => e.preventDefault()}
                          />
                        ),
                      )}
                    </Stepper>
                  ) : (
                    <div className="w-full">
                      <DynamicAdvancedTabs
                        // In PersonalDetails component, update the tabs array you pass to DynamicAdvancedTabs:
                        tabs={updatedPersonalDetails.map(
                          (tab: any, index: number) => {
                            // Get the field data for this specific tab
                            const tabFieldData = tab || {};

                            return {
                              id: index,
                              label: tab.TabAliasName || `Tab ${index + 1}`,
                              TabAliasName: tab.TabAliasName,
                              TabType: tab.TabType,
                              DefaultVisible: tab.DefaultVisible,
                              disabled: tab.DefaultVisible === false,
                              icon:
                                tabFieldData.ClsIcon || tabFieldData.clsicon,
                              _originalData: tab, // Pass the entire tab data
                            };
                          },
                        )}
                        activeId={value} // Pass the current value from state
                        onTabChange={(newIndex) => {
                          const newIndexNum = Number(newIndex);

                          // Prevent running if same tab
                          if (newIndexNum === value) return;

                          // Prevent rapid repeated calls
                          const now = Date.now();
                          if (
                            isValidatingRef.current ||
                            now - lastValidationTimeRef.current < 500
                          ) {
                            return;
                          }

                          isValidatingRef.current = true;
                          lastValidationTimeRef.current = now;

                          try {
                            const validation =
                              validateCurrentTabMandatoryFields();

                            if (!validation.isValid) {
                              setMandatoryFieldErrors(validation.errors);
                              setCurrentTabWithErrors(
                                updatedPersonalDetails[value]?.TabAliasName,
                              );

                              toast.error(
                                `Please fill all mandatory fields in current tab before switching`,
                                {
                                  style: { top: 80 },
                                  autoClose: 3000,
                                  toastId: "mandatory-field-error", // ADD THIS - prevents duplicate toasts
                                },
                              );

                              setTimeout(() => {
                                const firstErrorField = Object.keys(
                                  validation.errors,
                                )[0];
                                if (firstErrorField) {
                                  const errorElement = document.querySelector(
                                    `[data-field-id="${firstErrorField}"]`,
                                  );
                                  if (errorElement) {
                                    errorElement.scrollIntoView({
                                      behavior: "smooth",
                                      block: "center",
                                    });
                                  }
                                }
                              }, 100);

                              return;
                            }

                            setMandatoryFieldErrors({});
                            setCurrentTabWithErrors(null);

                            const selectedTab =
                              updatedPersonalDetails[newIndexNum];
                            if (selectedTab) {
                              handleNestedTabAPICall(selectedTab);
                            }

                            setTabChangeAttempted(true);
                            setValue(newIndexNum);
                          } finally {
                            // Reset the validation lock after a short delay
                            setTimeout(() => {
                              isValidatingRef.current = false;
                            }, 500);
                          }
                        }}
                        styleProps={{
                          Bgcolor: information?.Data?.[0]?.Fields?.[0]?.Bgcolor,
                          ActiveColor:
                            information?.Data?.[0]?.Fields?.[0]?.ActiveColor,
                          InActiveColor:
                            information?.Data?.[0]?.Fields?.[0]?.InActiveColor,
                          ActivetabBordercolor:
                            information?.Data?.[0]?.Fields?.[0]
                              ?.ActivetabBordercolor,
                          fontcolor:
                            information?.Data?.[0]?.Fields?.[0]?.fontcolor,
                          fontname:
                            information?.Data?.[0]?.Fields?.[0]?.FontName,
                          TabBackground:
                            information?.Data?.[0]?.Fields?.[0]?.TabBackground,
                          fontsize:
                            information?.Data?.[0]?.Fields?.[0]?.FontSize,
                          nestdtabsecbgcolor:
                            information?.Data?.[0]?.Fields?.[0]
                              ?.nestdtabsecbgcolor,
                          Isbold: information?.Data?.[0]?.Fields?.[0]?.Isbold,
                          IsItalic:
                            information?.Data?.[0]?.Fields?.[0]?.IsItalic,
                          IsUnderline:
                            information?.Data?.[0]?.Fields?.[0]?.IsUnderline,
                          Hovercolor:
                            information?.Data?.[0]?.Fields?.[0]?.Hovercolor,
                          clsicon: information?.Data?.[0]?.Fields?.[0]?.clsicon,
                          clscolor:
                            information?.Data?.[0]?.Fields?.[0]?.clscolor,
                        }}
                        closeable={information?.Data?.[0]?.IsCloseable}
                        reorderable={information?.Data?.[0]?.IsReorderable}
                        searchable={information?.Data?.[0]?.IsSearchable}
                      />
                    </div>
                  )}
                </div>
              )}

              <CustomTabPanel value={value} index={value}>
                {updatedPersonalDetails?.[value]?.IsTableDisplay ? (
                  <div
                    className="w-full"
                    style={{
                      width: "100%",
                      height: `${information.Data[0]?.PageHeight}vh`,
                    }}
                    ref={isDrag ? drop : containerRef}
                  >
                    <NewTablePage
                      title={"Table"}
                      columns={columnsTable}
                      tableFooter={updatedPersonalDetails[value]?.TableFooter}
                      TableArray={updatedPersonalDetails[value]?.TableData}
                      moduleID={tableModuleID}
                      buttonID={tableButtonID}
                    />
                  </div>
                ) : null}
                {updatedPersonalDetails?.[value]?.IsAddMore ? (
                  <div
                    className="w-full flex flex-col gap-5"
                    style={{
                      height: `${information.Data[0]?.PageHeight}vh`,
                      backgroundColor: updatedPersonalDetails?.[value]?.Bgcolor,
                    }}
                  >
                    {Object.entries(groupedFields).map(
                      ([groupName, fieldsInGroup]: any) => {
                        return fieldsInGroup?.[0]?.addmorevalues?.length > 0 ? (
                          <div key={groupName}>
                            <h2>{groupName}</h2>
                            <Table responsive>
                              <tbody>
                                {fieldsInGroup?.[0]?.addmorevalues?.map(
                                  (_: any, rowIndex: any) => (
                                    <tr key={rowIndex}>
                                      {fieldsInGroup.map((field: any) => {
                                        return field.DefaultVisible ? (
                                          <td
                                            key={`${field?.FieldID}-${rowIndex}`}
                                            style={{
                                              minWidth:
                                                field?.FieldType === "CHECKBOX"
                                                  ? "20px"
                                                  : "150px",
                                            }}
                                          >
                                            <RenderFieldsAddMore
                                              field={field}
                                              i={rowIndex}
                                              updatedPersonalDetails={
                                                updatedPersonalDetails
                                              }
                                              value={value}
                                              isDrag={isDrag}
                                              setModalData={setModalData}
                                              setIsModalOpen={setIsModalOpen}
                                              saveData={saveData}
                                              information={information}
                                              isOpen={isOpen}
                                              promiseOptions={promiseOptions}
                                              onInputChange={onInputChange}
                                              setColumnSelect={setColumnSelect}
                                              handleCalculateData={
                                                handleCalculateData
                                              }
                                              calculateFormula={
                                                calculateFormula
                                              } // Add this line
                                              isModify={isModify}
                                              setUpdatedPersonalDetails={
                                                setUpdatedPersonalDetails
                                              }
                                              setSaveData={setSaveData}
                                              evaluateFormula={evaluateFormula}
                                              groupName={groupName}
                                              AddMoreEvaluateFormula={
                                                AddMoreEvaluateFormula
                                              }
                                              handleSelectChangeAddMore={
                                                handleSelectChangeAddMore
                                              }
                                              menuID={menuID}
                                              menuIDQuery={menuIDQuery}
                                              confirm={confirm}
                                              addMoreSaveData={addMoreSaveData}
                                              setAddMoreSaveData={
                                                setAddMoreSaveData
                                              }
                                              isMobile={isMobile}
                                              tableBtnInfo={tableBtnInfo}
                                              applyAllFormulas={
                                                applyAllFormulas
                                              }
                                            />
                                          </td>
                                        ) : (
                                          ""
                                        );
                                      })}

                                      <td
                                        style={{
                                          minWidth: "150px",
                                        }}
                                      >
                                        <Button
                                          color="danger"
                                          disabled={!isModify}
                                          onClick={() => {
                                            if (rowIndex < 1) {
                                              return;
                                            }

                                            const nextState = [
                                              ...updatedPersonalDetails,
                                            ];
                                            nextState[value].Values.forEach(
                                              (
                                                parentRes: any,
                                                apiCallIndex: number,
                                              ) => {
                                                if (
                                                  parentRes.AddMoreGroup ===
                                                  groupName
                                                ) {
                                                  if (parentRes.IscalcapiCall) {
                                                    const nextState = [
                                                      ...updatedPersonalDetails,
                                                    ];
                                                    nextState.map(
                                                      (res: any) => {
                                                        res.Values.map(
                                                          async (
                                                            response: any,
                                                          ) => {
                                                            if (
                                                              response.FieldID ===
                                                              parentRes.ParentIDFormula
                                                            ) {
                                                              const data = {
                                                                Userid:
                                                                  localStorage.getItem(
                                                                    "username",
                                                                  ),
                                                                ModuleID:
                                                                  Number(
                                                                    menuIDQuery ||
                                                                      menuID,
                                                                  ),
                                                                FieldID:
                                                                  parentRes.FieldID,
                                                                OldValue:
                                                                  saveData[
                                                                    response
                                                                      .FieldName
                                                                  ],
                                                                Value: -Number(
                                                                  parentRes
                                                                    .addmorevalues[
                                                                    rowIndex
                                                                  ].FieldValue,
                                                                ),
                                                              };
                                                              axios
                                                                .post(
                                                                  "https://logpanel.insurancepolicy4u.com/api/Login/Calculate",
                                                                  data,
                                                                  {
                                                                    headers: {
                                                                      Authorization: `Bearer ${localStorage.getItem(
                                                                        "token",
                                                                      )}`,
                                                                    },
                                                                  },
                                                                )
                                                                .then(
                                                                  (
                                                                    responseData: any,
                                                                  ) => {
                                                                    const newState =
                                                                      [
                                                                        ...updatedPersonalDetails,
                                                                      ];
                                                                    newState.map(
                                                                      (
                                                                        res: any,
                                                                      ) => {
                                                                        res.Values.map(
                                                                          async (
                                                                            response: any,
                                                                          ) => {
                                                                            if (
                                                                              response.FieldID ===
                                                                              parentRes.ParentIDFormula
                                                                            ) {
                                                                              let state =
                                                                                {
                                                                                  ...saveData,
                                                                                  [response.FieldName]:
                                                                                    Number(
                                                                                      responseData
                                                                                        .data
                                                                                        .Value,
                                                                                    ),
                                                                                };
                                                                              setSaveData(
                                                                                state,
                                                                              );
                                                                            }
                                                                          },
                                                                        );
                                                                      },
                                                                    );
                                                                  },
                                                                );
                                                            }
                                                          },
                                                        );
                                                      },
                                                    );
                                                  }

                                                  parentRes.addmorevalues.splice(
                                                    rowIndex,
                                                    1,
                                                  );
                                                }
                                              },
                                            );
                                            setUpdatedPersonalDetails(
                                              nextState,
                                            );
                                          }}
                                        >
                                          Delete
                                        </Button>
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </Table>
                            <Button
                              style={style}
                              disabled={!isModify}
                              onClick={() => {
                                const nextState = [...updatedPersonalDetails];
                                nextState?.[value]?.Values.map((res: any) => {
                                  if (res.AddMoreGroup === groupName) {
                                    let defaultValue = "";

                                    if (res.FieldType === "DROPDOWN") {
                                      defaultValue = ""; // Empty for dropdowns
                                    }
                                    res.addmorevalues.push({
                                      ValIndex: res.addmorevalues?.length + 1,
                                      FieldValue: defaultValue,
                                      FieldID: res.FieldID,
                                      FieldName: res.FieldName,
                                      FieldType: res.FieldType,
                                    });
                                  }
                                });
                                setUpdatedPersonalDetails(nextState);
                              }}
                            >
                              Add More
                            </Button>
                          </div>
                        ) : null;
                      },
                    )}
                    <div
                      className="field-container w-full"
                      style={{
                        position: "relative",
                        minHeight: "100vh",
                        maxHeight: "calc(100vh - 200px)",
                        backgroundColor: getCurrentTabBgColor(),
                        width: "100%",
                        overflow: "hidden",
                      }}
                      ref={isDrag ? drop : containerRef}
                    >
                      <StandaloneFields
                        fields={standaloneFields}
                        value={value}
                        isDrag={isDrag}
                        onResize={onResize}
                        setModalData={setModalData}
                        setIsModalOpen={setIsModalOpen}
                        saveData={saveData}
                        setSaveData={setSaveData}
                        information={information}
                        isModify={isModify}
                        promiseOptions={promiseOptions}
                        onInputChange={onInputChange}
                        setColumnSelect={setColumnSelect}
                        handleCalculateData={handleCalculateData}
                        calculateFormula={calculateFormula}
                        setUpdatedPersonalDetails={setUpdatedPersonalDetails}
                        updatedPersonalDetails={updatedPersonalDetails}
                        applyAllFormulas={applyAllFormulas}
                        menuID={menuID}
                        menuIDQuery={menuIDQuery}
                        confirm={confirm}
                        isMobile={mobileLayout}
                        isPDFPreviewOpen={isPDFPreviewOpen}
                        setValue={setValue}
                        onTabChange={(newIndex) => {
                          const newIndexNum = Number(newIndex);

                          // Prevent running if same tab
                          if (newIndexNum === value) return;

                          // Prevent rapid repeated calls
                          const now = Date.now();
                          if (
                            isValidatingRef.current ||
                            now - lastValidationTimeRef.current < 500
                          ) {
                            return;
                          }

                          isValidatingRef.current = true;
                          lastValidationTimeRef.current = now;

                          try {
                            const validation =
                              validateCurrentTabMandatoryFields();

                            if (!validation.isValid) {
                              setMandatoryFieldErrors(validation.errors);
                              setCurrentTabWithErrors(
                                updatedPersonalDetails[value]?.TabAliasName,
                              );

                              toast.error(
                                `Please fill all mandatory fields in current tab before switching`,
                                {
                                  style: { top: 80 },
                                  autoClose: 3000,
                                  toastId: "mandatory-field-error",
                                },
                              );

                              setTimeout(() => {
                                const firstErrorField = Object.keys(
                                  validation.errors,
                                )[0];
                                if (firstErrorField) {
                                  const errorElement = document.querySelector(
                                    `[data-field-id="${firstErrorField}"]`,
                                  );
                                  if (errorElement) {
                                    errorElement.scrollIntoView({
                                      behavior: "smooth",
                                      block: "center",
                                    });
                                  }
                                }
                              }, 100);

                              return;
                            }

                            setMandatoryFieldErrors({});
                            setCurrentTabWithErrors(null);

                            const selectedTab =
                              updatedPersonalDetails[newIndexNum];
                            if (selectedTab) {
                              handleNestedTabAPICall(selectedTab);
                            }

                            setTabChangeAttempted(true);
                            setValue(newIndexNum);
                          } finally {
                            // Reset the validation lock after a short delay
                            setTimeout(() => {
                              isValidatingRef.current = false;
                            }, 500);
                          }
                        }}
                        mainColField={mainColField}
                        currentRecordID={currentRecordID}
                        setHideSubmit={setHideSubmit}
                        handleProfileInformation={handleProfileInformation}
                        setLoading={setLoading}
                        handleSubmit={handleSubmit}
                        handleExcelFileUpload={handleExcelFileUpload}
                        getCalculatorData={getCalculatorData}
                        setTableMetadata={setTableMetadata}
                        selectedRowsByTable={selectedRowsByTable}
                        isOpen={isOpen}
                      />
                    </div>
                    {!hideSubmit &&
                      updatedPersonalDetails?.[value]?.IsAddMore &&
                      updatedPersonalDetails?.[value]?.Values?.[1]
                        ?.ValueType !== "SUBMIT" &&
                      updatedPersonalDetails?.[value]?.Values?.[1]
                        ?.DefaultVisible &&
                      !updatedPersonalDetails?.[value]?.Values?.some(
                        (item: any) =>
                          item?.IsAddMore === false &&
                          item?.DefaultVisible &&
                          item?.FieldType === "BUTTON" &&
                          item?.ValueType === "NEXT",
                      ) && (
                        <Button
                          className="h-10 w-full"
                          style={style}
                          disabled={!isModify || isButtonLoading}
                          onClick={async () => {
                            const currentMainColVal =
                              saveData[mainColField?.FieldName];
                            console.log("currentMainColVal", currentMainColVal);

                            // Call the new handleSubmitDirectly function instead
                            await handleSubmitDirectlyInPersonalDetails();
                          }}
                        >
                          {isButtonLoading ? "Submitting..." : "SUBMIT"}
                        </Button>
                      )}

                    {!hideSubmit &&
                      updatedPersonalDetails?.[value]?.IsAddMore &&
                      updatedPersonalDetails?.[value]?.Values?.some(
                        (item: any) =>
                          item?.ValueType === "SUBMIT" && item?.DefaultVisible,
                      ) &&
                      !updatedPersonalDetails?.[value]?.Values?.some(
                        (item: any) =>
                          item?.IsAddMore === false &&
                          item?.DefaultVisible &&
                          item?.FieldType === "BUTTON" &&
                          item?.ValueType === "SUBMIT",
                      ) && (
                        <Button
                          className="h-10 w-full"
                          style={style}
                          disabled={!isModify}
                          onClick={() => {
                            handleSubmit({
                              Details: updatedPersonalDetails[value]?.Values,
                              saveData: saveData,
                              main: mainColField,
                              moduleID: menuIDQuery || menuID,
                              setSavePersonalData,
                              newValue: value,
                              savePersonalData,
                              length: updatedPersonalDetails?.length,
                              currentRecordID,
                              isOpen,
                              setLoading,
                              setHideSubmit: (
                                data: boolean,
                                mainColValue: string,
                              ) => {
                                setHideSubmit(data);
                              },
                              information,
                            });
                            let count = value;
                            count++;
                            setValue(count);
                          }}
                        >
                          NEXT
                        </Button>
                      )}
                  </div>
                ) : loading ? (
                  <div className="w-full justify-center items-center flex">
                    <CircularProgress />
                  </div>
                ) : updatedPersonalDetails?.[value]?.Nestedtab ===
                  "File Upload" ? (
                  <div
                    className="w-full field-container"
                    style={{
                      position: "relative",
                      minHeight: "100vh",
                      maxHeight: "calc(100vh - 200px)",
                      backgroundColor: getCurrentTabBgColor(),
                      backgroundImage:
                        pageBackgroundImage || information?.PageBackground
                          ? `url(${pageBackgroundImage || information?.PageBackground})`
                          : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      width: "100%",
                      overflow: "hidden", // Add this to prevent fields from overflowing visually
                    }}
                    ref={isDrag ? drop : containerRef}
                  >
                    <RenderFields
                      updatedPersonalDetails={updatedPersonalDetails}
                      value={value}
                      isDrag={isDrag}
                      onResize={onResize}
                      setModalData={setModalData}
                      setIsModalOpen={setIsModalOpen}
                      saveData={saveData}
                      information={information}
                      isOpen={isOpen}
                      promiseOptions={promiseOptions}
                      handleInputChange={handleInputChange}
                      onInputChange={onInputChange}
                      setColumnSelect={setColumnSelect}
                      handleCalculateData={handleCalculateData}
                      calculateFormula={calculateFormula}
                      isModify={isModify}
                      setValue={setValue}
                      mainColField={mainColField}
                      menuID={menuID}
                      menuIDQuery={menuIDQuery}
                      currentRecordID={currentRecordID}
                      setUpdatedPersonalDetails={setUpdatedPersonalDetails}
                      setHideSubmit={setHideSubmit}
                      handleProfileInformation={handleProfileInformation}
                      setLoading={setLoading}
                      setSavePersonalData={setSavePersonalData}
                      savePersonalData={savePersonalData}
                      handleSubmit={handleSubmit}
                      handleExcelFileUpload={handleExcelFileUpload}
                      getCalculatorData={getCalculatorData}
                      confirm={confirm}
                      isMobile={mobileLayout}
                      setSaveData={setSaveData}
                      editorRef={editorRef}
                      getCardFields={getCardFields}
                      handleTableLinkClick={handleTableLinkClick}
                      tableMetadata={tableMetadata}
                      setTableMetadata={setTableMetadata}
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      timelineData={timelineData}
                      vTimelineData={vTimelineData}
                      edit={tableEditMode}
                      setEdit={setTableEditMode}
                      reportData={reportData}
                      onChangeInput={onChangeInput}
                      dropDownArray={dropDownArray}
                      loadingDropdown={loadingDropdown}
                      handleSaveData={handleSaveData}
                      parentTabVisible={
                        updatedPersonalDetails[value]?.DefaultVisible !== false
                      }
                      tableBtnInfo={tableBtnInfo}
                      mandatoryFieldErrors={mandatoryFieldErrors}
                      currentTabWithErrors={currentTabWithErrors}
                      autopopupdrawer={autopopupdrawer}
                      cardDrop={cardDrop}
                      // ✅ CRITICAL FIX: Pass selected rows state and callback
                      selectedRowsByTable={selectedRowsByTable}
                      onTableSelectionChanged={handleTableSelectionChanged}
                    />
                    {/* {uploadedFiles?.length > 0 && (
                      <Table bordered responsive>
                        <tr>
                          {Object.keys(uploadedFiles?.[0])?.map((res: any) => {
                            if (res !== "FileLink" && res !== "fileTypes") {
                              return <th>{res}</th>;
                            }
                          })}
                        </tr>
                        <tbody>
                          {uploadedFiles?.map((res: any, index: number) => {
                            return (
                              <tr>
                                {Object.keys(res)?.map((response: any) => {
                                  if (
                                    response !== "FileLink" &&
                                    response !== "fileTypes"
                                  ) {
                                    return (
                                      <td>
                                        {response !== "Filename" &&
                                          response !== "Dellink" &&
                                          res[response]}{" "}
                                        {response === "Filename" && (
                                          <a
                                            href={res.FileLink}
                                            target="_blank"
                                          > 
                                            {res[response]}{" "}
                                          </a>
                                        )}
                                        {response === "Dellink" && (
                                          <Button
                                            onClick={async () => {
                                              const data = {
                                                Userid:
                                                  localStorage.getItem(
                                                    "username"
                                                  ),
                                                RecordID: currentRecordID,
                                                ModuleID: menuIDQuery || menuID,
                                              };
                                              axios
                                                .post(res[response], data, {
                                                  headers: {
                                                    Authorization: `Bearer ${localStorage.getItem(
                                                      "token"
                                                    )}`,
                                                  },
                                                })
                                                .then((response: any) => {
                                                  setUploadedFiles(
                                                    response.data.files
                                                  );
                                                });
                                            }}
                                          >
                                            Delete
                                          </Button>
                                        )}
                                      </td>
                                    );
                                  }
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
{/* 
                    {uploadedFiles?.length > 0 && (
                      <TableField
                        field={{
                          FieldType: "UPLOADED_FILES_TABLE",
                          FieldName: "Uploaded Files",
                          // ... other table field properties
                        }}
                        uploadedFiles={uploadedFiles}
                        setUploadedFiles={setUploadedFiles}
                        currentRecordID={currentRecordID}
                        menuID={menuIDQuery || menuID}
                      // ... all other props
                      />
                    )} */}
                  </div>
                ) : (
                  <div
                    className="field-container w-full"
                    style={{
                      position: "relative",
                      minHeight: "100vh",
                      maxHeight: "calc(100vh - 200px)",
                      backgroundColor: getCurrentTabBgColor(),
                      backgroundImage:
                        pageBackgroundImage || information?.PageBackground
                          ? `url(${pageBackgroundImage || information?.PageBackground})`
                          : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      width: "100%",
                      overflow: "hidden", // Add this to prevent fields from overflowing visually
                    }}
                    ref={isDrag ? drop : containerRef}
                  >
                    <RenderFields
                      updatedPersonalDetails={updatedPersonalDetails}
                      value={value}
                      isDrag={isDrag}
                      onResize={onResize}
                      setModalData={setModalData}
                      setIsModalOpen={setIsModalOpen}
                      saveData={saveData}
                      information={information}
                      isOpen={isOpen}
                      loading={loading}
                      promiseOptions={promiseOptions}
                      handleInputChange={handleInputChange}
                      onInputChange={onInputChange}
                      setColumnSelect={setColumnSelect}
                      handleCalculateData={handleCalculateData}
                      calculateFormula={calculateFormula}
                      isModify={isModify}
                      setValue={setValue}
                      mainColField={mainColField}
                      menuID={menuID}
                      menuIDQuery={menuIDQuery}
                      currentRecordID={currentRecordID}
                      setUpdatedPersonalDetails={setUpdatedPersonalDetails}
                      setHideSubmit={setHideSubmit}
                      handleProfileInformation={handleProfileInformation}
                      setLoading={setLoading}
                      setSavePersonalData={setSavePersonalData}
                      savePersonalData={savePersonalData}
                      handleSubmit={handleSubmit}
                      handleExcelFileUpload={handleExcelFileUpload}
                      getCalculatorData={getCalculatorData}
                      confirm={confirm}
                      isMobile={mobileLayout}
                      setSaveData={setSaveData}
                      editorRef={editorRef}
                      getCardFields={getCardFields}
                      handleTableLinkClick={handleTableLinkClick}
                      tableMetadata={tableMetadata}
                      setTableMetadata={setTableMetadata}
                      uploadedFiles={uploadedFiles}
                      setUploadedFiles={setUploadedFiles}
                      timelineData={timelineData}
                      vTimelineData={vTimelineData}
                      edit={tableEditMode}
                      setEdit={setTableEditMode}
                      reportData={reportData}
                      onChangeInput={onChangeInput}
                      dropDownArray={dropDownArray}
                      loadingDropdown={loadingDropdown}
                      selectedPdfSettings={selectedPdfSettings}
                      handleSaveData={handleSaveData}
                      isdisabled={isdisable}
                      parentTabVisible={
                        updatedPersonalDetails[value]?.DefaultVisible !== false
                      }
                      onTableDataUpdate={handleTableDataUpdate}
                      tableBtnInfo={tableBtnInfo}
                      mandatoryFieldErrors={mandatoryFieldErrors}
                      currentTabWithErrors={currentTabWithErrors}
                      autopopupdrawer={autopopupdrawer}
                      cardDrop={cardDrop}
                      // ✅ CRITICAL FIX: Pass selected rows state and callback
                      selectedRowsByTable={selectedRowsByTable}
                      onTableSelectionChanged={handleTableSelectionChanged}
                    />
                  </div>
                )}

                <div>
                  {updatedPersonalDetails[value]?.ds !== null && (
                    <NewTablePage
                      title={"Record Table"}
                      columns={columns}
                      TableArray={updatedPersonalDetails[value]?.ds}
                    />
                  )}
                </div>
              </CustomTabPanel>
            </>
          )}
        </Form>
      ) : (
        <Card className="mt-4 relative">
          <div className="w-full flex justify-end flex-1">
            <Button onClick={handleEditSubmitFunction} className="w-[100px]">
              Submit
            </Button>
          </div>
          <div className="w-full justify-between items-center flex">
            <Tabs
              value={valueEditTab}
              onChange={handleChangeEdit}
              aria-label="basic tabs example"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                display: "flex",
                gap: "10px",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                minWidth: "55px!important",
              }}
            >
              {editAutoCallData &&
                editAutoCallData.length > 0 &&
                editAutoCallData.map((commissionTab: any, i: number) => (
                  <Tab
                    key={i}
                    className=""
                    label={<CustomLabel commissionTab={commissionTab?.tab} />}
                    {...a11yProps(i)}
                    sx={{
                      minWidth: "59px",
                      marginLeft: "0px",
                      borderRadius: "2px 2px 0px 0px",
                      background: `url(${information?.Data?.[0]?.Fields?.[0]?.TabBackground}) no-repeat center center`,
                    }}
                  />
                ))}
            </Tabs>
          </div>
          <CustomTabPanel value={valueEditTab} index={valueEditTab}>
            <NewTablePage
              title={""}
              columns={editAutoCallColumns}
              TableArray={
                editAutoCallData && editAutoCallData[valueEditTab]?.data
              }
              height={"80vh"}
            />
          </CustomTabPanel>
        </Card>
      )}
    </>
  );
};

export default PersonalDetails;
