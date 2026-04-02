import { setLoading } from "@/reducers/Auth";
import axios from "axios";
import { useRouter } from "next/router";
import { Fragment, useEffect, useRef, useState } from "react";
import Loader from "react-loaders";
import { useDispatch, useSelector } from "react-redux";
import { Card, Collapse } from "reactstrap";
const LoadingOverlay = require("react-loading-overlay-ts").default;

export const ConversationView = ({
  conversationArray,
  setConversationArray,
  currentMailIndex,
  setCurrentIndex,
  mailList,
  mailCount,
}: any) => {
  const mailRef: any = useRef();
  const loading = useSelector((state: any) => state.authReducer.loading);
  const router = useRouter();
  const folder = router.query.folder;
  const id = router.query.id;

  const onClickCollapse = async (response: any, index: number) => {
    const conversationData = [...conversationArray];
    conversationData[index].isCollapsed = !conversationData[index].isCollapsed;
    setConversationArray(conversationData);
  };

  return (
    <Fragment>
      <Card className="app-inner-layout__content">

          {loading ?  <div
            style={{
              height: "80vh",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader active={loading} type="ball-pulse-rise" />
          </div>: <div className="card card-primary card-outline" ref={mailRef}>
            <div
              className="card-header"
              style={{ gap: 10, justifyContent: "space-between" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <i
                  onClick={() => {
                    router.push(`/conversationMail?id=${id}&folder=${folder}`);
                  }}
                  className="pe-7s-left-arrow"
                  style={{ fontSize: 30 }}
                ></i>
                <h3 className="card-title" style={{ margin: 0 }}>
                  Conversation Mail
                </h3>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <i
                  onClick={() => {
                    localStorage.setItem('mailIndex', `${currentMailIndex - 1}`)
                    setCurrentIndex(currentMailIndex - 1);
                  }}
                  className="pe-7s-angle-left"
                  style={{ fontSize: 40 }}
                />
                {currentMailIndex + 1} /{" "}
                {mailCount}
                <i
                  onClick={() => {
                    localStorage.setItem('mailIndex', `${currentMailIndex + 1}`)
                    setCurrentIndex(currentMailIndex + 1);
                  }}
                  className="pe-7s-angle-right"
                  style={{ fontSize: 40 }}
                />
              </div>
            </div>
            <div className="card-body">
              {conversationArray?.map((res: any, index: number) => {
                return (
                  <div>
                    <div
                      className="card-header"
                      onClick={() => {
                        onClickCollapse(res, index);
                      }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <h6 className="card-header-title fw-bolder mb-0">
                        {res.Subject}
                      </h6>
                      <span>Msg No: {res.Msgnum}</span>
                      <span>{res.RecieveDate}</span>
                    </div>
                    <Collapse isOpen={res.isCollapsed}>
                      <div className="card-body p-0">
                        <div className="mailbox-read-info">
                          <div className="mailbox-read-info">
                            <h5>{res.Subject}</h5>
                            <h6>From: {res.FromMail}</h6>
                            <h6>Date: {res.RecieveDate}</h6>
                            <h6>Subject: {res.Subject}</h6>
                            <h6>To: {res.Tomail}</h6>
                          </div>
                        </div>

                        <div
                          className="mailbox-read-message"
                          dangerouslySetInnerHTML={{
                            __html: res.HtmlBodyPath || res.TextBody,
                          }}
                        ></div>
                      </div>
                    </Collapse>
                  </div>
                );
              })}
            </div>
          </div>}
      </Card>
    </Fragment>
  );
};
