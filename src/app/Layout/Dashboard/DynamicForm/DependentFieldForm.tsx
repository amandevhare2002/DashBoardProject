import React, { useEffect, useState } from "react";
import { Form, FormGroup, Input } from "reactstrap";
import Select from "react-select";
import { useSelector } from "react-redux";

 function DependentFieldForm({ form, setForm, selectedModule }: any) {
  const [mainFieldArray, setMainFieldArray] = useState([]);
  const token = useSelector((state: any) => state.authReducer.token);

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

  return (
    <Form
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {form?.dependentFields?.map((res: any, index: number) => {
        return (
          <FormGroup
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              width: "100%",
            }}
          >
            <Input
              placeholder="Main Col Value"
              value={res.MainColValue}
              style={{ width: "50%" }}
              onChange={(e) => {
                const state = { ...form };
                state.dependentFields[index] = {
                  ...state.dependentFields[index],
                  MainColValue: e.target.value,
                };
                setForm(state);
              }}
            />

            <div style={{ width: "30%" }}>
              <Select
                placeholder="Select Conditional Fields"
                options={mainFieldArray}
                value={res?.SubcolID}
                onChange={(e: any) => {
                  const state = {
                    ...form,
                  };
                  state.dependentFields[index].SubcolID = e;
                  setForm(state);
                }}
              />
            </div>
            <i
              className="pe-7s-plus"
              style={{
                fontSize: 25,
                cursor: "pointer",
              }}
              onClick={() => {
                const state = { ...form };
                state.dependentFields.push({
                  MainFieldID: 0,
                  MainColValue: "",
                  ModuleID: 0,
                  SubcolID: 0,
                  IsActive: false,
                  FieldVisible: false,
                });
                setForm(state);
              }}
            />
            {index !== 0 && (
              <i
                className="pe-7s-close"
                style={{
                  fontSize: 30,
                  cursor: "pointer",
                }}
                onClick={() => {
                  const state = { ...form };
                  state.dependentFields.splice(index, 1);
                  setForm(state);
                }}
              />
            )}
          </FormGroup>
        );
      })}
    </Form>
  );
}


export default DependentFieldForm;