import { useEffect, useState } from "react";
import { Form, FormGroup, Input, Label } from "reactstrap";
import Select from "react-select";
import axios from "axios";
import CreatableSelect from 'react-select/creatable';

export const SubMenuForm = ({
  subMenuData,
  onChangeInput,
  setSubMenuData,
  onChangeSelectedDb,
  onChangeSelectedTable,
  onChangeSelectedHeader,
}: any) => {
  console.log("subMenuData",subMenuData)
  const [loadDatabase, setLoadDatabase] = useState([]);
  const [databaseTables, setDatabaseTables] = useState<Array<string>>([]);
  const [headerList, setHeaderList] = useState<any>([]);
  const [serverList, setServerList] = useState<any>([]);
  const [selectedServer, setSelectedServer] = useState({
    value: subMenuData.Servername ? subMenuData.Servername : "",
    label: subMenuData.Servername ? subMenuData.Servername : "",
  });
  // console.log("selected Serverver",selectedServer)
  console.log("loadDataBase",loadDatabase)
  useEffect(() => {
    getHeaderList();
    getServerList();
  }, []);


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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        setServerList(response.data.ServerList);
      })
      .catch((error) => {});
  };

  const getHeaderList = () => {
    const Params = {
      Userid: localStorage.getItem("username"),
      PanelID: Number(sessionStorage.getItem("panelID")) ? Number(sessionStorage.getItem("panelID")) : 1,
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetHeadersList",
        Params,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setHeaderList(response.data.headersLists);
      })
      .catch((error) => {});
  };

  // console.log("Header list",headerList)
  // const getDatabase = (type?: string) => {
  //   fetch("https://metabase.pkgrp.in/LoadDatabases", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "Access-Control-Allow-Origin": "*",
  //     },
  //     body: JSON.stringify({
  //       authConfiguration: {
  //         tokenAuth: "123ABC",
  //         macAddress: "string",
  //         product: "LoadDatabases",
  //         type: type || "Cloud",
  //       },
  //       databaseType: "",
  //       server: "",
  //       username: "",
  //       password: "",
  //     }),
  //   })
  //     .then((response) => response.json())
  //     .then((response) => {
  //       setLoadDatabase(response);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };
  console.log("selectedServer",selectedServer)
  const getDatabase = (type:any) => {
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
        "type": type ? type : selectedServer?.value && selectedServer?.value,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        setLoadDatabase(response?.Databases); 
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    if (subMenuData.DefaultDbname) {
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
          "type": !!selectedServer.value && selectedServer.value,
          "databaseName": subMenuData.DefaultDbname
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log("resp", response)
          // const newTable = response?.Tables?.map((res: any) => {
          //   return {
          //     Tablename: res?.Tablename,
          //     DbName: subMenuData.DefaultDbname,
          //   };
          // });
          setDatabaseTables(response?.Tables);
           
        })
        .catch((error) => {
           
          console.log(error);
        });
    }
  }, [subMenuData]);

  const onSelectServer = (e: { value: string; label: string }) => {
    const state = {
      ...subMenuData,
      ["Servername"]: e.value,
    };
    setSubMenuData(state);
    setSelectedServer(e);
    getDatabase(e.value);
  };


  return (
    <div>
      <Form style={{display:"flex",flexWrap:"wrap",gap:"10px",justifyContent:"space-evenly",alignItems:"center"}}>
        <FormGroup style={{width:"40%"}}>
          <Label style={{ fontWeight: "bold" }}>Sub Menu Name</Label>
          <Input
            value={subMenuData.SubmenuName}
            onChange={onChangeInput}
            name="SubmenuName"
          />
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
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
                checked={subMenuData.IsActive}
                onChange={(e) => {
                  const state = {
                    ...subMenuData,
                    [e.target.name]: true,
                  };
                  setSubMenuData(state);
                }}
              />{" "}
              TRUE
            </span>
            <span>
              {" "}
              <Input
                type="radio"
                name="IsActive"
                checked={subMenuData.IsActive === false}
                onChange={(e) => {
                  const state = {
                    ...subMenuData,
                    [e.target.name]: false,
                  };
                  setSubMenuData(state);
                }}
              />{" "}
              FALSE
            </span>
          </div>
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
          <Label style={{ fontWeight: "bold" }}>Sub Menu Sequence No</Label>
          <Input
            value={subMenuData.SubMenuSequenceNo}
            onChange={onChangeInput}
            name="SubMenuSequenceNo"
          />
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
          <Label style={{ fontWeight: "bold" }}>Device Type</Label>
          <Input
            value={subMenuData.DeviceType}
            onChange={onChangeInput}
            name="DeviceType"
          />
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
          <Label style={{ fontWeight: "bold" }}>Icon Path Url</Label>
          <Input
            value={subMenuData.IconPathUrl}
            onChange={onChangeInput}
            name="IconPathUrl"
          />
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
          <Label style={{ fontWeight: "bold" }}>Sub Menu Icon Cls Name</Label>
          <Input
            value={subMenuData.SubMenuIconClsName}
            onChange={onChangeInput}
            name="SubMenuIconClsName"
          />
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
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
            options={serverList.map((res: any) => {
              return { value: res.ServerName, label: res.ServerName };
            })}
            onChange={(e: any) => {
              onSelectServer(e);
            }}
          />
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
          <Label style={{ fontWeight: "bold" }}>Select Database</Label>
          <Select
            options={loadDatabase?.map((res: any) => {
              const object = {
                value: res?.DatabaseName,
                label: res?.DatabaseName,
              };
              return object;
            })}
            value={{
              value: subMenuData.DefaultDbname,
              label: subMenuData.DefaultDbname,
            }}
            onChange={(e: any) => {
              onChangeSelectedDb(e);
            }}
          />
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
          <Label style={{ fontWeight: "bold" }}>Select Tables</Label>
          <Select
            options={databaseTables?.map((res: any) => {
              const object = {
                value: res.Tablename,
                label: res.Tablename,
              };
              return object;
            })}
            value={{
              value: subMenuData.DefaultTabname,
              label: subMenuData.DefaultTabname,
            }}
            onChange={(e: any) => {
              onChangeSelectedTable(e);
            }}
          />
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
          <Label style={{ fontWeight: "bold" }}>Select Header</Label>
          <Select
            options={headerList?.map((res: any) => {
              const object = {
                value: res.HeaderID,
                label: res.HeaderName,
              };
              return object;
            })}
            value={{
              value: subMenuData.HeaderID,
              label: subMenuData.HeaderName,
               
            }}
            onChange={(e: any) => {
              onChangeSelectedHeader(e);
            }}
          />
        </FormGroup>
        <FormGroup style={{width:"40%"}}>
          <Label style={{ fontWeight: "bold" }}>Path Url New</Label>
          {/* <Input
            value={subMenuData.PathUrl}
            onChange={onChangeInput}
            name="PathUrl"
          /> */}
          <CreatableSelect
          isClearable 
          options={[
            { value: 'viewReport', label: 'viewReport'}, 
            { value: 'posmodule', label: 'posmodule'},
            { value: 'mailbox', label: 'mailbox'},
            { value: 'approval-dashboard', label: 'approval-dashboard'},
            { value: 'expense', label: 'expense'},
            { value: 'party', label: 'party'},
            { value: 'page/hotel', label: 'page/hotel'},
          ]} 
          name="PathUrl"
          value={{
            value:subMenuData.PathUrl,
            label:subMenuData.PathUrl
          }}
          onChange={(e:any) => {
            console.log("ePathUrl",e)
            const state = {
             ...subMenuData,
            ["PathUrl"]: e?.value,
            };
            setSubMenuData(state);
          }}
          />
        </FormGroup>
        <div style={{display:"flex",width:"40%",gap:"10px"}}>
          <FormGroup style={{width:"45%"}}>
            <Label style={{ fontWeight: "bold" }}>Main Menu ID</Label>
            <Input
              value={subMenuData.MainMenuID}
              onChange={onChangeInput}
              name="MainMenuID"
              disabled={subMenuData.MainMenuID ? true:false}
            />
          </FormGroup>
          <FormGroup style={{width:"45%"}}>
            <Label style={{ fontWeight: "bold" }}>MenuID</Label>
            <Input
              value={subMenuData.MenuID}
              onChange={onChangeInput}
              name="MenuID"
              disabled={subMenuData.MenuID ? true:false}
            />
          </FormGroup>
        </div>
        <div className="w-[90%]">
        <FormGroup style={{width:"100%"}}>
          <Label style={{ fontWeight: "bold" }}>LinkURL </Label>
          <Input
            placeholder="LinkURL"
            value={subMenuData.LinkURL}
            onChange={onChangeInput}
            name="LinkURL"
            type="text"
          />
        </FormGroup>
        </div>
      </Form>
    </div>
  );
};
