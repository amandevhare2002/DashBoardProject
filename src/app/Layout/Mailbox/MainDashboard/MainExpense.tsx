import React, { Fragment } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { ExpenseComponent } from "./Expense/index";

const MainExpense = () => {

  return (
    <Fragment>
      <TransitionGroup>
        <CSSTransition component="div" classNames="TabsAnimation" appear={true} timeout={1500} enter={false} exit={false}>
            <ExpenseComponent />
        </CSSTransition>
      </TransitionGroup>
    </Fragment>
  );
};

export default MainExpense;