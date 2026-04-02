import Select from "react-select";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import { Uiitem } from "../DynamicUI/interface";

const CreateBulkModalForm = ({
  databaseColumn,
  onSelectColumn,
  onChangeInput,
  form,
  onChangeValuesStaticDbApiComputed,
  onSelectValueDbName,
  onSelectValueTableName,
  onSelectValueColumnName,
  valueColumn,
  onSelectSearchColumn,
  valueDatabase,
  valueTable,
  onChangeStatisFieldValue,
  onClickPlus,
  onClickRemove,
  onClickUpdateField,
  onClickResetField,
}: {
  databaseColumn: Array<string>;
  onSelectColumn: (data: any, index: number) => void;
  onChangeInput: any;
  form: Array<Uiitem>;
  onChangeValuesStaticDbApiComputed: any;
  onSelectValueDbName: any;
  onSelectValueTableName: any;
  onSelectValueColumnName: any;
  valueColumn: any;
  onSelectSearchColumn: any;
  valueDatabase: Array<string>;
  valueTable: Array<string>;
  onChangeStatisFieldValue: any;
  onClickPlus: any;
  onClickRemove: any;
  onClickUpdateField: (index: number) => void;
  onClickResetField: (index: number) => void;
}) => {
  // console.log(form)
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 5,
        flexDirection: "column",
        width: "100%",
      }}
    >
      {form.map((res: Uiitem, formindex: number) => {
        const newData = JSON.parse(res?.dataBaseColumnArray?.columnLists?.[0].ColumnName|| '[]')
        const newData2 = JSON.parse(res?.valueColumnArray?.columnLists?.[0].ColumnName|| '[]')
        if (!res.updated) {
          return (
            <Form
              style={{
                display: "flex",
                width: "100%",
                gap: 5,
              }}
            >
              <FormGroup>
                <Label
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                  }}
                >
                  DB Column Name
                </Label>
                <Select
                  options={newData?.map((res: any) => {
                    const object = {
                      value: res,
                      label: res,
                    };
                    return object;
                  })}
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      width: 100,
                      height: 28,
                      fontSize: 10,
                      minHeight: 28,
                    }),
                  }}
                  value={res?.DBColumnName}
                  onChange={(e) => {
                    onSelectColumn(e, formindex);
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                  }}
                >
                  FieldName
                </Label>
                <Input
                  name="FieldName"
                  value={res?.FieldName}
                  style={{ fontSize: 10, height: 28, width: 70 }}
                  onChange={(e) => {
                    onChangeInput(e, formindex);
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                  }}
                >
                  RowIDX
                </Label>
                <Input
                  value={res?.RowIDX + 1}
                  style={{ fontSize: 10, height: 28, width: 70 }}
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                  }}
                >
                  ColIDX
                </Label>
                <Input
                  value={res?.ColIDX + 1}
                  style={{ fontSize: 10, height: 28, width: 70 }}
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                  }}
                >
                  Input Type
                </Label>
                <Input
                  name="inputtype"
                  type="select"
                  value={res?.inputtype}
                  style={{ fontSize: 10, height: 28, width: 70 }}
                  onChange={(e) => {
                    onChangeInput(e, formindex);
                  }}
                >
                  <option>TEXTBOX</option>
                  <option>DROPDOWN</option>
                  <option>LABEL</option>
                  <option>BUTTON</option>
                  <option>FILEUPLOAD</option>
                </Input>
              </FormGroup>

              {(res?.inputtype === "BUTTON" ||
                res?.inputtype === "FILEUPLOAD") && (
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Button Event URL
                  </Label>
                  <Input
                    name="ButtonEventURL"
                    value={res?.ButtonEventURL || ""}
                    onChange={(e) => {
                      onChangeInput(e, formindex);
                    }}
                  />
                </FormGroup>
              )}

              <FormGroup>
                <Label
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                  }}
                >
                  Values Static
                </Label>
                <Select
                  value={{
                    value: res?.ValuesStaticDbApiComputed,
                    label: res?.ValuesStaticDbApiComputed,
                  }}
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      width: 70,
                      height: 28,
                      fontSize: 10,
                      minHeight: 28,
                    }),
                  }}
                  options={[
                    { value: "0", label: "0" },
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3" },
                  ]}
                  onChange={(e) => {
                    onChangeValuesStaticDbApiComputed(e, formindex);
                  }}
                />
              </FormGroup>

              <FormGroup>
                <Label
                  style={{
                    fontWeight: "bold",
                    fontSize: 10,
                  }}
                >
                  ToolTip Text
                </Label>
                <Input
                  name="ToolTiptext"
                  value={res?.ToolTiptext || ""}
                  style={{ fontSize: 10, height: 28, width: 70 }}
                  onChange={(e) => {
                    onChangeInput(e, formindex);
                  }}
                />
              </FormGroup>
              {(res?.inputtype === "BUTTON" ||
                res?.inputtype === "FILEUPLOAD") && (
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Button Operation
                  </Label>
                  <Input
                    name="ButtonOperation"
                    value={res?.ButtonOperation || ""}
                    onChange={(e) => {
                      onChangeInput(e, formindex);
                    }}
                  />
                </FormGroup>
              )}
              {res?.ValuesStaticDbApiComputed === "1" &&
                res?.staticfieldvalue?.map((res, index) => {
                  return (
                    <FormGroup
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        width: 158,
                      }}
                    >
                      <Input
                        value={res.Value}
                        style={{ marginTop: 28, height: 28, fontSize: 10 }}
                        onChange={(e) => {
                          onChangeStatisFieldValue(e, index, formindex);
                        }}
                      />
                      <i
                        className="pe-7s-plus"
                        style={{
                          fontSize: 25,
                          cursor: "pointer",
                          marginTop: 28,
                        }}
                        onClick={() => {
                          onClickPlus(index, formindex);
                        }}
                      />
                      {index !== 0 && (
                        <i
                          className="pe-7s-close"
                          style={{
                            fontSize: 30,
                            cursor: "pointer",
                            marginTop: 28,
                          }}
                          onClick={() => {
                            onClickRemove(index, formindex);
                          }}
                        />
                      )}
                    </FormGroup>
                  );
                })}
              {(res?.ValuesStaticDbApiComputed === "2" ||
                res?.ValuesStaticDbApiComputed === "3") && [
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Value Db Name
                  </Label>
                  <Select
                    options={res?.valueDatabaseArray?.map((res: any) => {
                      const object = {
                        value: res,
                        label: res,
                      };
                      return object;
                    })}
                    value={res?.valueDbName}
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        width: 100,
                        height: 28,
                        fontSize: 10,
                        minHeight: 28,
                      }),
                    }}
                    onChange={(e) => {
                      onSelectValueDbName(e, formindex);
                    }}
                  />
                </FormGroup>,
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    value Table Name
                  </Label>
                  <Select
                    options={res?.valueTableArray?.map((res: any) => {
                      const object = {
                        value: res,
                        label: res,
                      };
                      return object;
                    })}
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        width: 100,
                        height: 28,
                        fontSize: 10,
                        minHeight: 28,
                      }),
                    }}
                    value={res?.valueTableName}
                    onChange={(e) => {
                      onSelectValueTableName(e, formindex);
                    }}
                  />
                </FormGroup>,
                <FormGroup>
                  <Label
                    style={{
                      fontWeight: "bold",
                      fontSize: 10,
                    }}
                  >
                    Value Column Name
                  </Label>
                  <Select
                    options={newData2?.map((res: any) => {
                      const object = {
                        value: res,
                        label: res,
                      };
                      return object;
                    })}
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        width: 100,
                        height: 28,
                        fontSize: 10,
                        minHeight: 28,
                      }),
                    }}
                    value={res?.ValueColumnName}
                    onChange={(e) => {
                      onSelectValueColumnName(e, formindex);
                    }}
                  />
                </FormGroup>,
                res?.ValuesStaticDbApiComputed === "3" && (
                  <FormGroup>
                    <Label
                      style={{
                        fontWeight: "bold",
                        fontSize: 10,
                      }}
                    >
                      Search Column
                    </Label>
                    <Select
                      options={newData2?.map((res: any) => {
                        const object = {
                          value: res,
                          label: res,
                        };
                        return object;
                      })}
                      styles={{
                        control: (baseStyles, state) => ({
                          ...baseStyles,
                          width: 100,
                          height: 28,
                          fontSize: 10,
                          minHeight: 28,
                        }),
                      }}
                      value={res?.SearchColumn}
                      onChange={(e) => {
                        onSelectSearchColumn(e, formindex);
                      }}
                    />
                  </FormGroup>
                ),

                res?.ValuesStaticDbApiComputed === "3" && (
                  <FormGroup>
                    <Label
                      style={{
                        fontWeight: "bold",
                        fontSize: 10,
                      }}
                    >
                      Search Value DropDown
                    </Label>
                    <Input
                      name="SearchValueDropDown"
                      value={res?.SearchValueDropDown}
                      style={{ height: 28, fontSize: 10, width: 100 }}
                      onChange={(e) => {
                        onChangeInput(e, formindex);
                      }}
                    />
                  </FormGroup>
                ),
              ]}
              <FormGroup>
                <Button
                  onClick={() => {
                    onClickResetField(formindex);
                  }}
                  color="primary"
                  style={{ marginTop: 24 }}
                >
                  Reset
                </Button>
              </FormGroup>
            </Form>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
};


export default CreateBulkModalForm;