import React, { Fragment, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";

import cx from "classnames";

import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "reactstrap";

import {
  setEnableMobileMenu,
  setEnableMobileMenuSmall,
} from "../../../reducers/ThemeOptions";

export const AppMobileMenu = () => {
  const [active, setActive] = useState(false);
  const [mobile, setMobile] = useState(false);
  const dispatch = useDispatch();
  const closedSmallerSidebar = useSelector(
    (state: any) => state.ThemeOptions.closedSmallerSidebar
  );
  const enableMobileMenu = useSelector(
    (state: any) => state.ThemeOptions.enableMobileMenu
  );
  const enableMobileMenuSmall = useSelector(
    (state: any) => state.ThemeOptions.enableMobileMenuSmall
  );
  const [activeSecondaryMenuMobile, setActiveSecondaryMenuMobile] =
    useState(false);

  const toggleMobileSidebar = () => {
    dispatch(setEnableMobileMenu(!enableMobileMenu));
  };

  const toggleMobileSmall = () => {
    dispatch(setEnableMobileMenuSmall(!enableMobileMenuSmall));
  };

  return (
    <Fragment>
      <div className="app-header__mobile-menu">
        <div onClick={toggleMobileSidebar}>
        <i
              className={enableMobileMenu ? "pe-7s-close" : "pe-7s-menu"}
              style={{ width: 42, height: 42, fontSize: 32 }}
            ></i>
        </div>
      </div>
      <div className="app-header__menu">
        <span onClick={toggleMobileSmall}>
          <Button
            size="sm"
            className={cx("btn-icon btn-icon-only", {
              active: activeSecondaryMenuMobile,
            })}
            color="primary"
            onClick={() =>
              setActiveSecondaryMenuMobile(!activeSecondaryMenuMobile)
            }
          >
            <div className="btn-icon-wrapper">
              <FontAwesomeIcon icon={faEllipsisV as any} />
            </div>
          </Button>
        </span>
      </div>
    </Fragment>
  );
};
