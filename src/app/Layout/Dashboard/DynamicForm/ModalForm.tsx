import classnames from "classnames";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import {
  Button,
  ButtonGroup,
  Form,
  FormGroup,
  Input,
  Label,
  TabContent,
  TabPane,
} from "reactstrap";
import { Uiitem } from "../DynamicUI/interface";

const ModalForm = ({
  databaseTable,
  onSelectTable,
  databaseColumn,
  onSelectColumn,
  onChangeInput,
  form,
  setForm,
  loadDatabase,
  onSelectDatabase,
  selectedModule,
  onChangeMainFieldId,
  onChangeValuesStaticDbApiComputed,
  onSelectValueDbName,
  onSelectValueTableName,
  onSelectValueColumnName,
  valueColumn,
  onSelectSearchColumn,
  onChangeConditionalFields,
  onChangeConditionalFieldsColumns,
  valueDatabase,
  valueTable,
  onChangeStatisFieldValue,
  onClickPlus,
  onClickRemove,
  setIsCheckinDependentTable,
  onSelectAlign,
  sectionsList,
  onChangeDependentSectiononFieldValues,
  onClickSectionRemove,
  onClickSectionPlus,
  onChangeDependentSectiononSelectFieldValues,
  onChangeSection,
  onChangeUiButtonField,
  serverList,
  selectedServer,
  onSelectServer,
}: {
  databaseTable: Array<string>;
  onSelectTable: (data: any) => void;
  databaseColumn: any;
  onSelectColumn: (data: any) => void;
  onChangeInput: any;
  form: Uiitem;
  setForm: any;
  loadDatabase: any;
  onSelectDatabase: (e: any) => void;
  selectedModule: string;
  onChangeMainFieldId: any;
  onChangeValuesStaticDbApiComputed: any;
  onSelectValueDbName: any;
  onSelectValueTableName: any;
  onSelectValueColumnName: any;
  valueColumn: any;
  onSelectSearchColumn: any;
  onChangeConditionalFields: any;
  onChangeConditionalFieldsColumns: any;
  valueDatabase: Array<string>;
  valueTable: Array<string>;
  onChangeStatisFieldValue: any;
  onClickPlus: any;
  onClickRemove: any;
  setIsCheckinDependentTable: any;
  onSelectAlign: any;
  sectionsList: any;
  onChangeDependentSectiononFieldValues: any;
  onClickSectionRemove: any;
  onClickSectionPlus: any;
  onChangeDependentSectiononSelectFieldValues: any;
  onChangeSection: any;
  onChangeUiButtonField: any;
  serverList: Array<{ ServerName: string }>;
  selectedServer: any;
  onSelectServer: any;
}) => {
  const [mainFieldArray, setMainFieldArray] = useState([]);
  const [activeTab, setActiveTab] = useState("1");
  const token = useSelector((state: any) => state.authReducer.token);
  const database = loadDatabase?.map((res: any) => {
    const object = {
      value: res,
      label: res,
    };
    return object;
  });

  const tableData = databaseTable?.map((res) => {
    const object = {
      value: res,
      label: res,
    };
    return object;
  });

  const newData = JSON.parse(
    databaseColumn?.columnLists?.[0].ColumnName || "{}"
  );

  const columanData = newData?.map((res: any) => {
    const object = {
      value: res,
      label: res,
    };
    return object;
  });
  const valueDatabaseData = valueDatabase?.map((res: any) => {
    const object = {
      value: res,
      label: res,
    };
    return object;
  });

  const valueTableData = valueTable?.map((res: any) => {
    const object = {
      value: res,
      label: res,
    };
    return object;
  });
  const newData2 = JSON.parse(valueColumn?.columnLists?.[0].ColumnName || "[]");
  const valueColumanData: any = newData2?.map((res: any) => {
    const object = {
      value: res,
      label: res,
    };
    return object;
  });

  const alignArray = [
    { value: "LEFT", label: "LEFT" },
    { value: "RIGHT", label: "RIGHT" },
  ]?.map((res: any) => {
    const object = {
      value: res,
      label: res,
    };
    return object;
  });

  useEffect(() => {
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/GetFieldID", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        Userid: localStorage.getItem("username"),
        ModuleID: Number(selectedModule),
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        const newArray = response?.fields?.map((res: any) => {
          const object = {
            value: res.FieldID,
            label: res.FieldName,
          };
          return object;
        });
        setMainFieldArray(newArray);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const toggle = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <div>
      <Fragment>
        <TransitionGroup>
          <CSSTransition
            component="div"
            classNames="TabsAnimation"
            appear={true}
            timeout={0}
            enter={false}
            exit={false}
          >
            <div>
              <ButtonGroup size="sm" style={{ marginBottom: 20 }}>
                <Button
                  caret="true"
                  color="light"
                  className={
                    "btn-shadow " + classnames({ active: activeTab === "1" })
                  }
                  onClick={() => {
                    toggle("1");
                  }}
                >
                  Tab 1
                </Button>
                <Button
                  color="light"
                  className={
                    "btn-shadow " + classnames({ active: activeTab === "2" })
                  }
                  onClick={() => {
                    toggle("2");
                  }}
                >
                  Tab 2
                </Button>
                <Button
                  color="light"
                  className={
                    "btn-shadow " + classnames({ active: activeTab === "3" })
                  }
                  onClick={() => {
                    toggle("3");
                  }}
                >
                  Tab 3
                </Button>
                <Button
                  color="light"
                  className={
                    "btn-shadow " + classnames({ active: activeTab === "4" })
                  }
                  onClick={() => {
                    toggle("4");
                  }}
                >
                  Tab 4
                </Button>
              </ButtonGroup>
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <Form>
                    <FormGroup style={{ width: 282 }}>
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
                        options={serverList.map((res) => {
                          return {
                            value: res.ServerName,
                            lable: res.ServerName,
                          };
                        })}
                        onChange={(e) => {
                          onSelectServer(e);
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        DB Name
                      </Label>
                      <Select
                        placeholder="Select Database"
                        value={form.DBName}
                        options={database}
                        onChange={(e) => {
                          onSelectDatabase(e);
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Table name
                      </Label>
                      <Select
                        placeholder="Select Table"
                        value={form.Tablename}
                        options={tableData}
                        onChange={(e) => {
                          onSelectTable(e);
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        DB Column Name
                      </Label>
                      <Select
                        placeholder="Select Column"
                        options={columanData}
                        value={form.DBColumnName}
                        onChange={(e) => {
                          onSelectColumn(e);
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Select Section
                      </Label>
                      <Select
                        options={sectionsList?.map((res: any) => {
                          const object = {
                            value: Number(res.SectionID),
                            label: res.SectionName,
                            Sec_ColIDX: 0,
                            Sec_RowIDX: 0,
                          };
                          return object;
                        })}
                        isMulti
                        styles={{
                          control: (baseStyles, state) => ({
                            ...baseStyles,
                            width: 200,
                          }),
                        }}
                        value={form.sectionsLists?.map((res) => {
                          return {
                            value: Number(res.SectionID),
                            label: res.SectionName,
                            Sec_ColIDX: 0,
                            Sec_RowIDX: 0,
                          };
                        })}
                        onChange={(e: any) => {
                          onChangeSection(e);
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        FieldName
                      </Label>
                      <Input
                        name="FieldName"
                        value={form.FieldName}
                        onChange={onChangeInput}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Row Index
                      </Label>
                      <Input name="FieldName" value={form.RowIDX} disabled />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Col Index
                      </Label>
                      <Input name="FieldName" value={form.ColIDX} disabled />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Input Type
                      </Label>
                      <Input
                        name="inputtype"
                        type="select"
                        value={form.inputtype}
                        onChange={onChangeInput}
                      >
                        <option>TEXTBOX</option>
                        <option>DROPDOWN</option>
                        <option>LABEL</option>
                        <option>BUTTON</option>
                        <option>FILEUPLOAD</option>
                      </Input>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        PlaceHolder Label
                      </Label>
                      <Input
                        name="PlaceHolder_Label"
                        value={form.PlaceHolder_Label}
                        type="select"
                        onChange={onChangeInput}
                      >
                        <option>Label</option>
                        <option>Placeholder</option>
                        <option>Both</option>
                      </Input>
                    </FormGroup>
                  </Form>
                </TabPane>
                <TabPane tabId="2">
                  <Form>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Main Field ID
                      </Label>
                      <Select
                        placeholder="Select Main Field ID"
                        options={mainFieldArray}
                        value={{
                          value: form.mainFieldID?.value,
                          label: form.mainFieldID?.label,
                        }}
                        onChange={(e) => {
                          onChangeMainFieldId(e);
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Values Static Db Api Computed
                      </Label>
                      <Select
                        placeholder="Select Db Api Computed"
                        value={{
                          value: form.ValuesStaticDbApiComputed,
                          label: form.ValuesStaticDbApiComputed,
                        }}
                        options={[
                          { value: "0", label: "0" },
                          { value: "1", label: "1" },
                          { value: "2", label: "2" },
                          { value: "3", label: "3" },
                        ]}
                        onChange={(e) => {
                          onChangeValuesStaticDbApiComputed(e);
                        }}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Field Height
                      </Label>
                      <Input
                        name="FieldHeight"
                        value={form.FieldHeight}
                        onChange={onChangeInput}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Field Width
                      </Label>
                      <Input
                        name="FieldWidth"
                        value={form.FieldWidth}
                        onChange={onChangeInput}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Align
                      </Label>
                      <Select
                        placeholder="Align"
                        options={alignArray}
                        value={form.Align}
                        onChange={(e) => {
                          onSelectAlign(e);
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Click Event URL
                      </Label>
                      <Input
                        name="ClickEventURL"
                        value={form.ClickEventURL || ""}
                        onChange={onChangeInput}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        ToolTip Text
                      </Label>
                      <Input
                        name="ToolTiptext"
                        value={form.ToolTiptext || ""}
                        onChange={onChangeInput}
                      />
                    </FormGroup>
                    {(form.inputtype === "BUTTON" ||
                      form.inputtype === "FILEUPLOAD") && (
                      <FormGroup>
                        <Label
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          Button Operation
                        </Label>
                        <Input
                          name="ButtonOperation"
                          type="select"
                          value={form.ButtonOperation || ""}
                          onChange={onChangeInput}
                        >
                          <option></option>
                          <option>UPLOAD</option>
                          <option>INSERT</option>
                          <option>DELETE</option>
                          <option>UPDATE</option>
                        </Input>
                      </FormGroup>
                    )}

                    {(form.inputtype === "BUTTON" ||
                      form.inputtype === "FILEUPLOAD") && (
                      <FormGroup>
                        <Label
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          Button Fields
                        </Label>
                        <Select
                          placeholder="Select Button Fields"
                          options={mainFieldArray}
                          value={form.uibuttonfields}
                          isMulti
                          onChange={(e) => {
                            onChangeUiButtonField(e);
                          }}
                        />
                      </FormGroup>
                    )}
                  </Form>
                </TabPane>
                <TabPane tabId="3">
                  <Form>
                    {(form.ValuesStaticDbApiComputed === "2" ||
                      form.ValuesStaticDbApiComputed === "3") && [
                      <FormGroup>
                        <Label
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          Value Db Name
                        </Label>
                        <Select
                          placeholder="Select value Db Name"
                          options={valueDatabaseData}
                          value={form.valueDbName}
                          onChange={(e) => {
                            onSelectValueDbName(e);
                          }}
                        />
                      </FormGroup>,
                      <FormGroup>
                        <Label
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          value Table Name
                        </Label>
                        <Select
                          placeholder="Select value Table Name"
                          options={valueTableData}
                          value={form.valueTableName}
                          onChange={(e) => {
                            onSelectValueTableName(e);
                          }}
                        />
                      </FormGroup>,
                      <FormGroup>
                        <Label
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          Value Column Name
                        </Label>
                        <Select
                          placeholder="Select Value Column Name"
                          options={valueColumanData}
                          value={form.ValueColumnName}
                          onChange={(e) => {
                            onSelectValueColumnName(e);
                          }}
                        />
                      </FormGroup>,
                      form.ValuesStaticDbApiComputed === "3" && (
                        <FormGroup>
                          <Label
                            style={{
                              fontWeight: "bold",
                            }}
                          >
                            Search Column
                          </Label>
                          <Select
                            placeholder="Select Column"
                            options={valueColumanData}
                            value={form.SearchColumn}
                            onChange={(e) => {
                              onSelectSearchColumn(e);
                            }}
                          />
                        </FormGroup>
                      ),

                      form.ValuesStaticDbApiComputed === "3" && (
                        <FormGroup>
                          <Label
                            style={{
                              fontWeight: "bold",
                            }}
                          >
                            Search Value DropDown
                          </Label>
                          <Input
                            name="SearchValueDropDown"
                            value={form.SearchValueDropDown}
                            onChange={onChangeInput}
                          />
                        </FormGroup>
                      ),
                    ]}
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Conditional Fields
                      </Label>
                      <Select
                        placeholder="Select Conditional Fields"
                        options={mainFieldArray}
                        value={form.ConditionalFields}
                        isMulti
                        onChange={(e) => {
                          onChangeConditionalFields(e);
                        }}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Conditional Fields Columns
                      </Label>
                      <Select
                        placeholder="Select Conditional Fields Columns"
                        options={valueColumanData}
                        value={form.ConditionalFieldsColumns}
                        isMulti
                        onChange={(e) => {
                          onChangeConditionalFieldsColumns(e);
                        }}
                      />
                    </FormGroup>
                    {form.ValuesStaticDbApiComputed === "1" &&
                      form?.staticfieldvalue?.map((res, index) => {
                        return (
                          <FormGroup
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <Input
                              placeholder="Static Field Value"
                              value={res.Value}
                              onChange={(e) => {
                                onChangeStatisFieldValue(e, index);
                              }}
                            />
                            <i
                              className="pe-7s-plus"
                              style={{ fontSize: 25, cursor: "pointer" }}
                              onClick={() => {
                                onClickPlus();
                              }}
                            />
                            {index !== 0 && (
                              <i
                                className="pe-7s-close"
                                style={{ fontSize: 30, cursor: "pointer" }}
                                onClick={() => {
                                  onClickRemove();
                                }}
                              />
                            )}
                          </FormGroup>
                        );
                      })}
                    {form?.dependentSectiononFieldValues?.map((res, index) => {
                      return (
                        <Form>
                          <FormGroup
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <Input
                              placeholder="Main Field Value"
                              value={res.MainFieldValue}
                              onChange={(e) => {
                                onChangeDependentSectiononFieldValues(
                                  e,
                                  index,
                                  "MainFieldValue"
                                );
                              }}
                            />
                            <i
                              className="pe-7s-plus"
                              style={{ fontSize: 25, cursor: "pointer" }}
                              onClick={() => {
                                onClickSectionPlus();
                              }}
                            />
                            {index !== 0 && (
                              <i
                                className="pe-7s-close"
                                style={{ fontSize: 30, cursor: "pointer" }}
                                onClick={() => {
                                  onClickSectionRemove(index);
                                }}
                              />
                            )}
                          </FormGroup>
                          <FormGroup>
                            <Select
                              options={sectionsList?.map((res: any) => {
                                const object = {
                                  value: res.SectionID,
                                  label: res.SectionName,
                                };
                                return object;
                              })}
                              name="SectionID"
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  width: 200,
                                }),
                              }}
                              value={{
                                value: res.SectionID,
                                label: res.SectionName,
                              }}
                              onChange={(e: any) => {
                                onChangeDependentSectiononSelectFieldValues(
                                  e,
                                  index,
                                  "SectionID"
                                );
                              }}
                            />
                          </FormGroup>
                        </Form>
                      );
                    })}
                  </Form>
                </TabPane>
                <TabPane tabId="4">
                  <Form>
                    {(form.inputtype === "BUTTON" ||
                      form.inputtype === "FILEUPLOAD") && (
                      <FormGroup>
                        <Label
                          style={{
                            fontWeight: "bold",
                          }}
                        >
                          Is Button for File Upload
                        </Label>
                        <br />
                        <div style={{ display: "flex", gap: 10 }}>
                          <span>
                            {" "}
                            <Input
                              type="radio"
                              name="IsButtonforFileUpload"
                              checked={form?.IsButtonforFileUpload}
                              onChange={(e) => {
                                const state = {
                                  ...form,
                                  [e.target.name]: true,
                                };
                                setForm(state);
                              }}
                            />{" "}
                            TRUE
                          </span>
                          <span>
                            {" "}
                            <Input
                              type="radio"
                              name="IsButtonforFileUpload"
                              checked={form?.IsButtonforFileUpload === false}
                              onChange={(e) => {
                                const state = {
                                  ...form,
                                  [e.target.name]: false,
                                };
                                setForm(state);
                              }}
                            />{" "}
                            FALSE
                          </span>
                        </div>
                      </FormGroup>
                    )}
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Is Mandatory
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsMandatory"
                            checked={form?.IsMandatory}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsMandatory"
                            checked={form?.IsMandatory === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Is AutoFill
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsAutoFill"
                            checked={form?.IsAutoFill}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsAutoFill"
                            checked={form?.IsAutoFill === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Is Calender
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsCalender"
                            checked={form?.IsCalender}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsCalender"
                            checked={form?.IsCalender === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Default Visibility
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="DefaultVisibility"
                            checked={form?.DefaultVisibility}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="DefaultVisibility"
                            checked={form?.DefaultVisibility === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Is ToolTip
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsToolTip"
                            checked={form?.IsToolTip}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsToolTip"
                            checked={form?.IsToolTip === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>

                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Is Click Event Available
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsClickEventAvailable"
                            checked={form?.IsClickEventAvailable}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsClickEventAvailable"
                            checked={form?.IsClickEventAvailable === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Is Checkin Dependent Table
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsCheckinDependentTable"
                            checked={form?.IsCheckinDependentTable}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                              setIsCheckinDependentTable(true);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsCheckinDependentTable"
                            checked={form?.IsCheckinDependentTable === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                              setIsCheckinDependentTable(false);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Is For Mail
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsForMail"
                            checked={form?.IsForMail}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsForMail"
                            checked={form?.IsForMail === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Auto ID Display
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="AutoIDDisplay"
                            checked={form?.AutoIDDisplay}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="AutoIDDisplay"
                            checked={form?.AutoIDDisplay === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Is Active
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsActive"
                            checked={form?.IsActive}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="IsActive"
                            checked={form?.IsActive === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        Dependent Col
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="dependentCol"
                            checked={form?.dependentCol}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="dependentCol"
                            checked={form?.dependentCol === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <Label
                        style={{
                          fontWeight: "bold",
                        }}
                      >
                        is Header
                      </Label>
                      <br />
                      <div style={{ display: "flex", gap: 10 }}>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="isHeader"
                            checked={form?.isHeader}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: true,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          TRUE
                        </span>
                        <span>
                          {" "}
                          <Input
                            type="radio"
                            name="isHeader"
                            checked={form?.isHeader === false}
                            onChange={(e) => {
                              const state = {
                                ...form,
                                [e.target.name]: false,
                              };
                              setForm(state);
                            }}
                          />{" "}
                          FALSE
                        </span>
                      </div>
                    </FormGroup>
                  </Form>
                </TabPane>
              </TabContent>
            </div>
          </CSSTransition>
        </TransitionGroup>
      </Fragment>
    </div>
  );
};

export default ModalForm;
