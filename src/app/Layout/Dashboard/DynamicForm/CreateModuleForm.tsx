import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { MainMenuItem, PannelListT } from "./constant";
import { Menuitem, Submenuitem } from "../../AppNav/NavItems";
import { useSelector } from "react-redux";

function CreateModuleForm({
  modulesDetails,
  onChangeInput,
  setModulesDetails,
  pannelList,
  menuItemList,
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
    PanelID: string;
    MainMenuID: string;
  } | null;
  onChangeInput: (e: ChangeEvent<HTMLInputElement>) => void;
  setModulesDetails: any;
  pannelList: Array<PannelListT>;
  menuItemList: Array<MainMenuItem>;
}) {
  const token = useSelector((state: any) => state.authReducer.token);
  const [subMenuItems, setSubMenuItems] = useState<Array<Submenuitem>>([]);

  useEffect(() => {
    if (modulesDetails?.MainMenuID) {
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
            if (Number(modulesDetails.MainMenuID) === res.MainMenuID) {
            const subMenu = res.submenuitems.find(res => res.MenuID === Number(modulesDetails.MenuID))
              setModulesDetails({...modulesDetails, ModuleName: subMenu?.SubmenuName})
              setSubMenuItems(res.submenuitems);
            }
          });
        })
        .catch((error) => {});
    }
  }, []);

  const onSelectMainMenuId = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          if (Number(e.target.value) === res.MainMenuID) {
            setSubMenuItems(res.submenuitems);
          }
        });
      })
      .catch((error) => {});
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 50,
        }}
      >
        <Form>
          <FormGroup>
            <Label
              style={{
                fontWeight: "bold",
              }}
            >
              Select Pannel
            </Label>
            <Input
              name="PanelID"
              type="select"
              value={modulesDetails?.PanelID}
              onChange={onChangeInput}
            >
              {pannelList?.map((response: PannelListT) => (
                <option value={response.PanelID}>{response.PanelName}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label
              style={{
                fontWeight: "bold",
              }}
            >
              Select Menu
            </Label>
            <Input
              name="MainMenuID"
              type="select"
              value={modulesDetails?.MainMenuID}
              onChange={(e) => {
                onChangeInput(e), onSelectMainMenuId(e);
              }}
            >
              {menuItemList?.map((response: MainMenuItem) => (
                <option value={response.MainMenuID}>
                  {response.MainMenuName}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label
              style={{
                fontWeight: "bold",
              }}
            >
              Select Sub Menu
            </Label>
            <Input
              name="MenuID"
              type="select"
              value={modulesDetails?.MenuID}
              onChange={(e) => {
                onChangeInput(e);
              }}
            >
              {subMenuItems?.map((response: Submenuitem) => (
                <option value={response.MenuID}>{response?.SubmenuName}</option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label
              style={{
                fontWeight: "bold",
              }}
            >
              Module Name
            </Label>
            <Input
              name="ModuleName"
              value={modulesDetails?.ModuleName}
              onChange={onChangeInput}
            />
          </FormGroup>
          <FormGroup>
            <Label
              style={{
                fontWeight: "bold",
              }}
            >
              ID Prefix
            </Label>
            <Input
              name="IDPrefix"
              value={modulesDetails?.IDPrefix}
              onChange={onChangeInput}
            />
          </FormGroup>
          <FormGroup>
            <Label
              style={{
                fontWeight: "bold",
              }}
            >
              ID Type Search
            </Label>
            <Input
              name="IDTypeSearch"
              value={modulesDetails?.IDTypeSearch}
              onChange={onChangeInput}
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
              Is Active
            </Label>
            <br />
            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <span>
                {" "}
                <Input
                  type="radio"
                  name="IsActive"
                  checked={modulesDetails?.IsActive}
                  onChange={(e) => {
                    const state = { ...modulesDetails, [e.target.name]: true };
                    setModulesDetails(state as any);
                  }}
                />{" "}
                TRUE
              </span>
              <span>
                {" "}
                <Input
                  type="radio"
                  name="IsActive"
                  checked={modulesDetails?.IsActive === false}
                  onChange={(e) => {
                    const state = { ...modulesDetails, [e.target.name]: false };
                    setModulesDetails(state as any);
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
              Display Tabular
            </Label>
            <br />
            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <span>
                {" "}
                <Input
                  type="radio"
                  name="DisplayTabular"
                  checked={modulesDetails?.DisplayTabular}
                  onChange={(e) => {
                    const state = { ...modulesDetails, [e.target.name]: true };
                    setModulesDetails(state as any);
                  }}
                />{" "}
                TRUE
              </span>
              <span>
                {" "}
                <Input
                  type="radio"
                  name="DisplayTabular"
                  checked={modulesDetails?.DisplayTabular === false}
                  onChange={(e) => {
                    const state = { ...modulesDetails, [e.target.name]: false };
                    setModulesDetails(state as any);
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
              Is ID Generate
            </Label>
            <br />
            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <span>
                {" "}
                <Input
                  type="radio"
                  name="IsIDGenerate"
                  checked={modulesDetails?.IsIDGenerate}
                  onChange={(e) => {
                    const state = { ...modulesDetails, [e.target.name]: true };
                    setModulesDetails(state as any);
                  }}
                />{" "}
                TRUE
              </span>
              <span>
                {" "}
                <Input
                  type="radio"
                  name="IsIDGenerate"
                  checked={modulesDetails?.IsIDGenerate === false}
                  onChange={(e) => {
                    const state = { ...modulesDetails, [e.target.name]: false };
                    setModulesDetails(state as any);
                  }}
                />{" "}
                FALSE
              </span>
            </div>
          </FormGroup>
        </Form>
      </div>
    </>
  );
}


export default CreateModuleForm;