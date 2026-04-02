import React, { Fragment, useState } from "react";
const Elastic = require("react-burgers");

export const HeaderRightDrawer = () => {
  const [active, setActive] = useState(false);
  const [openRight, setOpenRight] = useState(false);

  return (
    <Fragment>
      <div className="header-btn-lg">
        <Elastic
          width={26}
          lineHeight={2}
          lineSpacing={5}
          color="#6c757d"
          padding="5px"
          active={active}
          onClick={() => {
            setOpenRight(!openRight);
            setActive(!active);
          }}
        />
      </div>
    </Fragment>
  );
};
