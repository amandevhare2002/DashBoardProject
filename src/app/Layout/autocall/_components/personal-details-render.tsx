import MainTable from "@/utils/table";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Drawer,
  Tab,
  Tabs,
  Typography,
  Box,
} from "@mui/material";
import axios from "axios";
import { memo, useMemo, useState } from "react";
import { Step, Stepper } from "react-form-stepper";
import CreatableSelect from "react-select/creatable";
import { ToastContainer } from "react-toastify";
import Select, { components } from "react-select";
import AsyncSelect from "react-select/async";
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
import PersonalDetails from "./peronal-details";
import { RenderFields } from "./renderFields";
import { RenderFieldsAddMore } from "./renderFieldsAddMore";
import PdfModal from "./pdfModal";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export function PersonalDetailsRender({
  isEditNewField,
  setIsEditNewField,
  editFieldData,
  menuIDQuery,
  menuID,
  modalData,
  isModalOpen,
  setIsModalOpen,
  setModalData,
  formulaModal,
  updatedPersonalDetails,
  value,
  handleSelectChange,
  handleCreateOption,
  customFilterOption,
  selectedOptions,
  editIndex,
  setEditValue,
  handleSaveEdit,
  handleEditOption,
  setSelectedOptions,
  editAutoCallData,
  formulaIndex,
  setEditAutoCallData,
  setFormulaModal,
  openDrawer,
  setOpenDrawer,
  newFieldValues,
  information,
  mainColField,
  calculatorData,
  currentRecordID,
  handleProfileInformation,
  edit,
  setApiCall,
  setEdit,
  isDrag,
  isAccordian,
  handleChangeAccordian,
  drop,
  onResize,
  saveData,
  isOpen,
  promiseOptions,
  handleInputChange,
  onInputChange,
  setColumnSelect,
  handleCalculateData,
  calculateFormula,
  isModify,
  setValue,
  setUpdatedPersonalDetails,
  setHideSubmit,
  setLoading,
  setSavePersonalData,
  savePersonalData,
  handleSubmit,
  handleExcelFileUpload,
  getCalculatorData,
  confirm,
  isMobile,
  setSaveData,
  editorRef,
  getCardFields,
  columns,
  handleChange,
  containerRef,
  columnsTable,
  hideSubmit,
  loading,
  uploadedFiles,
  setUploadedFiles,
  handleEditSubmitFunction,
  valueEditTab,
  handleChangeEdit,
  editValue,
  loadDatabase,
  loadColName,
  databaseTables,
  fullview,
  serverList,
  setLoadDatabase,
  setLoadColName,
  selectedDatabase,
  setDatabaseTables,
  selectedServer,
  setFormulaIndex,
  setFullView,
  evaluateFormula,
  AddMoreEvaluateFormula,
  handleSelectChangeAddMore,
}: any) {
  const [pdfModal, setPdfModal] = useState(false)

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
      }
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
    MenuDbTableName: any
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
        }
      )
      .then((response) => {
        setLoadColName(response?.data?.ColumnsList);
      })
      .catch((error) => { });
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
                      { value: "RADIO", label: "RADIO" },
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
                        row?.TabName
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
                          row?.TabName
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
                          row?.ReadTablename
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
                              (item: any) => item !== newValue
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
                              (item: any) => item !== newValue
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
        }
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

  const CustomLabel = memo(({ commissionTab }: any) => (
    <div
      style={{ width: "100%", height: "30px", padding: "10px" }}
      className=""
    >
      {commissionTab?.tabname === "" ? "NONE" : commissionTab?.tabname}
    </div>
  ));

  const groupedFields = updatedPersonalDetails?.[value]?.Values?.reduce(
    (acc: any, field: any) => {
      if (!acc[field?.AddMoreGroup]) {
        acc[field?.AddMoreGroup] = [];
      }
      acc[field?.AddMoreGroup].push(field);
      return acc;
    },
    {}
  );

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

  return (
    <>
      <PdfModal isOpen={pdfModal} updatedPersonalDetails={updatedPersonalDetails} value={value} saveData={saveData} toggle={() => setPdfModal(false)} />
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
                }
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
                            }
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
                                (_: any, i: any) => i !== index
                              )
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
            color="primary"
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
      {!edit ? (
        <Form>
          {!!isAccordian ? (
            <div className="mt-3">
              {updatedPersonalDetails &&
                updatedPersonalDetails.length > 0 &&
                updatedPersonalDetails.map((commissionTab: any, i: number) => {
                  return (
                    <Accordion
                      expanded={value === i}
                      onChange={handleChangeAccordian(i)}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                        key={i}
                      >
                        <Typography>{commissionTab?.Nestedtab}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div
                          className="w-full"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            position: "relative",
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
                          />
                        </div>
                        {updatedPersonalDetails[value]?.ds !== null && (
                          <MainTable
                            title={""}
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
              <div className="w-full justify-between items-center flex">
                {information?.Data?.[0]?.IsStepper ? (
                  <Stepper
                    activeStep={value}
                    style={{
                      width: "100%",
                    }}
                    onClick={(e) => e.preventDefault()}
                  >
                    {updatedPersonalDetails &&
                      updatedPersonalDetails.length > 0 &&
                      updatedPersonalDetails.map(
                        (commissionTab: any, i: number) => (
                          <Step
                            label={commissionTab?.TabAliasName}
                            onClick={(e) => e.preventDefault()}
                          />
                        )
                      )}
                  </Stepper>
                ) : (
                  <Tabs
                    value={value}
                    onChange={handleChange}
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
                    {updatedPersonalDetails &&
                      updatedPersonalDetails.length > 0 &&
                      updatedPersonalDetails.map(
                        (commissionTab: any, i: number) => (
                          <Tab
                            className=""
                            label={
                              <div
                                style={{
                                  width: "100%",
                                  height: "30px",
                                  padding: "10px",
                                }}
                                className=""
                              >
                                {commissionTab?.TabAliasName}
                              </div>
                            }
                            {...a11yProps(i)}
                            sx={{
                              minWidth: "59px",
                              marginLeft: "0px",
                              borderRadius: "2px 2px 0px 0px",
                            }}
                          />
                        )
                      )}
                  </Tabs>
                )}
              </div>
              <CustomTabPanel value={value} index={value}>
                <div style={{ marginBottom: 20 }}>
                  <Button onClick={() => {
                    setPdfModal(true)
                  }}>Download PDF </Button>
                </div>
                {updatedPersonalDetails?.[value]?.IsTableDisplay ? (
                  <div
                    className="w-full"
                    style={{
                      width: "100%",
                      height: `${information.Data[0]?.PageHeight}vh`,
                    }}
                    ref={isDrag ? drop : containerRef}
                  >
                    <MainTable
                      title={"Table"}
                      columns={columnsTable}
                      style={{
                        width: "100%",
                      }}
                      tableFooter={updatedPersonalDetails[value]?.TableFooter}
                      TableArray={updatedPersonalDetails[value]?.TableData}
                    />
                  </div>
                ) : null}
                {updatedPersonalDetails?.[value]?.IsAddMore ? (
                  <div
                    className="w-full flex flex-col gap-5"
                    style={{
                      height: `${information.Data[0]?.PageHeight}vh`,
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
                                                  : field.Width,
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
                                              }
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
                                            />
                                          </td>
                                        ) : null;
                                      })}
                                      <td
                                        style={{
                                          minWidth: 100,
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
                                                apiCallIndex: number
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
                                                            response: any
                                                          ) => {
                                                            if (
                                                              response.FieldID ===
                                                              parentRes.ParentIDFormula
                                                            ) {
                                                              const data = {
                                                                Userid:
                                                                  localStorage.getItem(
                                                                    "username"
                                                                  ),
                                                                ModuleID:
                                                                  Number(
                                                                    menuIDQuery ||
                                                                    menuID
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
                                                                  ].FieldValue
                                                                ),
                                                              };
                                                              axios
                                                                .post(
                                                                  "https://logpanel.insurancepolicy4u.com/api/Login/Calculate",
                                                                  data,
                                                                  {
                                                                    headers: {
                                                                      Authorization: `Bearer ${localStorage.getItem(
                                                                        "token"
                                                                      )}`,
                                                                    },
                                                                  }
                                                                )
                                                                .then(
                                                                  (
                                                                    responseData: any
                                                                  ) => {
                                                                    const newState =
                                                                      [
                                                                        ...updatedPersonalDetails,
                                                                      ];
                                                                    newState.map(
                                                                      (
                                                                        res: any
                                                                      ) => {
                                                                        res.Values.map(
                                                                          async (
                                                                            response: any
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
                                                                                      .Value
                                                                                  ),
                                                                              };
                                                                              setSaveData(
                                                                                state
                                                                              );
                                                                            }
                                                                          }
                                                                        );
                                                                      }
                                                                    );
                                                                  }
                                                                );
                                                            }
                                                          }
                                                        );
                                                      }
                                                    );
                                                  }

                                                  parentRes.addmorevalues.splice(
                                                    rowIndex,
                                                    1
                                                  );
                                                }
                                              }
                                            );
                                            setUpdatedPersonalDetails(
                                              nextState
                                            );
                                          }}
                                        >
                                          Delete
                                        </Button>
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </Table>

                            <Button
                              color="primary"
                              disabled={!isModify}
                              onClick={() => {
                                const nextState = [...updatedPersonalDetails];
                                nextState?.[value]?.Values.map((res: any) => {
                                  if (res.AddMoreGroup === groupName) {
                                    res.addmorevalues.push({
                                      ValIndex: res.addmorevalues?.length + 1,
                                      FieldValue: res.FieldValue,
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
                      }
                    )}
                
                    {!hideSubmit &&
                      updatedPersonalDetails?.[value]?.IsAddMore &&
                      updatedPersonalDetails?.[value]?.Values?.some(
                        (item: any) => item?.ValueType === "SUBMIT" && item?.DefaultVisible
                      ) && (
                        <Button
                          className="h-10 w-full"
                          color="primary"
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
                                mainColValue: string
                              ) => {
                                setHideSubmit(data);
                                handleProfileInformation(mainColValue, menuID);
                              },
                              isSubmit: true,
                            });
                          }}
                        >
                          SUBMIT
                        </Button>
                      )}

                    {!hideSubmit &&
                      updatedPersonalDetails?.[value]?.IsAddMore &&
                      updatedPersonalDetails?.[value]?.Values?.[1]
                        ?.ValueType !== "SUBMIT" &&
                      updatedPersonalDetails?.[value]?.Values?.[1]
                        ?.DefaultVisible && (
                        <Button
                          className="h-10 w-full"
                          color="primary"
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
                                mainColValue: string
                              ) => {
                                setHideSubmit(data);
                              },
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
                    className="w-full"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 20,
                      position: "relative",
                      height: `${information.Data[0]?.PageHeight}vh`,
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
                    />
                    {uploadedFiles?.length > 0 && (
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
                  </div>
                ) : (
                  <div
                    className="w-full"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 20,
                      position: "relative",
                      height: `${information.Data[0]?.PageHeight}vh`,
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
                      isMobile={isMobile}
                      setSaveData={setSaveData}
                      editorRef={editorRef}
                      getCardFields={getCardFields}
                    />
                  </div>
                )}

                <div>
                  {updatedPersonalDetails[value]?.ds !== null && (
                    <MainTable
                      title={""}
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
                    className=""
                    label={<CustomLabel commissionTab={commissionTab?.tab} />}
                    {...a11yProps(i)}
                    sx={{
                      minWidth: "59px",
                      marginLeft: "0px",
                      borderRadius: "2px 2px 0px 0px",
                    }}
                  />
                ))}
            </Tabs>
          </div>
          <CustomTabPanel value={valueEditTab} index={valueEditTab}>
            <MainTable
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
}
