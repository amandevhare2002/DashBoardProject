import axios from "axios";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapse,
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
import Select from "react-select";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import Tooltip from "rc-tooltip";
import { Accordion, AccordionDetails, AccordionSummary, Box, Tab, Tabs, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Loading from "@/app/loading";
import { MdCancel } from "react-icons/md";
import CreatableSelect from 'react-select/creatable';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
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
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const Reports = () => {
  const token = useSelector((state: any) => state.authReducer.token);
  const [selectedHeading, setSelectedHeading] = useState({
    value: "",
    label: "",
    grouped: [],
  });
  const [headings, setHeadings] = useState([]);
  const [menuItems, setMenuItems] = useState<any>([]);
  const [selectedMenu, setSelectedMenu] = useState<any>({
    value: "",
    label: "",
    res: null,
  });
  const [columnsArray, setColumnsArray] = useState<any>([]);
  const [subMenuItems, setSubMenuItems] = useState<any>([]);
  const [selectedSubMenu, setSelectedSubMenu] = useState<any>({
    value: "",
    label: "",
  });
  const [reportName, setReportName] = useState("");
  const [isMultipleChart, setIsMultipleChart] = useState("");
  const [isExcelUpload, setIsExcelUpload] = useState("")
  const [loadDatabase, setLoadDatabase] = useState([]);
  const [loadColName, setLoadColName] = useState([])
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
  const [selectedReportArray, setSelectedReportArray] = useState({
    value: "",
    label: "",
  });
  const [reportDetails, setReportDetails] = useState<any>(null);

  const [reportId, setReportId] = useState(0);
  const [chartOperationType, setChartOperationType] = useState([]);
  const [aggFunc, setAggFunc] = useState([]);
  const [groupedColumnArray, setGroupedColumnArray] = useState<any>([]);
  const [selectedOptions, setSelectedOptions] = useState<any>([]);
  const [newGroupedIndex, setNewGroupedIndex] = useState(0);
  const [newIndex, setNewIndex] = useState(0);
  const [isHyperLinkModal, setIsHyperLinkModal] = useState(false);
  const [serverList, setServerList] = useState([]);
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(0);
  const [selectedServer, setSelectedServer] = useState({
    value: "",
    label: "",
  });
  const router = useRouter()
  const query = router.query
  console.log("query", query)
  const [formulaModal, setFormulaModal] = useState(false)
  const [formulaIndex, setFormulaIndex] = useState(false)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    setLoading(true)
    if (token && router.query) {
      getMenuItems();
      // getDatabase();
      getReports();
      getChartOperationType();
      getAggFunction();
      getServerList()
    }
    setLoading(false)
  }, [token, router.query]);

  const getServerList = () => {
    setLoading(true)
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
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setServerList(response.data.ServerList);
        setLoading(false)
      })
      .catch((error) => { setLoading(false) });


  };
  const getAggFunction = () => {
    setLoading(true)
    const Params = {
      Userid: localStorage.getItem("username"),
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetFunctionsApply",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setAggFunc(response.data.FunctionApply);
        setLoading(false)
      })
      .catch((error) => { setLoading(false) });
  };

  const getChartOperationType = () => {
    setLoading(true)
    const Params = {
      Userid: localStorage.getItem("username"),
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetChartOperationType",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setChartOperationType(response.data.ChartOperations);
        setLoading(true)
      })
      .catch((error) => { setLoading(false) });
  };

  const getReports = () => {
    setLoading(true)
    const { mainMenuID, menuID } = router.query;

    if (!mainMenuID || !menuID) {
      return;
    }
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
      .then((response) => {
        console.log("responsse getReport", response)
        setSelectedReportArray({
          value: response.data.reportLists?.[0]?.ReportID,
          label: response.data.reportLists?.[0]?.Reportname,
        });
        setReportDetails({
          ...reportDetails,
          MenuID: Number(menuID),
          MainMenuID: Number(mainMenuID),
        });
        setLoading(false)
      })
      .catch((error) => { setLoading(false) });
  };

  const getMenuItems = () => {
    setLoading(true)
    const { heading } = router.query;
    fetch(
      `https://logpanel.insurancepolicy4u.com/api/Login/GetMenuItems2?ProjectType=${sessionStorage.getItem("panelID") || 1}&Userid=${localStorage.getItem(
        "username"
      )}&device=1&ipaddress=122.76.54.19`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        const reminders: any = [];
        // Group data by the "company" field
        const groupedData = response.menuitems.reduce(
          (result: any, item: any) => {
            const company = item.MenuHeaderName;
            if (!result[company]) {
              result[company] = {
                value: company,
                label: company,
                grouped: [],
              };
              reminders.push(result[company]);
            }
            result[company].grouped.push({
              ...item,
            });
            return result;
          },
          {}
        );
        setHeadings(reminders);
        const selectedHeadingData: any = reminders?.find(
          (res: any) => res.value === heading
        );
        console.log("selectedHeadingData", selectedHeadingData)
        // MainMenuID   submenuitems  MenuID

        for(let menu of selectedHeadingData?.grouped){
          if(menu?.MainMenuID  === Number(query?.mainMenuID)){
            for(let submenu of menu?.submenuitems){
              if(submenu?.MenuID === Number(query?.menuID)){
                setReportName(submenu?.SubmenuName)
              }
            }
          }
        }

        setSelectedHeading(selectedHeadingData);


        setLoading(false)
      })
      .catch((error) => { setLoading(false) });
  };
  useEffect(() => {
    if (selectedHeading?.value) {
      const menuArray = selectedHeading.grouped.map((res: any) => {
        return {
          label: res.MainMenuName,
          value: res.MainMenuID,
          res: res,
        };
      });
      console.log("menuArrya", menuArray)
      setMenuItems(menuArray);
    }
  }, [selectedHeading]);

  useEffect(() => {
    if (selectedMenu?.value) {
      console.log("selectedMenu", selectedMenu)
      let subMenuItems: any = [];
      subMenuItems = [...subMenuItems, ...selectedMenu?.res?.submenuitems];
      console.log("subMenuItems", subMenuItems)
      const newArray = subMenuItems.map((response: any) => {
        return {
          value: response.MenuID,
          label: response.SubmenuName,
          res: response,
        };
      });
      setSubMenuItems(newArray);
    }
  }, [selectedMenu]);

  useEffect(() => {
    if (selectedSubMenu?.value) {
      console.log("Enter in this useEffect", selectedSubMenu)
      if (selectedSubMenu?.res?.ServerName && !selectedServer.value) {
        setSelectedServer({
          value: selectedSubMenu?.res?.ServerName,
          label: selectedSubMenu?.res?.ServerName,
        })
      }
      setSelectedDatabase({
        value: selectedSubMenu?.res?.DefaultDbname,
        label: selectedSubMenu?.res?.DefaultDbname,
      });
      if (selectedSubMenu?.res?.DefaultTablename && !(selectedTables.length > 0)) {
        setSelectedTables([
          ...selectedTables,
          ...[
            {
              value: selectedSubMenu?.res?.DefaultTablename,
              label: selectedSubMenu?.res?.DefaultTablename,
              dbName: selectedSubMenu?.res?.DefaultDbname,
            },
          ],
        ]);
      }
    }
  }, [selectedSubMenu]);

  const onChangeCheckbox = (e: any, index: any, groupedIndex: number) => {
    const nextState: any = [...groupedColumnArray];
    console.log("nextState", nextState)
    nextState[groupedIndex].columns[index].IsChecked = e.target.checked;
    setGroupedColumnArray(nextState);
  };

  const onChangeValue = (e: any, index: number, groupedIndex: number) => {
    const nextState: any = [...groupedColumnArray];
    nextState[groupedIndex].columns[index] = {
      ...nextState[groupedIndex].columns[index],
      [e.target.name]: e.target.value,
    };
    setGroupedColumnArray(nextState);
  };

  const getDatabase = (serverName: any) => {
    console.log("serverName", serverName)


    // setLoading(true)
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/LoadDatabases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        "Userid": localStorage.getItem("username"),
        "product": "LoadDatabases",
        "type": serverName,
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

  useEffect(() => {
    if (selectedServer?.value) {
      getDatabase(selectedServer?.value)
    }
  }, [selectedServer])

  const getDatabaseTables = (servername: any, dbName: any) => {
    // console.log("tableName",tableName,selectedServer.value,selectedDatabase.value)
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/LoadDatabaseTables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        "Userid": localStorage.getItem("username"),
        "product": "LoadDatabaseTables",
        "type": servername,
        "databaseName": dbName
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("resp", response)
        const newTable = response?.Tables?.map((res: any) => {
          return {
            Tablename: res?.Tablename,
            DbName: selectedDatabase.value,
          };
        });
        setDatabaseTables(newTable);
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
        console.log(error);
      });
  }
  useEffect(() => {
    if (selectedDatabase.value) {
      // setLoading(true)
      getDatabaseTables(selectedServer.value, selectedDatabase.value)
    }
  }, [selectedDatabase]);

  useEffect(() => {
    if (selectedTables.length > 0) {
      const newArray: any = [];
      selectedTables.map((res: any) => {
        if (res.value) {
          newArray.push(res.value);
        }
      });

      getDatabaseColumns(selectedServer?.value, selectedDatabase.value, newArray);
    }
  }, [selectedTables]);
  console.log("selectedTables", selectedTables)

  const getDatabaseColumns = (
    serverName: any,
    DbName: string,
    MenuDbTableName: any
  ) => {
    console.log("MenuDbTableName", MenuDbTableName)
    // setLoading(true)
    const Params = {
      "Userid": localStorage.getItem("username"),
      "product": "LoadDatabaseTableColumn",
      type: serverName ? serverName : selectedServer?.value,
      databaseName: DbName,
      tablelist: MenuDbTableName && Array.isArray(MenuDbTableName) ? MenuDbTableName.map((res: any) => {
        if (res) {
          return { tableName: res };
        }
      }) : [{ tableName: MenuDbTableName }],
    };
    axios
      .post("https://logpanel.insurancepolicy4u.com/api/Login/LoadDatabaseTableColumns", Params, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("respinse", response)
        setLoadColName(response?.data?.ColumnsList)
        if (!Array.isArray(MenuDbTableName)) {
          return
        }
        let columns: any = [];
        let indexNumber = 0;
        response?.data?.ColumnsList.map((response: any, indexNumber: number) => {
          // const coumnName = response.ColumnName;
          // const newColumn = coumnName.map((res: any, index: number) => {
          //   indexNumber++;
          //   return {

          //   };
          // });
          let newColumn = {
            dbName: response.Dbname,
            tableName: response.TableName,
            columnName: response?.ColumnName, 
            IsChecked: false,
            seqNo: "0",
            joiningCol: "",
            ischartColumn: "",
            chartColumnTypes: [],
            joiningTable: "",
            joiningDb: "",
            Inputtype: "",
            MarkasFilter: false,
            AggFuncApplied: "",
            ChartjoinCols: [],
            IsMandtory: false,
            IsHyperlink: false,
            RecordLinkPath: "",
            ReadServerName: selectedServer?.value,
            ReadDBName: response.Dbname,
            ReadtableName: response.TableName,
            ReadcolumnName: response?.ColumnName,
          }
          console.log("newColumn",newColumn)
          columns = [...columns, newColumn];
          console.log("columnssss",columns)
        });
        console.log("columns",columns)
        let newArray = [];
        console.log("reportDetails",reportDetails)
        if (
          columns.length > 0 &&
          reportDetails?.columnsArray?.length > 0 &&
          reportDetails &&
          selectedReportArray.value
        ) {
          newArray = columns.map((response: any) => {
            const matchingColumn = reportDetails.columnsArray.find((res: any) => response.columnName === res.columnName);
            let newVal = {};
            if (matchingColumn) {
              newVal = {
                ...matchingColumn,
                ischartColumn: matchingColumn.ischartColumn ? "YES" : "NO",
                chartColumnTypes: matchingColumn.chartColumnTypes
                  ? matchingColumn.chartColumnTypes.split(",").map((res: any) => ({ value: res, label: res }))
                  : [],
                ChartjoinCols: matchingColumn.ChartjoinCols
                  ? matchingColumn.ChartjoinCols.split(",").map((res: any) => ({ value: res, label: res }))
                  : [],
              };
            }
            console.log("responsenewArray", newVal);
            return newVal;
          });
        } else {
          newArray = columns;
        }

        console.log("newArray",newArray)
        setColumnsArray(newArray);
        const newArrayTable = [...newArray];
        const tableData: any = [];
        // Group data by the "company" field
        const groupedData = newArrayTable.reduce((result: any, item: any) => {
          const tableName = item.tableName;
          if (!result[tableName]) {
            result[tableName] = {
              tableName,
              dbName: item.dbName,
              columns: [],
              checked: false,
            };
            tableData.push(result[tableName]);
          }
          result[tableName].columns.push({
            ...item,
          });
          return result;
        }, {});

        console.log("tableData",tableData)
        setGroupedColumnArray(tableData);
        // setLoading(false)
      })
      .catch((error) => { });
  };

  const handleSubmitChart = () => {
    setLoading(true)
    // console.log("tableColumnsData",tableColumnsData)
    const dbList: any = [];
    const groupedData = selectedTables.reduce((result: any, item: any) => {
      const dbName = item.dbName;
      if (!result[dbName]) {
        result[dbName] = {
          Dbname: dbName,
          tablenameLists: [],
        };
        dbList.push(result[dbName]);
      }
      result[dbName].tablenameLists.push({
        Tablename: item.value,
      });
      return result;
    }, {});

    let tableColumnsData: any = [];
    groupedColumnArray?.map((res: any) => {
      tableColumnsData = [...tableColumnsData, ...res.columns];
    });
    const newColumns: any = [];
    tableColumnsData?.map((res: any) => {
      if (res?.IsChecked) {
        res.ischartColumn = res?.ischartColumn === "YES";
        res.chartColumnTypes =
          res?.chartColumnTypes && res?.chartColumnTypes?.length > 0
            ? res?.chartColumnTypes?.map((res: any) => res.value).toString()
            : [].toString();
        res.ChartjoinCols =
          res?.ChartjoinCols && res?.ChartjoinCols?.length > 0
            ? res?.ChartjoinCols?.map((res: any) => res.value).toString()
            : [].toString();
        res.ServerName = selectedServer?.value
        return newColumns.push(res);
      }
    });
    const Params = {
      Userid: localStorage.getItem("username"),
      reportid: reportId || 0,
      IsActive: true,
      reportName: reportName,
      headings: selectedHeading?.value,
      MainMenuID: selectedMenu?.value,
      MainMenuName: selectedMenu?.label,
      MenuID: selectedSubMenu?.value,
      MenuName: selectedSubMenu?.label,
      isMultipleChart: isMultipleChart === "YES",
      IsExcelUpload: isExcelUpload === "YES",
      columnsArray: newColumns,
      dbnameLists: dbList,
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/Add_UpdateReport",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log("response", response)
        if (response.status === 200 || response.status === 201) {
          toast.success("Report Saved", { style: { top: 80 } });
        }

        setLoading(false)
      })
      .catch((error) => {

        setLoading(false)
        toast.error("Report Error", { style: { top: 80 } });
      });
  };

  useEffect(() => {
    if (selectedReportArray.value) {
      setReportName(selectedReportArray.label);
      getReportDetails(selectedReportArray.value);
    }
  }, [selectedReportArray]);

  const getReportDetails = (id: string) => {
    setLoading(true)
    const Params = {
      Userid: localStorage.getItem("username"),
      ReportID: Number(id),
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
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          console.log('response', response)
          setSelectedDatabase({
            value: response.data.dbnameLists?.[0].Dbname,
            label: response.data.dbnameLists?.[0].Dbname,
          });

          setSelectedServer({
            value: response.data.columnsArray[0].ServerName,
            label: response.data.columnsArray[0].ServerName,
          });
          const tableList: any = [];
          response.data.dbnameLists?.[0]?.tablenameLists.map((res: any) => {
            if (res.Tablename) {
              tableList.push({
                value: res.Tablename,
                label: res.Tablename,
                dbName: response.data.dbnameLists?.[0].Dbname,
              });
            }
          });
          setSelectedTables(tableList);
          setReportName(response.data.reportName);
          const selectedHeadingData: any = headings?.find(
            (res: any) => res.value === response.data.headings
          );

          setSelectedHeading(selectedHeadingData);
          setReportDetails(response.data);
          setIsMultipleChart(response.data.isMultipleChart ? "YES" : "NO");
          setReportId(response.data.reportid);
          setIsExcelUpload(response.data.IsExcelUpload ? "YES" : "NO")
          setLoading(false)
        }
      })
      .catch((error) => { setLoading(false) });
  };

  useEffect(() => {

    if (menuItems.length > 0 && reportDetails?.MainMenuID) {
      const selectedMenuData = menuItems?.find(
        (res: any) => res.value === reportDetails?.MainMenuID
      );
      console.log("selectedMenuData", selectedMenuData)
      setSelectedMenu(selectedMenuData);
    }
  }, [menuItems, reportDetails]);

  useEffect(() => {
    if (subMenuItems.length > 0 && reportDetails) {
      const selectedSubMenuData = subMenuItems?.find(
        (res: any) => res.value === reportDetails.MenuID
      );
      console.log("subMenuItems", subMenuItems)
      console.log("selectedSubMenuData", selectedSubMenuData)
      setSelectedSubMenu(selectedSubMenuData);
      // setReportName(selectedSubMenuData.value); //check 
    }
  }, [subMenuItems]);

  let columnIndex = 0;

  const fetchDatabases = async (serverName: any) => {
    try {
      const response = await fetch("https://logpanel.insurancepolicy4u.com/api/Login/LoadDatabases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          Userid: localStorage.getItem("username"),
          product: "LoadDatabases",
          type: serverName,
        }),
      });
      const data = await response.json();
      return data?.Databases.map((res: any) => ({
        value: res?.DatabaseName,
        label: res?.DatabaseName,
      }));
    } catch (error) {
      console.error("Error fetching databases:", error);
      return [];
    }
  };
  console.log("columnsArray", groupedColumnArray)

  const options = !formulaIndex ? groupedColumnArray[newGroupedIndex]?.columns.map((col: any) => {
    return { value: col?.columnName, label: col?.columnName }
  }) : [
    { label: "+", value: "+" },
    { label: "-", value: "-" },
    { label: "*", value: "*" },
    { label: "/", value: "/" },
    { label: "(", value: "(" },
    { label: ")", value: ")" },
    { label: "{", value: "{" },
    { label: "}", value: "}" }
  ];

  const handleChangeSelect = (selectedOption: any) => {
    // Append the newly selected option to the state array, allowing duplicates
    if (selectedOption) {
      setSelectedOptions([...selectedOptions, selectedOption]);
    }
    setFormulaIndex(!formulaIndex)
  };


  return (
    <>
      <Modal isOpen={formulaModal}>
        <ModalHeader>Add Formula</ModalHeader>

        <ModalBody>
          <FormGroup>
            <Label style={{ fontWeight: 700 }}>Formula</Label>
            <Select
              options={options}
              onChange={handleChangeSelect}
              isMulti={false} // Disable default multi-select behavior
              value={null} // Clear the selected value to allow re-selection
              closeMenuOnSelect={false}
              isClearable={false}
              hideSelectedOptions={false}
              blurInputOnSelect
              placeholder="Select or create an option..."
            />
            <div>
              <p>Formula Expression:</p>
              <div className="flex">
                {selectedOptions.map((option: any, index: number) => (
                  <span key={index} className="border flex p-1 w-fit space-x-2 items-center text-center">{option.label} <MdCancel
                    className="text-red-500"
                    onClick={() => {
                      console.log("enter in cancel")
                      setSelectedOptions((prevOptions: any) =>
                        prevOptions.filter((_: any, i: number) => i !== index)
                      );
                    }}
                  /> </span>
                ))}
              </div>
            </div>
          </FormGroup>

        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              const nextState = [...groupedColumnArray];
              if (nextState[newGroupedIndex] && nextState[newGroupedIndex].columns && nextState[newGroupedIndex].columns[newIndex]) {
                nextState[newGroupedIndex].columns[newIndex].Formula = [...selectedOptions];
                setGroupedColumnArray(nextState);
                setFormulaModal(!formulaModal);
              }
            }}
          >
            Submit
          </Button>
          <Button
            onClick={() => setFormulaModal(!formulaModal)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isHyperLinkModal}>
        <ModalHeader>Add Hyper Link</ModalHeader>

        <ModalBody>
          <Input
            placeholder="add hyperLink"
            value={
              groupedColumnArray[newGroupedIndex]?.columns[newIndex]
                .RecordLinkPath
            }
            onChange={(e) => {
              const nextState: any = [...groupedColumnArray];
              nextState[newGroupedIndex].columns[newIndex].RecordLinkPath =
                e.target.value;
              setGroupedColumnArray(nextState);
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              setIsHyperLinkModal(false);
            }}
          >
            Submit
          </Button>
        </ModalFooter>
      </Modal>
      {loading ? (<Loading />) : (
        <>
          <Card className="card">
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
            <CardHeader
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <CardTitle>Report Module</CardTitle>
              </div>
              <Button
                color="primary"
                onClick={() => {
                  handleSubmitChart();
                }}
              >
                {" "}
                Submit
              </Button>
            </CardHeader>
            <CardBody>
              <Form style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 20 }}>
                <FormGroup style={{ width: "20%" }}>
                  <Label style={{ fontWeight: 700 }}>Enter Report Name</Label>
                  <Input
                    placeholder="Enter report name"
                    value={reportName}
                    onChange={(e) => {
                      setReportName(e.target.value);
                    }}
                  />
                </FormGroup>
                <FormGroup style={{ width: "20%" }}>
                  <Label style={{ fontWeight: 700 }}>Headings</Label>
                  <Select
                    options={headings}
                    value={selectedHeading}
                    onChange={(e: any) => {

                      setSelectedHeading(e);
                    }}
                  />
                </FormGroup>
                <FormGroup style={{ width: "20%" }}>
                  <Label style={{ fontWeight: 700 }}>Menu</Label>
                  <Select
                    options={menuItems}
                    value={selectedMenu}
                    onChange={(e: any) => {
                      setSelectedMenu(e);
                    }}
                  />
                </FormGroup>
                <FormGroup style={{ width: "20%" }}>
                  <Label style={{ fontWeight: 700 }}>Sub Menu</Label>
                  <Select
                    options={subMenuItems}
                    value={selectedSubMenu}
                    onChange={(e: any) => {
                      setSelectedSubMenu(e);
                    }}
                  />
                </FormGroup>
                <FormGroup style={{ width: '20%' }}>
                  <Label
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Server Name
                  </Label>
                  <Select
                    placeholder="Select Server "
                    value={selectedServer}
                    options={serverList.map((res: any) => { return { value: res.ServerName, label: res.ServerName } })}
                    onChange={(e: any) => {
                      setSelectedServer(e)
                    }}
                  />
                </FormGroup>
                <FormGroup style={{ width: "20%" }}>
                  <Label style={{ fontWeight: 700 }}>Database</Label>
                  <Select
                    options={loadDatabase?.map((res: any) => {
                      const object = {
                        value: res?.DatabaseName,
                        label: res?.DatabaseName,
                      };
                      return object;
                    })}
                    value={selectedDatabase}
                    onChange={(e: any) => {
                      setSelectedDatabase(e);
                    }}
                  />
                </FormGroup>
                <FormGroup style={{ width: "20%" }}>
                  <Label style={{ fontWeight: 700 }}>Tables</Label>
                  <Select
                    options={databaseTables?.map((res: any) => {
                      const object = {
                        value: res.Tablename,
                        label: res.Tablename,
                        dbName: res.DbName,
                      };
                      return object;
                    })}
                    isMulti
                    closeMenuOnSelect={false}
                    value={selectedTables}
                    onChange={(e: any) => {
                      setSelectedTables(e);
                    }}
                  />
                </FormGroup>
                <FormGroup
                  style={{ width: "10%", display: "flex", flexDirection: "column" }}
                >
                  <Label style={{ fontWeight: 700 }}>Is Multiple Graph</Label>
                  <Input
                    type="select"
                    value={isMultipleChart}
                    onChange={(e) => {
                      setIsMultipleChart(e.target.value);
                    }}
                  >
                    <option>Select</option>
                    <option>YES</option>
                    <option>NO</option>
                  </Input>
                </FormGroup>
                <FormGroup
                  style={{ width: "10%", display: "flex", flexDirection: "column" }}
                >
                  <Label style={{ fontWeight: 700 }}>Is Excel Upload</Label>
                  <Input
                    type="select"
                    value={isExcelUpload}
                    onChange={(e) => {
                      setIsExcelUpload(e.target.value);
                    }}
                  >
                    <option>Select</option>
                    <option>YES</option>
                    <option>NO</option>
                  </Input>
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
          <div>
            <Card style={{ marginTop: 30 }}>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                aria-label="tabs example"
              >
                {groupedColumnArray?.map((groupedColumn: any, groupedIndex: number) => (
                  <Tab label={groupedColumn.tableName} {...a11yProps(groupedIndex)} />
                ))}
              </Tabs>
              {groupedColumnArray?.map((groupedColumn: any, groupedIndex: number) => (
                <CustomTabPanel value={value} index={groupedIndex}>
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        <th>sr no</th>
                        <th>Db Name</th>
                        <th>Table Name</th>
                        <th>Column Name</th>
                        <th className="flex flex-col">
                          <div>Checkbox</div>
                          <div style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <Tooltip
                              placement="top"
                              overlay={<Label>ALL Select Report</Label>}
                            >
                              <Input
                                type="checkbox"
                                // checked={res.IsChecked}
                                onChange={(e) => {
                                  const nextState = [...groupedColumnArray];
                                  let nextRes = nextState[groupedIndex]?.columns.map((next: any) => ({
                                    ...next,
                                    IsChecked: e.target.checked
                                  }));

                                  nextState[groupedIndex].columns = nextRes;
                                  setGroupedColumnArray(nextState);
                                }}
                              />
                            </Tooltip>
                            <Tooltip
                              placement="top"
                              overlay={<Label>ALL for Mark as filter</Label>}
                            >
                              <Input
                                type="checkbox"
                                // checked={res.IsChecked}
                                onChange={(e) => {
                                  const nextState = [...groupedColumnArray];
                                  let nextRes = nextState[groupedIndex]?.columns.map((next: any) => ({
                                    ...next,
                                    MarkasFilter: e.target.checked
                                  }));

                                  nextState[groupedIndex].columns = nextRes;
                                  setGroupedColumnArray(nextState);
                                }}
                              />
                            </Tooltip>
                            <Tooltip
                              placement="top"
                              overlay={<Label>ALL for Is chart Col</Label>}
                            >
                              <Input
                                type="checkbox"
                                onChange={(e) => {
                                  const nextState = [...groupedColumnArray];
                                  let nextRes = nextState[groupedIndex]?.columns.map((next: any) => ({
                                    ...next,
                                    ischartColumn: e.target.checked ? "YES" : "NO"
                                  }));

                                  nextState[groupedIndex].columns = nextRes;
                                  setGroupedColumnArray(nextState);
                                }}
                              />
                            </Tooltip>
                            <Tooltip
                              placement="top"
                              overlay={<Label>All for IsMandtory</Label>}
                            >
                              <Input
                                type="checkbox"
                                onChange={(e) => {
                                  const nextState = [...groupedColumnArray];
                                  let nextRes = nextState[groupedIndex]?.columns.map((next: any) => ({
                                    ...next,
                                    IsMandtory: e.target.checked
                                  }));

                                  nextState[groupedIndex].columns = nextRes;
                                  setGroupedColumnArray(nextState);
                                }}
                              />
                            </Tooltip>
                            <div>
                            </div>
                            <Tooltip
                              placement="top"
                              overlay={<Label>All for IsMainCol</Label>}
                            >
                              <Input
                                type="checkbox"

                                onChange={(e) => {
                                  const nextState = [...groupedColumnArray];
                                  let nextRes = nextState[groupedIndex]?.columns.map((next: any) => ({
                                    ...next,
                                    IsMaincol: e.target.checked
                                  }));

                                  nextState[groupedIndex].columns = nextRes;
                                  setGroupedColumnArray(nextState);
                                }}
                              />
                            </Tooltip>
                          </div>
                        </th>
                        <th>Input Type</th>
                        <th style={{ width: 70 }}>Seq No</th>
                        <th>Is Formula</th>
                        <th>Joining Column</th>
                        <th>Agg Func</th>
                        <th>Chart Types</th>
                        <th>Chart joinCols</th>
                        <th>ReadServername</th>
                        <th>ReadDbname</th>
                        <th>ReadTabname</th>
                        <th>ReadColname</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedColumn?.columns?.map((res: any, index: number) => {
                        columnIndex++;
                        return (
                          <tr>
                            <td> {columnIndex}</td>
                            <td> <div className="w-[200px]"
                              // onClick={() => console.log("res",res)}
                              onClick={() => getDatabase(res?.ServerName)}
                            >
                              <Select
                                options={loadDatabase?.map((res: any) => {
                                  const object = {
                                    value: res?.DatabaseName,
                                    label: res?.DatabaseName,
                                  };
                                  return object;
                                })}
                                defaultValue={res?.dbName}
                                value={{
                                  value: res?.dbName,
                                  label: res?.dbName,
                                }}
                                onChange={(e: any) => {
                                  const nextState: any = [...groupedColumnArray];
                                  (nextState[groupedIndex].columns[
                                    index
                                  ].dbName = e.value),
                                    setGroupedColumnArray(nextState);
                                }}
                              />
                            </div>
                            </td>
                            <td>
                              <div className="w-[200px]" onClick={() => getDatabaseTables(res?.ServerName, res?.dbName)}>
                                <Select
                                  options={databaseTables?.map((res: any) => {
                                    const object = {
                                      value: res.Tablename,
                                      label: res.Tablename,
                                      dbName: res.DbName,
                                    };
                                    return object;
                                  })}
                                  // isMulti
                                  // closeMenuOnSelect={false}
                                  defaultValue={res?.tableName}
                                  value={{
                                    value: res?.tableName,
                                    label: res?.tableName,
                                    dbName: res.dbName,
                                  }}
                                  onChange={(e: any) => {
                                    const nextState: any = [...groupedColumnArray];
                                    (nextState[groupedIndex].columns[
                                      index
                                    ].tableName = e.value),
                                      setGroupedColumnArray(nextState);
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              <div
                                className="w-[200px]"
                                onClick={() => getDatabaseColumns(res?.ServerName, res?.dbName, res?.tableName)}
                              >
                                <Select
                                  placeholder="Select ColName"
                                  value={{
                                    value: res?.columnName,
                                    label: res?.columnName,
                                  }}
                                  // defaultValue={res?.ServerName}
                                  options={loadColName.map((res: any) => { return { value: res.ColumnName, label: res.ColumnName } })}
                                  onChange={(e: any) => {
                                    const nextState: any = [...groupedColumnArray];
                                    (nextState[groupedIndex].columns[
                                      index
                                    ].columnName = e.value),
                                      setGroupedColumnArray(nextState);
                                  }}
                                />
                              </div>

                            </td>
                            <td>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Tooltip
                                  placement="top"
                                  overlay={<Label>For Report</Label>}
                                >
                                  <Input
                                    type="checkbox"
                                    checked={res.IsChecked}
                                    onChange={(e) => {
                                      onChangeCheckbox(e, index, groupedIndex);
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip
                                  placement="top"
                                  overlay={<Label>Mark as Filter</Label>}
                                >
                                  <Input
                                    type="checkbox"
                                    checked={res.MarkasFilter}
                                    onChange={(e) => {
                                      const nextState: any = [
                                        ...groupedColumnArray,
                                      ];
                                      nextState[groupedIndex].columns[
                                        index
                                      ].MarkasFilter = e.target.checked;
                                      setGroupedColumnArray(nextState);
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip
                                  placement="top"
                                  overlay={<Label>Is Chart Column</Label>}
                                >
                                  <Input
                                    type="checkbox"
                                    checked={
                                      res.ischartColumn === "YES" ? true : false
                                    }
                                    onChange={(e) => {
                                      const nextState: any = [
                                        ...groupedColumnArray,
                                      ];
                                      nextState[groupedIndex].columns[
                                        index
                                      ].ischartColumn = e.target.checked
                                          ? "YES"
                                          : "NO";
                                      setGroupedColumnArray(nextState);
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip
                                  placement="top"
                                  overlay={<Label>Is Mandtory</Label>}
                                >
                                  <Input
                                    type="checkbox"
                                    checked={res.IsMandtory}
                                    onChange={(e) => {
                                      const nextState: any = [
                                        ...groupedColumnArray,
                                      ];
                                      nextState[groupedIndex].columns[
                                        index
                                      ].IsMandtory = e.target.checked;
                                      setGroupedColumnArray(nextState);
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip
                                  placement="top"
                                  overlay={<Label>Is Hyper link</Label>}
                                >
                                  <Input
                                    type="checkbox"
                                    checked={res.IsHyperlink}
                                    onChange={(e) => {
                                      const nextState: any = [
                                        ...groupedColumnArray,
                                      ];
                                      nextState[groupedIndex].columns[
                                        index
                                      ].IsHyperlink = e.target.checked;
                                      setGroupedColumnArray(nextState);
                                      setIsHyperLinkModal(e.target.checked);
                                      setNewGroupedIndex(groupedIndex);
                                      setNewIndex(index);
                                    }}
                                  />
                                </Tooltip>
                                <Tooltip
                                  placement="top"
                                  overlay={<Label>Is Main Col</Label>}
                                >
                                  <Input
                                    type="checkbox"
                                    checked={res.IsMaincol}
                                    onChange={(e) => {
                                      const nextState: any = [
                                        ...groupedColumnArray,
                                      ];
                                      // IS Main Col
                                      nextState[groupedIndex].columns[
                                        index
                                      ].IsMaincol = e.target.checked;
                                      setGroupedColumnArray(nextState);
                                    }}
                                  />
                                </Tooltip>

                                {/* <Tooltip
                                placement="top"
                                overlay={<Label>All Select</Label>}
                              >
                                <Input
                                  type="checkbox"
                                  checked={res.IsMaincol}
                                  onChange={(e) => {
                                    const nextState: any = [
                                      ...groupedColumnArray,
                                    ];
                                    console.log("nextState",nextState,nextState[groupedIndex].columns[index])
                                    //MArk as filter
                                    nextState[groupedIndex].columns[
                                      index
                                    ].MarkasFilter = e.target.checked;
                                    // IS MAin Col 
                                    nextState[groupedIndex].columns[
                                      index
                                    ].IsMaincol = e.target.checked;
                                    // HYper LInk
                                    nextState[groupedIndex].columns[
                                      index
                                    ].IsHyperlink = e.target.checked;
                                    

                                    // Is MAntory
                                    nextState[groupedIndex].columns[
                                      index
                                    ].IsMandtory = e.target.checked;
                                    //Report 
                                    nextState[groupedIndex].columns[index].IsChecked = e.target.checked;

                                    nextState[groupedIndex].columns[
                                      index
                                    ].ischartColumn = e.target.checked
                                        ? "YES"
                                        : "NO";

                                    setIsHyperLinkModal(e.target.checked);
                                    setNewGroupedIndex(groupedIndex);
                                    setNewIndex(index);

                                    setGroupedColumnArray(nextState);
                                  }}
                                />
                              </Tooltip> */}
                              </div>
                            </td>
                            <td>
                              <div className="!w-[200px]">
                                <Input
                                  value={res.Inputtype}
                                  type="select"
                                  name="Inputtype"
                                  onChange={(e: any) => {
                                    onChangeValue(e, index, groupedIndex);
                                  }}

                                >
                                  <option></option>
                                  <option>DROPDOWN</option>
                                  <option>TEXTBOX</option>
                                  <option>DATE</option>
                                  <option>File Upload</option>
                                  <option>checkbox</option>
                                </Input>{" "}
                              </div>
                            </td>
                            <td>
                              <div className="!w-[100px]">
                                <Input
                                  value={res.seqNo}
                                  name="seqNo"
                                  placeholder="Sequence Number"
                                  onChange={(e: any) => {
                                    onChangeValue(e, index, groupedIndex);
                                  }}
                                  className="w-[150px]"
                                />
                              </div>
                            </td>
                            <td>
                              <div className="!w-[100px]">
                                <Input
                                  type="select"
                                  value={res?.IsFormulaApply}
                                  onChange={(e) => {
                                    const nextState: any = [
                                      ...groupedColumnArray,
                                    ];
                                    nextState[groupedIndex].columns[
                                      index
                                    ].IsFormulaApply = e.target.value === "YES" ? true : false;
                                    setGroupedColumnArray(nextState);
                                    setFormulaModal(e.target.value === "YES" ? true : false)
                                  }}
                                >
                                  <option>Select</option>
                                  <option>YES</option>
                                  <option>NO</option>
                                </Input>
                              </div>
                            </td>
                            <td>
                              <div className="!w-[150px]">
                                <Input
                                  type="select"
                                  value={res.joiningCol}
                                  name="joiningCol"
                                  onChange={(e) => {
                                    const newDBName = columnsArray.find(
                                      (res: any) =>
                                        res.columnName === e.target.value
                                    );
                                    const nextState: any = [...groupedColumnArray];
                                    nextState[groupedIndex].columns[index] = {
                                      ...nextState[groupedIndex].columns[index],
                                      [e.target.name]: e.target.value,
                                      joiningTable: newDBName.tableName,
                                      joiningDb: newDBName.dbName,
                                    };
                                    setGroupedColumnArray(nextState);
                                  }}
                                >
                                  <option>Select Joining Column</option>
                                  {columnsArray.map((response: any) => {
                                    if (response.tableName !== res.tableName) {
                                      return <option>{response.columnName}</option>;
                                    }
                                  })}
                                </Input>
                              </div>
                            </td>
                            <td>
                              <div className="!w-[100px]">
                                <Input

                                  type="select"
                                  placeholder="Select Agg Func"
                                  value={res?.AggFuncApplied}
                                  onChange={(e: any) => {
                                    const nextState: any = [...groupedColumnArray];
                                    (nextState[groupedIndex].columns[
                                      index
                                    ].AggFuncApplied = e.target.value),
                                      setGroupedColumnArray(nextState);
                                  }}
                                >
                                  <option>Select Agg Func</option>
                                  {aggFunc?.map((res: any) => {
                                    return <option>{res.FunctionApply}</option>;
                                  })}
                                </Input>
                              </div>
                            </td>
                            <td>
                              <Select
                                className="w-[150px]"
                                options={["LINE", "PIE", "BAR"].map(
                                  (res: any) => {
                                    const object = {
                                      value: res,
                                      label: res,
                                    };
                                    return object;
                                  }
                                )}
                                isMulti
                                closeMenuOnSelect={false}
                                value={res.chartColumnTypes}
                                onChange={(e: any) => {
                                  const nextState: any = [...groupedColumnArray];
                                  (nextState[groupedIndex].columns[
                                    index
                                  ].chartColumnTypes = e),
                                    setGroupedColumnArray(nextState);
                                }}
                              />
                            </td>
                            <td>
                              <Select
                                className="w-[200px]"
                                options={columnsArray.map((res: any) => {
                                  const object = {
                                    value: res.columnName,
                                    label: res.columnName,
                                  };
                                  return object;
                                })}
                                isMulti
                                closeMenuOnSelect={false}
                                value={res.ChartjoinCols}
                                onChange={(e: any) => {
                                  const nextState: any = [...groupedColumnArray];
                                  (nextState[groupedIndex].columns[
                                    index
                                  ].ChartjoinCols = e),
                                    setGroupedColumnArray(nextState);
                                }}
                              />
                            </td>
                            <td>
                              <Select
                                className="w-[200px]"
                                placeholder="Select Server"
                                value={{
                                  value: res?.ReadServerName,
                                  label: res?.ReadServerName,
                                }}
                                // defaultValue={res?.ServerName}
                                options={serverList.map((res: any) => { return { value: res.ServerName, label: res.ServerName } })}
                                onChange={(e: any) => {
                                  const nextState: any = [...groupedColumnArray];
                                  (nextState[groupedIndex].columns[
                                    index
                                  ].ReadServerName = e.value),
                                    setGroupedColumnArray(nextState);
                                }}
                              />
                            </td>
                            <td>
                              <div 
                              className="w-[200px]"
                                // onClick={() => console.log("res",res)}
                                onClick={() => getDatabase(res?.ReadServerName)}
                              >
                                <Select
                                  options={loadDatabase?.map((res: any) => {
                                    const object = {
                                      value: res?.DatabaseName,
                                      label: res?.DatabaseName,
                                    };
                                    return object;
                                  })}
                                  defaultValue={res?.ReadDBName}
                                  value={{
                                    value: res?.ReadDBName,
                                    label: res?.ReadDBName,
                                  }}
                                  onChange={(e: any) => {
                                    const nextState: any = [...groupedColumnArray];
                                    (nextState[groupedIndex].columns[
                                      index
                                    ].ReadDBName = e.value),
                                      setGroupedColumnArray(nextState);
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              <div 
                              className="w-[200px]"
                              onClick={() => getDatabaseTables(res?.ReadServerName, res?.ReadDBName)}>
                                <Select
                                  options={databaseTables?.map((res: any) => {
                                    const object = {
                                      value: res.Tablename,
                                      label: res.Tablename,
                                      dbName: res.DbName,
                                    };
                                    return object;
                                  })}
                                  // isMulti
                                  // closeMenuOnSelect={false}
                                  defaultValue={res?.ReadtableName}
                                  value={{
                                    value: res?.ReadtableName,
                                    label: res?.ReadtableName,
                                    dbName: res.ReadDBName,
                                  }}
                                  onChange={(e: any) => {
                                    const nextState: any = [...groupedColumnArray];
                                    (nextState[groupedIndex].columns[
                                      index
                                    ].ReadtableName = e.value),
                                      setGroupedColumnArray(nextState);
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              <div
                                className="w-[200px]"
                                onClick={() => getDatabaseColumns(res?.ReadServerName, res?.ReadDBName, res?.ReadtableName)}
                              >
                                <Select
                                  placeholder="Select ColName"
                                  value={{
                                    value: res?.ReadcolumnName,
                                    label: res?.ReadcolumnName,
                                  }}
                                  // defaultValue={res?.ServerName}
                                  options={loadColName.map((res: any) => { return { value: res.ColumnName, label: res.ColumnName } })}
                                  onChange={(e: any) => {
                                    const nextState: any = [...groupedColumnArray];
                                    (nextState[groupedIndex].columns[
                                      index
                                    ].ReadcolumnName = e.value),
                                      setGroupedColumnArray(nextState);
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </CustomTabPanel>
              ))}

            </Card>
          </div>
        </>)}
    </>
  );
};

export default Reports;
