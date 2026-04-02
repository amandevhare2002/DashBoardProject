/**
 * src/components/Container.jsx
 * Author: H.Alper Tuna <halpertuna@gmail.com>
 * Date: 16.09.2016
 */

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Container from "../containers/Container";

const Item = (
  {
    id,
    icon,
    label,
    to,
    externalLink,
    hasSubMenu,
    active,
    hasActiveChild,
    subMenuVisibility,
    toggleSubMenu,
    activateMe,
    reduxStoreName,
    reduxUid,
    mainMenuId,
    menuId,
    onClickEdit,
    IsSubmenuActive,
    callBackMenu,
    MenuHeaderName,
    ModuleID,
    fontColor,
    IconClscolor,
    IconWidth,
    IconHeight,
    FontColor,
    BgColor,
    FontSize,
    FontName,
    SubMenuIconClscolor,
    SubmenuName,
    MainMenuName,
  },
  { classStore, LinkComponent },
) => {
  const [edit, setedit] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let val = sessionStorage.getItem("IsSubMenuEdit");
    if (!!val) {
      setedit(val);
    }
  }, []);

  // Get menu data from sessionStorage for fallback styles
  const getMenuStyles = () => {
    try {
      const menuheaderstyles = sessionStorage.getItem("appsideData");
      if (!menuheaderstyles) return {};

      const menuData = JSON.parse(menuheaderstyles);
      // If we're a main menu item (hasSubMenu is true), look for main menu styles
      if (hasSubMenu) {
        const mainMenuItem = menuData.menuitems?.find(
          (item) =>
            item.MainMenuName === label || item.MainMenuID === mainMenuId,
        );
        if (mainMenuItem) {
          return {
            iconColor: mainMenuItem.IconClscolor,
            iconWidth: mainMenuItem.IconWidth,
            iconHeight: mainMenuItem.IconHeight,
            fontColor: mainMenuItem.FontColor,
            backgroundColor: mainMenuItem.BgColor,
            fontSize: `${mainMenuItem.FontSize}px`,
            fontFamily: mainMenuItem.FontName,
            hoverColor: menuData.Hovercolor,
            activeColor: mainMenuItem.activecolor,
          };
        }
      }
      // If we're a submenu item, look for submenu styles
      else {
        // Find the parent main menu first
        const mainMenuItem = menuData.menuitems?.find((item) =>
          item.submenuitems?.some((sub) => sub.SubmenuName === label),
        );

        if (mainMenuItem) {
          // Find the specific submenu
          const subMenuItem = mainMenuItem.submenuitems?.find(
            (sub) => sub.SubmenuName === label,
          );

          if (subMenuItem) {
            return {
              iconColor: subMenuItem.SubMenuIconClscolor,
              fontColor: subMenuItem.FontColor,
              backgroundColor: subMenuItem.BgColor,
              fontSize: `${subMenuItem.FontSize}px`,
              fontFamily: subMenuItem.FontName,
              activeColor: subMenuItem.activecolor,
              hoverColor: menuData.Hovercolor,
            };
          }
        }
      }
    } catch (error) {
      console.error("Error parsing menu styles:", error);
    }

    return {};
  };

  const styles = getMenuStyles();

  // Create style objects for different elements
  const iconStyle = {
    color: IconClscolor || styles.iconColor,
    width: IconWidth || styles.iconWidth,
    height: IconHeight || styles.iconHeight,
    fontSize: IconWidth || styles.iconWidth,
  };

  const labelStyle = {
    color: FontColor || styles.fontColor,
    backgroundColor: BgColor || styles.backgroundColor,
    fontSize: FontSize || styles.fontSize,
    fontFamily: FontName || styles.fontFamily,
  };

  const liStyle = {
    display: label ? "list-item" : "none",
    position: "relative", // Add position relative for z-index management
  };

  const mainActive = styles.activeColor;
  if (active && hasSubMenu && mainActive) {
    liStyle.backgroundColor = mainActive;
  }

  // Apply hover color to li when hovered
  if (hovered && styles.hoverColor) {
    liStyle.backgroundColor = styles.hoverColor;
  }

  const linkStyle = {
    ...(active && !hasSubMenu && styles.activeColor
      ? {
          backgroundColor: styles.activeColor,
        }
      : {}),
  };

  const subMenuIconStyle = hasSubMenu
    ? iconStyle
    : {
        color: SubMenuIconClscolor || styles.iconColor,
      };

  return (
    <>
      <style>{`
        .metismenu-item {
          position: relative;
        }
        
        /* Ensure the submenu container doesn't inherit hover styles */
        .metismenu-item .metismenu-container {
          background-color: transparent !important;
        }
        
        /* Make sure the submenu container is above the hover effect */
        .metismenu-item .metismenu-container {
          position: relative;
          z-index: 2;
        }
        
        /* Prevent hover from affecting the submenu container area */
        .metismenu-item.has-submenu:hover {
          background-color: transparent !important;
        }
        
        /* Apply hover only to the link area of items with submenus */
        .metismenu-item.has-submenu:hover > .metismenu-link {
          background-color: ${styles.hoverColor || "inherit"};
        }
        
        /* For items without submenu, hover on the whole li is fine */
        .metismenu-item:not(.has-submenu):hover {
          background-color: ${styles.hoverColor || "inherit"} !important;
        }
        
        /* Active state styles */
        .metismenu-item.active {
          background-color: ${mainActive || "inherit"};
        }
        
        /* Submenu items hover - only apply to the li itself */
        .metismenu-container .metismenu-item:hover {
          background-color: ${styles.hoverColor || "inherit"};
        }
        
        /* Ensure submenu container doesn't show hover */
        .metismenu-container {
          background-color: transparent !important;
        }
        
        /* Prevent hover from bleeding into submenu area */
        .metismenu-item.has-submenu {
          background-color: transparent !important;
        }
        
        .metismenu-item.has-submenu > .metismenu-link {
          position: relative;
          z-index: 3;
        }
      `}</style>

      <li
        className={classnames(
          classStore.classItem,
          active && classStore.classItemActive,
          hasActiveChild && classStore.classItemHasActiveChild,
          hasSubMenu && classStore.classItemHasVisibleChild,
          hasSubMenu && "has-submenu", // Add custom class for items with submenu
          !hasSubMenu && "no-submenu", // Add custom class for items without submenu
        )}
        style={liStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <LinkComponent
          className={classStore.classLink}
          classNameActive={classStore.classLinkActive}
          classNameHasActiveChild={classStore.classLinkHasActiveChild}
          active={active}
          hasActiveChild={hasActiveChild}
          id={id}
          to={to}
          label={label}
          externalLink={externalLink}
          hasSubMenu={hasSubMenu}
          toggleSubMenu={toggleSubMenu}
          activateMe={activateMe}
          labelStyle={labelStyle}
          iconStyle={hasSubMenu ? iconStyle : subMenuIconStyle}
          style={linkStyle}
        >
          {hasSubMenu ? (
            <i
              className={classnames(
                classStore.classIcon,
                classStore.iconNamePrefix + icon || icon,
              )}
              style={{
                ...iconStyle,
                fontSize: styles.fontSize,
              }}
            />
          ) : (
            <i
              className={classnames(classStore.iconNamePrefix + icon || icon)}
              style={{
                ...subMenuIconStyle,
                fontSize: styles.fontSize,
              }}
            />
          )}

          <i
            className={edit == "true" ? "block pe-7s-pen" : "hidden"}
            style={{
              marginRight: 17,
              color: iconStyle.color,
              fontSize: labelStyle.fontSize,
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClickEdit(menuId, mainMenuId, ModuleID);
            }}
          />

          <span style={labelStyle}>{label}</span>
        </LinkComponent>

        {hasSubMenu && (
          <Container
            itemId={id}
            visible={subMenuVisibility}
            reduxStoreName={reduxStoreName}
            reduxUid={reduxUid}
            mainMenuId={mainMenuId}
            callBackMenu={callBackMenu}
            fontColor={fontColor}
          />
        )}
      </li>
    </>
  );
};

Item.defaultProps = {
  icon: "",
  label: "",
  to: null,
  externalLink: false,
  toggleSubMenu: null,
  IconClscolor: null,
  IconWidth: null,
  IconHeight: null,
  FontColor: null,
  BgColor: null,
  FontSize: null,
  FontName: null,
  SubMenuIconClscolor: null,
};

Item.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  icon: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.array,
    PropTypes.string,
  ]),
  to: PropTypes.string,
  externalLink: PropTypes.bool,
  hasSubMenu: PropTypes.bool.isRequired,
  active: PropTypes.bool.isRequired,
  hasActiveChild: PropTypes.bool.isRequired,
  subMenuVisibility: PropTypes.bool.isRequired,
  toggleSubMenu: PropTypes.func,
  activateMe: PropTypes.func.isRequired,
  reduxStoreName: PropTypes.string.isRequired,
  reduxUid: PropTypes.number.isRequired,
  callBackMenu: PropTypes.any,
  IconClscolor: PropTypes.string,
  IconWidth: PropTypes.string,
  IconHeight: PropTypes.string,
  FontColor: PropTypes.string,
  BgColor: PropTypes.string,
  FontSize: PropTypes.string,
  FontName: PropTypes.string,
  SubMenuIconClscolor: PropTypes.string,
};

Item.contextTypes = {
  classStore: PropTypes.object.isRequired,
  LinkComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func])
    .isRequired,
};

export default Item;
