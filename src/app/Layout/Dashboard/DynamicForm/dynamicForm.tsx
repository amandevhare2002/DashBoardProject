import axios from "axios";
import update from "immutability-helper";
import { useRouter } from "next/router";
import Tooltip from "rc-tooltip";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { DragDropContext, resetServerContext } from "react-beautiful-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSelector } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Collapse,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { Menuitem } from "../../AppNav/NavItems";
import { ModalComponent } from "../../Common/Modal";
const CreateBulkModalForm = dynamic(() => import("./CreateBulkModuleForm"));
const DependentFieldForm = dynamic(() => import("./DependentFieldForm"));
const GlobalForm = dynamic(() => import("./GlobalModalForm"));
const ModalForm = dynamic(() => import("./ModalForm"));
const Sections = dynamic(() => import("./Sections"));
const Container = dynamic(() => import("./dnd/Container"));
const CustomDragLayer = dynamic(() => import("./dnd/CustomDragLayer"));
import { DEFAULT_STATE } from "../DynamicUI/constant";
import { Uiitem } from "../DynamicUI/interface";
import { InitalState } from "./constant";
import { Resizable } from "re-resizable";
import dynamic from "next/dynamic";

const DynamicForm = ({
  modulesDetails,
  setAddModuleModal,
  setModulesDetails,
  selectedModule,
  setSelectedModule,
  modules,
  onChangeModuleInput,
  SubmitModuleForm,
}: {
  modulesDetails: {
    ErrorMessage: string;
    ModuleID: string;
    ModuleName: string;
    IsActive: boolean;
    MenuID: string;
    DisplayTabular: boolean;
    IsIDGenerate: boolean;
    IDPrefix: string;
    IDTypeSearch: string;
    SeoPageTitle: string;
    SeoMetaKeywords: string;
    SeoMetaDescription: string;
    SeoCopyRight: string;
    SeoContentType: string;
    SeoRobots: string;
    SeoViewPort: string;
    SeoCharset: string;
  } | null;
  setAddModuleModal: any;
  setModulesDetails: any;
  setSelectedModule: any;
  selectedModule: any;
  modules: any;
  PanelID?: string;
  onChangeModuleInput?: any;
  SubmitModuleForm?: any;
}) => {
  resetServerContext();
  const [isModalOpen, setIsOpenModal] = useState(false);
  const [modalData, setModalData] = useState<any>(null);
  const [colspanModal, setColspanModal] = useState(false);
  const [loadDatabase, setLoadDatabase] = useState([]);
  const [databaseTable, setDatebaseTable] = useState<Array<string>>([]);
  const [databaseColumn, setDatebaseColumn] = useState<Array<string>>([]);
  const [valueDatabase, setValueDatabase] = useState<Array<string>>([]);
  const [valueTable, setValueTable] = useState<Array<string>>([]);
  const [valueColumn, setValueColumn] = useState<Array<string>>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitFieldData, setIsSubmitFieldData] = useState(false);
  const [IsCheckinDependentTable, setIsCheckinDependentTable] = useState(false);
  const [form, setForm] = useState<Uiitem>({ ...DEFAULT_STATE });
  const [bulkForm, setBulkForm] = useState<Uiitem>({ ...DEFAULT_STATE });
  const token = useSelector((state: any) => state.authReducer.token);
  const [IsBulkFormModal, setIsBulkFormModal] = useState(false);
  const router = useRouter();
  const [workflow, setWorkflow] = useState<Array<Uiitem>>([]);
  const [accordion, setAccordian] = useState([true, false, true, false]);
  const [sectionsList, setSectionsList] = useState<Array<any>>([]);
  const [globalForm, setGlobalForm] = useState<Uiitem>({ ...DEFAULT_STATE });
  const [serverList, setServerList] = useState([]);
  const [selectedServer, setSelectedServer] = useState({
    value: "",
    label: "",
  });
  const [selectedSection, setSelectedSection] = useState({
    value: "",
    label: "",
  });
  const [containerWidth, setContainerWidth] = useState(1272);
  const [sectionWidth, setSectionWidth] = useState(404);

  useEffect(() => {
    if (router?.query?.create) {
      setModulesDetails({
        ...InitalState,
        MainMenuID: router?.query?.mainId,
        PanelID: 1,
        MenuID: router.query.menuId,
      });

      setAddModuleModal(true);
    }
    if (router?.query?.isEdit) {
      setSelectedModule(router.query.moduleId);
    }
  }, []);

  useEffect(() => {
    if (token) {
      getMenuItems();
    }
  }, [token]);

  const getMenuItems = () => {
    fetch(
      `https://logpanel.insurancepolicy4u.com/api/Login/GetMenuItems?ProjectType=1&Userid=${localStorage.getItem(
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
      .then((response: any) => {
        response?.menuitems?.map((res: Menuitem, index: Number) => {
          if (Number(router?.query?.mainId) === res.MainMenuID) {
            res.submenuitems.map((submenu) => {
              if (submenu.MenuID === Number(router.query.menuId)) {
                setForm({
                  ...form,
                  DBName: {
                    value: submenu.DefaultDbname,
                    label: submenu.DefaultDbname,
                  },
                  Tablename: {
                    value: submenu.DefaultTablename,
                    label: submenu.DefaultTablename,
                  },
                });
                setGlobalForm({
                  ...globalForm,
                  DBName: {
                    value: submenu.DefaultDbname,
                    label: submenu.DefaultDbname,
                  },
                  Tablename: {
                    value: submenu.DefaultTablename,
                    label: submenu.DefaultTablename,
                  },
                });
                setBulkForm({
                  ...bulkForm,
                  DBName: {
                    value: submenu.DefaultDbname,
                    label: submenu.DefaultDbname,
                  },
                  Tablename: {
                    value: submenu.DefaultTablename,
                    label: submenu.DefaultTablename,
                  },
                });
                if (submenu.DefaultTablename) {
                  onClickFieldGetTableApi(
                    submenu.DefaultDbname,
                    submenu.DefaultTablename
                  );
                }
              }
            });
          }
        });
      })
      .catch((error) => {});
  };

  useEffect(() => {
    if (modulesDetails?.MenuID && token) {
      getDynamicUIData();
      getServerList();
    }
  }, [modulesDetails, token]);

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
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setServerList(response.data.ServerList);
      })
      .catch((error) => {});
  };

  const getDatabase = (type?: string) => {
    fetch("https://metabase.pkgrp.in/LoadDatabases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "string",
          product: "LoadDatabases",
          type: type || "Cloud",
        },
        databaseType: "",
        server: "",
        username: "",
        password: "",
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setLoadDatabase(response);
        setValueDatabase(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onSelectDatabase = (e: { value: string; label: string }) => {
    getTableData(e);
    setForm({ ...form, DBName: e });
    setBulkForm({ ...bulkForm, DBName: e });
  };

  const onSelectServer = (e: { value: string; label: string }) => {
    setSelectedServer(e);
    getDatabase(e.value);
  };

  const onSelectValueDbName = (
    e: { value: string; label: string },
    index?: number
  ) => {
    fetch("https://metabase.pkgrp.in/LoadDatabaseTables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "string",
          product: "LoadDatabaseTables",
          type: "Cloud",
        },
        databaseType: "",
        server: "",
        databaseName: e.value,
        username: "",
        password: "",
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("response hhhh",response)
        if (index || index === 0) {
          const newFormArrayData: Array<Uiitem> = [...workflow];
          newFormArrayData[index] = {
            ...newFormArrayData[index],
            valueTableArray: response,
            valueDbName: e,
          };
          // console.log("newFormArrayDataloadData",newFormArrayData)
          setWorkflow(newFormArrayData);
        } else {
          setValueTable(response);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getTableData = (e: { value: string; label: string }) => {
    fetch("https://metabase.pkgrp.in/LoadDatabaseTables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "string",
          product: "LoadDatabaseTables",
          type: "Cloud",
        },
        databaseType: "",
        server: "",
        databaseName: e.value,
        username: "",
        password: "",
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setDatebaseTable(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onSelectTable = (data: any) => {
    fetch("https://metabase.pkgrp.in/LoadDatabaseTableColumns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "string",
          product: "LoadDatabaseTableColumns",
          type: "Cloud",
        },
        databaseType: "",
        server: "",
        databaseName: "",
        username: "",
        password: "",
        tableslist: [
          {
            tableName: data.value,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setForm({ ...form, Tablename: data });
        setBulkForm({ ...bulkForm, Tablename: data });
        setGlobalForm({ ...bulkForm, Tablename: data });
        setDatebaseColumn(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onSelectValueTableName = (
    e: { value: string; label: string },
    index?: number
  ) => {
    const formData = workflow[index || 0];
    fetch("https://metabase.pkgrp.in/LoadDatabaseTableColumns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "string",
          product: "LoadDatabaseTableColumns",
          type: "Cloud",
        },
        databaseType: "",
        server: "",
        databaseName: formData?.valueDbName?.value || form.valueDbName?.value,
        username: "",
        password: "",
        tableslist: [
          {
            tableName: e.value,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (index || index === 0) {
          const newFormArrayData: Array<Uiitem> = [...workflow];
          newFormArrayData[index] = {
            ...newFormArrayData[index],
            valueTableName: e,
            valueColumnArray: response,
          };
          setWorkflow(newFormArrayData);
        } else {
          setForm({ ...form, valueTableName: e });
          setValueColumn(response);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onSelectValueColumnName = (
    e: { value: string; label: string },
    index?: number
  ) => {
    if (index || index === 0) {
      const newFormArrayData: Array<Uiitem> = [...workflow];
      newFormArrayData[index] = {
        ...newFormArrayData[index],
        ValueColumnName: e,
      };
      setWorkflow(newFormArrayData);
    } else {
      setForm({ ...form, ValueColumnName: e });
    }
  };

  const onSelectColumn = (e: { value: string; label: string }) => {
    setForm({ ...form, DBColumnName: e });
  };

  const getDynamicUIData = async () => {
    if (Number(modulesDetails?.ModuleID) === 0) {
      return;
    }
    const result = await axios.post(
      `https://logpanel.insurancepolicy4u.com/api/Login/GetBulkFieldIDDetails`,
      {
        Userid: localStorage.getItem("username"),
        ModuleID: modulesDetails?.ModuleID,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const uiSectionsArray: any = [];
    result?.data?.UiSections?.map((res: any) => {
      if (res.SectionID !== "8") {
        uiSectionsArray.push(res);
      }
    });
    setSectionsList(
      result?.data?.UiSections?.length === 0
        ? [
            {
              SectionID: result?.data?.DefaultSectionID?.toString(),
              SectionName: result?.data?.DefaultSectionName,
              SectionsValues: [],
            },
          ]
        : [
            ...uiSectionsArray,
            {
              SectionID: result?.data?.DefaultSectionID?.toString(),
              SectionName: result?.data?.DefaultSectionName,
              SectionsValues: [],
            },
          ]
    );
    setSelectedSection({
      value: result?.data?.DefaultSectionID?.toString(),
      label: result?.data?.DefaultSectionName,
    });
    const data = result.data.bulkFieldRequests?.map((res: any) => {
      const object = {
        FieldID: res.dynamicuifields.FieldID,
        FieldName: res.dynamicuifields.FieldName,
        inputtype: res.dynamicuifields.inputtype,
        PlaceHolder_Label: res.dynamicuifields.PlaceHolder_Label,
        IsMandatory: res.dynamicuifields.IsMandatory,
        IsAutoFill: res.dynamicuifields.IsAutoFill,
        IsForMail: res.dynamicuifields.IsForMail,
        IsCalender: res.dynamicuifields.IsCalender,
        RowIDX: res.dynamicuifields.Row_IDX,
        ColIDX: res.dynamicuifields.Col_IDX,
        default_ColIDX: res.dynamicuifields.Col_IDX,
        default_RowIDX: res.dynamicuifields.Row_IDX,
        id: `${res.dynamicuifields.Row_IDX}${res.dynamicuifields.Col_IDX}${res.dynamicuifields.FieldID}`,
        FieldHeight: Number(res.dynamicuifields.FieldHeight?.split("px")[0]),
        FieldWidth: Number(res.dynamicuifields.FieldWidth?.split("px")[0]),
        IsClickEventAvailable: res.dynamicuifields.IsClickEventAvailable,
        DefaultVisibility: res.dynamicuifields.DefaultVisibility,
        IsToolTip: res.dynamicuifields.IsToolTip,
        ToolTiptext: res.dynamicuifields.ToolTiptext,
        isAlign: {
          value: res.dynamicuifields.Align,
          label: res.dynamicuifields.Align,
        },
        isHeader: res.dynamicuifields.IsHeaderField,
        dependentCol: res.dynamicuifields.DependentCol,
        staticfieldvalue: res.dynamicuifields.staticfieldvalue,
        SearchValueDropDown: res.dynamicuifields.SearchValueDropDown,
        IsActive: res.dynamicuifields.IsActive,
        AutoIDDisplay: res.dynamicuifields.AutoIDDisplay,
        IsCheckinDependentTable: res.dynamicuifields.IsCheckinDependentTable,
        dependentSectiononFieldValues:
          res.dynamicuifields.dependentSectiononFieldValues.map((res: any) => {
            const object = {
              MainFieldID: res.MainFieldID,
              MainFieldValue: res.MainFieldValue,
              SectionID: res.SectionID,
              SectionName: res.SectionName,
              SectionVisibility: res.SectionVisibility,
            };
            return object;
          }),
        updated: true,
        dependentFields: res.dynamicuifields.dependentFields,
        mainFieldID: {
          value: res.dynamicuifields.MainFieldID,
          label: res.dynamicuifields.MainFieldID,
        },
        DBName: {
          value: res.dynamicuifields.DBName,
          label: res.dynamicuifields.DBName,
        },
        Tablename: {
          value: res.dynamicuifields.Tabname,
          label: res.dynamicuifields.Tabname,
        },
        DBColumnName: {
          value: res.dynamicuifields.DBColumnName,
          label: res.dynamicuifields.DBColumnName,
        },
        valueDbName: {
          value: res.dynamicuifields.value_dbname,
          label: res.dynamicuifields.value_dbname,
        },
        ValueColumnName: {
          value: res.dynamicuifields.ValueColumnname,
          label: res.dynamicuifields.ValueColumnname,
        },
        valueTableName: {
          value: res.dynamicuifields.value_tablename,
          label: res.dynamicuifields.value_tablename,
        },
        SearchColumn: {
          value: res.dynamicuifields.SearchColumn,
          label: res.dynamicuifields.SearchColumn,
        },
        ValuesStaticDbApiComputed:
          res.dynamicuifields.Values_static_db_api_computed.toString(),
        sectionsLists: res.dynamicuifields.sectionsLists?.map(
          (response: any) => {
            const object = {
              ...response,
            };
            object.Sec_ColIDX =
              object.Sec_ColIDX === 0
                ? res.dynamicuifields.Col_IDX
                : object.Sec_ColIDX;
            object.Sec_RowIDX =
              object.Sec_RowIDX === 0
                ? res.dynamicuifields.Row_IDX
                : object.Sec_RowIDX;
            return object;
          }
        ),
      };

      return object;
    });

    const newData = data.map((res: Uiitem) => {
      const object = {
        ...res,
      };
      object.sectionsLists = object.sectionsLists.map((response) => {
        if (response.SectionID === Number(result.data.DefaultSectionID)) {
          object.ColIDX = response.Sec_ColIDX;
          object.RowIDX = response.Sec_RowIDX;
        }
        return response;
      });
      return object;
    });
    setWorkflow(newData);
  };

  const onChangeModalFormInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const Globalstate = {
      ...globalForm,
      [e.target.name]: e.target.value,
    };
    setGlobalForm(Globalstate);
    const state = {
      ...form,
      [e.target.name]: e.target.value,
    };
    setForm(state);
  };
  const onSubmitModal = () => {
    const newWorkFlow: any = [...workflow];
    setForm({
      ...globalForm,
      inputtype: modalData?.inputType,
    });
    setIsSubmitFieldData(true);
  };

  useEffect(() => {
    if (isSubmitFieldData) {
      onSubmitEditModal();
    }
  }, [isSubmitFieldData]);

  const onClickField = (responseData: Uiitem) => {
    setForm({ ...responseData });
    onClickFieldGetValueTableApi(
      responseData.valueDbName?.value || "",
      responseData.valueTableName?.value || ""
    );
    onClickFieldGetTableApi(
      responseData.DBName?.value || "",
      responseData.Tablename?.value || ""
    );
    getAutoFillValues(
      responseData.valueDbName?.value || "",
      responseData.valueTableName?.value || "",
      responseData.ValueColumnName?.value || ""
    );
    setIsOpenModal(true);
  };

  const getAutoFillValues = (
    Dbname: string,
    Tabname: string,
    Colname: string
  ) => {
    fetch(
      "https://logpanel.insurancepolicy4u.com/api/Login/GetAutoFillValues",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userid: localStorage.getItem("username"),
          Dbname,
          Tabname,
          Colname,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });
  };

  const onClickFieldGetValueTableApi = (dbName: string, tableName: string) => {
    fetch("https://metabase.pkgrp.in/LoadDatabaseTables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "string",
          product: "LoadDatabaseTables",
          type: "Cloud",
        },
        databaseType: "",
        server: "",
        databaseName: dbName,
        username: "",
        password: "",
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        onClickFieldGetValueColumn(dbName, tableName);
        setValueTable(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onClickFieldGetTableApi = (dbName: string, tableName: string) => {
    fetch("https://metabase.pkgrp.in/LoadDatabaseTables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "string",
          product: "LoadDatabaseTables",
          type: "Cloud",
        },
        databaseType: "",
        server: "",
        databaseName: dbName,
        username: "",
        password: "",
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        onClickFieldGetColumn(dbName, tableName);
        setDatebaseTable(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onClickFieldGetValueColumn = (dbname: string, tableName: string) => {
    fetch("https://metabase.pkgrp.in/LoadDatabaseTableColumns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "string",
          product: "LoadDatabaseTableColumns",
          type: "Cloud",
        },
        databaseType: "",
        server: "",
        databaseName: dbname,
        username: "",
        password: "",
        tableslist: [
          {
            tableName: tableName,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setValueColumn(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onClickFieldGetColumn = (dbname: string, tableName: string) => {
    fetch("https://metabase.pkgrp.in/LoadDatabaseTableColumns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "string",
          product: "LoadDatabaseTableColumns",
          type: "Cloud",
        },
        databaseType: "",
        server: "",
        databaseName: dbname,
        username: "",
        password: "",
        tableslist: [
          {
            tableName: tableName,
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setDatebaseColumn(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onSubmitEditModal = () => {
    const buttonFields: any = [];
    workflow.map((res: Uiitem) => {
      form?.uibuttonfields?.map((response: any) => {
        if (res.FieldID === response.value) {
          const object = {
            buttonID: form.FieldID,
            FieldID: res.FieldID,
            IsActive: res.IsActive,
            DBname: res.DBName?.value,
            Tabname: res.Tablename?.value,
            Colname: res.DBColumnName?.value,
          };
          buttonFields.push(object);
        }
      });
    });
    const Params = {
      Userid: localStorage.getItem("username"),
      dynamicuifields: {
        ModuleID: Number(selectedModule),
        FieldID: form.FieldID || 0,
        FieldName: form.FieldName,
        inputtype: form.inputtype,
        PlaceHolder_Label: form.PlaceHolder_Label,
        colspan: form.colspan || "1",
        IsMandatory: form.IsMandatory,
        IsAutoFill: form.IsAutoFill,
        IsForMail: form.IsForMail,
        IsCalender: form.IsCalender,
        DefaultVisibility: form.DefaultVisibility,
        Row_IDX: form.default_RowIDX,
        Col_IDX: form.default_ColIDX,
        DBColumnName: form.DBColumnName?.value || "",
        DependentCol: form.dependentCol || false,
        Tabname: form.Tablename?.value || "",
        DBName: form.DBName?.value || "",
        IsActive: form.IsActive,
        MainFieldID: form.mainFieldID?.value,
        Values_static_db_api_computed: form.ValuesStaticDbApiComputed,
        staticfieldvalue: form.staticfieldvalue?.[0]?.Value
          ? form.staticfieldvalue
          : [],
        value_dbname: form.valueDbName?.value || "",
        value_tablename: form.valueTableName?.value || "",
        ValueColumnname: form.ValueColumnName?.value || "",
        SearchColumn: form.SearchColumn?.value || "",
        SearchValueDropDown: form.SearchValueDropDown || "",
        AutoIDDisplay: form.AutoIDDisplay,
        IsClickEventAvailable: form.IsClickEventAvailable,
        FieldHeight: form.FieldHeight,
        FieldWidth: form.FieldWidth,
        IsToolTip: form.IsToolTip,
        ToolTipText: form.ToolTiptext || "",
        IsCheckinDependentTable: form.IsCheckinDependentTable,
        sectionsLists: form.sectionsLists,
        dependentSectiononFieldValues: form.dependentSectiononFieldValues?.[0]
          ?.MainFieldValue
          ? form.dependentSectiononFieldValues.map((res) => {
              const newObject = {
                MainFieldID: form.FieldID,
                MainFieldValue: res.MainFieldValue,
                SectionID: Number(res.SectionID),
                SectionName: res.SectionName,
                SectionVisibility: true,
              };
              return newObject;
            })
          : [],
        dependentFields: form.dependentFields?.[0]?.MainColValue
          ? form.dependentFields
          : [],
        ConditionalFields:
          (form?.ConditionalFields &&
            form?.ConditionalFields?.map((res) => res.value).toString()) ||
          "",
        ConditionalFieldsColumns:
          (form?.ConditionalFieldsColumns &&
            form?.ConditionalFieldsColumns?.map(
              (res) => res.value
            ).toString()) ||
          "",
        Align: form.Align?.value || "LEFT",
        IsHeaderField: form.isHeader || false,
      },
      buttondetail: {
        ButtonOperation: form.ButtonOperation || "",
        Buttoncolorcode: form.Buttoncolorcode || "",
        IsButtonforFileUpload: form.IsButtonforFileUpload || false,
        UploadPathforfile: form.ButtonEventURL || "",
        buttonFields: buttonFields,
      },
    };

    fetch(
      "https://logpanel.insurancepolicy4u.com/api/Login/Insert_Save_FinalMappingFields",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Params),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        setIsOpenModal(false);
        setIsEdit(false);
        setIsSubmitFieldData(false);
        setForm({ ...DEFAULT_STATE });
        getDynamicUIData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const dependentFieldContent = () => {
    return (
      <DependentFieldForm
        selectedModule={selectedModule}
        form={form}
        setForm={setForm}
      />
    );
  };

  const modalContentBulkForm = () => {
    return (
      <CreateBulkModalForm
        databaseColumn={databaseColumn}
        valueColumn={valueColumn}
        valueDatabase={valueDatabase}
        valueTable={valueTable}
        onSelectColumn={(e: { value: string; label: string }, index) => {
          const newFormArrayData: Array<Uiitem> = [...workflow];
          newFormArrayData[index] = {
            ...newFormArrayData[index],
            DBColumnName: e,
          };
          setWorkflow(newFormArrayData);
        }}
        form={workflow}
        onChangeInput={(
          e: React.ChangeEvent<HTMLInputElement>,
          index: number
        ) => {
          const newFormArrayData: Array<Uiitem> = [...workflow];
          newFormArrayData[index] = {
            ...newFormArrayData[index],
            [e.target.name]: e.target.value,
          };
          setWorkflow(newFormArrayData);
        }}
        onChangeValuesStaticDbApiComputed={(e: any, index: number) => {
          const newFormArrayData: Array<Uiitem> = [...workflow];
          newFormArrayData[index] = {
            ...newFormArrayData[index],
            ValuesStaticDbApiComputed: e.value,
          };
          setWorkflow(newFormArrayData);
        }}
        onSelectValueDbName={(
          e: { value: string; label: string },
          index: number
        ) => {
          const newFormArrayData: Array<Uiitem> = [...workflow];
          newFormArrayData[index] = {
            ...newFormArrayData[index],
            valueDbName: e,
          };
          setWorkflow(newFormArrayData);
          onSelectValueDbName(e, index);
        }}
        onSelectValueTableName={(
          e: { value: string; label: string },
          index: number
        ) => {
          onSelectValueTableName(e, index);
        }}
        onSelectValueColumnName={(
          e: { value: string; label: string },
          index: number
        ) => {
          onSelectValueColumnName(e, index);
        }}
        onSelectSearchColumn={(
          e: { value: string; label: string },
          index: number
        ) => {
          const newFormArrayData: Array<Uiitem> = [...workflow];
          newFormArrayData[index] = {
            ...newFormArrayData[index],
            SearchColumn: e,
          };
          setWorkflow(newFormArrayData);
        }}
        onChangeStatisFieldValue={(
          e: React.ChangeEvent<HTMLInputElement>,
          index: number,
          formindex: number
        ) => {
          const updatedState = update(workflow, {
            [formindex]: {
              staticfieldvalue: {
                [index]: {
                  Value: { $set: e.target.value },
                },
              },
            },
          });
          setWorkflow(updatedState);
        }}
        onClickPlus={(index: number, formIndex: number) => {
          const updatedState = update(workflow, {
            [formIndex]: {
              staticfieldvalue: {
                $push: [
                  {
                    Value: "",
                    IsActive: false,
                    Seqno: 1,
                  },
                ],
              },
            },
          });
          setWorkflow(updatedState);
        }}
        onClickRemove={(index: number, formIndex: number) => {
          const updatedState = update(workflow, {
            [formIndex]: {
              staticfieldvalue: { $splice: [[index, 1]] },
            },
          });
          setWorkflow(updatedState);
        }}
        onClickUpdateField={() => {}}
        onClickResetField={(index) => {
          const newFormArrayData: Array<Uiitem> = [...workflow];
          newFormArrayData[index] = { ...bulkForm };
          setWorkflow(newFormArrayData);
        }}
      />
    );
  };

  const onDeleteField = (response: Uiitem, index: number) => {
    if (response.FieldID) {
      fetch("https://logpanel.insurancepolicy4u.com/api/Login/DeleteFieldID", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Userid: localStorage.getItem("username"),
          FieldID: response.FieldID,
          ModuleID: Number(selectedModule),
          InputType: response.inputtype,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          getDynamicUIData();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      const newWorkflow = [...workflow];
      newWorkflow.splice(index, 1);
      setWorkflow(newWorkflow);
    }
  };

  const toggleAccordion = (tab: any) => {
    const prevState = accordion;
    const state = prevState.map((x, index) => (tab === index ? !x : false));

    setAccordian(state);
  };

  const onSubmitBulkModalForm = () => {
    const newWorkflow: any = [];
    workflow?.map((response: Uiitem) => {
      if (!response.updated) {
        const object = {
          dynamicuifields: {
            ModuleID: Number(modulesDetails?.ModuleID),
            FieldID: response.FieldID,
            FieldName: response.FieldName || "",
            inputtype: response.inputtype,
            PlaceHolder_Label: response.PlaceHolder_Label,
            IsMandatory: response.IsMandatory,
            IsAutoFill: response.IsAutoFill,
            IsForMail: response.IsForMail,
            IsCalender: response.IsCalender,
            DefaultVisibility: response.DefaultVisibility,
            Row_IDX: response.default_RowIDX,
            Col_IDX: response.default_ColIDX,
            DBColumnName: response.DBColumnName?.value || "",
            DependentCol: response.dependentCol,
            Tabname: response?.Tablename?.value || "",
            DBName: response?.DBName?.value || "",
            IsActive: response.IsActive,
            MainFieldID: response.mainFieldID?.value,
            Values_static_db_api_computed:
              response.ValuesStaticDbApiComputed || "0",
            staticfieldvalue: response.staticfieldvalue?.[0]?.Value
              ? response.staticfieldvalue
              : [],
            value_dbname: response?.valueDbName?.value || "",
            value_tablename: response.valueTableName?.value || "",
            ValueColumnname: response?.ValueColumnName?.value || "",
            SearchColumn: response.SearchColumn?.value || "",
            SearchValueDropDown: response?.SearchValueDropDown || "",
            AutoIDDisplay: response.AutoIDDisplay,
            IsClickEventAvailable: response.IsClickEventAvailable,
            FieldHeight: response.FieldHeight,
            FieldWidth: response.FieldWidth,
            IsToolTip: response?.IsToolTip,
            ToolTipText: response.ToolTiptext || "",
            IsCheckinDependentTable: response.IsCheckinDependentTable,
            dependentFields: response.dependentFields?.[0]?.MainColValue
              ? response.dependentFields
              : [],
            ConditionalFields: response.ConditionalFields || "",
            ConditionalFieldsColumns: response.ConditionalFieldsColumns || "",
            colspan: response.colspan || "",
            Align: response.Align || "LEFT",
            IsHeaderField: response.isHeader,
            sectionsLists:
              response.sectionsLists.length === 0
                ? globalForm?.sectionsLists
                : response.sectionsLists,
            dependentSectiononFieldValues: response
              .dependentSectiononFieldValues?.[0]?.MainFieldValue
              ? response.dependentSectiononFieldValues?.map((res) => {
                  const newObject = {
                    MainFieldID: response.FieldID,
                    MainFieldValue: res.MainFieldValue,
                    SectionID: Number(res.SectionID),
                    SectionName: res.SectionName,
                    SectionVisibility: true,
                  };
                  return newObject;
                })
              : [],
          },
          buttondetail: {
            ButtonOperation: response.ButtonOperation || "",
            Buttoncolorcode: response.Buttoncolorcode || "",
            IsButtonforFileUpload: response.IsButtonforFileUpload || false,
            UploadPathforfile: response.ButtonEventURL || "",
            buttonFields: response.uibuttonfields || [],
          },
        };
        newWorkflow.push(object);
      }
    });
    fetch(
      "https://logpanel.insurancepolicy4u.com/api/Login/Insert_Save_BulkFinalMappingFields",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Userid: localStorage.getItem("username"),
          bulkRequests: newWorkflow,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        setIsBulkFormModal(false);
        getDynamicUIData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onSubmitGlobalForm = () => {
    const newWorkflow: any = [];
    workflow?.map((response: Uiitem) => {
      const object = {
        dynamicuifields: {
          ModuleID: Number(modulesDetails?.ModuleID),
          FieldID: response.FieldID,
          FieldName: response.FieldName || "",
          inputtype: response.inputtype,
          PlaceHolder_Label: globalForm.PlaceHolder_Label,
          IsMandatory: globalForm.IsMandatory,
          IsAutoFill: globalForm.IsAutoFill,
          IsCalender: globalForm.IsCalender,
          DefaultVisibility: globalForm.DefaultVisibility,
          Row_IDX: response.default_RowIDX,
          Col_IDX: response.default_ColIDX,
          DBColumnName: response.DBColumnName?.value || "",
          DependentCol: response.dependentCol,
          Tabname: globalForm?.Tablename?.value || "",
          DBName: globalForm?.DBName?.value || "",
          IsActive: globalForm.IsActive,
          MainFieldID: globalForm.mainFieldID?.value,
          Values_static_db_api_computed:
            response.ValuesStaticDbApiComputed || "0",
          staticfieldvalue: response.staticfieldvalue?.[0]?.Value
            ? response.staticfieldvalue
            : [],
          value_dbname: response?.valueDbName?.value || "",
          value_tablename: response.valueTableName?.value || "",
          ValueColumnname: response?.ValueColumnName?.value || "",
          SearchColumn: response.SearchColumn?.value || "",
          SearchValueDropDown: response?.SearchValueDropDown || "",
          AutoIDDisplay: globalForm.AutoIDDisplay,
          IsClickEventAvailable: globalForm.IsClickEventAvailable,
          FieldHeight: globalForm.FieldHeight,
          FieldWidth: globalForm.FieldWidth,
          IsToolTip: globalForm?.IsToolTip,
          ToolTipText: response.ToolTiptext || "",
          IsCheckinDependentTable: globalForm.IsCheckinDependentTable,
          dependentFields: response.dependentFields?.[0]?.MainColValue
            ? response.dependentFields
            : [],
          ConditionalFields: response.ConditionalFields || "",
          ConditionalFieldsColumns: response.ConditionalFieldsColumns || "",
          colspan: response.colspan || "",
          Align: response.Align || "LEFT",
          IsHeaderField: response.isHeader,
          sectionsLists: globalForm?.sectionsLists,
          dependentSectiononFieldValues: response
            .dependentSectiononFieldValues?.[0]?.MainFieldValue
            ? response.dependentSectiononFieldValues?.map((res) => {
                const newObject = {
                  MainFieldID: response.FieldID,
                  MainFieldValue: res.MainFieldValue,
                  SectionID: Number(res.SectionID),
                  SectionName: res.SectionName,
                  SectionVisibility: true,
                };
                return newObject;
              })
            : [],
        },
        buttondetail: {
          ButtonOperation: response.ButtonOperation || "",
          Buttoncolorcode: response.Buttoncolorcode || "",
          IsButtonforFileUpload: response.IsButtonforFileUpload || false,
          UploadPathforfile: response.ButtonEventURL || "",
          buttonFields: response.uibuttonfields || [],
        },
      };
      newWorkflow.push(object);
    });

    fetch(
      "https://logpanel.insurancepolicy4u.com/api/Login/Insert_Save_BulkFinalMappingFields",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Userid: localStorage.getItem("username"),
          bulkRequests: newWorkflow,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        getDynamicUIData();
        toggleAccordion(0);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onResize = (e: any, direction: any, ref: any, d: any) => {
    if (d.width < 0) {
      setSectionWidth(sectionWidth + Math.abs(d.width));
      setContainerWidth(containerWidth + d.width);
    }
    if (d.width > 0) {
      setSectionWidth(sectionWidth - Math.abs(d.width));
      setContainerWidth(containerWidth + d.width);
    }
  };

  return (
    <>
      <ModalComponent
        visible={IsCheckinDependentTable}
        onSubmit={() => {
          setIsCheckinDependentTable(false);
        }}
        onClose={() => {
          setIsCheckinDependentTable(false);
        }}
        width={800}
        showFooter
        title="Dependent Table Fields "
        content={dependentFieldContent}
      />

      <ModalComponent
        visible={IsBulkFormModal}
        onSubmit={() => {
          onSubmitBulkModalForm();
        }}
        width={1200}
        title="Bulk Form Modal"
        onClose={() => {
          setIsBulkFormModal(!IsBulkFormModal);
        }}
        showFooter
        content={modalContentBulkForm}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <Resizable
          style={{ border: "1px solid #ddd", padding: 5 }}
          onResizeStop={onResize}
          size={{ width: containerWidth, height: "auto" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <Card style={{ width: "100%", marginBottom: 30 }}>
              <CardBody>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start7",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 30,
                  }}
                >
                  <div
                    style={{
                      flexDirection: "column",
                      width: "30%",
                      marginBottom: 30,
                    }}
                  >
                    <Label style={{ fontWeight: "bold" }}>Select Module</Label>
                    <Input
                      type="select"
                      placeholder={"Select Module"}
                      style={{ width: "100%", height: 40 }}
                      value={selectedModule}
                      onChange={(e) => {
                        setSelectedModule(e.target.value);
                      }}
                    >
                      {modules?.map((option: any, index: number) => (
                        <option key={index} value={option.ModuleID}>
                          {option.ModuleName}
                        </option>
                      ))}
                    </Input>
                  </div>
                  <Label style={{ fontWeight: "bold" }}>OR</Label>
                  <Button
                    style={{ width: "30%" }}
                    color="primary"
                    onClick={() => {
                      setModulesDetails({ ...InitalState });
                      setAddModuleModal(true);
                    }}
                  >
                    Create new module
                  </Button>
                </div>
              </CardBody>
            </Card>

            <div style={{ width: "100%" }}>
              <DragDropContext onDragEnd={() => {}}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Card className="main-card mb-3" style={{ width: "100%" }}>
                    <CardBody>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          marginBottom: 30,
                        }}
                      >
                        <CardTitle>Create dynamic form</CardTitle>
                        <Select
                          options={sectionsList?.map((res: any) => {
                            const object = {
                              value: res.SectionID,
                              label: res.SectionName,
                            };
                            return object;
                          })}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              width: 200,
                            }),
                          }}
                          value={selectedSection}
                          onChange={(e: any) => {
                            setSelectedSection(e);
                            const newWorkfow = [...workflow];
                            const data = newWorkfow.map((res: Uiitem) => {
                              const object = {
                                ...res,
                              };
                              object.sectionsLists = object.sectionsLists.map(
                                (response) => {
                                  if (response.SectionID === Number(e.value)) {
                                    object.ColIDX = response.Sec_ColIDX;
                                    object.RowIDX = response.Sec_RowIDX;
                                  }
                                  return response;
                                }
                              );
                              return object;
                            });
                            setWorkflow(data);
                          }}
                        />
                      </div>
                      <DndProvider backend={HTML5Backend}>
                        <Container
                          workflow={workflow}
                          selectedSection={selectedSection}
                          setWorkflow={setWorkflow}
                          onClickField={(data: Uiitem) => {
                            setIsEdit(true);
                            if (!accordion[1]) {
                              toggleAccordion(1);
                            }
                            onClickField(data);
                          }}
                          onDeleteField={onDeleteField}
                        />
                        <CustomDragLayer />
                      </DndProvider>
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Tooltip
                          placement="bottom"
                          trigger={["hover"]}
                          overlay={<span>Set Global Data</span>}
                        >
                          <span>
                            {" "}
                            <Button
                              color="primary"
                              type="button"
                              style={{ marginTop: 30 }}
                              disabled={bulkForm?.DBName?.value ? false : true}
                              onClick={() => {
                                const newFromArrayData = [...workflow];
                                newFromArrayData?.map((res: any) => {
                                  
                                  (res.dataBaseColumnArray = databaseColumn),
                                    (res.DBName = form.DBName),
                                    (res.Tablename = form.Tablename),
                                    (res.valueDatabaseArray = loadDatabase);
                                });
                                console.log("newFromArrayData",newFromArrayData)
                                setWorkflow(newFromArrayData);
                                setIsBulkFormModal(true);
                              }}
                            >
                              Submit
                            </Button>
                          </span>
                        </Tooltip>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </DragDropContext>
            </div>
          </div>
        </Resizable>

        <div
          id="accordion"
          className="accordion-wrapper mb-3"
          style={{ width: sectionWidth }}
        >
          <Card style={{ padding: 10 }}>
            <CardTitle
              block
              color="link"
              className="text-start m-0 p-0"
              onClick={() => toggleAccordion(0)}
              aria-expanded={accordion[0]}
              aria-controls="collapseOne"
            >
              Global Data
            </CardTitle>

            <Collapse
              isOpen={accordion[0]}
              data-parent="#accordion"
              id="collapseOne"
              aria-labelledby="headingOne"
              style={{ paddingBottom: 10 }}
            >
              <br />
              <GlobalForm
                databaseTable={databaseTable}
                onSelectTable={onSelectTable}
                loadDatabase={loadDatabase}
                onSubmitGlobalForm={onSubmitGlobalForm}
                setForm={(data: any) => {
                  setGlobalForm(data);
                  setBulkForm(data);
                }}
                form={globalForm}
                onChangeInput={onChangeModalFormInput}
                serverList={serverList}
                selectedServer={selectedServer}
                onSelectServer={(e: { value: string; label: string }) => {
                  onSelectServer(e);
                }}
                onSelectDatabase={(e: { value: string; label: string }) => {
                  onSelectDatabase(e);
                }}
                selectedModule={selectedModule}
                onChangeMainFieldId={(e: { value: string; label: string }) => {
                  setGlobalForm({ ...globalForm, mainFieldID: e });
                  setBulkForm({ ...bulkForm, mainFieldID: e });
                  setForm({ ...form, mainFieldID: e });
                }}
                setIsCheckinDependentTable={setIsCheckinDependentTable}
                getDataBaseApi={(dbName: string, tableName: string) => {
                  getDatabase();
                  getTableData({ value: tableName, label: tableName });
                  setGlobalForm({
                    ...globalForm,
                    DBName: { value: dbName, label: dbName },
                    Tablename: { value: tableName, label: tableName },
                  });
                  setForm({
                    ...form,
                    DBName: { value: dbName, label: dbName },
                    Tablename: { value: tableName, label: tableName },
                  });
                }}
                onChangeGlobalSection={(e) => {
                  const globalFormData = { ...globalForm };
                  const object = {
                    ...globalFormData,
                  };
                  object.sectionsLists = e.map((response: any) => {
                    const newObject = {
                      Sec_ColIDX: 0,
                      Sec_RowIDX: 0,
                      SectionID: Number(response.value),
                      SectionName: response.label,
                    };
                    return newObject;
                  });
                  setGlobalForm(object);
                }}
                sectionsList={sectionsList}
              />
            </Collapse>
          </Card>
          {isEdit && (
            <Card style={{ padding: 10, marginTop: 20 }}>
              <CardTitle
                block
                color="link"
                className="text-start m-0 p-0"
                onClick={() => toggleAccordion(1)}
                aria-expanded={accordion[1]}
                aria-controls="collapseOne"
              >
                {form?.FieldName}
              </CardTitle>
              <Collapse
                isOpen={accordion[1]}
                data-parent="#accordion"
                id="collapseOne"
                aria-labelledby="headingOne"
                style={{ paddingBottom: 10 }}
              >
                <br />
                <ModalForm
                  databaseTable={databaseTable || []}
                  onSelectTable={onSelectTable}
                  databaseColumn={databaseColumn || []}
                  valueColumn={valueColumn || []}
                  valueDatabase={valueDatabase || []}
                  sectionsList={sectionsList || []}
                  onChangeSection={(e: any) => {
                    const sectionArray = e?.map((res: any) => {
                      const object = {
                        Sec_ColIDX: res.Sec_ColIDX,
                        Sec_RowIDX: res.Sec_RowIDX,
                        SectionID: res.value,
                        SectionName: res.label,
                      };
                      return object;
                    });
                    setForm({
                      ...form,
                      sectionsLists: sectionArray,
                    });
                  }}
                  valueTable={valueTable || []}
                  loadDatabase={loadDatabase || []}
                  onSelectColumn={onSelectColumn}
                  setForm={setForm}
                  form={form}
                  onChangeInput={onChangeModalFormInput}
                  onSelectAlign={(e: { value: string; label: string }) => {
                    setForm({ ...form, Align: e });
                    setBulkForm({ ...bulkForm, Align: e });
                  }}
                  serverList={serverList}
                  selectedServer={selectedServer}
                  onSelectServer={(e: { value: string; label: string }) => {
                  onSelectServer(e);
                  }}
                  onSelectDatabase={(e: { value: string; label: string }) => {
                    onSelectDatabase(e);
                  }}
                  selectedModule={selectedModule}
                  onChangeMainFieldId={(e: {
                    value: string;
                    label: string;
                  }) => {
                    setForm({ ...form, mainFieldID: e });
                  }}
                  onChangeValuesStaticDbApiComputed={(e: any) => {
                    setForm({ ...form, ValuesStaticDbApiComputed: e.value });
                  }}
                  onSelectValueDbName={(e: {
                    value: string;
                    label: string;
                  }) => {
                    setForm({ ...form, valueDbName: e });
                    onSelectValueDbName(e);
                  }}
                  onSelectValueTableName={(e: {
                    value: string;
                    label: string;
                  }) => {
                    onSelectValueTableName(e);
                  }}
                  onSelectValueColumnName={(e: {
                    value: string;
                    label: string;
                  }) => {
                    onSelectValueColumnName(e);
                  }}
                  onSelectSearchColumn={(e: {
                    value: string;
                    label: string;
                  }) => {
                    setForm({ ...form, SearchColumn: e });
                  }}
                  onChangeConditionalFields={(e: any) => {
                    setForm({ ...form, ConditionalFields: e });
                  }}
                  onChangeConditionalFieldsColumns={(e: any) => {
                    setForm({ ...form, ConditionalFieldsColumns: e });
                  }}
                  onChangeUiButtonField={(e: any) => {
                    setForm({ ...form, uibuttonfields: e });
                  }}
                  onChangeStatisFieldValue={(
                    e: React.ChangeEvent<HTMLInputElement>,
                    index: number
                  ) => {
                    const state = { ...form };
                    state.staticfieldvalue[index] = {
                      ...state.staticfieldvalue[index],
                      Value: e.target.value,
                    };
                    setForm(state);
                  }}
                  onClickPlus={() => {
                    const state = { ...form };
                    state.staticfieldvalue.push({
                      Value: "",
                      IsActive: false,
                      Seqno: 1,
                    });
                    setForm(state);
                  }}
                  onClickRemove={(index: number) => {
                    const state = { ...form };
                    state.staticfieldvalue.splice(index, 1);
                    setForm(state);
                  }}
                  onChangeDependentSectiononSelectFieldValues={(
                    e: any,
                    index: number,
                    name: string
                  ) => {
                    const state = { ...form };
                    state.dependentSectiononFieldValues[index] = {
                      ...state.dependentSectiononFieldValues[index],
                      SectionID: Number(e.value),
                      SectionName: e.label,
                    };
                    setForm(state);
                  }}
                  onChangeDependentSectiononFieldValues={(
                    e: React.ChangeEvent<HTMLInputElement>,
                    index: number,
                    name: string
                  ) => {
                    const state = { ...form };
                    state.dependentSectiononFieldValues[index] = {
                      ...state.dependentSectiononFieldValues[index],
                      [name]: e.target.value,
                    };
                    setForm(state);
                  }}
                  onClickSectionRemove={(index: number) => {
                    const state = { ...form };
                    state.dependentSectiononFieldValues.splice(index, 1);
                    setForm(state);
                  }}
                  onClickSectionPlus={() => {
                    const state = { ...form };
                    state.dependentSectiononFieldValues.push({
                      MainFieldID: 0,
                      MainFieldValue: "",
                      SectionID: 0,
                      SectionName: "",
                      SectionVisibility: false,
                    });
                    setForm(state);
                  }}
                  setIsCheckinDependentTable={setIsCheckinDependentTable}
                />
                <Form style={{ display: "flex", justifyContent: "center" }}>
                  <FormGroup>
                    <Button
                      color="primary"
                      onClick={() => {
                        if (isEdit) {
                          onSubmitEditModal();
                        }
                      }}
                    >
                      Submit
                    </Button>
                  </FormGroup>
                </Form>
              </Collapse>
            </Card>
          )}
          <Card style={{ padding: 10, marginTop: 20 }}>
            <CardTitle
              block
              color="link"
              className="text-start m-0 p-0"
              onClick={() => toggleAccordion(2)}
              aria-expanded={accordion[2]}
              aria-controls="collapseOne"
            >
              Sections
            </CardTitle>

            <Collapse
              isOpen={accordion[2]}
              data-parent="#accordion"
              id="collapseOne"
              aria-labelledby="headingOne"
              style={{ paddingBottom: 10 }}
            >
              <Sections
                moduleId={modulesDetails?.ModuleID || ""}
                getSections={() => {
                  getDynamicUIData();
                }}
              />
            </Collapse>
          </Card>

          <Card style={{ padding: 10, marginTop: 20 }}>
            <CardTitle
              block
              color="link"
              className="text-start m-0 p-0"
              onClick={() => toggleAccordion(3)}
              aria-expanded={accordion[3]}
              aria-controls="collapseOne"
            >
              SEO
            </CardTitle>

            <Collapse
              isOpen={accordion[3]}
              data-parent="#accordion"
              id="collapseOne"
              aria-labelledby="headingOne"
              style={{ paddingBottom: 10 }}
            >
              <Form>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Seo Page Title
                  </Label>
                  <Input
                    name="SeoPageTitle"
                    type="textarea"
                    value={modulesDetails?.SeoPageTitle}
                    onChange={onChangeModuleInput}
                  />
                </FormGroup>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Seo Meta Keywords
                  </Label>
                  <Input
                    name="SeoMetaKeywords"
                    type="textarea"
                    value={modulesDetails?.SeoMetaKeywords}
                    onChange={onChangeModuleInput}
                  />
                </FormGroup>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Seo Meta Description
                  </Label>
                  <Input
                    name="SeoMetaDescription"
                    type="textarea"
                    value={modulesDetails?.SeoMetaDescription}
                    onChange={onChangeModuleInput}
                  />
                </FormGroup>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Seo CopyRight
                  </Label>
                  <Input
                    name="SeoCopyRight"
                    type="textarea"
                    value={modulesDetails?.SeoCopyRight}
                    onChange={onChangeModuleInput}
                  />
                </FormGroup>
              </Form>
              <Form>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Seo ContentType
                  </Label>
                  <Input
                    name="SeoContentType"
                    type="textarea"
                    value={modulesDetails?.SeoContentType}
                    onChange={onChangeModuleInput}
                  />
                </FormGroup>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Seo Robots
                  </Label>
                  <Input
                    name="SeoRobots"
                    type="textarea"
                    value={modulesDetails?.SeoRobots}
                    onChange={onChangeModuleInput}
                  />
                </FormGroup>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Seo ViewPort
                  </Label>
                  <Input
                    name="SeoViewPort"
                    type="textarea"
                    value={modulesDetails?.SeoViewPort}
                    onChange={onChangeModuleInput}
                  />
                </FormGroup>
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    Seo Charset
                  </Label>
                  <Input
                    name="SeoCharset"
                    type="textarea"
                    value={modulesDetails?.SeoCharset}
                    onChange={onChangeModuleInput}
                  />
                </FormGroup>
              </Form>
              <Form style={{ display: "flex", justifyContent: "center" }}>
                <FormGroup>
                  <Button
                    color="primary"
                    onClick={() => {
                      if (isEdit) {
                        SubmitModuleForm();
                      }
                    }}
                  >
                    Submit
                  </Button>
                </FormGroup>
              </Form>
            </Collapse>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DynamicForm;
