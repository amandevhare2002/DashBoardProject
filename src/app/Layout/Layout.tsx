import { setAuthToken, setPageBackground, setUserData } from "@/reducers/Auth";
import axios from "axios";
import cx from "classnames";
import Router, { useRouter } from "next/router";
import { Fragment, PropsWithChildren, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ResizeDetector from "react-resize-detector";
import "../../styles/base.scss";
import { Header } from "./AppHeader";
import { Menuitem } from "./AppNav/NavItems";
import { AppSidebar } from "./AppSidebar";
import { Spinner } from "reactstrap";
import Loading from "@/app/loading";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Layout = (props: PropsWithChildren) => {
  const [closedSmallerSidebar, setClosedSmallerSidebar] = useState(false);
  const token = useSelector((state: any) => state.authReducer.token);
  const router = useRouter();
  const colorScheme = useSelector(
    (state: any) => state?.ThemeOptions?.colorScheme,
  );
  const enableFixedHeader = useSelector(
    (state: any) => state?.ThemeOptions?.enableFixedHeader,
  );
  const enableMobileMenu = useSelector(
    (state: any) => state?.ThemeOptions?.enableMobileMenu,
  );
  const enableFixedFooter = useSelector(
    (state: any) => state?.ThemeOptions?.enableFixedFooter,
  );
  const enableFixedSidebar = useSelector(
    (state: any) => state?.ThemeOptions?.enableFixedSidebar,
  );
  const enableClosedSidebar = useSelector(
    (state: any) => state?.ThemeOptions?.enableClosedSidebar,
  );
  const enablePageTabsAlt = useSelector(
    (state: any) => state?.ThemeOptions?.enablePageTabsAlt,
  );
  const [menuItems, setMenuItems] = useState<any>([]);
  const [selectedPannelId, setSelectedPannelId] = useState("1");
  const [headerList, setHeaderList] = useState([]);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const pageBackground = useSelector(
    (state: any) => state.authReducer.pageBackground,
  );
  console.log("pageBackground", pageBackground);
  useEffect(() => {
    if (!pageBackground.color && !pageBackground.image) {
      const storedBg = localStorage.getItem("pageBackground");
      if (storedBg) {
        const parsedBg = JSON.parse(storedBg);
        dispatch(setPageBackground(parsedBg));
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      getMenuItems();
    }
  }, [selectedPannelId, token]);

  useEffect(() => {
    const headerList = sessionStorage.getItem("headerList");
    if (!headerList || headerList === "null") {
      const Params = {
        Userid: localStorage.getItem("username"),
        PanelID: sessionStorage.getItem("panelID")
          ? sessionStorage.getItem("panelID")
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
          },
        )
        .then((response: any) => {
          sessionStorage.setItem(
            "headerList",
            JSON.stringify(response.data.headersLists),
          );
          setHeaderList(response.data.headersLists);
        })
        .catch((error) => {});
    } else {
      setHeaderList(JSON.parse(headerList));
    }
  }, [selectedPannelId]);

  const getRoute = (response: any, res: any) => {
    try {
      setLoading(true);
      if (response.PathUrl === "mailbox") {
        return `/mailbox?folder=Inbox&isMailList=true`;
      }
      if (response.PathUrl === "/") {
        return `/`;
      }
      if (response.PathUrl === "viewReport") {
        return `/${response.PathUrl}/${res.MainMenuID}/${response.MenuID}/${res.MenuHeaderName}`;
      }
      if (response.PathUrl === "autocall") {
        return `/${response.PathUrl}/${res.MainMenuID}/${response.MenuID}`;
      }
      if (response.PathUrl) {
        return `/${response.PathUrl}`;
      }
      if (!response.PathUrl) {
        return `/${res.MainMenuID}/${response.MenuID}`;
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getMenuItems = async () => {
    try {
      if (!sessionStorage.getItem("appsideData")) {
        const response = await axios(
          `https://logpanel.insurancepolicy4u.com/api/Login/GetMenuItems2?ProjectType=${selectedPannelId}&Userid=${localStorage.getItem(
            "username",
          )}&device=1&ipaddress=122.76.54.19`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response) {
          sessionStorage.setItem("appsideData", JSON.stringify(response?.data));
          dispatch(setUserData(response.data));

          // appsideData = response?.data
        }
      }

      const appsideData = sessionStorage.getItem("appsideData");
      let mainData = appsideData && JSON.parse(appsideData);

      if (!sessionStorage.getItem("IsSubMenuEdit")) {
        sessionStorage.setItem("IsSubMenuEdit", mainData?.IsSubmenuedit);
        // sessionStorage.setItem('IsSubMenuEdit',false)
      }

      if (!sessionStorage.getItem("IsMenuEdit")) {
        sessionStorage.setItem("IsMenuEdit", mainData?.Ismenuedit);
      }

      const newArray = mainData.menuitems?.map((res: any, index: number) => {
        const Object = {
          icon: res.IconClassName,
          pannelName: res.PanelName,
          label: res.MainMenuName,
          IconClassName: res.IconClassName,
          IconHeight: res.IconHeight,
          IconPathUrl: res.IconPathUrl,
          IconWidth: res.IconWidth,
          IconClscolor: res.IconClscolor,
          FontColor: res.FontColor,
          BgColor: res.BgColor,
          FontSize: res.FontSize,
          FontName: res.FontName,
          IsSubmenu: res.IsSubmenu,
          mainMenuId: res.MainMenuID,
          MainMenuName: res.MainMenuName,
          MenuHeaderName: res.MenuHeaderName,
          PanelName: res.PanelName,
          HeaderID: res.MenuHeaderID,
          ModuleID: res.ModuleID,
          HeaderName: res.MenuHeaderName,
          ServerName: res.DefaultServername,
          DefaultDbname: res.DefaultDbname,
          DefaultTableName: res.DefaultTablename,
          subMenu: res.submenuitems?.map((response: any) => {
            const object = {
              label: response.SubmenuName,
              mainMenuId: res.MainMenuID,
              menuId: response.MenuID,
              icon: response.SubMenuIconClsName,
              to: getRoute(response, res),
              SubMenuIconClsName: response.SubMenuIconClsName,
              SubMenuIconClscolor: response.SubMenuIconClscolor,
              SubmenuName: response.SubmenuName,
              SubMenuSequenceNo: response.SubMenuSequenceNo,
              SubmenuIconPathUrl: response.SubmenuIconPathUrl,
              IsSubmenuActive: response.IsSubmenuActive,
              DefaultDbname: response.DefaultDbname,
              DefaultTabname: response.DefaultTablename,
              PathUrl: response.PathUrl,
              HeaderID: res.MenuHeaderID,
              HeaderName: res.MenuHeaderName,
              LinkURL: response?.LinkURL,
              ModuleID: response.ModuleID,
              FontColor: response.FontColor,
              BgColor: response.BgColor,
              FontSize: response.FontSize,
              FontName: response.FontName,
            };
            return object;
          }),
          content: res.submenuitems?.map((response: any) => {
            if (response.IsSubmenuActive) {
              const object = {
                label: response.SubmenuName,
                mainMenuId: res.MainMenuID,
                menuId: response.MenuID,
                to: getRoute(response, res),
                icon: response.SubMenuIconClsName,
                SubMenuIconClsName: response.SubMenuIconClsName,
                SubmenuName: response.SubmenuName,
                SubMenuSequenceNo: response.SubMenuSequenceNo,
                SubmenuIconPathUrl: response.SubmenuIconPathUrl,
                IsSubmenuActive: response.IsSubmenuActive,
                DefaultDbname: response.DefaultDbname,
                DefaultTabname: response.DefaultTablename,
                PathUrl: response.PathUrl,
                HeaderID: res.MenuHeaderID,
                HeaderName: res.MenuHeaderName,
                ServerName: response.ServerName,
                LinkURL: response?.LinkURL,
                ModuleID: response.ModuleID,
                FontColor: response.FontColor,
                BgColor: response.BgColor,
                FontSize: response.FontSize,
                FontName: response.FontName,
              };
              return object;
            }
          }),
        };
        return Object;
      });

      setMenuItems(newArray);
    } catch (error) {}
  };

  useEffect(() => {
    fetchToken();
  }, [token]);

  const fetchToken = async () => {
    if (!token && !localStorage.getItem("token")) {
      Router.push("/login");
    }
    dispatch(setAuthToken(localStorage.getItem("token")));
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {loading && <Loading />}
      {loading ? (
        <Loading />
      ) : (
        <ResizeDetector
          handleWidth
          render={({ width }: { width?: any }) => (
            <Fragment>
              <div
                className={cx(
                  "app-container app-theme-" + colorScheme,
                  { "fixed-header": enableFixedHeader },
                  { "fixed-sidebar": enableFixedSidebar || width < 1250 },
                  { "fixed-footer": enableFixedFooter },
                  { "closed-sidebar": enableClosedSidebar || width < 1250 },
                  {
                    "closed-sidebar-mobile":
                      closedSmallerSidebar || width < 1250,
                  },
                  { "sidebar-mobile-open": enableMobileMenu },
                  { "body-tabs-shadow-btn": enablePageTabsAlt },
                )}
              >
                <Fragment>
                  <Header
                    selectedPannel={(pannelId: string) => {
                      setSelectedPannelId(pannelId);
                    }}
                    selectedPannelId={selectedPannelId}
                  />
                  <AppSidebar
                    menuItems={menuItems}
                    headerList={headerList}
                    callBackMenu={() => {
                      getMenuItems();
                    }}
                  />
                  <div className="app-main">
                    <div className="app-main__outer">
                      <div
                        className="app-main__inner"
                        style={{
                          backgroundColor:
                            pageBackground.color || "default-color",
                          backgroundImage: pageBackground.image
                            ? `url(${pageBackground.image})`
                            : "none",
                          backgroundSize: "cover",
                          backgroundRepeat: "no-repeat",
                        }}
                      >
                        {props.children}
                      </div>
                    </div>
                  </div>
                </Fragment>
              </div>
            </Fragment>
          )}
        />
      )}
    </>
  );
};
