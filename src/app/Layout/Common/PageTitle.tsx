import cx from "classnames";
import { useSelector } from "react-redux";

export const PageTitle = ({
  icon,
  heading,
  subheading,
}: {
  icon: any;
  heading: string;
  subheading: string;
}) => {
  const enablePageTitleIcon = useSelector(
    (state: any) => state?.ThemeOptions?.enablePageTitleIcon
  );
  const enablePageTitleSubheading = useSelector(
    (state: any) => state?.ThemeOptions?.enablePageTitleSubheading
  );
  return (
    <div className="app-page-title">
      <div className="page-title-wrapper">
        <div className="page-title-heading">
          <div
            className={cx("page-title-icon", {
              "d-none": !enablePageTitleIcon,
            })}
          >
            <i className={icon} />
          </div>
          <div>
            {heading}
            <div
              className={cx("page-title-subheading", {
                "d-none": !enablePageTitleSubheading,
              })}
            >
              {subheading}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
