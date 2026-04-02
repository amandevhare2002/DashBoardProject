import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setEnableMobileMenu } from "../../../reducers/ThemeOptions";
import MetisMenu from "../Common/MetisMenu";

export const Nav = ({ menuItems, callBackMenu, headerList }: any) => {
  console.log("Nav menuItems sample:", menuItems[0]);
  const [globalApiCache, setGlobalApiCache] = useState(new Map());
  const [globalCacheTimestamp, setGlobalCacheTimestamp] = useState(new Map());

  const pathName = usePathname();
  const enableMobileMenu = useSelector(
    (state: any) => state?.ThemeOptions?.enableMobileMenu
  );
  const dispatch = useDispatch();

  const toggleMobileSidebar = () => {
    dispatch(setEnableMobileMenu(!enableMobileMenu));
  };



  return (
    <Fragment>
      <>

        {menuItems?.length > 0 && (
          <MetisMenu
            content={menuItems}
            onSelected={toggleMobileSidebar}
            activeLinkTo={`/${Number(pathName?.split("/")[1])}/${Number(pathName?.split("/")[2])}`}
            className="vertical-nav-menu"
            iconNamePrefix=""
            classNameStateIcon="pe-7s-angle-down"
            callBackMenu={callBackMenu}
            headerList={headerList}
            globalApiCache={globalApiCache}
            setGlobalApiCache={setGlobalApiCache}
            globalCacheTimestamp={globalCacheTimestamp}
            setGlobalCacheTimestamp={setGlobalCacheTimestamp}
            originalMenuData={menuItems}
            menuData={JSON.parse(sessionStorage.getItem('appsideData') || '{}')}
          />
        )}
      </>
    </Fragment>
  );
};
