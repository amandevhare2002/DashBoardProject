import React, { useEffect, useState, useCallback } from 'react';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import axios from 'axios';

interface Field {
  ServerName?: string;
  Items?: {
    parentValues: Array<{
      parentvalue: string;
      childfields: Array<{
        ChildFieldID: string;
        IsVisible: boolean;
      }>;
    }>;
  };
  [key: string]: any;
}

interface ModalDIVProps {
  field: Field;
  fieldIdArray: number[];
  toggle: () => void;
  setFieldArray: (fields: Field[]) => void;
}

const ModalDIV: React.FC<ModalDIVProps> = ({ field, fieldIdArray, toggle, setFieldArray }) => {
  const [updateField, setUpdateField] = useState<any>(field || []);
  const [serverList, setServerList] = useState<any[]>([]);
  const [loadDatabase, setLoadDatabase] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState({
    value: field.ServerName || "",
    label: field.ServerName || "",
  });

  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateField((prevState:any) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const addParentValue = useCallback(() => {
    setUpdateField((prevUpdateField:any) => ({
      ...prevUpdateField,
      Items: {
        ...prevUpdateField.Items,
        parentValues: [
          ...(prevUpdateField.Items?.parentValues || []),
          {
            parentvalue: "New Parent Value",
            childfields: [],
          },
        ],
      },
    }));
  }, []);

  const addChildField = useCallback((index: number) => {
    setUpdateField((prevUpdateField:any) => {
      const updatedParentValues = [...(prevUpdateField.Items?.parentValues || [])];
      const parentValueToUpdate = updatedParentValues[index];
      const newChildFieldID = parentValueToUpdate.childfields.length > 0
        ? parseInt(parentValueToUpdate.childfields[parentValueToUpdate.childfields.length - 1].ChildFieldID) + 1
        : 1;
      parentValueToUpdate.childfields.push({
        ChildFieldID: newChildFieldID.toString(),
        IsVisible: true,
      });
      return {
        ...prevUpdateField,
        Items: {
          ...prevUpdateField.Items,
          parentValues: updatedParentValues,
        },
      };
    });
  }, []);

  const getServerList = useCallback(() => {
    axios.post(
      "https://logpanel.insurancepolicy4u.com/api/Login/GetServerListAPI",
      { Userid: localStorage.getItem("username") },
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    .then((response) => {
      setServerList(response.data.ServerList);
    })
    .catch((error) => {
      console.error(error);
    });
  }, []);

  const getDatabase = useCallback(() => {
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/LoadDatabases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        "Userid": localStorage.getItem("username"),
        "product": "LoadDatabases",
        "type": selectedServer.value,
      }),
    })
    .then((response) => response.json())
    .then((response) => {
      setLoadDatabase(response?.Databases);
    })
    .catch((error) => {
      console.error(error);
    });
  }, [selectedServer.value]);

  useEffect(() => {
    getDatabase();
    getServerList();
  }, [getDatabase, getServerList]);

  const handleSubmit = async () => {
    try {
      const data = {
        "Userid": localStorage.getItem("username"),
        "Fields": [updateField],
        "Data": [
          {
            "Sno": "",
            "Month": "",
            "Date": "",
            "Year": "",
            "Timing": "",
            "Description": "",
            "Type": "",
            "Regulatation": "",
            "Company_Name": "",
            "Remarks": "",
            "colname": "",
            "EventDate": "",
            "CalenderType": "",
            "Mins": "",
          },
        ],
        "Table2": [
          { "ControlName": "TEXTBOX", "DefaultWidth": "25%" },
          { "ControlName": "RADIO", "DefaultWidth": "30%" },
          { "ControlName": "CHECKBOX", "DefaultWidth": "40%" },
          { "ControlName": "DROPDOWN", "DefaultWidth": "30%" },
          { "ControlName": "CALENDER", "DefaultWidth": "25%" },
        ],
      };

      const result = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsModuleWise",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (result?.data === "Success") {
        setFieldArray([]);
        toggle();
      }
    } catch (error) {
      console.error("error", error);
    }
  };

    const renderFormFields = () => {
      if (!updateField) return null;
      
      const fields = Object.keys(updateField);
      const result = [];
      let fieldIndex = 0;
  
      while (fieldIndex < fields.length) {
        const fld = fields[fieldIndex];
        console.log("fld", fld);
  
        switch(true) {
          // Case for boolean fields
          case ["IsActive", "IsMainCol", "IsMandatory", "DefaultVisible", "IsDependent", "IsMainCol"].includes(fld): {
            result.push(
              <div key={fieldIndex}>
                <FormGroup className='font-bold'>
                  <Label for={fld}>{fld}</Label>
                  <Input
                    id={fld}
                    name={fld}
                    type="select"
                    value={updateField[fld]}
                    onChange={onChangeInput}
                  >
                    <option>true</option>
                    <option>false</option>
                  </Input>
                </FormGroup>
              </div>
            );
            break;
          }

          // Case for Read Server Name
          case fld === 'ReadServername': {
            const serverOptions = [];
            let serverIndex = 0;
            
            while (serverList && serverIndex < serverList.length) {
              serverOptions.push(
                <option key={serverIndex}>{serverList[serverIndex]?.ServerName}</option>
              );
              serverIndex++;
            }
  
            result.push(
              <div key={fieldIndex}>
                <FormGroup className='w-full'>
                  <Label style={{ fontWeight: "bold" }}>Read Server Name</Label>
                  <Input
                    id="ReadServername"
                    name="ReadServername"
                    type="select"
                    placeholder="Select ReadServername"
                    value={updateField[fld]}
                    onChange={onChangeInput}
                  >
                    {serverOptions}
                  </Input>
                </FormGroup>
              </div>
            );
            break;
          }
  
          // Case for Server Name
          case fld === "ServerName": {
            const serverOptions = [];
            let serverIndex = 0;
            
            while (serverList && serverIndex < serverList.length) {
              serverOptions.push(
                <option key={serverIndex}>{serverList[serverIndex]?.ServerName}</option>
              );
              serverIndex++;
            }
  
            result.push(
              <div key={fieldIndex}>
                <FormGroup className='w-full'>
                  <Label style={{ fontWeight: "bold" }}>Server Name</Label>
                  <Input
                    id="ServerName"
                    name="ServerName"
                    type="select"
                    placeholder="Select Server"
                    value={updateField[fld]}
                    onChange={onChangeInput}
                  >
                    {serverOptions}
                  </Input>
                </FormGroup>
              </div>
            );
            break;
          }
  
          // Case for Database Name
          case fld === "Dbname": {
            const dbOptions = [];
            let dbIndex = 0;
            
            while (loadDatabase && dbIndex < loadDatabase.length) {
              dbOptions.push(
                <option key={dbIndex}>{loadDatabase[dbIndex].DatabaseName}</option>
              );
              dbIndex++;
            }
  
            result.push(
              <div key={fieldIndex}>
                <FormGroup className='font-bold'>
                  <Label style={{ fontWeight: "bold" }}>Select Database</Label>
                  <Input
                    id="Dbname"
                    name="Dbname"
                    type="select"
                    placeholder="Select Database"
                    value={updateField[fld]}
                    onChange={onChangeInput}
                  >
                    {dbOptions}
                  </Input>
                </FormGroup>
              </div>
            );
            break;
          }
  
          // Case for Items
          case fld === 'Items': {
            const parentValues = updateField[fld]?.parentValues || [];
            const parentElements = [];
            let parentIndex = 0;
  
            while (parentIndex < parentValues.length) {
              const parentValue = parentValues[parentIndex];
              const childFields = [];
              let childIndex = 0;
  
              while (childIndex < (parentValue.childfields?.length || 0)) {
                const childField = parentValue.childfields[childIndex];
                const fieldIdOptions = [];
                let fieldIdIndex = 0;
  
                while (fieldIdArray && fieldIdIndex < fieldIdArray.length) {
                  fieldIdOptions.push(
                    <option key={fieldIdIndex}>{fieldIdArray[fieldIdIndex]}</option>
                  );
                  fieldIdIndex++;
                }
  
                childFields.push(
                  <div key={childIndex} className='flex w-full justify-between'>
                    <FormGroup className='w-1/2'>
                      <Label style={{ fontWeight: "bold" }}>Child Field ID</Label>
                      <Input
                        id="Items.parentValues.childfields.ChildFieldID"
                        name="Items.parentValues.childfields.ChildFieldID"
                        type="select"
                        value={childField.ChildFieldID}
                        onChange={(e) => {
                          const updatedParentValues = [...(updateField?.Items?.parentValues || [])];
                          if (updatedParentValues[parentIndex] && updatedParentValues[parentIndex].childfields[childIndex]) {
                            updatedParentValues[parentIndex].childfields[childIndex].ChildFieldID = e.target.value;
                          }
                          setUpdateField((prevState:any) => ({
                            ...prevState,
                            Items: {
                              ...prevState.Items,
                              parentValues: updatedParentValues,
                            },
                          }));
                        }}
                      >
                        {fieldIdOptions}
                      </Input>
                    </FormGroup>
                    <FormGroup className='w-1/2'>
                      <Label style={{ fontWeight: "bold" }}>Is Visible</Label>
                      <Input
                        id="Items.parentValues.IsVisible"
                        name="Items.parentValues.IsVisible"
                        type="select"
                        value={childField.IsVisible.toString()}
                        onChange={(e) => {
                          const updatedParentValues = [...(updateField.Items?.parentValues || [])];
                          if (updatedParentValues[parentIndex] && updatedParentValues[parentIndex].childfields[childIndex]) {
                            updatedParentValues[parentIndex].childfields[childIndex].IsVisible = e.target.value === 'true';
                          }
                          setUpdateField((prevState:any) => ({
                            ...prevState,
                            Items: {
                              ...prevState.Items,
                              parentValues: updatedParentValues,
                            },
                          }));
                        }}
                      >
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </Input>
                    </FormGroup>
                  </div>
                );
                childIndex++;
              }
  
              parentElements.push(
                <div key={parentIndex}>
                  <Input
                    id={parentValue.parentvalue}
                    name={parentValue.parentvalue}
                    placeholder={parentValue.parentvalue}
                    type="text"
                    value={parentValue.parentvalue}
                    onChange={(e) => {
                      const updatedParentValues = [...(updateField?.Items?.parentValues || [])];
                      updatedParentValues[parentIndex].parentvalue = e.target.value;
                      setUpdateField((prevState:any) => ({
                        ...prevState,
                        Items: {
                          ...prevState.Items,
                          parentValues: updatedParentValues,
                        },
                      }));
                    }}
                  />
                  <Button onClick={() => addChildField(parentIndex)}>Add Child Field</Button>
                  <div className='flex flex-wrap'>
                    {childFields}
                  </div>
                </div>
              );
              parentIndex++;
            }
  
            result.push(
              <div key={fieldIndex} className='font-semibold'>
                <div className='flex justify-between w-full'>
                  <div className='text-2xl'>Items</div>
                  <Button color='primary' onClick={addParentValue}>Add New</Button>
                </div>
                {parentElements}
              </div>
            );
            break;
          }
  
          
  
          // Case for Read Database Name
          case fld === "ReadDbname": {
            const dbOptions = [];
            let dbIndex = 0;
            
            while (loadDatabase && dbIndex < loadDatabase.length) {
              dbOptions.push(
                <option key={dbIndex}>{loadDatabase[dbIndex].DatabaseName}</option>
              );
              dbIndex++;
            }
  
            result.push(
              <div key={fieldIndex}>
                <FormGroup className='font-bold'>
                  <Label style={{ fontWeight: "bold" }}>Select Read  Database</Label>
                  <Input
                    id="ReadDbname"
                    name="ReadDbname"
                    type="select"
                    placeholder="Select ReadDbname"
                    value={updateField[fld]}
                    onChange={onChangeInput}
                  >
                    {dbOptions}
                  </Input>
                </FormGroup>
              </div>
            );
            break;
          }
  
          // Default case for all other fields
          default: {
            result.push(
              <div key={fieldIndex}>
                <FormGroup className='font-bold'>
                  <Label for={fld}>{fld}</Label>
                  <Input
                    id={fld}
                    name={fld}
                    placeholder={fld}
                    type="text"
                    value={updateField[fld]}
                    onChange={onChangeInput}
                  />
                </FormGroup>
              </div>
            );
          }
        }
  
        fieldIndex++;
      }
  
      return result;
    };
  
  return (
    <Form>
      {/* {updateField && Object.keys(updateField).map((fld, index) =>
       {
        console.log("fld",fld)
        return (
          <div key={index}>
            {["IsActive", "IsMainCol", "IsMandatory", "DefaultVisible", "IsDependent", "IsMainCol"].includes(fld) ? (
              <FormGroup className='font-bold'>
                <Label for={fld}>{fld}</Label>
                <Input
                  id={fld}
                  name={fld}
                  type="select"
                  value={updateField[fld]}
                  onChange={onChangeInput}
                >
                  <option>true</option>
                  <option>false</option>
                </Input>
              </FormGroup>
            ) : fld === "ServerName" ? (
              <FormGroup className='w-full'>
                <Label style={{ fontWeight: "bold" }}>Server Name</Label>
                <Input
                  id="ServerName"
                  name="ServerName"
                  type="select"
                  placeholder="Select Server"
                  value={updateField[fld]}
                  onChange={onChangeInput}
                >
                  {serverList && serverList.map((res, idx) => (
                    <option key={idx}>{res?.ServerName}</option>
                  ))}
                </Input>
              </FormGroup>
            ) : fld === "Dbname" ? (
              <FormGroup className='font-bold'>
                <Label style={{ fontWeight: "bold" }}>Select Database</Label>
                <Input
                  id="Dbname"
                  name="Dbname"
                  type="select"
                  placeholder="Select Database"
                  value={updateField[fld]}
                  onChange={onChangeInput}
                >
                  {loadDatabase && loadDatabase.map((res, idx) => (
                    <option key={idx}>{res.DatabaseName}</option>
                  ))}
                </Input>
              </FormGroup>
            ) : fld === 'Items' ? (
              <div className='font-semibold'>
                <div className='flex justify-between w-full'>
                  <div className='text-2xl'>Items</div>
                  <Button color='primary' onClick={addParentValue}>Add New</Button>
                </div>
                {updateField && updateField[fld] && updateField[fld]?.parentValues && Array.isArray(updateField[fld]?.parentValues) && updateField[fld]?.parentValues.length > 0 && updateField[fld]?.parentValues.map((parentValue:any, parentIndex:any) => (
                  <div key={parentIndex}>
                    <Input
                      id={parentValue.parentvalue}
                      name={parentValue.parentvalue}
                      placeholder={parentValue.parentvalue}
                      type="text"
                      value={parentValue.parentvalue}
                      onChange={(e) => {
                        const updatedParentValues = [...(updateField?.Items?.parentValues || [])];
                        updatedParentValues[parentIndex].parentvalue = e.target.value;
                        setUpdateField((prevState:any) => ({
                          ...prevState,
                          Items: {
                            ...prevState.Items,
                            parentValues: updatedParentValues,
                          },
                        }));
                      }}
                    />
                    <Button onClick={() => addChildField(parentIndex)}>Add Child Field</Button>
                    <div className='flex flex-wrap'>
                      {parentValue.childfields?.map((childField:any, childIndex:any) => (
                        <div key={childIndex} className='flex w-full justify-between'>
                          <FormGroup className='w-1/2'>
                            <Label style={{ fontWeight: "bold" }}>Child Field ID</Label>
                            <Input
                              id="Items.parentValues.childfields.ChildFieldID"
                              name="Items.parentValues.childfields.ChildFieldID"
                              type="select"
                              value={childField.ChildFieldID}
                              onChange={(e) => {
                                const updatedParentValues = [...(updateField?.Items?.parentValues || [])];
                                if (updatedParentValues[parentIndex] && updatedParentValues[parentIndex].childfields[childIndex]) {
                                  updatedParentValues[parentIndex].childfields[childIndex].ChildFieldID = e.target.value;
                                }
                                setUpdateField((prevState:any) => ({
                                  ...prevState,
                                  Items: {
                                    ...prevState.Items,
                                    parentValues: updatedParentValues,
                                  },
                                }));
                              }}
                            >
                              {fieldIdArray && fieldIdArray.map((id, idx) => (
                                <option key={idx}>{id}</option>
                              ))}
                            </Input>
                          </FormGroup>
                          <FormGroup className='w-1/2'>
                            <Label style={{ fontWeight: "bold" }}>Is Visible</Label>
                            <Input
                              id="Items.parentValues.IsVisible"
                              name="Items.parentValues.IsVisible"
                              type="select"
                              value={childField.IsVisible.toString()} // Convert boolean to string for the select input
                              onChange={(e) => {
                                const updatedParentValues = [...(updateField.Items?.parentValues || [])];
                                if (updatedParentValues[parentIndex] && updatedParentValues[parentIndex].childfields[childIndex]) {
                                  updatedParentValues[parentIndex].childfields[childIndex].IsVisible = e.target.value === 'true'; // Convert string to boolean
                                }
                                setUpdateField((prevState:any) => ({
                                  ...prevState,
                                  Items: {
                                    ...prevState.Items,
                                    parentValues: updatedParentValues,
                                  },
                                }));
                              }}
                            >
                              <option value="true">true</option>
                              <option value="false">false</option>
                            </Input>
                          </FormGroup>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : fld === 'ReadServername' ? (
              <FormGroup className='w-full'>
                <Label style={{ fontWeight: "bold" }}>Server Name</Label>
                <Input
                  id="ReadServername"
                  name="ReadServername"
                  type="select"
                  placeholder="Select ReadServername"
                  value={updateField[fld]}
                  onChange={onChangeInput}
                >
                  {serverList && serverList.map((res, idx) => (
                    <option key={idx}>{res?.ServerName}</option>
                  ))}
                </Input>
              </FormGroup>
            ) : fld === "ReadDbname" ? (
              <FormGroup className='font-bold'>
                <Label style={{ fontWeight: "bold" }}>Select Database</Label>
                <Input
                  id="ReadDbname"
                  name="ReadDbname"
                  type="select"
                  placeholder="Select ReadDbname"
                  value={updateField[fld]}
                  onChange={onChangeInput}
                >
                  {loadDatabase && loadDatabase.map((res, idx) => (
                    <option key={idx}>{res.DatabaseName}</option>
                  ))}
                </Input>
              </FormGroup>
            ): (
              <FormGroup className='font-bold'>
                <Label for={fld}>{fld}</Label>
                <Input
                  id={fld}
                  name={fld}
                  placeholder={fld}
                  type="text"
                  value={updateField[fld]}
                  onChange={onChangeInput}
                />
              </FormGroup>
            )}
          </div>
        )
       })
      } */}
      {
        renderFormFields()
      }
      <Button color='primary' onClick={handleSubmit}>Submit</Button>
    </Form>
  );
};

export default ModalDIV;