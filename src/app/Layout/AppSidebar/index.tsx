import cx from "classnames";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { setEnableMobileMenu } from "../../../reducers/ThemeOptions";
import { Nav } from "../AppNav/VerticalNavWrapper";
import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import Select from "react-select";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { Autocomplete, TextField } from "@mui/material";
import Loading from "@/app/loading";
import AutoCallPage from "../autocall";
import { ModalComponent } from "../Common/Modal";
const PerfectScrollbar = require("react-perfect-scrollbar");

export const AppSidebar = ({
  menuItems,
  callBackMenu,
  headerList,
}: {
  menuItems: any[];
  callBackMenu: any;
  headerList: any;
}) => {
  console.log("AppSidebar menuItems sample:", menuItems);
  const enableBackgroundImage = useSelector(
    (state: any) => state?.ThemeOptions?.enableBackgroundImage,
  );
  const enableSidebarShadow = useSelector(
    (state: any) => state?.ThemeOptions?.enableSidebarShadow,
  );
  const enableMobileMenu = useSelector(
    (state: any) => state?.ThemeOptions?.enableMobileMenu,
  );
  const backgroundColor = useSelector(
    (state: any) => state?.ThemeOptions?.backgroundColor,
  );
  const backgroundImage = useSelector(
    (state: any) => state?.ThemeOptions?.backgroundImage,
  );
  const backgroundImageOpacity = useSelector(
    (state: any) => state?.ThemeOptions?.backgroundImageOpacity,
  );
  const [isAutoCallOpen, setIsAutoCallOpen] = useState(false);
  const [isMenuHeader, setIsMenuHeader] = useState(false);
  const [menuHeaderName, setMenuHeaderName] = useState("");
  const [selectedMenu, setSelectedMenu] = useState([]);
  const [order, setOrder] = useState<any>();
  const [keySearch, setKeySearch] = useState("");
  const token = useSelector((state: any) => state.authReducer.token);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const toggleMobileSidebar = () => {
    dispatch(setEnableMobileMenu(!enableMobileMenu));
  };

  const onSubmitHeader = () => {
    setLoading(true);
    let panelData = sessionStorage.getItem("panelList");
    let panel =
      panelData &&
      menuItems &&
      JSON.parse(panelData).find(
        (pnl: any) => pnl.PanelName === menuItems[0]?.pannelName,
      );
    if (!panel) {
      return;
    }
    const Params = {
      Userid: localStorage.getItem("username"),
      MenuHeaderID: 0,
      MenuHeaderName: menuHeaderName,
      PanelID: panel?.PanelID,
      SortOrder: Number(order),
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
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        setIsMenuHeader(false);
        callBackMenu();
        sessionStorage.removeItem("appsideData");
        sessionStorage.removeItem("headerList");
      })
      .catch((error) => {})
      .finally(() => setLoading(false));
  };

  const onChangeInput = (event: React.ChangeEvent<{}>, newValue: any) => {
    // if (newValue !== null) {
    setKeySearch(newValue);
    // }
  };

  let subMenuArray = useMemo(() => {
    if (!Array.isArray(menuItems)) {
      return [];
    }
    let submenu: any = [];
    for (let menu of menuItems) {
      for (let sub of menu?.content) {
        if (!submenu.includes(sub?.label.toLowerCase())) {
          submenu.push(sub?.label.toLowerCase()); // ?.trim()
        }
      }
    }
    return submenu;
  }, [menuItems]);

  let NewMenuItems = useMemo(() => {
    if (!keySearch) {
      callBackMenu();
      return;
    }

    let newContent: any;
    const filteredMenuItems = menuItems.filter((menu: any) => {
      const filteredContents = menu.content.filter(
        (sub: any) => sub.label.toLowerCase() === keySearch.toLowerCase(),
      );
      // type.Question.toLowerCase().includes(faqSearch.toLowerCase())
      // const filteredContents = menu.content.filter((type: any) => type.label.toLowerCase().includes(keySearch.toLowerCase()))
      if (filteredContents.length > 0) {
        newContent = filteredContents;
      }
      return filteredContents.length > 0;
    });

    if (filteredMenuItems.length > 0) {
      filteredMenuItems[0].content = newContent;
    }
    let newHeaderList = [];
    for (let menu of filteredMenuItems) {
      for (let head of headerList) {
        if (
          head?.HeaderName.toLowerCase() === menu?.MenuHeaderName.toLowerCase()
        ) {
          newHeaderList.push(head);
        }
      }
    }
    console.log(
      "newHeaderListfilteredMenuItems",
      filteredMenuItems,
      newHeaderList,
    );
    return { filteredMenuItems, newHeaderList };
  }, [keySearch]);

  const [sidebarData, setSidebarData] = useState<any>(null);
  const [searchbgColor, setSearchbgColor] = useState<any>(null);
  const [isMenuItems, setIsMenuItems] = useState<any>(null);
  const [isMenuHeaders, setIsMenuHeaders] = useState<any>(null);

  // const userData = useSelector((state: any) => state.authReducer.userData);

  // useEffect(() => {
  //   // const menuData = JSON.parse(sessionStorage.getItem("appsideData") || "{}");
  //   setSidebarData(userData?.Menubgcolor);
  //   setSearchbgColor(userData?.Searchboxbgcolor);
  //   setIsMenuItems(userData?.menuitems);
  // }, []);
  useEffect(() => {
    const menuData = JSON.parse(sessionStorage.getItem("appsideData") || "{}");
    setSidebarData(menuData?.Menubgcolor);
    setSearchbgColor(menuData?.Searchboxbgcolor);
    setIsMenuItems(menuData?.menuitems);
    setIsMenuHeaders(menuData?.MenuHeaders);
    console.log("sidebarData", menuData);
  }, []);
  console.log("NewMenuItems?.newHeaderList", NewMenuItems?.newHeaderList);
  console.log("AppsidebarAppsidebarAppsidebar", headerList);
  return (
    <Fragment>
      {isMenuItems && (
        <>
          <div
            className="sidebar-mobile-overlay"
            onClick={toggleMobileSidebar}
          />
          <Modal isOpen={isMenuHeader}>
            <ModalHeader>Create Menu Header</ModalHeader>
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
                  <Label style={{ fontWeight: 700 }}>Sort Order</Label>
                  <Input
                    placeholder="Add Sort Order"
                    value={order}
                    onChange={(e: any) => {
                      setOrder(e.target.value);
                    }}
                  />
                </FormGroup>
                <FormGroup>
                  <Label style={{ fontWeight: 700 }}>Main Menu List</Label>
                  <Select
                    options={menuItems?.map((response: any) => ({
                      label: response.MainMenuName,
                      value: response.mainMenuId,
                      options: [], // Add empty options array to satisfy GroupBase type
                    }))}
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
                  setIsMenuHeader(false);
                }}
              >
                Close
              </Button>
            </ModalFooter>
          </Modal>
          <TransitionGroup>
            <CSSTransition
              component="div"
              className={cx("app-sidebar", backgroundColor, {
                "sidebar-shadow": enableSidebarShadow,
              })}
              style={{
                backgroundColor: sidebarData,
              }}
              appear={true}
              enter={false}
              exit={false}
              timeout={500}
            >
              <div>
                <PerfectScrollbar>
                  <div className="app-sidebar__inner">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 10,
                        marginBottom: 10,
                        flexDirection: "column",
                      }}
                    >
                      <Button
                        onClick={() => {
                          setIsAutoCallOpen(true);
                        }}
                      >
                        Create Menu Groups
                      </Button>
                    </div>
                    {/* <Modal
                      isOpen={isAutoCallOpen}
                      toggle={() => setIsAutoCallOpen(false)}
                      width={"100%"}
                    >
                      <ModalBody style={{ padding: 0 }}>
                        <AutoCallPage
                          recordID={isMenuHeaders?.[0]?.MenuHeaderID}
                          moduleID={isMenuHeaders?.[0]?.ModuleID}
                          isModalOpen={isAutoCallOpen}
                        />
                      </ModalBody>
                    </Modal> */}
                    <ModalComponent
                      visible={isAutoCallOpen}
                      width={"100%"}
                      isfullscreen={true}
                      showFooter={false}
                      onClose={() => {
                        setIsAutoCallOpen(false);
                      }}
                      title="Menu Header"
                      content={() => (
                        <AutoCallPage
                          recordID={isMenuHeaders?.[0]?.MenuHeaderID.toString()}
                          moduleID={isMenuHeaders?.[0]?.ModuleID}
                          isModalOpen={isAutoCallOpen}
                        />
                      )}
                    />
                    <div className="my-2 relative w-full">
                      <Autocomplete
                        sx={{
                          height: "100%",
                          minWidth: "150px",
                          width: "100%",
                          padding: "0px!important",
                          margin: "0px!important",
                          backgroundColor: searchbgColor,
                        }}
                        value={keySearch}
                        options={subMenuArray}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Search"
                            variant="outlined"
                            sx={{ width: `100%` }}
                          />
                        )}
                        onChange={onChangeInput}
                        freeSolo
                      />
                    </div>

                    <Nav
                      menuItems={
                        keySearch ? NewMenuItems?.filteredMenuItems : menuItems
                      }
                      callBackMenu={callBackMenu}
                      headerList={
                        keySearch ? NewMenuItems?.newHeaderList : headerList
                      }
                    />
                  </div>
                </PerfectScrollbar>
                <div
                  className={cx("app-sidebar-bg", backgroundImageOpacity)}
                  style={{
                    backgroundImage: enableBackgroundImage
                      ? "url(" + backgroundImage + ")"
                      : undefined,
                  }}
                ></div>
              </div>
            </CSSTransition>
          </TransitionGroup>
        </>
      )}
    </Fragment>
  );
};
