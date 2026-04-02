/**
 * src/components/MetisMenu.jsx
 * Author: H.Alper Tuna <halpertuna@gmail.com>
 * Date: 16.09.2016
 */

/* eslint react/forbid-prop-types: [ "error", { forbid: [ "any", "array" ] } ] */

import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { createStore } from "redux";
import classnames from "classnames";
import Ajax from "simple-ajax";
import Container from "../containers/Container";
import Link from "./DefaultLink";
import internalReducers from "../reducers/internal";
import {
  updateContent,
  changeActiveLinkId,
  changeActiveLinkTo,
  changeActiveLinkLabel,
  changeActiveLinkFromLocation,
} from "../actions/content";
import { updateListener } from "../actions/emitters";
import { ModalComponent } from "../../Modal";
import { MainMenuForm } from "./MainMenuForm";
import axios from "axios";
import AutoCallPage from "@/app/Layout/autocall";

let lastReduxUid = -1;

class MetisMenu extends React.Component {
  preloadSubMenuData = async (mainMenuId, subMenus) => {
    console.log("Preloading data for main menu:", mainMenuId);

    const {
      globalApiCache,
      setGlobalApiCache,
      globalCacheTimestamp,
      setGlobalCacheTimestamp,
    } = this.props;

    if (!subMenus || !globalApiCache) return;

    const preloadPromises = subMenus.map(async (subMenu) => {
      if (!subMenu.ModuleID) return;

      try {
        const cacheKey = `${subMenu.ModuleID}_0_default`;

        // Skip if already cached
        if (globalApiCache.has(cacheKey)) return;

        const payload = {
          Userid: localStorage.getItem("username"),
          ModuleID: subMenu.ModuleID,
          RecordID: "0",
        };

        const result = await axios.post(
          "https://logpanel.insurancepolicy4u.com/api/Login/AutoCall",
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            timeout: 10000,
          },
        );

        // Cache the result
        setGlobalApiCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(cacheKey, result.data);
          return newCache;
        });

        setGlobalCacheTimestamp((prev) => {
          const newTimestamps = new Map(prev);
          newTimestamps.set(cacheKey, Date.now());
          return newTimestamps;
        });

        console.log("Preloaded:", subMenu.ModuleID);
      } catch (error) {
        console.log("Preload failed for:", subMenu.ModuleID, error);
      }
    });

    Promise.allSettled(preloadPromises).then(() =>
      console.log("Preloading completed for menu:", mainMenuId),
    );
  };
  constructor(props) {
    super(props);

    this.state = {
      isModalOpen: false,
      mainMenuData: {
        PanelID: 1,
        MainMenuID: 0, //Pass 0 for New Entry
        MainMenuName: "",
        MainMenuLogopath: "",
        IsActive: false,
        IconHeight: "",
        IconWidth: "",
        IconClassName: "",
        ServerName: "",
        HeaderName: "",
        DefaultDBname: "",
        DefaultTableName: "",
        HeaderID: "",
        MenuSequenceNo: 0,
        ModuleID: "",
      },
      menuId: 0,
      mainMenuId: 0,
      subMenuData: [
        {
          MainMenuID: "",
          MenuID: "0",
          ModuleID: "",
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
        },
      ],
    };

    lastReduxUid += 1;
    this.reduxUid = lastReduxUid;
    this.useExternalReduxStore = props.useExternalReduxStore;
    this.reduxStoreName = props.reduxStoreName;
    if (this.useExternalReduxStore) {
      this.store = this.useExternalReduxStore;
    } else {
      this.store = createStore(internalReducers);
    }

    if (props.onSelected) {
      this.store.dispatch(updateListener(this.reduxUid, props.onSelected));
    }

    this.LinkComponent = props.LinkComponent;

    if (props.content) {
      this.updateContent(props.content);
      this.updateActiveLink(props);
    } else if (props.ajax) {
      this.updateRemoteContent(props);
    }

    this.classStore = {
      classMainWrapper: classnames(
        { metismenu: !props.noBuiltInClassNames },
        props.className,
      ),
      classContainer:
        typeof props.classNameContainer === "function"
          ? props.classNameContainer
          : classnames(
              { "metismenu-container": !props.noBuiltInClassNames },
              props.classNameContainer,
            ),
      classContainerVisible: classnames(
        { visible: !props.noBuiltInClassNames },
        props.classNameContainerVisible,
      ),
      classItem: classnames(
        { "metismenu-item": !props.noBuiltInClassNames },
        props.classNameItem,
      ),
      classLink: classnames(
        { "metismenu-link": !props.noBuiltInClassNames },
        props.classNameLink,
      ),
      classItemActive: props.classNameItemActive,
      classItemHasActiveChild: props.classNameItemHasActiveChild,
      classItemHasVisibleChild: props.classNameItemHasVisibleChild,
      classLinkActive: classnames(
        { active: !props.noBuiltInClassNames },
        props.classNameLinkActive,
      ),
      classLinkHasActiveChild: classnames(
        { "has-active-child": !props.noBuiltInClassNames },
        props.classNameLinkHasActiveChild,
      ),
      classIcon: classnames(
        { "metismenu-icon": !props.noBuiltInClassNames },
        props.classNameIcon,
      ),
      classStateIcon: classnames(
        { "metismenu-state-icon": !props.noBuiltInClassNames },
        props.classNameStateIcon,
      ),

      iconNamePrefix: props.iconNamePrefix,
      iconNameStateHidden: props.iconNameStateHidden,
      iconNameStateVisible: props.iconNameStateVisible,
    };
  }

  getChildContext() {
    return {
      classStore: this.classStore,
      LinkComponent: this.LinkComponent,
    };
  }

  onChangeInput = (e) => {
    const state = {
      ...this.state.mainMenuData,
      [e.target.name]: e.target.value,
    };

    this.setState({ mainMenuData: state });
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.content !== nextProps.content) {
      this.updateContent(nextProps.content);
    }

    if (this.props.ajax !== nextProps.ajax) {
      this.updateRemoteContent(nextProps);
    } else if (
      this.props.activeLinkId !== nextProps.activeLinkId ||
      this.props.activeLinkTo !== nextProps.activeLinkTo ||
      this.props.activeLinkLabel !== nextProps.activeLinkLabel ||
      this.props.activeLinkFromLocation !== nextProps.activeLinkFromLocation
    ) {
      this.updateActiveLink(nextProps);
    }
  }

  changeActiveLinkId(value) {
    this.store.dispatch(changeActiveLinkId(this.reduxUid, value));
  }

  changeActiveLinkTo(value) {
    this.store.dispatch(changeActiveLinkTo(this.reduxUid, value));
  }

  changeActiveLinkLabel(value) {
    this.store.dispatch(changeActiveLinkLabel(this.reduxUid, value));
  }

  changeActiveLinkFromLocation() {
    this.store.dispatch(changeActiveLinkFromLocation(this.reduxUid));
  }

  updateActiveLink(props) {
    if (props.activeLinkId) this.changeActiveLinkId(props.activeLinkId);
    else if (props.activeLinkTo) this.changeActiveLinkTo(props.activeLinkTo);
    else if (props.activeLinkLabel)
      this.changeActiveLinkLabel(props.activeLinkLabel);
    else if (props.activeLinkFromLocation) this.changeActiveLinkFromLocation();
  }

  updateRemoteContent(props) {
    const ajax = new Ajax(props.ajax);
    ajax.on("success", (event) => {
      let content;
      const {
        target: { responseText },
      } = event.target.responseText;
      try {
        content = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `MetisMenu: Ajax response expected to be json, but got; ${responseText}`,
        );
      }
      this.updateContent(content);
      this.updateActiveLink(props);
    });
    ajax.send();
  }

  updateContent(content) {
    this.store.dispatch(updateContent(this.reduxUid, content));
  }

  AddMainMenu = () => {
    fetch(
      "https://logpanel.insurancepolicy4u.com/api/Login/Add_UpdateMainMenuList",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Userid: localStorage.getItem("username"),
          PanelID: Number(sessionStorage.getItem("panelID"))
            ? Number(sessionStorage.getItem("panelID"))
            : 1,
          MainMenuID: this.state.mainMenuData.MainMenuID, //Pass 0 for New Entry
          MainMenuName: this.state.mainMenuData.MainMenuName,
          MainMenuLogopath: this.state.mainMenuData.MainMenuLogopath,
          IsActive: this.state.mainMenuData.IsActive,
          IconHeight: this.state.mainMenuData.IconHeight,
          IconWidth: this.state.mainMenuData.IconWidth,
          IconClassName: this.state.mainMenuData.IconClassName,
          MenuSequenceNo: parseInt(this.state.mainMenuData.MenuSequenceNo),
          ServerName: this.state.mainMenuData.ServerName,
          HeaderName: this.state.mainMenuData.HeaderName,
          DefaultDBname: this.state.mainMenuData.DefaultDBname,
          DefaultTableName: this.state.mainMenuData.DefaultTableName,
          HeaderID: this.state.mainMenuData.HeaderID,
        }),
      },
    )
      .then((response) => response.json())
      .then((response) => {
        sessionStorage.removeItem("appsideData");
        sessionStorage.removeItem("headerList");
      })
      .catch((error) => {});
  };

  render() {
    console.log("Rendering MetisMenu with content:", this.props.menuData);
    const menuData = JSON.parse(sessionStorage.getItem("appsideData") || "{}");
    const mainWrapper = (
      <div className={this.classStore.classMainWrapper}>
        <Container
          reduxStoreName={this.reduxStoreName}
          reduxUid={this.reduxUid}
          headerList={this.props.headerList}
          callBackMenu={this.props.callBackMenu}
          items={this.props.subMenu}
          content={this.props.content}
          FontColor={this.props.content?.[0]?.fontColor}
          hoverColor={menuData?.Hovercolor}
          openMainModal={async (menuId, mainMenuId, ModuleID, subMenus) => {
            // ADD subMenus parameter
            console.log(menuId, mainMenuId, ModuleID);

            // PRELOAD DATA FIRST - this happens in background
            if (subMenus) {
              this.preloadSubMenuData(mainMenuId, subMenus);
            }

            const response = await axios(
              `https://logpanel.insurancepolicy4u.com/api/Login/GetMenuItems2?ProjectType=${Number(sessionStorage.getItem("panelID")) ? Number(sessionStorage.getItem("panelID")) : 1}&Userid=${localStorage.getItem(
                "username",
              )}&device=1&ipaddress=122.76.54.19`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/json",
                },
              },
            );

            const selectedMenu = response?.data?.menuitems.find(
              (res) => res.MainMenuID === mainMenuId,
            );
            this.setState({
              isModalOpen: true,
              menuId: ModuleID,
              mainMenuId,
              mainMenuData: {
                PanelID: Number(sessionStorage.getItem("panelID"))
                  ? Number(sessionStorage.getItem("panelID"))
                  : 1,
                MainMenuID: selectedMenu?.MainMenuID, //Pass 0 for New Entry
                MainMenuName: selectedMenu.MainMenuName,
                MainMenuLogopath: selectedMenu.IconPathUrl,
                IsActive: true,
                IconHeight: selectedMenu.IconHeight,
                IconWidth: selectedMenu.IconWidth,
                IconClassName: selectedMenu.IconClassName,
                ServerName: selectedMenu.ServerName,
                HeaderName: selectedMenu.HeaderName,
                DefaultDBname: selectedMenu.DefaultDBname,
                DefaultTableName: selectedMenu.DefaultTableName,
                HeaderID: selectedMenu.HeaderID,
                MenuSequenceNo: selectedMenu.MenuSequenceNo,
                ModuleID: ModuleID,
                color: selectedMenu.FontColor,
              },
              subMenuData: selectedMenu?.subMenu,
            });
          }}
        />
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
            this.setState({
              isModalOpen: true,
              menuId: this.props.menuData?.menuitems[0].ModuleID,
              mainMenuId: "0",
            });
          }}
        >
          Add New Menu{" "}
        </div>
      </div>
    );

    if (this.useExternalReduxStore) {
      return <>{mainWrapper}</>;
    }

    return (
      <>
        {" "}
        <ModalComponent
          visible={this.state.isModalOpen}
          width={"100%"}
          isfullscreen={true}
          showFooter={false}
          onSubmit={() => {
            this.setState({ isModalOpen: false });
            this.AddMainMenu();
          }}
          onClose={() => {
            this.setState({ isModalOpen: false });
          }}
          title="Menu Modal "
          content={() => (
            <AutoCallPage
              recordID={this.state.mainMenuId}
              moduleID={this.state.menuId}
              isModalOpen={true}
              // ADD THESE CACHE PROPS:
              globalApiCache={this.props.globalApiCache}
              setGlobalApiCache={this.props.setGlobalApiCache}
              globalCacheTimestamp={this.props.globalCacheTimestamp}
              setGlobalCacheTimestamp={this.props.setGlobalCacheTimestamp}
            />
          )}
        />
        <Provider store={this.store}>{mainWrapper}</Provider>{" "}
      </>
    );
  }
}

MetisMenu.defaultProps = {
  content: [],
  ajax: null,
  LinkComponent: Link,
  noBuiltInClassNames: false,
  className: null,
  classNameContainer: null,
  classNameContainerVisible: null,
  classNameItem: null,
  classNameItemActive: null,
  classNameItemHasActiveChild: null,
  classNameItemHasVisibleChild: null,
  classNameLink: null,
  classNameLinkActive: null,
  classNameLinkHasActiveChild: null,
  classNameIcon: null,
  classNameStateIcon: null,
  iconNamePrefix: "fa fa-",
  iconNameStateHidden: "caret-left",
  iconNameStateVisible: "caret-left rotate-minus-90",
  activeLinkId: null,
  activeLinkTo: null,
  activeLinkLabel: null,
  activeLinkFromLocation: false,
  onSelected: null,
  useExternalReduxStore: null,
  reduxStoreName: "metisMenuStore",
};

MetisMenu.propTypes = {
  content: PropTypes.arrayOf(PropTypes.object),
  ajax: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),

  LinkComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  headerList: PropTypes.any,
  noBuiltInClassNames: PropTypes.bool,
  className: PropTypes.string,
  classNameContainer: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  classNameContainerVisible: PropTypes.string,
  classNameItem: PropTypes.string,
  classNameItemActive: PropTypes.string,
  classNameItemHasActiveChild: PropTypes.string,
  classNameItemHasVisibleChild: PropTypes.string,
  classNameLink: PropTypes.string,
  classNameLinkActive: PropTypes.string,
  classNameLinkHasActiveChild: PropTypes.string,
  classNameIcon: PropTypes.string,
  classNameStateIcon: PropTypes.string,
  iconNamePrefix: PropTypes.string,
  iconNameStateHidden: PropTypes.string,
  iconNameStateVisible: PropTypes.string,

  activeLinkId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  activeLinkTo: PropTypes.string,
  activeLinkLabel: PropTypes.string,
  activeLinkFromLocation: PropTypes.bool,

  onSelected: PropTypes.func,
  useExternalReduxStore: PropTypes.object,
  reduxStoreName: PropTypes.string,
  callBackMenu: PropTypes.any,
};

MetisMenu.childContextTypes = {
  classStore: PropTypes.object.isRequired,
  LinkComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
    .isRequired,
};

export default MetisMenu;
