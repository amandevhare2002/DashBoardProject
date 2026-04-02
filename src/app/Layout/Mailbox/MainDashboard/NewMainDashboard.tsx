import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { Button, Card, CardBody, Col, ListGroup, ListGroupItem, Row } from "reactstrap";
import { BANKDETILS } from "./constant";
import { AssetType, AssetValue, BankAndCreditCard, ITransactions } from "./interface";
import DataTable from "react-data-table-component";
import { BankAndCreditCardComponent } from "./bankAndCreditCard";
import { NewDashboard } from "./NewDashboard";

const MainExpense = () => {

  return (
    <Fragment>
      <TransitionGroup>
        <CSSTransition component="div" classNames="TabsAnimation" appear={true} timeout={1500} enter={false} exit={false}>
          <div>
            <NewDashboard/>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </Fragment>
  );
};

export default MainExpense;