import { Menuitem } from "@/app/Layout/AppNav/NavItems";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Form,
  FormGroup,
  Label,
  Input,
  ModalFooter,
  Button,
} from "reactstrap";
import Select from "react-select";
import axios from "axios";

export const EditHeader = ({
  isEditHeader,
  setIsEditHeader,
  headingName,
}: any) => {
  const [selectedPannelId, setSelectedPannelId] = useState("1");
  const [menuItems, setMenuItems] = useState<any>([]);
  const [menuHeaderName, setMenuHeaderName] = useState("");
  const [selectedMenu, setSelectedMenu] = useState([]);
  const [headerId, setHeaderId] = useState(0);

  useEffect(() => {
    getMenuItems();
  }, []);

  useEffect(() => {
    if (headingName) {
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
          const headerData = response.data.headersLists.find(
            (res: any) => res.HeaderName === headingName
          );
          const menuList = headerData.mainMenuLists.map((res: any) => {
            return {
              value: res.MainMenuID,
              label: res.MainMenuName,
            };
          });
          setSelectedMenu(menuList);
          setHeaderId(headerData.HeaderID);
          setMenuHeaderName(headerData.HeaderName);
        })
        .catch((error) => {});
    }
  }, []);

  const getMenuItems = () => {
    fetch(
      `https://logpanel.insurancepolicy4u.com/api/Login/GetMenuItems?ProjectType=${selectedPannelId}&Userid=${localStorage.getItem(
        "username"
      )}&device=1&ipaddress=122.76.54.19`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((response) => {
        const newArray = response?.menuitems?.map(
          (res: Menuitem, index: number) => {
            const Object = {
              icon: res.IconClassName,
              pannelName: res.PanelName,
              label: res.MainMenuName,
              IconClassName: res.IconClassName,
              IconHeight: res.IconHeight,
              IconPathUrl: res.IconPathUrl,
              IconWidth: res.IconWidth,
              IsSubmenu: res.IsSubmenu,
              mainMenuId: res.MainMenuID,
              MainMenuName: res.MainMenuName,
              MenuHeaderName: res.MenuHeaderName,
              PanelName: res.PanelName,
              subMenu: res.submenuitems?.map((response) => {
                const object = {
                  label: response.SubmenuName,
                  mainMenuId: res.MainMenuID,
                  menuId: response.MenuID,
                  to: response.PathUrl
                    ? `/${response.PathUrl}/${res.MainMenuID}/${response.MenuID}/${res.MenuHeaderName}`
                    : `/${res.MainMenuID}/${response.MenuID}`,
                  SubMenuIconClsName: response.SubMenuIconClsName,
                  SubmenuName: response.SubmenuName,
                  SubMenuSequenceNo: response.SubMenuSequenceNo,
                  SubmenuIconPathUrl: response.SubmenuIconPathUrl,
                  IsSubmenuActive: response.IsSubmenuActive,
                  DefaultDbname: response.DefaultDbname,
                  DefaultTabname: response.DefaultTablename,
                  PathUrl: response.PathUrl,
                  ModuleID: response.ModuleID,
                };
                return object;
              }),
              content: res.submenuitems?.map((response) => {
                if (response.IsSubmenuActive) {
                  const object = {
                    label: response.SubmenuName,
                    mainMenuId: res.MainMenuID,
                    menuId: response.MenuID,
                    to: response.PathUrl
                      ? `/${response.PathUrl}/${res.MainMenuID}/${response.MenuID}/${res.MenuHeaderName}`
                      : `/${res.MainMenuID}/${response.MenuID}`,
                    SubMenuIconClsName: response.SubMenuIconClsName,
                    SubmenuName: response.SubmenuName,
                    SubMenuSequenceNo: response.SubMenuSequenceNo,
                    SubmenuIconPathUrl: response.SubmenuIconPathUrl,
                    IsSubmenuActive: response.IsSubmenuActive,
                    DefaultDbname: response.DefaultDbname,
                    DefaultTabname: response.DefaultTablename,
                    PathUrl: response.PathUrl,
                    ModuleID: response.ModuleID
                  };
                  return object;
                }
              }),
            };
            return Object;
          }
        );
        setMenuItems(newArray);
      });
  };

  const onSubmitHeader = () => {
    const Params = {
      Userid: localStorage.getItem("username"),
      MenuHeaderID: headerId,
      MenuHeaderName: menuHeaderName,
      IsActive: true,
      menuLists: selectedMenu.map((res: any) => {
        return {
          MenuID: res.value,
          MenuName: res.label,
        };
      }),
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/Add_UpdateMenuHeaderName",
        Params,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setIsEditHeader(false);
      })
      .catch((error) => {});
  };

  return (
    <div>
      <Modal isOpen={isEditHeader}>
        <ModalHeader>Edit Menu Header</ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label style={{ fontWeight: 700 }}>Menu Header Name</Label>
              <Input
                placeholder="Add Menu Header Name"
                value={menuHeaderName}
                onChange={(e: any) => {
                  setMenuHeaderName(e.target.value);
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label style={{ fontWeight: 700 }}>Main Menu List</Label>
              <Select
                options={menuItems.map((response: any) => {
                  const object = {
                    label: response.MainMenuName,
                    value: response.mainMenuId,
                  };
                  return object;
                })}
                isMulti
                closeMenuOnSelect={false}
                value={selectedMenu}
                onChange={(e: any) => setSelectedMenu(e)}
              />
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              onSubmitHeader();
            }}
          >
            Submit
          </Button>
          <Button
            color="primary"
            onClick={() => {
              setIsEditHeader(false);
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
