import { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppMobileMenu } from "../AppMobileMenu";
import { setEnableClosedSidebar } from "../../../reducers/ThemeOptions";

export const HeaderLogo = () => {
  const [active, setActive] = useState(false);
  const dispatch = useDispatch();
  const enableClosedSidebar = useSelector(
    (state: any) => state.ThemeOptions.enableClosedSidebar
  );

  const toggleEnableClosedSidebar = () => {
    dispatch(setEnableClosedSidebar(!enableClosedSidebar));
  };

  return (
    <Fragment>
      <div className="app-header__logo">
        <div className="logo-src" />
        <div className="header__pane ms-auto">
          <div onClick={toggleEnableClosedSidebar}>
            <i
              className={enableClosedSidebar ? "pe-7s-close" : "pe-7s-menu"}
              style={{ width: 42, height: 42, fontSize: 32 }}
            ></i>
          </div>
        </div>
      </div>
      <AppMobileMenu />
    </Fragment>
  );
};
