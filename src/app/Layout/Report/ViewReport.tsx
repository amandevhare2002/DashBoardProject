import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { RCDatePicker } from "../Common/DatePicker";
import { GraphComponent } from "./Graph";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from "next/link";
import Loading from "@/app/loading";
import MainTable from "@/utils/table";
import AsyncSelect from 'react-select/async';

const ViewReports = () => {
  const token = useSelector((state: any) => state.authReducer.token);
  const [reportData, setReportData] = useState<any>(null);
  const router = useRouter();
  const [reportTableData, setReportTableData] = useState([]);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [loading, setLoading] = useState(true);
  const [excelFile, setExcelFile] = useState<any>();
  const [fileType, setFileType] = useState("");
  const [filterArray, setFilterArray] = useState<
    Array<{
      name: string;
      value: string | Date;
      value2: string | Date;
      dbName: string;
      selectValue: Array<{ value: string; label: string }>;
      tableName: string;
      inputtype: string;
      options: Array<{ value: string; label: string }>;
    }>
  >([]);
  const { mainMenuID, menuID, heading } = router?.query;
  const [isGraphCollapsed, setIsGraphCollapsed] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [reportsArr, setReportsArr] = useState<any>([]);
  const [reportId, setReportId] = useState<any>();
  const [edit, setEdit] = useState(false);
  const [dyanmicModuleData, setDyanmicModuleData] = useState<any>([]);
  const [dropDownArray, setDropDownArray] = useState<any>([{ value: "", label: "" }]);
  const [fieldArray, setFieldArray] = useState<any>([]);
  const [columnsMatch, setColumnsMatch] = useState<any>({});
  const [excelMatchModal, setExcelMatchModal] = useState(false);
  const [matchedColArray, setMatchColArray] = useState<any>([]);
  const [TableDataUpdate, setTableDataUpdate] = useState<any>([]);
  const [columnSelect, setColumnSelect] = useState("");
  const [reportName, setReportName] = useState("");
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  const handleChange = (panel: any) => (event: any, isExpanded: any) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getDynamicReports = () => {
    const Params = {
      Userid: localStorage.getItem("username"),
      MainMenuID: mainMenuID,
      MenuID: menuID,
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetDynamicReports",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(async (response) => {
        if (response.data.reportLists?.[0]?.ReportID) {
          setReportsArr(response.data.reportLists);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    setLoading(false);
  };

  useEffect(() => {
    if (token && mainMenuID && menuID) {
      getDynamicReports();
    }
  }, [token, mainMenuID]);

  const onChangeValue = (name: string, value: string | Date, index: number) => {
    const nextState = [...filterArray];
    nextState[index] = {
      ...nextState[index],
      value: value,
    };
    setFilterArray(nextState);
  };

  const inputTypeComponent = (
    res: {
      name: string;
      value: string;
      value2: string;
      selectValue: Array<{ value: string; label: string }>;
      dbName: string;
      tableName: string;
      inputtype: string;
      options: Array<{ value: string; label: string }>;
    },
    index: number
  ) => {
    switch (res.inputtype) {
      case "TEXTBOX":
        return (
          <Input
            value={res.value}
            name={res.name}
            onChange={(e) => {
              onChangeValue(res.name, e.target.value, index);
            }}
          />
        );
      case "DATE":
        const date = res.value ? new Date(res.value) : null;
        const date2 = res.value2 ? new Date(res.value2) : null;
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              width: "100%",
            }}
          >
            <RCDatePicker
              placeholder={"Select To"}
              value={date}
              name={res.name}
              onChange={(e) => {
                onChangeValue(res.name, e, index);
              }}
            />
            <RCDatePicker
              placeholder={"Select From"}
              value={date2}
              name={res.name}
              onChange={(e) => {
                const nextState = [...filterArray];
                nextState[index] = {
                  ...nextState[index],
                  value2: e,
                };
                setFilterArray(nextState);
              }}
            />
          </div>
        );
      case "DROPDOWN":
        return (
          <Select
            name={res.name}
            value={res.selectValue}
            options={res.options}
            isMulti
            closeMenuOnSelect={false}
            onChange={(e: any) => {
              const nextState = [...filterArray];
              nextState[index] = {
                ...nextState[index],
                selectValue: e,
              };
              setFilterArray(nextState);
            }}
          />
        );
      default:
        return null;
    }
  };

  const getReportDetails = (reportVal: { reportVal?: number }) => {
    setLoading(true);
    const Params = {
      Userid: localStorage.getItem("username"),
      ReportID: reportVal ? reportVal : reportId?.value,
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
        }
      )
      .then(async (response) => {
        if (response.status === 200 || response.status === 201) {
          setReportData(response.data);
          setReportName(response?.data?.reportName);
          const reportArray = [...response.data.columnsArray];
          const arrayData = reportArray.map((response: any) => ({
            name: response.ReadcolumnName,
            value: "",
            value2: "",
            selectValue: [],
            dbName: response.ReadDBName,
            chartColumnTypes: response.chartColumnTypes,
            tableName: response.ReadtableName,
            inputtype: response.Inputtype,
            MarkasFilter: response.MarkasFilter,
            ischartColumn: response.ischartColumn,
            AggFuncApplied: response.AggFuncApplied,
            ChartjoinCols: response.ChartjoinCols,
            options: [],
            ServerName: response?.ReadServerName,
          }));
          const newArray = await Promise.all(
            arrayData.map(async (response: any) => {
              if (response.inputtype === "DROPDOWN") {
                const object = { ...response };
                object.options = await getValues(response);
                return object;
              }
              return response;
            })
          );
          setFilterArray(newArray);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
    setLoading(false);
  };

  useEffect(() => {
    if (reportId?.value) {
      getReportDetails(reportId.value);
    }
  }, [reportId, edit]);

  useEffect(() => {
    if (reportsArr?.length === 1) {
      setReportId({
        value: reportsArr[0]?.ReportID,
        label: reportsArr[0]?.Reportname,
      });
    }
  }, [reportsArr]);

  const getValues = async (response: {
    name: string;
    value: string;
    dbName: string;
    tableName: string;
    inputtype: string;
    ServerName: string;
    options: Array<{ value: string; label: string }>;
  }) => {
    let newOptions: any = [];
    const Params = {
      Userid: localStorage.getItem("username"),
      Dbname: response.dbName,
      Tabname: response.tableName,
      Colname: response.name,
      ServerName: response.ServerName,
    };
    await axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValues",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        newOptions = res.data.colvalues?.map((res: any) => ({
          value: res.Colvalue,
          label: res.Colvalue,
        }));
      })
      .catch((error) => {
        console.error(error);
      });
    return newOptions;
  };

  const getReportData = () => {
    setLoading(true);
    const reportsColumnsArray: any = [];
    filterArray.forEach((res: any) => {
      const object = {
        Dbname: res.dbName,
        Tabname: res.tableName,
        Colname: res.name,
        ischartColumn: res.ischartColumn,
        chartColumnTypes: res.chartColumnTypes,
        ChartOperationType: res.ChartOperationType,
        AggFuncApplied: res.AggFuncApplied,
        ChartjoinCols: res.ChartjoinCols,
        ServerName: res.ServerName,
      };
      reportsColumnsArray.push(object);
    });
    const selectedDbTables = reportData?.dbnameLists?.[0]?.tablenameLists.map(
      (res: any) => ({
        SelectedDb: reportData?.dbnameLists?.[0]?.Dbname,
        SelectedTab: res.Tablename,
      })
    );

    const conditionalColArray: any = [];
    filterArray.forEach((res: any) => {
      if (res.MarkasFilter && res.inputtype === "DROPDOWN") {
        const object = {
          ConditionDbname: res.dbName,
          ConditionTabname: res.tableName,
          ConditionColumn: res.name,
          ConditionTypeApply: "EQUAL",
          conditionValues:
            res.selectValue.length > 0
              ? res.selectValue.map((response: any) => ({
                  ConditionValue: response.value,
                }))
              : [],
        };
        conditionalColArray.push(object);
      }
      if (res.MarkasFilter && res.inputtype === "DATE") {
        const today = new Date(res.value);
        const yyyy = today.getFullYear();
        let mm: any = today.getMonth() + 1;
        let dd: any = today.getDate();
        if (dd < 10) dd = "0" + dd;
        if (mm < 10) mm = "0" + mm;
        const formattedToday = yyyy + "-" + mm + "-" + dd;

        const today2 = new Date(res.value2);
        const yyyy2 = today2.getFullYear();
        let mm2: any = today2.getMonth() + 1;
        let dd2: any = today2.getDate();
        if (dd2 < 10) dd2 = "0" + dd2;
        if (mm2 < 10) mm2 = "0" + mm2;
        const formattedToday2 = yyyy2 + "-" + mm2 + "-" + dd2;

        const object = {
          ConditionDbname: res.dbName,
          ConditionTabname: res.tableName,
          ConditionColumn: res.name,
          ConditionTypeApply: "between",
          conditionValues: [
            { ConditionValue: formattedToday },
            { ConditionValue: formattedToday2 },
          ],
        };
        conditionalColArray.push(object);
      }
      if (res.MarkasFilter && res.inputtype === "TEXTBOX") {
        const object = {
          ConditionDbname: res.dbName,
          ConditionTabname: res.tableName,
          ConditionColumn: res.name,
          ConditionTypeApply: "EQUAL",
          conditionValues: [{ ConditionValue: res.value }],
        };
        conditionalColArray.push(object);
      }
    });

    const joiningColumnsArray: any = [];
    reportData?.columnsArray?.forEach((res: any) => {
      if (res.joiningCol) {
        const object = {
          MainDbname: res.dbName,
          MainTabname: res.tableName,
          MainColname: res.columnName,
          JoinDbname: res.joiningDb,
          JoinTabname: res.joiningTable,
          JoinColname: res.joiningCol,
        };
        joiningColumnsArray.push(object);
      }
    });

    const Params = {
      Userid: localStorage.getItem("username"),
      reportsColumns: reportsColumnsArray,
      selected_DB_Tables: selectedDbTables,
      conditionalColsLists: conditionalColArray,
      joiningColumns: joiningColumnsArray,
      ReportID: reportId?.value,
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetReportData",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setReportTableData(response.data.Report);
        setGraphData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleGETDynamicFields = async () => {
    try {
      if (fieldArray.length > 0) {
        return;
      }
      const data = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuID,
        RecordID: "0",
      };
      const result = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetDynamicFieldsModuleWise",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (result?.data) {
        setFieldArray(result?.data?.Fields);
        setDyanmicModuleData(result?.data?.Fields);
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  useEffect(() => {
    if (reportTableData?.length > 0) {
      handleGETDynamicFields();
    }
  }, [reportTableData]);

  const AddDropDownData = async (text: any) => {
    try {
      setLoadingDropdown(true);
      const columnsData = reportData?.columnsArray?.find(
        (reportCol: any) => reportCol.columnName.toLowerCase() === columnSelect.toLowerCase()
      );
      if (!columnsData) {
        return [];
      }
      const data = {
        Userid: localStorage.getItem('username'),
        Dbname: columnsData?.ReadDBName,
        Tabname: columnsData?.ReadtableName,
        Colname: columnsData?.ReadcolumnName,
        ServerName: columnsData?.ReadServerName,
        SearchText: text,
      };
      const res = await axios.post(
        'https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValues',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res?.data?.colvalues) {
        const options = res.data.colvalues.map((value: any) => ({
          value: value.Colvalue,
          label: value.Colvalue,
        }));
        setDropDownArray(options);
        return options;
      }
      return [];
    } catch (error) {
      console.error('error', error);
      return [];
    } finally {
      setLoadingDropdown(false);
    }
  };

  const promiseOptions = (inputValue: string) =>
    new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve(AddDropDownData(inputValue));
      }, 1000);
    });

  const onChangeInput = (e: any) => {
    const rowMainCol = dyanmicModuleData?.find((data: any) => data?.IsMainCol === true);
    e.row[e.target.name] = e.target.value;
    setTableDataUpdate((prev: any) => {
      let tableRowData = [...prev];
      let checkRow = tableRowData.findIndex(
        (col: any) => col[rowMainCol?.FieldName] === e.row[rowMainCol?.FieldName]
      );
      if (checkRow !== -1) {
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

  const columns = useMemo(() => {
    if (!reportTableData || reportTableData.length === 0) return [];
    return Object.keys(reportTableData[0]).map((column) => {
      const columnData = reportData?.columnsArray?.find(
        (data: any) => data?.columnName === column
      );
      const isMainCol = columnData?.IsMaincol || false;
      const isDropdown = columnData?.Inputtype === 'DROPDOWN';

      return {
        name: column,
        selector: (row: any) => row[column],
        sortable: true,
        wrap: true,
        cell: (row: any) =>
          edit && isDropdown ? (
            <AsyncSelect
              loadOptions={promiseOptions}
              defaultOptions={dropDownArray}
              onChange={(selectedOption: any) => {
                onChangeInput({
                  target: { name: column, value: selectedOption ? selectedOption.value : '' },
                  row,
                });
              }}
              value={{ label: row[column] ?? '', value: row[column] ?? '' }}
              onInputChange={(val) => onInputChange(val, column)}
              isLoading={loading || loadingDropdown}
              isDisabled={isMainCol}
              noOptionsMessage={() => 'No Suggestions'}
              onFocus={() => {
                setColumnSelect(column);
                setDropDownArray([{ value: '', label: '' }]);
              }}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                container: (base) => ({ ...base, width: '100%' }),
              }}
              menuPlacement="auto"
            />
          ) : (
            <a
              style={{
                color: '#0088ff',
                cursor: 'pointer',
                width: '150px !important',
                minWidth: '150px',
              }}
              href={row?.Link}
            >
              {row[column] ?? '-'}
            </a>
          ),
      };
    });
  }, [reportTableData, edit, dropDownArray, loading, loadingDropdown, reportData]);

  let recordID = "";
  if (dyanmicModuleData?.length > 0 && reportTableData?.length > 0) {
    for (const fld of dyanmicModuleData) {
      for (const col of columns) {
        if (fld?.FieldName === col?.name && fld?.IsMainCol) {
          recordID = fld.FieldName;
          break;
        }
      }
    }
  }

  const handleSaveData = async () => {
    try {
      if (!TableDataUpdate.length) {
        setEdit(false);
        setReportTableData([]);
        return;
      }
      const recordsbulk = TableDataUpdate.map((row: any) => {
        const dataOfRow = Object.keys(row).map((rowKey) => {
          const columnData = reportData?.columnsArray?.find(
            (data: any) => data?.columnName === rowKey
          );
          return {
            Fieldname: rowKey,
            FieldValue: row[rowKey] ?? '',
            Colname: columnData?.ReadcolumnName || rowKey,
            IsMain: columnData?.IsMaincol || false,
          };
        });
        return { fieldsDatanew: dataOfRow };
      });

      const data = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuID,
        Operation: "UPDATE",
        recordsbulk,
      };

      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldBulk",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res) {
        setReportTableData([]);
        toast.success("Data Updated Successfully!");
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Failed to update data");
    }
    setEdit(false);
  };

  const handleFileSelect = async (event: any) => {
    const { files: tempFiles } = event.target;
    const files = [...tempFiles];
    if (files?.length) {
      for await (const file of files) {
        const base64File: any = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            resolve({
              Filename: file.name,
              ContentType: file.type,
              base64string: reader.result,
            });
          };
          reader.onerror = (error) => {
            console.error("Error: ", error);
            reject(error);
          };
        });
        setExcelFile(base64File);
      }
    }
  };

  const handleExcelFileUpload = async () => {
    try {
      setLoading(true);
      if (!fileType || !excelFile?.base64string) {
        toast.error("Please select a file and file type");
        setLoading(false);
        return;
      }
      const data = {
        Userid: localStorage.getItem("username"),
        InputType: fileType,
        Base64string: excelFile.base64string.split(",")[1],
      };
      const result = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UploadTransactions",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (result?.data?.ErrorMessage) {
        toast.error(result?.data?.ErrorMessage || "Something went wrong", { style: { top: 80 } });
        setLoading(false);
        return;
      }
      if (result?.data) {
        setColumnsMatch(result?.data);
        setExcelMatchModal(true);
        for (const col of result?.data?.OurColumns) {
          setMatchColArray((prev: any) => {
            const matched = [...prev];
            const index = matched.findIndex((c: any) => c?.OurColumn === col?.Colname);
            const match = { OurColumn: col?.Colname, excelcolname: col?.MappedColumn };
            if (index !== -1) {
              matched[index] = match;
            } else {
              matched.push(match);
            }
            return matched;
          });
        }
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTransWithMapping = async () => {
    setLoading(true);
    try {
      const data = {
        Userid: localStorage.getItem("username"),
        InputType: fileType,
        Recordno: "",
        Base64string: excelFile?.base64string.split(",")[1],
        MappedCols: matchedColArray,
      };
      const result = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UploadTransWithMapping",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (result) {
        toast.success("File Data Uploaded Successfully", { style: { top: 80 } });
        setExcelMatchModal(false);
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Something went wrong", { style: { top: 80 } });
    } finally {
      setLoading(false);
    }
  };

  const graphArray: any = [];
  Object.keys(graphData || {}).forEach((res: any) => {
    if (res !== "Query Executed" && res !== "Report") {
      graphArray.push({ key: res, data: graphData?.[res] });
    }
  });

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
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
          <Card>
            <CardHeader>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <CardTitle>{reportName || "View Report"}</CardTitle>
                <div>
                  {filterArray?.length !== 0 ? (
                    <div className="gap-x-4 flex">
                      <Link
                        href={{
                          pathname: "/calendar-event",
                          query: { heading: `${reportId?.label}`, menuId: menuID, recordId: "0" },
                        }}
                      >
                        <Button color="primary">Add New</Button>
                      </Link>
                      <Button
                        onClick={() => {
                          router.push(`/report/${mainMenuID}/${menuID}/${heading}`);
                        }}
                      >
                        Create Report
                      </Button>
                      <Button
                        color="primary"
                        onClick={() => {
                          router.push(`/report/${mainMenuID}/${menuID}/${heading}`);
                        }}
                      >
                        Edit Report
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        router.push(`/report/${mainMenuID}/${menuID}/${heading}`);
                      }}
                    >
                      Create Report
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Loading />
              ) : reportsArr.length === 1 || reportId?.value ? (
                <>
                  {reportData?.IsExcelUpload && (
                    <div
                      style={{
                        display: "flex",
                        gap: 20,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <FormGroup style={{ width: "400px" }}>
                        <Label for="file">File</Label>
                        <Input
                          id="file"
                          name="file"
                          type="file"
                          onChange={handleFileSelect}
                        />
                      </FormGroup>
                      <FormGroup style={{ width: "200px" }}>
                        <Label style={{ fontWeight: 700 }}></Label>
                        <Input
                          type="select"
                          value={fileType}
                          onChange={(e) => setFileType(e.target.value)}
                        >
                          <option></option>
                          {reportData?.fileTypes.map((file: any, index: number) => (
                            <option key={index}>{file.Filetype}</option>
                          ))}
                        </Input>
                      </FormGroup>
                      <Button color="success" onClick={handleExcelFileUpload}>
                        Upload
                      </Button>
                      <Modal isOpen={excelMatchModal}>
                        <ModalHeader>Match Excel Columns</ModalHeader>
                        <ModalBody className="flex flex-col">
                          {columnsMatch?.OurColumns?.map((mainCol: any, i: number) => (
                            <FormGroup className="flex w-full" key={i}>
                              <Label style={{ fontWeight: 700 }} className="w-1/2">
                                {mainCol?.Colname}
                              </Label>
                              <Input
                                className="w-1/2"
                                type="select"
                                name={mainCol?.Colname}
                                defaultValue={mainCol?.MappedColumn}
                                onChange={(e) => {
                                  const match = {
                                    OurColumn: e.target.name,
                                    excelcolname: e.target.value,
                                  };
                                  setMatchColArray((prev: any) => {
                                    const matched = [...prev];
                                    const index = matched.findIndex(
                                      (col: any) => col?.OurColumn === match?.OurColumn
                                    );
                                    if (index !== -1) {
                                      matched[index] = match;
                                    } else {
                                      matched.push(match);
                                    }
                                    return matched;
                                  });
                                }}
                              >
                                <option></option>
                                {columnsMatch?.ExcelColumns?.map((excelCol: any, index: number) => (
                                  <option key={index}>{excelCol.excelcolname}</option>
                                ))}
                              </Input>
                            </FormGroup>
                          ))}
                        </ModalBody>
                        <ModalFooter>
                          <Button color="primary" onClick={handleUploadTransWithMapping}>
                            Submit
                          </Button>
                          <Button
                            color="primary"
                            onClick={() => setExcelMatchModal(!excelMatchModal)}
                          >
                            Close
                          </Button>
                        </ModalFooter>
                      </Modal>
                    </div>
                  )}
                  <Form
                    style={{
                      display: "flex",
                      gap: 20,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {filterArray?.map((res: any, index: number) =>
                      res.MarkasFilter ? (
                        <FormGroup style={{ width: res.inputtype === "DATE" ? 400 : 200 }}>
                          <Label style={{ fontWeight: 700, marginBottom: 5 }}>
                            {res.name}
                          </Label>
                          {inputTypeComponent(res, index)}
                        </FormGroup>
                      ) : null
                    )}
                    <FormGroup>
                      <Button
                        color="primary"
                        onClick={() => {
                          getReportData();
                        }}
                      >
                        Apply Filter
                      </Button>
                    </FormGroup>
                  </Form>
                </>
              ) : reportsArr.length > 0 ? (
                <div>
                  <Label for="reportId">Select Report</Label>
                  <Select
                    id="report"
                    name="report"
                    value={reportId}
                    onChange={(selectedOption) => setReportId(selectedOption)}
                    options={reportsArr.map((rep: any) => ({
                      value: rep.ReportID,
                      label: rep.Reportname,
                    }))}
                    className="w-[30%]"
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Label style={{ fontWeight: "bold" }}>No Report Data Found</Label>
                  <Button
                    color="primary"
                    onClick={() => {
                      router.push(`/report/${mainMenuID}/${menuID}/${heading}`);
                    }}
                  >
                    Create Report
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
          {reportTableData?.length > 0 && (
            <>
              {graphArray?.length > 0 && (
                <Accordion
                  onChange={handleChange('panel1')}
                  expanded={expanded === 'panel1'}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>Graph report data</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <GraphComponent
                      graphData={graphData}
                      setIsGraphCollapsed={setIsGraphCollapsed}
                      isGraphCollapsed={isGraphCollapsed}
                    />
                  </AccordionDetails>
                </Accordion>
              )}
              <Accordion
                onChange={handleChange('panel2')}
                expanded={expanded === 'panel2'}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                  sx={{ width: "100%" }}
                >
                  <div className="flex justify-between w-[96%]">
                    <Typography>Table Report Data</Typography>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <MainTable
                    title="Table Report Data"
                    TableArray={reportTableData}
                    columns={columns}
                    editingRow={true}
                    handleSaveChanges={(val: any) =>
                      router.push(
                        `/calendar-event/?heading=${reportId.label}&menuId=${menuID}&recordId=${
                          recordID ? val[recordID] : "0"
                        }`
                      )
                    }
                    setEditBtn={setEdit}
                    editBtn={edit}
                    handleSaveData={handleSaveData}
                    reportData={reportData}
                    onChangeInput={onChangeInput}
                    promiseOptions={promiseOptions}
                    dropDownArray={dropDownArray}
                    onInputChange={onInputChange}
                    loadingDropdown={loadingDropdown}
                    moduleID={menuID}
                    IsDetailPopupOpen={false}
                    handleTableLinkClick={() => {}}
                  />
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ViewReports;
