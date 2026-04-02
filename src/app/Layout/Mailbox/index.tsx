import { setLoading } from "@/reducers/Auth";
import { setMailUserId } from "@/reducers/mail";
import axios from "axios";
import cx from "classnames";
import CryptoJS from "crypto-js";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import ComposeMail from "./ComposeMail";
import { ConversationView } from "./ConversationView";
import { FolderList } from "./FolderList";
import MailDetails from "./MailDetails";
import { MailList } from "./MailList";
import "./mail.scss";
import { emptyFilterOption } from "./utils/constant";
import { decryptText } from "./utils";
import { setTimeout } from "timers";
import { MailList2 } from "./MailList2";
const crypto = require("crypto");
const Tabs = require("rc-tabs").default;
const TabData = require("rc-tabs");
const TabContent = require("rc-tabs/lib/TabContent");
const ScrollableInkTabBar = require("rc-tabs/lib/ScrollableInkTabBar");
const { TabPane } = TabData;
const Mailbox = (props: any) => {
  const token = useSelector((state: any) => state.authReducer.token);
  const selectedEmailUser = useSelector(
    (state: any) => state.mailReducer.mailUserId
  );
  const [state, setState] = useState({
    active: false,
  });
  const [isReadMail, setIsReadMail] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [viewAsHtml, setViewAsHtml] = useState(false);
  const [createNew, setCreateNew] = useState(false);
  const [active, setActive] = useState(false);
  const [mailList, setMailList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const folder = router.query.folder;
  const email = router.query.email;
  const id = router.query.id;
  const isMailList = router.query.isMailList;
  const conversationValue = router.query.conversation;
  const conversationMail = router.pathname.includes("conversationMail");
  let create = router.query.create;
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [prevIndexCount, setPrevIndexCount] = useState(0);
  const [mailCount, setMailCount] = useState(0);
  const [forwardMessageDetails, setForwardMessageDetails] = useState(null);
  const [isConversation, setIsConversation] = useState(false);
  const [conversationArray, setConversationArray] = useState([]);
  const [emailUserList, setEmialUserList] = useState<any>([]);
  const [filterOptionData, setFilterOptionData] = useState(emptyFilterOption);
  const [searchQueryData, setSearchQueryData] = useState(null);
  const [tabindex, setTabIndex] = useState("0");
  const [tabArray, setTabArray] = useState([] as any);
  const [recordsCount, setRecordsCount] = useState(0);
  const [mailIndex, setMailIndex] = useState(0);
  const [decryptedData, setDecryptedData] = useState<any>({
    emaildata: []
  });
  console.log("decryptedData", decryptedData)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [mount, setMount] = useState(false)
  const [value, setValue] = useState<any>(0);
  console.log("tabArray", tabArray, tabindex)

  const [ids, setIds] = useState<any>({});
  useEffect(() => {
    const apikeycliendId = JSON.parse(sessionStorage.getItem("appsideData") || "[]");
    console.log("apikeycliendId", apikeycliendId.EditorClientID);
    setIds({
      clientID: apikeycliendId.EditorClientID,
      apikey: apikeycliendId.EditorKey
    });
  },[])


  useEffect(() => {
    if (id && folder && !conversationValue && !isMailList) {
      setIsReadMail(true);
    } else {
      setIsReadMail(false);
    }

    if (create === "new-mail") {
      setCreateNew(true);
    } else {
      setCreateNew(false);
    }
  }, [folder, id, create]);

  useEffect(() => {
    if (conversationValue && id && folder) {
      fetchConversationData(mailList[currentIndex]);
    }
  }, [conversationValue, id, currentIndex]);

  useEffect(() => {
    if (token) {
      getEmailUserList();
      // getDecryptData();
    }
  }, [token]);

  const getEmailUserList = () => {
    if (!emailUserList && emailUserList.length < 0) {
      return
    }
    const Params = {
      Userid: localStorage.getItem("username"),
      InputType: "LIST"
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetEmailIDList",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setEmialUserList(response?.data?.EmailList || []);
        dispatch(setMailUserId(localStorage.getItem("mailUserId") || ""));
      })
      .catch((error) => { });
  };

  const fetchConversationData = async (messageDetails: any) => {
    let folderName = folder;
    if (folder === "High") {
      folderName = "HIGH";
    }
    if (folder === "Low") {
      folderName = "LOW";
    }
    if (folder === "Medium") {
      folderName === "MEDIUM";
    }

    try {
      dispatch(setLoading(true));
      const Params = {
        Userid: localStorage.getItem("username"),
        Msgnum: messageDetails.MSGNUM,
        FolderName: folderName,
        Subject: messageDetails.SUBJECT,
        GroupNum: messageDetails.GroupNum,
        EmailID:
          email === "undefined" || !email
            ? selectedEmailUser ||
            "" ||
            localStorage.getItem("mailUserId") ||
            ""
            : email,
        isTransfer:
          folderName === "High" ||
            folderName === "Low" ||
            folderName === "Medium"
            ? true
            : false,
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetMessageDetailsConversation",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      res.data.MessageResponses?.map((res: any) => {
        const object = {
          ...res,
          isCollapsed: false,
          htmlContent: "",
        };
        return object;
      });
      setConversationArray(res.data.MessageResponses);
    } catch (err) {
      console.log("Error:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    const currentIndexMail = currentIndex;
    const isFilterMail = localStorage.getItem("isFilterMail") === "true";
    const isTransfer = router.query.isTransfer === "true";
    const currentMail: any = mailList[currentIndexMail];

    if (
      currentIndexMail <= mailList?.length &&
      folder &&
      !(currentIndexMail > mailList.length - 1) &&
      currentMail &&
      !conversationValue &&
      !conversationMail
    ) {
      const queryParams: any = {
        id: currentMail?.MSGNUM,
        folder,
        email: email || selectedEmailUser || localStorage.getItem("mailUserId"),
      };

      if (isTransfer) {
        queryParams["isTransfer"] = "true";
      }

      if (router.query.vendorName) {
        queryParams["vendorName"] = router.query.vendorName;
        queryParams["vendorTag"] = router.query.vendorTag;
        queryParams["vendorMapping"] = router.query.vendorMapping;
      }

      router.push(`/mailbox?${new URLSearchParams(queryParams).toString()}`);
    } else if (conversationValue) {
      router.push(
        `/conversationMail?id=${currentMail?.MSGNUM}&folder=${folder}&conversation=${conversationValue}&GroupNum=${currentMail.GroupNum}`
      );
    }

    if (currentIndexMail > mailList.length - 1) {
      console.log("Enter in currentIndexMail > mailList.length - 1")
      setPrevIndexCount(prevIndexCount + mailList?.length);
      if (isFilterMail) {
        fetchFilterMails(folder, pageNumber + 1, false);
      } else {
        fetchMails(folder, pageNumber + 1, false);
      }
    }

    if (currentIndexMail === -1) {
      console.log("Enter in currentIndexMail > mailList.length")
      setPrevIndexCount(prevIndexCount - mailList?.length);
      if (isFilterMail) {
        fetchFilterMails(
          folder,
          pageNumber === 1 ? pageNumber : pageNumber - 1,
          true
        );
      } else {
        fetchMails(
          folder,
          pageNumber === 1 ? pageNumber : pageNumber - 1,
          true
        );
      }
    }
  }, [currentIndex]);

  console.log("currentIndex", currentIndex)

  const fetchFilterMails = async (
    mailboxType: any,
    pageNumber: number,
    backward: boolean
  ) => {
    dispatch(setLoading(true));
    const Params = {
      Userid: localStorage.getItem("username"),
      ...filterOptionData,
      SearchWords: searchQueryData,
      PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
      EmailID:
        email === "undefined" || !email
          ? selectedEmailUser || localStorage.getItem("mailUserId")
          : email,
    };
    const res = await axios.post(
      "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENCv2",
      Params,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("res",res)

    dispatch(setLoading(false));
    const decrypted = decryptText(res.data);
    setDecryptedData(decrypted)
    setPageNumber(pageNumber);
    setMailCount(decrypted?.emaildata && decrypted.emaildata[value]?.displayEmailsemaildata?.MailCount);
    const currentMail: any = decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists[backward ? decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists.length - 1 : 0];
    const data = JSON.stringify(decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists);
    setRecordsCount(decrypted.RecordsCount);
    console.log("decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists", res, decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists)
    setMailList(decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists)

    if (id) {
      const index = decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists.findIndex(
        (res: any) => res.MSGNUM === currentMail?.MSGNUM
      );
      setCurrentIndex(index);
    }
    // const decrypted = decryptText(res.data);
    // const decrypted = decrypted
    // setDecryptedData(decrypted)
    localStorage.setItem("isFilterMail", "true");
    setPageNumber(pageNumber);
    // setMailCount(decrypted.MailCount);
    // const currentMail: any =
    //   decrypted.emailLists[backward ? decrypted?.emailLists.length - 1 : 0];
    // const data = JSON.stringify(decrypted?.emailLists);
    // setRecordsCount(decrypted.RecordsCount);
    // setMailList([]);
    // console.log("JSON.parse(data)",JSON.parse(data))
    // setMailList(JSON.parse(data));
    // if (id) {
    //   const index = decrypted.emailLists.findIndex(
    //     (res: any) => res.MSGNUM === currentMail?.MSGNUM
    //   );
    //   setCurrentIndex(index);
    // }
  };

  const fetchMails = async (
    mailboxType: any,
    pageNumber: number,
    backward: boolean,
    isFolderMail: boolean = false
  ) => {
    let folderName = folder;
    if (folder === "High") {
      folderName = "HIGH";
    }
    if (folder === "Low") {
      folderName = "LOW";
    }
    if (folder === "Medium") {
      folderName === "MEDIUM";
    }

    const filter = isFolderMail ? { ...emptyFilterOption } : { ...filterOptionData }
    try {
      setIsInitialLoading(true);
      dispatch(setLoading(true));
      const Params = {
        Userid: localStorage.getItem("username"),
        ...filter,
        SearchWords: searchQueryData || "",
        MailFolderName:
          mailboxType === "High" ||
            mailboxType === "Low" ||
            mailboxType === "Medium"
            ? "inbox"
            : mailboxType,
        PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
        EmailID:
          selectedEmailUser || "" || localStorage.getItem("mailUserId") || "",
        Priority: isFolderMail ? mailboxType : folderName,
        IsTransfer:
          mailboxType === "High" ||
            mailboxType === "Low" ||
            mailboxType === "Medium"
            ? true
            : false,
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENCv2",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("res 1", res)
      const decrypted = decryptText(res.data);
      // const encrypted = res.data;
      // const secretKey = "PKGRPHOTEL#@2023";
      // const decrypted = decryptText(encrypted, secretKey);
      // console.log("✅ Decrypted data:", decrypted);
      // console.log("decrypteddecrypted", decrypted)
      // console.log("🔐 Raw Encrypted:", res.data);

      setDecryptedData(decrypted)
      setPageNumber(pageNumber);
      setMailCount(decrypted?.emaildata && decrypted.emaildata[value]?.displayEmailsemaildata?.MailCount);
      const currentMail: any = decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists[backward ? decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists.length - 1 : 0];
      const data = JSON.stringify(decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists);
      setRecordsCount(decrypted.RecordsCount);
      console.log("decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists", res, decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists)
      setMailList(decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists)

      if (id && !isFolderMail) {
        const index = decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists.findIndex(
          (res: any) => res.MSGNUM === currentMail?.MSGNUM
        );
        setCurrentIndex(index);
      }
    } catch (err: any) {
      if (err.message === "Authorization has been denied for this request.") {
        router.push("/login")
      }
      console.log("err", err)
    } finally {
      dispatch(setLoading(false));
    }
  };

  console.log("setMailList", mailList)

  useEffect(() => {
    const findIndex = tabArray.findIndex(
      (res: any) => res.index === mailIndex
    );
    console.log("findIndex", findIndex)
    setTabIndex((findIndex + 1).toString())

  }, [mailIndex]);

  useEffect(() => {
    setTabIndex("0")
    setTabArray([])
  }, [value])

  useEffect(() => {
    setMount(true)
  }, [])

  if (!mount) {
    return null;
  }

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginRight: 20,
          marginBottom: 20,
        }}
      >
        <Select
          options={emailUserList.map((res: any) => {
            return { value: res.Userid, label: res.Userid };
          })}
          isClearable
          placeholder="Select User"
          value={{
            value: selectedEmailUser || "",
            label: selectedEmailUser || "",
          }}
          onChange={(e: any) => {
            dispatch(setMailUserId(e?.value));
            localStorage.setItem("mailUserId", e?.value || "");
            // router.push(`/mailbox?folder=${folder}`);
            // setTimeout(() => {
            router.reload();
            // }, 2000);
          }}
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              width: 300,
            }),
          }}
        />
      </div>
      <TransitionGroup>
        <CSSTransition
          component="div"
          classNames="TabsAnimation"
          appear={true}
          timeout={1500}
          enter={false}
          exit={false}
        >
          <div>
            <div
              className={cx("app-inner-layout TabsAnimation", {
                "open-mobile-menu": state.active,
              })}
            >
              <div className="app-inner-layout__wrapper">
                <Tabs
                  defaultActiveKey="1"
                  activeKey={tabindex}
                  renderTabBar={() => <ScrollableInkTabBar />}
                  onChange={(key: any) => {
                    setTabIndex(key);
                  }}
                  renderTabContent={() => <TabContent animated={false} />}
                >
                  <TabPane tab={`${folder || "New Mail"}`} key="0">
                    {createNew ? (
                      <ComposeMail
                        token={token}
                        handleDiscardMailData={() => {
                          setCreateNew(false);
                          router.push(`/mailbox?folder=${("Inbox").toLocaleLowerCase()}`);
                        }}
                        htmlContent={create !== "new-mail" ? htmlContent : ""}
                        isReply={create === "reply-mail"}
                        isForwardMail={create === "forward-mail"}
                        messageDetails={
                          create === "forward-mail" || create === "reply-mail"
                            ? forwardMessageDetails
                            : null
                        }
                        ids={ids}
                      />
                    ) : conversationValue ? (

                      <ConversationView
                        conversationArray={conversationArray}
                        setConversationArray={setConversationArray}
                        currentMailIndex={currentIndex}
                        setCurrentIndex={setCurrentIndex}
                        prevIndexCount={prevIndexCount}
                        mailList={mailList}
                        mailCount={mailCount}
                      />
                    ) : (

                      <MailList2
                        value={value}
                        setValue={setValue}
                        active={active}
                        mailList={mailList}
                        decryptedData={decryptedData}
                        setDecryptedData={setDecryptedData}
                        setActiveState={(active: boolean) => {
                          setActive(active);
                        }}
                        setMailList={setMailList}
                        setPageNumber={setPageNumber}
                        pageNumber={pageNumber}
                        setPrevIndexCount={setPrevIndexCount}
                        mailCount={mailCount}
                        setMailCount={setMailCount}
                        isConversation={isConversation}
                        setFilterOptionData={setFilterOptionData}
                        setSearchQueryData={setSearchQueryData}
                        onClickMail={(mail: any) => {
                          const index = mailList.findIndex(
                            (res: any) => res.MSGNUM === mail.MSGNUM
                          );

                          const findIndex = tabArray.findIndex(
                            (res: any) => res.index === index
                          );
                          if (findIndex === -1) {
                            tabArray.push({
                              index: index,
                              folder: folder,
                              pageNumber,
                              isReplay: false,
                              isForward: false,
                              isCreate: false,
                              messageDetails: null
                            });
                            setCurrentIndex(index);

                          }
                          setMailIndex(index)
                        }}
                      />
                    )}
                  </TabPane>
                  {tabArray.map((res: any, index: any) => {
                    return (
                      <TabPane
                        tab={
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "flex-start",
                            }}
                          >
                            {`${res.folder} Details ${index + 1}`}{" "}
                            {Number(tabindex) - 1 === index && (
                              <i
                                className="pe-7s-close"
                                onClick={() => {
                                  const tabIndex = [...tabArray];
                                  tabIndex.splice(index, 1);
                                  setTabIndex("0");
                                  console.log("tabIndex", tabIndex)
                                  setTabArray(tabIndex);
                                }}
                                style={{
                                  fontSize: 21,
                                  marginLeft: 10,
                                  cursor: "pointer",
                                }}
                              />
                            )}
                          </div>
                        }
                        closable
                        key={index + 1}
                      >
                        {res.isForward || res.isReply ? (
                          <ComposeMail
                            token={token}
                            htmlContent={res.isCreate ? "" : htmlContent}
                            isReply={res.isReply}
                            isForwardMail={res.isForward}
                            handleDiscardMailData={() => {
                              const tabIndex = [...tabArray];
                              tabIndex[index].isForward = false;
                              tabIndex[index].isReply = false;
                              tabIndex[index].isCreate = false;
                              console.log("tabIndex compose", tabIndex);
                              setTabArray(tabIndex);
                            }}
                            messageDetails={
                              res.isForward || res.isReply
                                ? res.messageDetails
                                : null
                            }
                            ids={ids}
                          />
                        ) : (
                          <MailDetails
                            // isAttachment={re}
                            emailUserList={emailUserList}
                            validatePageNumber={res.pageNumber}
                            validateFolder={res.folder}
                            htmlContent={htmlContent}
                            setIsReadMail={(state: any) => {
                              setIsReadMail(state);
                              setTabIndex("0");
                              if (isConversation) {
                                router.push(
                                  `/conversationMail?folder=${folder}`
                                );
                              } else {
                                if (router.query.isTransfer === "true") {
                                  router.push(
                                    `/mailbox?folder=${folder}&isTransfer=true&email=${email}`
                                  );
                                } else {
                                  router.push(`/mailbox?folder=${folder}`);
                                }
                              }
                            }}
                            currentMailIndexData={res.index}
                            setCurrentIndex={(currentIndex: any) => {

                              setCurrentIndex(currentIndex);
                              const tabIndex = [...tabArray];
                              tabIndex[index].index =
                                currentIndex === recordsCount
                                  ? 0
                                  : currentIndex;
                              if (currentIndex === recordsCount) {
                                tabIndex[index].pageNumber = pageNumber + 1;
                              }
                              console.log("tabIndex mail Detail", tabIndex)
                              setTabArray(tabIndex);
                            }}
                            prevIndexCount={prevIndexCount}
                            pageNumber={pageNumber}
                            mailList={mailList}
                            mailCount={mailCount}
                            onClickForwardMessage={(messageDetails: any) => {
                              if (isConversation) {
                                router.push(
                                  `/conversationMail?create=forward-mail&folder=${folder}`
                                );
                              } else {
                                const tabIndex = [...tabArray];
                                tabIndex[index].isForward = true;
                                tabIndex[index].messageDetails = messageDetails;
                                console.log("tabINdex", tabIndex)
                                setTabArray(tabIndex);
                              }
                              setViewAsHtml(!viewAsHtml);
                            }}
                            onClickReplyMessage={(messageDetails: any) => {
                              if (isConversation) {
                                router.push(
                                  `/conversationMail?create=replay-mail&folder=${folder}`
                                );
                              } else {
                                const tabIndex = [...tabArray];
                                tabIndex[index].isReply = true;
                                tabIndex[index].messageDetails = messageDetails;
                                console.log("tabIndex mail-649", tabIndex)
                                setTabArray(tabIndex);
                              }
                              setViewAsHtml(!viewAsHtml);
                            }}
                          />
                        )}
                      </TabPane>
                    );
                  })}
                </Tabs>

                <FolderList
                  handleNewMail={() => {
                    setTabIndex("0")
                  }}
                  onClickFolder={(key: any, type: any) => {
                    localStorage.setItem("isFilterMail", "false");
                    if (type === "Conversation") {
                      setIsConversation(true);
                      setTabIndex("0");
                      fetchMails(key, 1, true, true);
                    } else {
                      setIsConversation(false);
                      setTabIndex("0");
                      fetchMails(key, 1, true, true);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
      <BottomSheet
        open={active}
        onDismiss={() => {
          setActive(false);
        }}
        style={{ zIndex: 23 }}
        defaultSnap={({ snapPoints, lastSnap }) => lastSnap ?? snapPoints[1]}
        snapPoints={({ height, minHeight, maxHeight }) => [
          maxHeight - maxHeight / 5,
          Math.min(Math.max(height, minHeight), maxHeight * 0.525),
        ]}
      >
        <div className="open-mobile-menu">
          <FolderList
            onClickFolder={() => {
              setActive(false);
            }}
          />
        </div>
      </BottomSheet>
    </Fragment>
  );
};

export default Mailbox;
