import React, { Fragment, useEffect, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Notifications } from "./Notifications";

const MainPartyVendor = () => {

  return (
    <Fragment>
      <TransitionGroup>
        <CSSTransition component="div" classNames="TabsAnimation" appear={true} timeout={1500} enter={false} exit={false}>
          <div>
            <Notifications />
          </div>
        </CSSTransition>
      </TransitionGroup>
    </Fragment>
  );
};

export default MainPartyVendor;