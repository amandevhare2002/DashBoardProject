import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import cx from "classnames";
import Switch from "react-switch";
import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { ModalComponent } from "../../Modal";
import { SubMenuForm } from "./SubMenuForm";

export const MainMenuForm = ({
  callBackMenu,
  MainMenuData,
  onChangeInput,
  setMainMenuData,
  subMenuData,
  setSubMenuData,
}: any) => {
  const [loadDatabase, setLoadDatabase] = useState([]);
  const [databaseTables, setDatabaseTables] = useState<Array<string>>([]);
  const [headerList, setHeaderList] = useState<any>([]);
  const [serverList, setServerList] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState<any>(false);
  const [selectedServer, setSelectedServer] = useState({
    value: subMenuData ? subMenuData?.ServerName : "",
    label: subMenuData ? subMenuData?.ServerName : "",
  });
  const [subMenuNewData, setSubMenuNewData] = useState<{
    MainMenuID: string;
    MenuID: string;
    SubmenuName: string;
    IsActive: Boolean;
    PanelID: string;
    SubMenuSequenceNo: string;
    DeviceType: string;
    IconPathUrl: string;
    SubMenuIconClsName: string;
    DefaultDbname: string;
    DefaultTabname: string;
    PathUrl: string;
    HeaderID: number;
    HeaderName: string;
    Servername: string;
    LinkURL: string;
  }>({
    MainMenuID: "",
    MenuID: "0",
    SubmenuName: "",
    IsActive: false,
    PanelID: "",
    SubMenuSequenceNo: "1",
    DeviceType: "0",
    IconPathUrl: "",
    SubMenuIconClsName: "pe-7s-check",
    DefaultDbname: "",
    DefaultTabname: "",
    PathUrl: "",
    HeaderID: 0,
    HeaderName: "",
    Servername: "",
    LinkURL: "",
  });

  const onChangeInputSubMenu = (e: any) => {
    const state = {
      ...subMenuNewData,
      [e.target.name]: e.target.value,
    };
    // console.log("state",state)
    setSubMenuNewData(state);
  };

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
      PanelID: Number(sessionStorage.getItem("panelID"))
        ? Number(sessionStorage.getItem("panelID"))
        : 1,
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

  const getDatabase = (type: any) => {
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
        type: type ? type : selectedServer?.value && selectedServer?.value,
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
    if (MainMenuData.DefaultDBname) {
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
            type: !!selectedServer.value && selectedServer.value,
            databaseName: MainMenuData.DefaultDBname,
          }),
        }
      )
        .then((response) => response.json())
        .then((response) => {
          console.log("resp", response);
          // const newTable = response?.Tables?.map((res: any) => {
          //   return {
          //     Tablename: res?.Tablename,
          //     DefaultDBname: subMenuData.DefaultDbname,
          //   };
          // });
          setDatabaseTables(response?.Tables);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [MainMenuData]);

  const onSelectServer = (e: { value: string; label: string }) => {
    const state = {
      ...MainMenuData,
      ["ServerName"]: e.value,
    };
    setMainMenuData(state);
    // setSubMenuData(state);
    setSelectedServer(e);
    getDatabase(e.value);
  };
  const AddSubMenuList = () => {
    fetch(
      "https://logpanel.insurancepolicy4u.com/api/Login/Add_UpdateSubMenuList",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Userid: localStorage.getItem("username"),
          MainMenuID: subMenuNewData.MainMenuID,
          MenuID: subMenuNewData.MenuID ? subMenuData.MenuID : 0, //Pass 0 for NEW
          SubmenuName: subMenuNewData.SubmenuName,
          IsActive: subMenuNewData.IsActive,
          PanelID: Number(sessionStorage.getItem("panelID"))
            ? Number(sessionStorage.getItem("panelID"))
            : 1,
          SubMenuSequenceNo: subMenuNewData.SubMenuSequenceNo,
          DeviceType: subMenuNewData.DeviceType,
          IconPathUrl: subMenuNewData.IconPathUrl,
          SubMenuIconClsName: subMenuNewData.SubMenuIconClsName,
          DefaultDbname: subMenuNewData.DefaultDbname,
          DefaultTabname: subMenuNewData.DefaultTabname,
          PathUrl: subMenuNewData.PathUrl,
          HeaderID: subMenuNewData.HeaderID,
          HeaderName: subMenuNewData.HeaderName,
          Servername: subMenuNewData.Servername,
          LinkURL: subMenuNewData.LinkURL,
        }),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        sessionStorage.removeItem("appsideData");
        callBackMenu?.();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    setSubMenuNewData((prevState) => ({
      ...prevState,
      MainMenuID: MainMenuData.MainMenuID, // Update mainMenuID
    }));
  }, [isModalOpen, MainMenuData.mainMenuId]);
  // console.log("main menu data",MainMenuData,"sub menuu data",subMenuData);
  return (
    <div>
      <ModalComponent
        visible={isModalOpen}
        width={'100%'}
        isfullscreen={true}
        showFooter
        onSubmit={() => {
          setIsModalOpen(false);
          AddSubMenuList();
        }}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title="Add Sub Menu "
        content={() => (
          <SubMenuForm
            subMenuData={subMenuNewData}
            onChangeInput={onChangeInputSubMenu}
            setSubMenuData={setSubMenuNewData}
            onChangeSelectedDb={(e: any) => {
              const state = {
                ...subMenuNewData,
                ["DefaultDbname"]: e.value,
              };
              setSubMenuNewData(state);
            }}
            onChangeSelectedTable={(e: any) => {
              const state = {
                ...subMenuNewData,
                ["DefaultTabname"]: e.value,
              };
              setSubMenuNewData(state);
            }}
            onChangeSelectedHeader={(e: any) => {
              const state = {
                ...subMenuNewData,
                ["HeaderID"]: e.value,
                ["HeaderName"]: e.label,
              };
              setSubMenuNewData(state);
            }}
          />
        )}
      />
      <Form
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <FormGroup style={{ width: "45%" }}>
          <Label style={{ fontWeight: "bold" }}>Main Menu Name</Label>
          <Input
            value={MainMenuData.MainMenuName}
            onChange={onChangeInput}
            name="MainMenuName"
          />
        </FormGroup>
        <FormGroup style={{ width: "45%" }}>
          <Label style={{ fontWeight: "bold" }}>Main Menu Logo path</Label>
          <Input
            value={MainMenuData.MainMenuLogopath}
            onChange={onChangeInput}
            name="MainMenuLogopath"
          />
        </FormGroup>
        <FormGroup style={{ width: "45%" }}>
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
                checked={MainMenuData.IsActive}
                onChange={(e) => {
                  const state = {
                    ...MainMenuData,
                    [e.target.name]: true,
                  };
                  setMainMenuData(state);
                }}
              />{" "}
              TRUE
            </span>
            <span>
              {" "}
              <Input
                type="radio"
                name="IsActive"
                checked={MainMenuData.IsActive === false}
                onChange={(e) => {
                  const state = {
                    ...MainMenuData,
                    [e.target.name]: false,
                  };
                  setMainMenuData(state);
                }}
              />{" "}
              FALSE
            </span>
          </div>
        </FormGroup>
        <FormGroup style={{ width: "45%" }}>
          <Label style={{ fontWeight: "bold" }}>Icon Height</Label>
          <Input
            value={MainMenuData.IconHeight}
            onChange={onChangeInput}
            name="IconHeight"
          />
        </FormGroup>
        <FormGroup style={{ width: "45%" }}>
          <Label style={{ fontWeight: "bold" }}>Icon Width</Label>
          <Input
            value={MainMenuData.IconWidth}
            onChange={onChangeInput}
            name="IconWidth"
          />
        </FormGroup>
        <FormGroup style={{ width: "45%" }}>
          <Label style={{ fontWeight: "bold" }}>Icon Class Name</Label>
          <Input
            value={MainMenuData.IconClassName}
            onChange={onChangeInput}
            name="IconClassName"
          />
        </FormGroup>
        <FormGroup style={{ width: "45%" }}>
          <Label style={{ fontWeight: "bold" }}>Menu Sequence No</Label>
          <Input
            value={MainMenuData.MenuSequenceNo}
            onChange={onChangeInput}
            name="MenuSequenceNo"
          />
        </FormGroup>

        <FormGroup style={{ width: "45%" }}>
          <Label
            style={{
              fontWeight: "bold",
            }}
          >
            Server Name
          </Label>
          <Select
            placeholder="Select Server "
            value={
              MainMenuData.ServerName
                ? {
                    value: MainMenuData.ServerName,
                    label: MainMenuData.ServerName,
                  }
                : selectedServer
            }
            options={serverList.map((res: any) => {
              return { value: res.ServerName, label: res.ServerName };
            })}
            onChange={(e: any) => {
              onSelectServer(e);
            }}
          />
        </FormGroup>
        <FormGroup style={{ width: "45%" }}>
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
              value: MainMenuData.DefaultDBname,
              label: MainMenuData.DefaultDBname,
            }}
            onChange={(e: any) => {
              const state = {
                ...MainMenuData,
                ["DefaultDBname"]: e.value,
              };
              setMainMenuData(state);
            }}
          />
        </FormGroup>
        <FormGroup style={{ width: "45%" }}>
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
              value: MainMenuData.DefaultTableName,
              label: MainMenuData.DefaultTableName,
            }}
            onChange={(e: any) => {
              const state = {
                ...MainMenuData,
                ["DefaultTableName"]: e.value,
              };
              setMainMenuData(state);
            }}
          />
        </FormGroup>
        <FormGroup style={{ width: "45%" }}>
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
              value: MainMenuData.HeaderID,
              label: MainMenuData.HeaderName,
            }}
            onChange={(e: any) => {
              console.log("e", e);
              const state = {
                ...MainMenuData,
                ["HeaderName"]: e.label,
                ["HeaderID"]: e.value,
              };
              setMainMenuData(state);
            }}
          />
        </FormGroup>
        <FormGroup style={{ width: "45%" }}></FormGroup>

        <FormGroup style={{ width: "100%" }}>
          <Label style={{ fontWeight: "bold" }}>
            Sub Menu List{" "}
            <Button onClick={() => setIsModalOpen(!isModalOpen)}>
              Add Sub Menu
            </Button>{" "}
          </Label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {subMenuData?.map((subMenu: any, index: number) => (
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <Switch
                  checked={subMenu.IsSubmenuActive}
                  onChange={(checked) => {
                    setSubMenuData(index, checked, subMenu);
                  }}
                  onColor="#86d3ff"
                  onHandleColor="#2693e6"
                  handleDiameter={20}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                  height={12}
                  width={38}
                  className="react-switch"
                  id="material-switch"
                />
                <Label>{subMenu?.label}</Label>{" "}
              </div>
            ))}
          </div>
        </FormGroup>
      </Form>
    </div>
  );
};
