import { SubMenuForm } from "./SubMenuForm";
/**
 * src/components/Container.jsx
 * Author: H.Alper Tuna <halpertuna@gmail.com>
 * Date: 16.09.2016
 */

import classnames from "classnames";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ModalComponent } from "../../Modal";
import Item from "../containers/Item";
import { EditHeader } from "./EditHeader";
import { Collapse } from "reactstrap";
import AutoCallPage from "@/app/Layout/autocall";

const Container = (
  {
    items,
    visible,
    itemId,
    reduxStoreName,
    reduxUid,
    openMainModal,
    callBackMenu,
    headerList,
    FontColor,
    hoverColor,
  }: any,
  { classStore }: any
): any => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainMenuId, setMainMenuId] = useState<any>();
  const [isEditHeader, setIsEditHeader] = useState(false);
  const [headingName, setHeadingName] = useState("");
  const [subMenuData, setSubMenuData] = useState<{
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
    ModuleID: string;
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
    ModuleID: "",
  });

  const [updatedReminder, setUpdatedReminder] = useState<any>(null);

  const onChangeInput = (e: any) => {
    const state = {
      ...subMenuData,
      [e.target.name]: e.target.value,
    };
    setSubMenuData(state);
  };

  useEffect(() => {
    setSubMenuData({ ...subMenuData, ["MainMenuID"]: mainMenuId });
  }, [mainMenuId]);

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
          MainMenuID: subMenuData.MainMenuID || mainMenuId,
          MenuID: subMenuData.MenuID ? subMenuData.MenuID : 0, //Pass 0 for NEW
          SubmenuName: subMenuData.SubmenuName,
          IsActive: subMenuData.IsActive,
          PanelID: Number(sessionStorage.getItem("panelID"))
            ? Number(sessionStorage.getItem("panelID"))
            : 1,
          SubMenuSequenceNo: subMenuData.SubMenuSequenceNo,
          DeviceType: subMenuData.DeviceType,
          IconPathUrl: subMenuData.IconPathUrl,
          SubMenuIconClsName: subMenuData.SubMenuIconClsName,
          DefaultDbname: subMenuData.DefaultDbname,
          DefaultTabname: subMenuData.DefaultTabname,
          PathUrl: subMenuData.PathUrl,
          HeaderID: subMenuData.HeaderID,
          HeaderName: subMenuData.HeaderName,
          Servername: subMenuData.Servername,
          LinkURL: subMenuData.LinkURL,
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
    const reminders: any = [];

    // Group data by the "company" field
    const groupedData = items.reduce((result: any, item: any) => {
      const company = item.MenuHeaderName;
      // console.log("company",company)
      if (!result[company]) {
        result[company] = {
          heading: company,
          ModuleID: "",
          HeaderID: "",
          grouped: [],
        };

        const update =
          reminders &&
          reminders?.find((head: any) => {
            return (
              head.heading.toLowerCase() ===
              result[company].heading.toLowerCase()
            );
          });
        // console.log("update",update)
        if (!update) {
          reminders.push(result[company]);
        }
      }
      result[company].grouped.push({
        ...item,
      });
      return result;
    }, {});

    const updatedReminder: any[] = [];

    headerList?.map((res: any, index: number) => {
      reminders?.map((response: any) => {
        // console.log("response head",response,"res head",res)
        if (
          response.heading !== "" &&
          res.HeaderName !== "" &&
          response?.heading?.toLowerCase() === res.HeaderName.toLowerCase()
        ) {
          // console.log("Enter in fun",updatedReminder)
          updatedReminder.push({
            heading: response.heading,
            ModuleID: res.ModuleID,
            HeaderID: res.HeaderID,
            grouped: response?.grouped,
            isCollapsed: true,
          });
        }
      });
    });

    // console.log("updatedRemainder",updatedReminder)
    reminders?.map((response: any) => {
      if (!response.heading) {
        updatedReminder.push({ ...response, isCollapsed: true });
      }
    });

    headerList?.forEach((res: any, index: any) => {
      let head = updatedReminder?.find(
        (response: any) =>
          response?.heading?.toLowerCase() === res.HeaderName.toLowerCase()
      );
      if (!head) {
        updatedReminder.push({
          heading: res.HeaderName,
          ModuleID: res.ModuleID,
          HeaderID: res.HeaderID,
          grouped: [],
          isCollapsed: true,
        });
      }
    });
    // console.log("updatedRemainder 22",updatedReminder)

    let mainResult = updatedReminder.filter(
      (update: any) => update.heading !== ""
    );
    setUpdatedReminder(mainResult);
  }, [items]);

  const handleGetMainMenuID = (value: any) => {
    setSubMenuData({
      ...subMenuData,
      LinkURL: "",
      SubmenuName: "",
      PathUrl: "",
    });
    setMainMenuId(
      value && value[0] && value[0]?.mainMenuId && value[0]?.mainMenuId
    );
    setIsModalOpen(true);
  };

  // Get menu data from sessionStorage
  const menuData = JSON.parse(sessionStorage.getItem('appsideData') || '{}');
  // Extract header styles
  const headerStyles = menuData.MenuHeaders.reduce((acc: any, header: any) => {
    console.log("headerStyles", header.FontSize);
    acc[header.MenuHeaderName] = {
      color: header.HeaderFontColor,
      backgroundColor: header.Headerbgcolor,
      fontSize: `${header.FontSize}px`,
      fontFamily: header.FontName,
      fontWeight: header.IsBold ? 'bold' : 'normal',
      fontStyle: header.IsItalic ? 'italic' : 'normal',
      textDecoration: header.IsUnderline ? 'underline' : 'none',
    };
    return acc;
  }, {});

  return (
    <>
      <ModalComponent
        visible={isModalOpen}
        width={"100%"}
        isfullscreen={true}
        showFooter={false}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title="Add Sub Menu "
        content={() => (
          <AutoCallPage
            recordID={subMenuData?.MenuID}
            moduleID={subMenuData?.ModuleID}
            isModalOpen={true}
          />
        )}
      />
      {isEditHeader && (
        <EditHeader
          isEditHeader={isEditHeader}
          setIsEditHeader={setIsEditHeader}
          headingName={headingName}
        />
      )}

      <div>
        {updatedReminder?.map((reminder: any, index: number) => {
          return (
            <>
              <h5
                className="app-sidebar__heading"
                style={{ margin: 0, ...(headerStyles[reminder.heading] || {}) }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const data = [...updatedReminder];
                  data[index].isCollapsed = !data[index].isCollapsed;
                  setUpdatedReminder(data);
                }}
              >
                {reminder.heading}{" "}
                {reminder.heading && (
                <div></div>
                )}
              </h5>
              <ul
                className={classnames(
                  typeof classStore.classContainer === "function"
                    ? classStore.classContainer({ itemId, visible, items })
                    : classStore.classContainer,
                  visible && classStore.classContainerVisible
                )}
              >
                {reminder.grouped.map((item: any, i: number) => {
                  const menuData = JSON.parse(sessionStorage.getItem('appsideData') || '{}');
                  const menuItemData = menuData.menuitems?.find(
                    (menu: any) => menu.MainMenuID === item.mainMenuId
                  );

                  const subMenuItemData = menuItemData?.submenuitems?.find(
                    (sub: any) => sub.MenuID === item.menuId
                  );
                  return (
                    <>
                      <Item
                        key={item.id || `_${i}`}
                        reduxStoreName={reduxStoreName}
                        reduxUid={reduxUid}
                        callBackMenu={callBackMenu}
                        mainMenuId={item.mainMenuId}
                        IconClscolor={item.IconClscolor}
                        IconWidth={item.IconWidth}
                        IconHeight={item.IconHeight}
                        FontColor={item.FontColor}
                        BgColor={item.BgColor}
                        FontSize={item.FontSize}
                        FontName={item.FontName}
                        SubMenuIconClscolor={item.SubMenuIconClscolor}
                        SubmenuName={item.label}
                        MainMenuName={item.MainMenuName}
                        {...item}
                        onClickEdit={(
                          menuId: any,
                          mainMenuId: any,
                          ModuleID: any
                        ) => {
                          if (openMainModal) {
                            openMainModal?.(menuId, mainMenuId, ModuleID);
                          } else {
                            const selectedSubMenu = items?.find(
                              (res: any) => res.menuId === menuId
                            );
                            setSubMenuData({
                              ...subMenuData,
                              MainMenuID: selectedSubMenu?.mainMenuId,
                              MenuID: selectedSubMenu?.menuId,
                              SubmenuName: selectedSubMenu?.label,
                              IsActive: selectedSubMenu?.IsSubmenuActive,
                              SubMenuSequenceNo:
                                selectedSubMenu?.SubMenuSequenceNo,
                              DeviceType: "0",
                              IconPathUrl: selectedSubMenu?.SubmenuIconPathUrl,
                              PathUrl: selectedSubMenu?.PathUrl,
                              SubMenuIconClsName:
                                selectedSubMenu?.SubMenuIconClsName,
                              DefaultDbname: selectedSubMenu?.DefaultDbname,
                              DefaultTabname: selectedSubMenu?.DefaultTabname,
                              HeaderID: selectedSubMenu?.HeaderID,
                              HeaderName: selectedSubMenu?.HeaderName,
                              Servername: selectedSubMenu?.ServerName,
                              ModuleID: selectedSubMenu?.ModuleID,
                            });
                            setIsModalOpen(true);
                          }
                        }}
                      // edit={edit}
                      />

                      {(!items && !visible) ||
                        (items.length - 1 === i && visible && (
                          <div
                            style={{
                              marginTop: 13,
                              color: "#0088ff",
                              marginLeft: 14,
                              fontFamily: "var(--bs-font-sans-serif)",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setSubMenuData({
                                ...subMenuData,
                                MainMenuID: '0',
                                ModuleID: item?.ModuleID,
                              });
                              setIsModalOpen(true);
                            }}
                          >
                            Add Sub Menu{" "}
                          </div>
                        ))}
                    </>
                  );
                })}
              </ul>
            </>
          );
        })}
      </div>
    </>
  );
};

Container.defaultProps = {
  itemId: null,
  visible: false,
};

Container.contextTypes = {
  classStore: PropTypes.object.isRequired,
};

export default Container;
