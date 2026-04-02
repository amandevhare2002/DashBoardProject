import Select from "react-select";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from "reactstrap";
import { Uiitem } from "../DynamicUI/interface";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NewDbForm } from "./newDbFrom";
import classnames from "classnames";
import { CSSTransition, TransitionGroup } from "react-transition-group";

 const GlobalForm = ({
  databaseTable,
  onSelectTable,
  onChangeInput,
  form,
  setForm,
  loadDatabase,
  onSelectDatabase,
  selectedModule,
  onChangeMainFieldId,
  setIsCheckinDependentTable,
  getDataBaseApi,
  onSubmitGlobalForm,
  onChangeGlobalSection,
  sectionsList,
  serverList,
  selectedServer,
  onSelectServer
}: {
  databaseTable: Array<string>;
  onSelectTable: (data: any) => void;
  onChangeInput: any;
  form: Uiitem;
  setForm: any;
  loadDatabase: any;
  onSelectDatabase: (e: any) => void;
  selectedModule: string;
  onChangeMainFieldId: any;
  setIsCheckinDependentTable: any;
  getDataBaseApi: any;
  onSubmitGlobalForm: () => void;
  onChangeGlobalSection: (e: any) => void;
  sectionsList: any;
  serverList: Array<{ServerName: string}>;
  selectedServer: any;
  onSelectServer: any;
}) => {
  const [mainFieldArray, setMainFieldArray] = useState([]);
  const [isNewDb, setIsNewDb] = useState(false);
  const [isOldDb, setIsOldDb] = useState(false);
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
    <>
      {!isNewDb && !isOldDb && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Button
            color="primary"
            onClick={() => {
              setIsOldDb(false);
              setIsNewDb(true);
            }}
          >
            Create New DB{" "}
          </Button>{" "}
          OR{" "}
          <Button
            color="primary"
            onClick={() => {
              setIsNewDb(false);
              setIsOldDb(true);
            }}
          >
            Select Old DB{" "}
          </Button>
        </div>
      )}
      {isNewDb && (
        <div>
          <NewDbForm
            getDataBaseApi={getDataBaseApi}
            onClickBack={() => {
              setIsOldDb(false);
              setIsNewDb(false);
            }}
          />
        </div>
      )}
      {isOldDb && (
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
                  <Nav>
                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeTab === "1",
                        })}
                        onClick={() => {
                          toggle("1");
                        }}
                      >
                        Tab 1
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        href="#"
                        className={classnames({
                          active: activeTab === "2",
                        })}
                        onClick={() => {
                          toggle("2");
                        }}
                      >
                        Tab 2
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent activeTab={activeTab}>
                    <TabPane tabId="1">
                      <Form
                        style={{ flexWrap: "wrap", display: "flex", gap: 10 }}
                      >
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
                            options={serverList.map(res => {return {value: res.ServerName, label: res.ServerName}})}
                            onChange={(e) => {
                              onSelectServer(e);
                            }}
                          />
                        </FormGroup>
                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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

                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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
                                width: "100%",
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
                              onChangeGlobalSection(e);
                            }}
                          />
                        </FormGroup>
                        <FormGroup style={{ width: 282 }}>
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

                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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

                        {(form.inputtype === "BUTTON" ||
                          form.inputtype === "FILEUPLOAD") && (
                          <FormGroup style={{ width: 282 }}>
                            <Label
                              style={{
                                fontWeight: "bold",
                              }}
                            >
                              Button Operation
                            </Label>
                            <Input
                              name="ButtonOperation"
                              value={form.ButtonOperation || ""}
                              onChange={onChangeInput}
                            />
                          </FormGroup>
                        )}
                      </Form>
                    </TabPane>
                    <TabPane tabId="2">
                      <Form
                        style={{ flexWrap: "wrap", display: "flex", gap: 10 }}
                      >
                        {(form.inputtype === "BUTTON" ||
                          form.inputtype === "FILEUPLOAD") && (
                          <FormGroup style={{ width: 282 }}>
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
                                  checked={
                                    form?.IsButtonforFileUpload === false
                                  }
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
                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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

                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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
                                checked={
                                  form?.IsCheckinDependentTable === false
                                }
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
                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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
                        <FormGroup style={{ width: 282 }}>
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
                      </Form>
                    </TabPane>
                  </TabContent>
                  <Form
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <FormGroup>
                      <Button
                        color="primary"
                        onClick={() => {
                          onSubmitGlobalForm();
                        }}
                      >
                        Submit
                      </Button>
                    </FormGroup>
                    <FormGroup>
                      <Button
                        color="primary"
                        onClick={() => {
                          setIsNewDb(false);
                          setIsOldDb(false);
                        }}
                      >
                        BACK
                      </Button>
                    </FormGroup>
                  </Form>
                </div>
              </CSSTransition>
            </TransitionGroup>
          </Fragment>
        </div>
      )}
    </>
  );
};


export default GlobalForm;