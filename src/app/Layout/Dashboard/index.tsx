import cx from "classnames";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import ResizeDetector from "react-resize-detector";
import dynamic from "next/dynamic";
const CreateDynamicForm = dynamic<{}>(() =>
  import("./DynamicForm/CreateDynamicForm").then(
    (module) => module.CreateDynamicForm
  )
);
const DynamicUI = dynamic<{}>(() =>
  import("./DynamicUI/DynamicUI").then((module) => module.DynamicUI)
);

const Dashboard = () => {
  const pathName = usePathname();
  const [closedSmallerSidebar, setClosedSmallerSidebar] = useState(false);
  const colorScheme = useSelector(
    (state: any) => state?.ThemeOptions?.colorScheme
  );
  const enableFixedHeader = useSelector(
    (state: any) => state?.ThemeOptions?.enableFixedHeader
  );
  const enableMobileMenu = useSelector(
    (state: any) => state?.ThemeOptions?.enableMobileMenu
  );
  const enableFixedFooter = useSelector(
    (state: any) => state?.ThemeOptions?.enableFixedFooter
  );
  const enableFixedSidebar = useSelector(
    (state: any) => state?.ThemeOptions?.enableFixedSidebar
  );
  const enableClosedSidebar = useSelector(
    (state: any) => state?.ThemeOptions?.enableClosedSidebar
  );
  const enablePageTabsAlt = useSelector(
    (state: any) => state?.ThemeOptions?.enablePageTabsAlt
  );
    console.log("In this page",pathName,pathName?.split("/")[1])
  return (
    <>
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
                  "closed-sidebar-mobile": closedSmallerSidebar || width < 1250,
                },
                { "sidebar-mobile-open": enableMobileMenu },
                { "body-tabs-shadow-btn": enablePageTabsAlt }
              )}
            >
              <Fragment>
                <div className="app-inner-layout">
                  <div className="app-inner-layout__header-boxed p-0">
                    {pathName?.split("/")[1] === "1" ? (
                      <>
                      <CreateDynamicForm />
                      </>
                    ) : (
                      <DynamicUI />
                    )}
                  </div>
                </div>
              </Fragment>
            </div>
          </Fragment>
        )}
      />
      
    </>
  );
};

export default Dashboard;
