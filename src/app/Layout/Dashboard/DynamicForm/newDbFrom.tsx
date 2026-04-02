import { useState } from "react";
import { Button, Form, FormGroup, Input } from "reactstrap";
import Select from "react-select";
import { useSelector } from "react-redux";

export const NewDbForm = ({getDataBaseApi, onClickBack}: {getDataBaseApi: any, onClickBack: any} ) => {
  const [nextForm, setNextForm] = useState(false);
  const token = useSelector((state: any) => state.authReducer.token);
  const [dbName, setDbName] = useState("");
  const [tableName, setTableName] = useState("");
  const [columnArray, setColumnArray] = useState([
    {
      columnName: "",
      dataType: "",
      size: 0,
      allowNulls: true,
      autoIncrement: false,
      scale: 0,
    },
  ]);

  const onClickNext = () => {
    fetch("https://metabase.pkgrp.in/CreateSqlServerDatabase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        authConfiguration: {
          tokenAuth: "123ABC",
          macAddress: "00-B0-D0-63-C2-26",
          product: "CreateSqlServerDatabase",
          type: "CreateSqlServerDatabase",
        },
        databaseType: "",
        server: "",
        databaseName: dbName,
        username: "",
        password: "",
      }),
    })
      .then((response) => {
        setNextForm(true);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onChangeStatisFieldValue = (e: any, index: number) => {
    const state = [...columnArray];
    state[index] = {
      ...state[index],
      columnName: e.target.value,
    };
    setColumnArray(state);
  };

  const onClickPlus = () => {
    const state = [...columnArray];
    state.push({
      columnName: "",
      dataType: "",
      size: 0,
      allowNulls: true,
      autoIncrement: false,
      scale: 0,
    });
    setColumnArray(state);
  };

  const onClickRemove = (index: number) => {
    const state = [...columnArray];
    state.splice(index, 1);
    setColumnArray(state);
  };

  const objectArray: any = ["numeric", "nvarchar", "bit", "datetime"]?.map(
    (res: any) => {
      const object = {
        value: res,
        label: res,
      };
      return object;
    }
  );

  const onClickSubmit = () => {
    const Params = {
      databaseType: "sql server",
      server: "61.246.34.128,9042",
      username: "sa",
      password: "Server$#@54321",
      databaseName: dbName,
      tableName: tableName,
      columns: columnArray,
      primaryKeyColumn: "",
    };
    fetch("https://metabase.pkgrp.in/CreateSqlServerTable", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(Params),
    })
      .then((response) => response.json())
      .then((response) => {
        getDataBaseApi(dbName, tableName);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      {!nextForm && (
        <Form>
          <FormGroup>
            <Input
              placeholder="Enter Db Name"
              value={dbName}
              onChange={(e) => {
                setDbName(e.target.value);
              }}
            />
          </FormGroup>
          <FormGroup style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="primary"
              onClick={() => {
                onClickNext();
              }}
            >
              Next
            </Button>
          </FormGroup>
          <FormGroup style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="primary"
              onClick={() => {
                onClickBack();
              }}
            >
              BACK
            </Button>
          </FormGroup>
        </Form>
      )}
      {nextForm && (
        <Form>
          <FormGroup>
            <Input
              placeholder="Enter Table Name"
              value={tableName}
              onChange={(e) => {
                setTableName(e.target.value);
              }}
            />
          </FormGroup>
          {columnArray?.map((res, index) => (
            <Form>
              <FormGroup
                style={{ display: "flex", alignItems: "center", gap: 5 }}
              >
                <Input
                  placeholder="Add Column Name"
                  value={res.columnName}
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
                      onClickRemove(index);
                    }}
                  />
                )}
              </FormGroup>
              <FormGroup>
                <Select
                  placeholder="Select Type"
                  value={res.dataType}
                  options={objectArray}
                  onChange={(e: any) => {
                    const state = [...columnArray];
                    state[index] = {
                      ...state[index],
                      dataType: e.value,
                    };
                    setColumnArray(state);
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Input
                  value={res.size}
                  onChange={(e) => {
                    const state = [...columnArray];
                    state[index] = {
                      ...state[index],
                      size: Number(e.target.value),
                    };
                    setColumnArray(state);
                  }}
                />
              </FormGroup>
            </Form>
          ))}
          <FormGroup style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="primary"
              onClick={() => {
                onClickSubmit();
              }}
            >
              Submit
            </Button>
          </FormGroup>
        </Form>
      )}
    </>
  );
};
