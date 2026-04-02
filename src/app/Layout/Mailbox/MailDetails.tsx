import React, {
  ChangeEvent,
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMailService } from "./services/mail.service";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Collapse,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudDownloadAlt,
  faFile,
  faPaperclip,
  faPrint,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import Loader from "react-loaders";
const LoadingOverlay = require("react-loading-overlay-ts").default;
import Select from "react-select";
import { useRouter } from "next/router";
import axios from "axios";
const parse = require("react-render-html");
const toast = require("react-toastify");
import "react-toastify/dist/ReactToastify.css";
import Tooltip from "rc-tooltip";
import update from "immutability-helper";
import { RCDatePicker } from "../Common/DatePicker";
import { setModuleList } from "@/reducers/mail";
import { useDispatch } from "react-redux";
import Loading from "@/app/loading";
import { Backdrop, CircularProgress } from "@mui/material";

function MailDetails(props: any) {
  const {
    htmlContent,
    validatePageNumber,
    validateFolder,
    setIsReadMail,
    setCurrentIndex,
    prevIndexCount,
    currentMailIndexData,
    mailList,
    mailCount,
    onClickForwardMessage,
    onClickReplyMessage,
    emailUserList,
    pageNumber,
  } = props;
  const dispatch = useDispatch()
  const mailRef: any = useRef();
  const moduleList = useSelector((state: any) => state.mailReducer.moduleList)
  const loading = useSelector((state: any) => state.authReducer.loading);
  const token = useSelector((state: any) => state.authReducer.token);
  const router = useRouter();
  const [isMappOld, setIsMappOld] = useState({
    value: "",
    label: "",
  })
  const [selectedEmails, setSelectedEmails] = useState([]);
  const folder = router.query.folder;


  const [openDeleteMail, setOpenDeleteMail] = useState({
    name: "",
    open: false,
  });
  const [vendorList, setVendorList] = useState([]);
  const [selectedVendorName, setSelectedVendorName] = useState({
    value: "",
    label: "",
  });
  const [vendorTagList, setVendorTagList] = useState([]);
  const [selectedVendorTag, setSelectedVendorTag] = useState({
    value: "",
    label: "",
  });
  const [vendorMappingList, setVendorMappingList] = useState([]);
  const [selectedVendorMapping, setSelectedVendorMapping] = useState({
    value: "",
    label: "",
  });
  const [recordID, setRecordID] = useState("");
  const [isRecordIdVerrfied, setIsRecordIdVerified] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<any>(null);
  const [countDownTimer, setCountDownTimer] = useState("");
  const timer: any = useRef();
  const [priorityMailList, setPriorityMailList] = useState([]);
  const [status, setStatus] = useState("");
  const [isFilterEmial, setIsFilterEmail] = useState(false);
  const [isTransferComment, setIsTransferComment] = useState(false);
  const [transferComment, setTransferComment] = useState("");
  const [internalTransferComment, setIsInternalTransferComment] =
    useState(false);

  const [commentThreads, setCommentThreads] = useState<any>([]);
  const [readMailLogs, setReadMailsLog] = useState([]);
  const [isCollapsedMailRead, setIsCollapredMailRead] = useState(false);
  const [updateButtonLoading, setUpdateButtonLoading] = useState(false);
  const [transferButtonLoading, setTransferButtonLoading] = useState(false);
  const [internalTransferLoading, setInternalTransferLoading] = useState(false);
  const [taskEnd, setTaskEnd] = useState(false);
  const [sectionWidth, setSectionWidth] = useState(288);
  const [isDynamicCollapse, setIsDynamicCollapse] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedModule, setSelectedModule] = useState("");
  // const [modules, setModules] = useState<any>([]);
  const [dynamicUIData, setDynamicUIData] = useState<any>(null);
  const email = router.query.email;
  const [selectedSection, setSelectedSection] = useState({
    value: "",
    label: "",
  });
  const [defaultSection, setDefaultSection] = useState({
    value: "",
    label: "",
  });
  const [fileArray, setFileArray] = useState<any>([]);
  const [onShowUploadedFile, setOnShowUplaodedFile] = useState(false);
  const [attachements, setAttachments] = useState([]);
  const [isFilters, setIsFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSubjectMap, setIsSubjectMap] = useState("")
  const [fromMapVal, setFromMapVal] = useState("")
  const [mailloading, setMailloading] = useState(false);

  useEffect(() => {
    // Set loading to true when component mounts
    setMailloading(true);

    // Simulate loading (or use your actual loading logic)
    const timer = setTimeout(() => {
      setMailloading(false);
    }, 1000); // Adjust timeout as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("isFilterMail") === "true") {
      setIsFilterEmail(true);
    } else {
      setIsFilterEmail(false);
    }
    if (mailList[currentMailIndexData]) {
      setSelectedVendorName({
        value: mailList[currentMailIndexData].VendorName,
        label: mailList[currentMailIndexData].VendorName,
      });
      setSelectedVendorTag({
        value: mailList[currentMailIndexData].VendorTag,
        label: mailList[currentMailIndexData].VendorTag,
      });
      setSelectedVendorMapping({
        value: mailList[currentMailIndexData].MappingType,
        label: mailList[currentMailIndexData].MappingType,
      });
    }
    if (mailList[currentMailIndexData]?.EndTime) {
      updateTimer();
    }
  }, [mailList]);

  const fetchMessageDetails = async () => {

    let folderName = mailList[currentMailIndexData]?.FolderName;
    let NewFolderName = folderName;
    if (folderName === "High") {
      NewFolderName = "HIGH";
    }
    if (folderName === "Low") {
      NewFolderName = "LOW";
    }
    if (folderName === "Medium") {
      NewFolderName === "MEDIUM";
    }
    try {
      const Params = {
        Userid: localStorage.getItem("username"),
        Msgnum:
          mailList[currentMailIndexData]?.Msgnum ||
          mailList[currentMailIndexData]?.MSGNUM,
        FolderName: NewFolderName,
        EmailID:
          email === "undefined" || !email
            ? localStorage.getItem("mailUserId") || ""
            : email,
        isTransfer:
          folderName === "High" ||
            folderName === "Low" ||
            folderName === "Medium"
            ? true
            : false,
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetMessageDetails",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttachments(res.data.Attachments);
    } catch (err) {
      console.log("Error:", err);
    } finally {
    }
  };

  // useEffect(() => {
  //   fetchMessageDetails()
  // })

  const getDynamicUI = async (id: any) => {
    const result = await axios.post(
      `https://logpanel.insurancepolicy4u.com/api/Login/GetDynamicUI?MenuID=${id}&Userid=${localStorage.getItem(
        "username"
      )}&ipaddress=122.176.54.19`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setDynamicUIData(result.data.uiitems);
  };

  const GetModuleList = () => {
    if (moduleList && moduleList.length > 0) {
      return
    }
    fetch("https://logpanel.insurancepolicy4u.com/api/Login/GetReportData", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Userid: localStorage.getItem("username"),
        reportsColumns: [
          {
            Dbname: "CommonDB_For_UI",
            Tabname: "DynamicModules",
            Colname: "ModuleID",
            ischartColumn: false,
            ChartOperationType: "",
            chartColumnTypes: "",
            AggFuncApplied: "",
            ChartjoinCols: "",
            RecordLinkPath: "",
          },
          {
            Dbname: "CommonDB_For_UI",
            Tabname: "DynamicModules",
            Colname: "ModuleName",
            ischartColumn: false,
            ChartOperationType: "",
            chartColumnTypes: "",
            AggFuncApplied: "",
            ChartjoinCols: "",
            RecordLinkPath: "abc",
          },
          {
            Dbname: "CommonDB_For_UI",
            Tabname: "DynamicModules",
            Colname: "MenuID",
            ischartColumn: false,
            ChartOperationType: "",
            chartColumnTypes: "",
            AggFuncApplied: "",
            ChartjoinCols: "",
            RecordLinkPath: "abc",
          },
        ],
        selected_DB_Tables: [
          {
            SelectedDb: "CommonDB_For_UI",
            SelectedTab: "DynamicModules",
          },
        ],
        joiningColumns: [],
        conditionalColsLists: [
          {
            ConditionDbname: "CommonDB_For_UI",
            ConditionTabname: "DynamicModules",
            ConditionColumn: "IsModuleForMail",
            ConditionTypeApply: "EQUAL",
            conditionValues: [
              {
                ConditionValue: true,
              },
            ],
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        response.Report.unshift({});

        dispatch(setModuleList(response.Report));
        // setModules(response.Report);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    getCommentThreads();
    fetchMessageDetails();
    GetModuleList();
  }, [currentMailIndexData]);

  const updateTimer = () => {
    const targetTime = new Date(mailList[currentMailIndexData]?.EndTime).getTime(); //"2023-09-16 19:23:40"
    const currentTime = new Date().getTime();
    const timeDifference = targetTime - currentTime;

    if (timeDifference <= 0) {
      setTaskEnd(true);
      setCountDownTimer("");
      clearTimeout(timer.current);
      return;
    }

    const seconds = Math.floor((timeDifference / 1000) % 60);
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    setCountDownTimer(`${hours}h ${minutes}m ${seconds}s`);
    timer.current = setTimeout(updateTimer, 1000);
  };

  useEffect(() => {
    if (token) {

      const Params = {
        Userid: localStorage.getItem("username"),
      };

      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetTaggingAPI",
          Params,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response: any) => {
          console.log("response.data.MappingTypes", response.data.MappingTypes)
          setVendorMappingList(response.data.MappingTypes);
        })
        .catch((error: any) => {
          if (error.message === "Authorization has been denied for this request.") {
            router.push("/login")
          }
        });
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/PriorityList",
          {
            Userid: localStorage.getItem("username"),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setPriorityMailList(response.data.Table);
        });


    }
  }, [token]);

  const getCommentThreads = () => {
    if (router?.query?.isTransfer === "true") {
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetCommentsThread",
          {
            Msgnum:
              mailList[currentMailIndexData]?.Msgnum ||
              mailList[currentMailIndexData]?.MSGNUM,
            Userid: localStorage.getItem("username"),
            EmailID: localStorage.getItem("mailUserId"),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setCommentThreads(res.data.CommentsThread);
        })
        .catch((error) => { });
    }
  };

  const getReadMailsLogs = () => {
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetMailReadLog",
        {
          Msgnum:
            mailList[currentMailIndexData]?.Msgnum ||
            mailList[currentMailIndexData]?.MSGNUM,
          Userid: localStorage.getItem("username"),
          FolderName: folder,
          EmailID: localStorage.getItem("mailUserId"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setReadMailsLog(res.data.MailLogs);
      })
      .catch((error) => { });
  };

  const onUpdateTag = () => {
    const Params = {
      Msgnum:
        mailList[currentMailIndexData]?.Msgnum ||
        mailList[currentMailIndexData]?.MSGNUM,
      Userid: localStorage.getItem("username"),
      FolderName:
        folder === "High" || folder === "Low" || folder === "Medium"
          ? "inbox"
          : folder,
      VendorName: selectedVendorName?.value || "",
      VendorTag: selectedVendorTag?.value || "",
      MappingType: selectedVendorMapping?.value || "",
      RecordID: recordID || "",
      EmailID: localStorage.getItem("mailUserId"),
      "IsMappOld": isMappOld.value === "YES" ? true : false,
      "Subject": isSubjectMap,
      "Domain": fromMapVal
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UpdateMailTag",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        toast.toast.success("Mail Updated Successfully", {
          style: { top: 80 },
        });
      })
      .catch((error) => { });
  };

  const onTransferMail = () => {
    const Params = {
      Msgnum:
        mailList[currentMailIndexData]?.Msgnum ||
        mailList[currentMailIndexData]?.MSGNUM,
      Userid: localStorage.getItem("username"),
      EmailID: localStorage.getItem("mailUserId"),
      FolderName:
        folder === "High" || folder === "Low" || folder === "Medium"
          ? "inbox"
          : folder,
      Priority: selectedPriority?.value,
      TransferComments: transferComment,
      transferPersons: selectedEmails?.map((res: any) => {
        return {
          TransferToEmail: res.value,
        };
      }),
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/TransferEmail",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setIsTransferComment(false);
        toast.toast.success("Mail Transfered Successfully", {
          style: { top: 80 },
        });
      })
      .catch((error) => { });
  };

  const onInternaltransfer = () => {
    setInternalTransferLoading(true);
    const Params = {
      Msgnum:
        mailList[currentMailIndexData]?.Msgnum ||
        mailList[currentMailIndexData]?.MSGNUM,
      Userid: localStorage.getItem("username"),
      EmailID: localStorage.getItem("mailUserId"),
      FolderName:
        folder === "High" || folder === "Low" || folder === "Medium"
          ? "inbox"
          : folder,
      Priority: selectedPriority?.value,
      TransferComments: transferComment,
      transferPersons: selectedEmails?.map((res: any) => {
        return {
          TransferToEmail: res.value,
        };
      }),
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/InternalTransfer",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setIsInternalTransferComment(false);
        setInternalTransferLoading(false);
        toast.toast.success("Mail Transfered Successfully", {
          style: { top: 80 },
        });
      })
      .catch((error) => {
        setInternalTransferLoading(false);
      });
  };

  const onUpdateStatus = () => {
    setUpdateButtonLoading(true);
    const Params = {
      Msgnum:
        mailList[currentMailIndexData]?.Msgnum ||
        mailList[currentMailIndexData]?.MSGNUM,
      Userid: localStorage.getItem("username"),
      EmailID: localStorage.getItem("mailUserId"),
      Status: status,
      Priority: selectedPriority?.value || "",
      Comments: transferComment,
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UpdateTransfermail",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setIsTransferComment(false);
        setUpdateButtonLoading(false);
        toast.toast.success("Mail Status Updated", { style: { top: 80 } });
      })
      .catch((error) => {
        setUpdateButtonLoading(false);
      });
  };
  const mailService = useMailService(token);

  const handleDeleteMail = async () => {
    localStorage.setItem(
      "undoMail",
      JSON.stringify([
        {
          id:
            mailList[currentMailIndexData]?.Msgnum ||
            mailList[currentMailIndexData]?.MSGNUM,
          folder: folder,
        },
      ])
    );
    try {
      const FolderName = folder;
      const id =
        mailList[currentMailIndexData]?.Msgnum ||
        mailList[currentMailIndexData]?.MSGNUM;
      const payload = {
        Msgnum: id,
        MailFolderName: FolderName,
      };
      const res = await mailService.deleteEmail([payload]);
      if (res === "Success") {
        setIsReadMail(false);
        router.back();
      }
    } catch (error) {
      console.log("Error with Delete mail.", error);
    }
  };

  const handlePrintmail = () => {
    let printContents = mailRef.current.innerHTML;
    let originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>, field: any) => {
    const index = dynamicUIData?.uiitems.findIndex(
      (res: any) => res.FieldID === field.FieldID
    );
    const updatedState = update(field, {
      uiitemsvalues: {
        [0]: {
          UIValue: { $set: e.target.value },
        },
      },
    });
    dynamicUIData.uiitems[index] = updatedState;
    setDynamicUIData({ ...dynamicUIData });
  };

  const onChangeFileUpload = (e: ChangeEvent<HTMLInputElement>, field: any) => {
    const file: any = e.target.files?.[0];
    const reader: any = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const index = dynamicUIData?.uiitems.findIndex(
        (res: any) => res.FieldID === field.FieldID
      );
      const updatedState = update(field, {
        uiitemsvalues: {
          [0]: {
            UIValue: { $set: reader.result },
          },
        },
      });
      dynamicUIData.uiitems[index] = updatedState;
      setDynamicUIData({ ...dynamicUIData });
    };
  };

  const onClickButton = (field: any) => {
    let isUpload = false;
    const index = dynamicUIData?.uiitems.findIndex(
      (res: any) => res.FieldID === field.FieldID
    );
    const newArray: Array<{ FieldValue: string | undefined; FieldID: number }> =
      [];
    dynamicUIData?.uiitems?.[index || 0]?.uibuttonfields?.map(
      (response: any) => {
        dynamicUIData.uiitems.map((res: any) => {
          res.sectionsLists.map((sections: any) => {
            if (sections.SectionName === selectedSection.label) {
              if (
                res.FieldID === response.FieldID &&
                res.inputtype === "DROPDOWN"
              ) {
                if (res.fieldValue) {
                  const object = {
                    FieldID: res.FieldID,
                    FieldValue: res?.fieldValue,
                  };
                  newArray.push(object);
                }
              }
              if (
                res.FieldID === response.FieldID &&
                res?.uiitemsvalues?.[0]?.UIValue &&
                res.inputtype !== "DROPDOWN"
              ) {
                const object = {
                  FieldID: res.FieldID,
                  FieldValue: res?.uiitemsvalues?.[0]?.UIValue,
                };
                newArray.push(object);
              }
              if (
                res.inputtype === "FILEUPLOAD" &&
                res?.uiitemsvalues?.[0]?.UIValue
              ) {
                isUpload = true;
              }
            }
          });
        });
      }
    );
    if (newArray.length === 0) {
      return;
    }
    let bodyData = null;
    if (isUpload) {
      bodyData = {
        ButtonJsonstring: JSON.stringify({ uiresponse: newArray }),
        Filename: "upload",
      };
    } else {
      bodyData = {
        ButtonJsonstring: JSON.stringify({ uiresponse: newArray }),
      };
    }
    const eventUrl = field?.ButtonEventURL?.split("&")[0];
    fetch(
      `${eventUrl}&ButtonID=${field.FieldID}&ButtonOperation=${field.ButtonOperation}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(bodyData),
      }
    )
      .then((response) => response.json())
      .then((response) => {
        if (isUpload) {
          setFileArray(response?.attachmentFiles);
          toast.toast.success("Upload Success", { style: { top: 80 } });
        } else {
          toast.toast.success("Stored Successfully", { style: { top: 80 } });
        }
      });
  };

  const onChangeDropdown = (e: ChangeEvent<HTMLInputElement>, field: any) => {
    const index = dynamicUIData?.uiitems.findIndex(
      (res: any) => res.FieldID === field.FieldID
    );
    dynamicUIData.uiitems[index] = {
      ...dynamicUIData.uiitems[index],
      fieldValue: e.target.value,
    };
    setDynamicUIData({ ...dynamicUIData });
    const requiredFields = field?.ConditionalFields.split(",");
    const requiredFieldsData: any = [];
    requiredFields.map((res: any) => {
      dynamicUIData.uiitems.map((response: any) => {
        if (response.FieldID === Number(res)) {
          const object = {
            FieldID: response.FieldID,
            FieldValue: response.fieldValue,
          };
          requiredFieldsData.push(object);
        }
      });
    });
    if (field.IsClickEventAvailable) {
      fetch(
        `https://logpanel.insurancepolicy4u.com/api/Login/GetClickEventFieldData?FieldID=${field.FieldID
        }&Userid=${localStorage.getItem("username")}&Value=${e.target.value}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requiredFields: requiredFieldsData }),
        }
      )
        .then((response) => response.json())
        .then((response) => {
          response?.clickeventitems?.map(
            (clickeventData: {
              FieldID: number;
              FieldName: string;
              Visibility: boolean;
              clickeventitemvalues: Array<{
                UIValue: string;
              }>;
            }) => {
              const index = dynamicUIData.uiitems.findIndex(
                (res: any) => res.FieldID === clickeventData.FieldID
              );
              dynamicUIData.uiitems[index] = {
                ...dynamicUIData.uiitems[index],
                uiitemsvalues: clickeventData.clickeventitemvalues,
                fieldValue: e.target.value,
                DefaultVisibility: clickeventData.Visibility,
              };
              setDynamicUIData({ ...dynamicUIData });
            }
          );

          if (response?.sectionsLists?.length > 1) {
            const section = response?.sectionsLists.find(
              (res: any) => res.SectionID === selectedSection.value
            );
            setSelectedSection({
              value: section?.SectionID,
              label: section?.SectionName,
            });
          } else {
            setSelectedSection({
              value:
                response?.sectionsLists?.[0]?.SectionID || defaultSection.value,
              label:
                response?.sectionsLists?.[0]?.SectionName ||
                defaultSection.label,
            });
          }
        });
    }
  };

  useEffect(() => {

    if (isMappOld?.value === "YES") {
      setIsSubjectMap(mailList[currentMailIndexData]?.SUBJECT)
      setFromMapVal(mailList[currentMailIndexData]?.FROMMAIL)
    } else {
      setIsSubjectMap("")
      setFromMapVal("")
    }
  }, [isMappOld])

  console.log("isMappOld", pageNumber, prevIndexCount, mailList.length, currentMailIndexData)

  return (
    <Fragment>
      <toast.ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
      />

      <Card className="app-inner-layout__content">
        {loading ? (
          <div
            style={{
              height: "80vh",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader active={loading} type="ball-pulse-rise" />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "space-between",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div
              style={{
                width: "100%",
              }}
            >
              <div className="card card-primary card-outline" ref={mailRef}>
                {!loading && (
                  <div
                    className="card-header"
                    style={{
                      gap: 10,
                      justifyContent: "space-between",
                      height: "auto",
                      paddingTop: 10,
                      paddingBottom: 10,
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <h3 className="card-title" style={{ margin: 0 }}>
                        Read Mail
                      </h3>
                    </div>

                    {validatePageNumber === pageNumber && folder === validateFolder && <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                      }}
                    >
                      <i
                        onClick={() => {

                          if (
                            currentMailIndexData - 1 === -1
                            // &&pageNumber === 1
                          ) {
                            return;
                          }
                          setCurrentIndex(currentMailIndexData - 1);
                        }}
                        className="pe-7s-angle-left"
                        style={{ fontSize: 40 }}
                      />
                      {
                        (
                          (pageNumber * 50) +
                          (currentMailIndexData +
                            1))}{" "}
                      {/* {
                      prevIndexCount -
                        (mailList.length +
                        currentMailIndexData +
                        1)}{" "} */}
                      / {mailCount}
                      <i
                        onClick={() => {
                          // if (currentMailIndexData + 1 === mailCount) {
                          if (((pageNumber * 50) + (currentMailIndexData + 1)) === mailCount) {
                            return;
                          }
                          setCurrentIndex(currentMailIndexData + 1);
                        }}
                        className="pe-7s-angle-right"
                        style={{ fontSize: 40 }}
                      />
                    </div>}
                  </div>
                )}

                <div className="card-body p-0">
                  <CardHeader
                    onClick={() => {
                      setIsFilters(!isFilters);
                    }}
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <CardTitle>More Filters</CardTitle>
                    {!loading && router?.query?.isTransfer === "true" ? null : (
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            marginTop: 10,
                            gap: 10,
                            paddingBottom: 10,
                            paddingLeft: 10,
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <div
                            style={{
                              flexDirection: "column",
                              width: "20%",
                              justifyContent: "flex-end",
                            }}
                          ></div>
                          {props?.messageDetails?.TaskID && (
                            <Label>
                              Task ID: {props?.messageDetails?.TaskID}
                            </Label>
                          )}
                        </div>
                      </div>
                    )}

                    <Input
                      type="select"
                      placeholder={"Select Module"}
                      style={{ width: "22%", height: 40 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      value={selectedModule}
                      onChange={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (e.target.value !== "Select Module") {
                          setSelectedModule(e.target.value);
                          getDynamicUI(e.target.value);
                          setIsEdit(true);
                          setIsDynamicCollapse(true);
                        } else {
                          setSelectedModule(e.target.value);
                          setIsEdit(false);
                          setIsDynamicCollapse(false);
                        }
                      }}
                    >
                      {moduleList.map((res: any, index: number) => {
                        return index === 0 ? (
                          <option selected value={"Select Module"}>
                            Select Module
                          </option>
                        ) : (
                          <option selected value={res.MenuID}>
                            {res.ModuleName}
                          </option>
                        );
                      })}
                    </Input>
                  </CardHeader>
                  <Collapse isOpen={isFilters}>
                    <div style={{ padding: 10 }}>
                      {router?.query?.isTransfer === "true" ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <Select
                            options={emailUserList.map((res: any) => {
                              return { value: res.Userid, label: res.Userid };
                            })}
                            isClearable
                            placeholder="Select Email Ids"
                            closeMenuOnSelect={false}
                            value={selectedEmails}
                            isMulti
                            onChange={(e: any) => {
                              setSelectedEmails(e);
                            }}
                            styles={{
                              control: (baseStyles, state) => ({
                                ...baseStyles,
                                width: 200,
                              }),
                            }}
                          />
                          <Select
                            options={
                              priorityMailList.map((res: any) => {
                                return {
                                  value: res.PriorityName,
                                  label: res.PriorityName,
                                };
                              }) as any
                            }
                            isClearable
                            placeholder="Priority"
                            closeMenuOnSelect={false}
                            value={selectedPriority}
                            onChange={(e: any) => {
                              setSelectedPriority(e);
                            }}
                            styles={{
                              control: (baseStyles, state) => ({
                                ...baseStyles,
                                width: 200,
                              }),
                            }}
                          />
                          <Input
                            value={status}
                            type="select"
                            style={{ width: 150 }}
                            onChange={(e) => setStatus(e.target.value)}
                          >
                            <option value="DONE">DONE</option>
                            <option value="PENDING">PENDING</option>
                          </Input>
                          <Button
                            onClick={() => {
                              setIsTransferComment(true);
                            }}
                            color="primary"
                          >
                            {" "}
                            Update Status
                          </Button>
                          {router?.query?.isTransfer === "true" && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginLeft: 10,
                              }}
                            >
                              <Button
                                onClick={() => {
                                  setIsInternalTransferComment(true);
                                }}
                                color="primary"
                              >
                                {" "}
                                Internal Transfer
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 10,
                          }}
                        >
                          <Select
                            options={emailUserList.map((res: any) => {
                              return { value: res.Userid, label: res.Userid };
                            })}
                            isClearable
                            placeholder="Select Email Ids"
                            closeMenuOnSelect={false}
                            value={selectedEmails}
                            isMulti
                            onChange={(e: any) => {
                              setSelectedEmails(e);
                            }}
                            styles={{
                              control: (baseStyles, state) => ({
                                ...baseStyles,
                                width: 300,
                              }),
                            }}
                          />
                          <Select
                            options={
                              priorityMailList.map((res: any) => {
                                return {
                                  value: res.PriorityName,
                                  label: res.PriorityName,
                                };
                              }) as any
                            }
                            isClearable
                            placeholder="Priority"
                            closeMenuOnSelect={false}
                            value={selectedPriority}
                            onChange={(e: any) => {
                              setSelectedPriority(e);
                            }}
                            styles={{
                              control: (baseStyles, state) => ({
                                ...baseStyles,
                                width: 300,
                              }),
                            }}
                          />
                          <Button
                            onClick={() => {
                              setIsTransferComment(true);
                            }}
                            color="primary"
                          >
                            {" "}
                            Transfer
                          </Button>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          marginTop: 10,
                          gap: 10,
                          paddingBottom: 10,
                          paddingLeft: 10,
                          borderBottom: "1px solid #ddd",
                          flexWrap: "wrap",
                        }}
                      >
                        <Select
                          options={vendorMappingList?.map((res: any) => {
                            return {
                              value: res.mappingtype,
                              label: res.mappingtype,
                              res: res,
                            };
                          })}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              width: 200,
                            }),
                          }}
                          isClearable
                          onChange={(e: any) => {
                            setSelectedVendorMapping(e);
                            if (e) {
                              setVendorList(e.res.CompanyNames);
                            }
                          }}
                          placeholder={"Vendor Mapping"}
                          value={
                            selectedVendorMapping?.value
                              ? selectedVendorMapping
                              : null
                          }
                        />
                        <Select
                          options={vendorList?.map((res: any) => {
                            return {
                              value: res.company,
                              label: res.company,
                              res: res,
                            };
                          })}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              width: 200,
                            }),
                          }}
                          placeholder={"Vendor Name"}
                          onChange={(e: any) => {
                            setSelectedVendorName(e);
                            if (e) {
                              setVendorTagList(e.res.Tagnames);
                            }
                          }}
                          isClearable
                          value={
                            selectedVendorName?.value
                              ? selectedVendorName
                              : null
                          }
                        />
                        <Select
                          options={vendorTagList?.map((res: any) => {
                            return { value: res.tagname, label: res.tagname };
                          })}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              width: 200,
                            }),
                          }}
                          isClearable
                          onChange={(e: any) => {
                            setSelectedVendorTag(e);
                          }}
                          placeholder={"Vendor Tag"}
                          value={
                            selectedVendorTag?.value ? selectedVendorTag : null
                          }
                        />
                        <Input
                          placeholder="Record ID"
                          value={recordID}
                          style={{ width: 200 }}
                          onChange={(e) => {
                            setRecordID(e.target.value);
                            const Params = {
                              Userid: localStorage.getItem("username"),
                              InputType: selectedVendorTag?.value || "",
                              RecordID: e.target.value,
                            };
                            axios
                              .post(
                                "https://logpanel.insurancepolicy4u.com/api/Login/CheckQuoteID",
                                Params,
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              )
                              .then((response) => {
                                if (
                                  !response.data.LeadStatus?.[0]?.ErrorMessage
                                ) {
                                  setIsRecordIdVerified(true);
                                } else {
                                  setIsRecordIdVerified(false);
                                }
                              })
                              .catch((error) => { });
                          }}
                        />

                        <Select
                          options={[{ "IsMappOld": "YES" }, { "IsMappOld": "NO" }].map((res: any) => {
                            return { value: res.IsMappOld, label: res.IsMappOld };
                          })}
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              width: 200,
                            }),
                          }}
                          isClearable
                          onChange={(e: any) => {
                            setIsMappOld(e);
                          }}
                          placeholder={"Is Mapping Old"}
                          value={
                            isMappOld?.value ? isMappOld : null
                          }

                        />

                        <Input
                          placeholder="Subject"
                          value={isSubjectMap}
                          style={{ width: 200, display: !!isMappOld?.value && isMappOld.value === "YES" ? "block" : "none" }}
                          onChange={(e) => {
                            setIsSubjectMap(e.target.value);
                          }}
                          className={`${!!isMappOld.value && isMappOld?.value === "YES" ? "block" : "hidden"}`}

                        />

                        <Input
                          placeholder="From"
                          value={fromMapVal}
                          style={{ width: 200, display: !!isMappOld?.value && isMappOld.value === "YES" ? "block" : "none" }}

                          onChange={(e) => {
                            setFromMapVal(e.target.value);
                          }}
                          className={`${!!isMappOld.value && isMappOld?.value === "YES" ? "block" : "hidden"}`}
                        />


                        <Button
                          onClick={() => {
                            onUpdateTag();
                          }}
                          disabled={recordID ? !isRecordIdVerrfied : false}
                          color="primary"
                        >
                          {" "}
                          Update
                        </Button>
                      </div>
                    </div>
                  </Collapse>
                </div>

                <div className="card-body p-0">
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Wrap the mail section with a relative container */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: isEdit ? `calc(99% - ${sectionWidth}px)` : "100%",
                        position: "relative", // Important for scoped overlay
                      }}
                    >
                      {/* Scoped Backdrop */}
                      {mailloading && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0,0,0,0.3)",
                            zIndex: 10,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <CircularProgress color="inherit" />
                        </div>
                      )}

                      <div className="mailbox-read-info" style={{ width: "100%" }}>
                        <h5
                          style={{
                            fontWeight: "bold",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          {mailList[currentMailIndexData]?.SUBJECT}
                          {router?.query?.isTransfer === "true" && taskEnd && (
                            <Label
                              style={{
                                fontWeight: "bold",
                                color: "red",
                                fontSize: 15,
                              }}
                            >
                              Task Failed
                            </Label>
                          )}
                        </h5>
                        <h6 style={{ fontSize: 18 }}>
                          From: {mailList[currentMailIndexData]?.FROMMAIL}
                        </h6>
                        <h6 style={{ fontSize: 18 }}>
                          Date: {mailList[currentMailIndexData]?.RecieveDate}
                        </h6>
                        <h6 style={{ fontSize: 18 }}>
                          Subject: {mailList[currentMailIndexData]?.SUBJECT}
                        </h6>
                        <h6 style={{ fontSize: 18 }}>
                          To: {mailList[currentMailIndexData]?.Tomail}
                        </h6>
                        {mailList[currentMailIndexData]?.CC && (
                          <h6 style={{ fontSize: 18 }}>
                            CC: {mailList[currentMailIndexData]?.CC}
                          </h6>
                        )}
                        {mailList[currentMailIndexData]?.BCC && (
                          <h6 style={{ fontSize: 18 }}>
                            BCC: {mailList[currentMailIndexData]?.BCC}
                          </h6>
                        )}
                      </div>
                      <div className="mailbox-read-message">
                        {mailList[currentMailIndexData]?.Bodyhtml ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: mailList[currentMailIndexData]?.Bodyhtml
                                .replace(".btn", ".bttn")
                                .replace(
                                  "serif",
                                  `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`
                                )
                                .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "")
                            }}
                          />
                        ) : (
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {mailList[currentMailIndexData]?.Textbody}
                          </div>
                        )}
                      </div>
                    </div>
                    {isEdit && (
                      <Card
                        style={{
                          padding: 10,
                          width: sectionWidth,
                          height: "fit-content",
                        }}
                      >
                        <CardTitle
                          block
                          color="link"
                          className="text-start m-0 p-0"
                          onClick={() =>
                            setIsDynamicCollapse(!isDynamicCollapse)
                          }
                        >
                          Dynamic Fields
                        </CardTitle>
                        <Collapse
                          isOpen={isDynamicCollapse}
                          style={{ paddingBottom: 10 }}
                        >
                          {dynamicUIData?.map((res: any) => {
                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                {res.inputtype === "TEXTBOX" && (
                                  <div
                                    className={
                                      res.IsMandatory ? "required" : ""
                                    }
                                    style={{
                                      height: 75,

                                      marginTop: 10,
                                      width: "100%",
                                    }}
                                  >
                                    {(res.PlaceHolder_Label === "Label" ||
                                      res.PlaceHolder_Label === "Both") && (
                                        <Label style={{ fontWeight: "bold" }}>
                                          {res.FieldName}
                                        </Label>
                                      )}
                                    {res.IsCalender ? (
                                      <RCDatePicker
                                        placeholder={""}
                                        value={res?.uiitemsvalues?.[0].UIValue}
                                        name={res.FieldName}
                                        onChange={(e) => {
                                          const index =
                                            dynamicUIData?.uiitems.findIndex(
                                              (res: any) =>
                                                res.FieldID === res.FieldID
                                            );
                                          const updatedState = update(res, {
                                            uiitemsvalues: {
                                              [0]: {
                                                UIValue: { $set: e },
                                              },
                                            },
                                          });
                                          dynamicUIData.uiitems[index] =
                                            updatedState;
                                          setDynamicUIData({
                                            ...dynamicUIData,
                                          });
                                        }}
                                      />
                                    ) : (
                                      (res.PlaceHolder_Label ===
                                        "Placeholder" ||
                                        res.PlaceHolder_Label === "Both") && (
                                        <Input
                                          type={"textarea"}
                                          style={{ width: "100%" }}
                                          name={res.FieldName}
                                          onChange={(e) => {
                                            onChangeInput(e, res);
                                          }}
                                          value={
                                            res?.uiitemsvalues?.[0].UIValue
                                          }
                                        />
                                      )
                                    )}
                                  </div>
                                )}

                                {res.inputtype === "DROPDOWN" && (
                                  <div
                                    className={
                                      res.IsMandatory ? "required" : ""
                                    }
                                    style={{
                                      height: 75,

                                      marginTop: 10,
                                      width: "100%",
                                    }}
                                  >
                                    {(res.PlaceHolder_Label === "Label" ||
                                      res.PlaceHolder_Label === "Both") && (
                                        <Label style={{ fontWeight: "bold" }}>
                                          {res.FieldName}
                                        </Label>
                                      )}
                                    <Input
                                      name={res.FieldName}
                                      type="select"
                                      value={res?.fieldValue}
                                      style={{ width: "100%" }}
                                      onChange={(e) => onChangeDropdown(e, res)}
                                    >
                                      {res?.uiitemsvalues?.map(
                                        (option: any, index: number) => (
                                          <option
                                            key={index}
                                            value={option.UIValue}
                                          >
                                            {option.UIValue}
                                          </option>
                                        )
                                      )}
                                    </Input>
                                  </div>
                                )}
                                {res.inputtype === "BUTTON" && (
                                  <div
                                    style={{
                                      height: 75,

                                      marginTop: 10,
                                      width: "100%",
                                    }}
                                  >
                                    <Button
                                      className="mb-2 me-2"
                                      color="primary"
                                      style={{ width: "100%" }}
                                      onClick={() => {
                                        onClickButton(res);
                                      }}
                                    >
                                      {res.FieldName}
                                    </Button>
                                  </div>
                                )}
                                {res.inputtype === "FILEUPLOAD" && (
                                  <div
                                    style={{
                                      height: 75,

                                      marginTop: 10,
                                      width: "100%",
                                    }}
                                  >
                                    {(res.PlaceHolder_Label === "Label" ||
                                      res.PlaceHolder_Label === "Both") && (
                                        <Label style={{ fontWeight: "bold" }}>
                                          {res.FieldName}
                                        </Label>
                                      )}
                                    <Input
                                      onChange={(e) => {
                                        onChangeFileUpload(e, res);
                                      }}
                                      type="file"
                                    />{" "}
                                    <div
                                      style={{
                                        fontWeight: 700,
                                        color: "red",
                                        fontSize: 14,
                                        cursor: "pointer",
                                      }}
                                      onClick={() => {
                                        setOnShowUplaodedFile(true);
                                      }}
                                    >
                                      Show Uploaded File{" "}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </Collapse>
                      </Card>
                    )}
                  </div>
                </div>

                {mailList[currentMailIndexData]?.Attachments?.length > 0 ||
                  (attachements?.length > 0 && (
                    <div className="card-footer bg-white">
                      <ul style={{ flexWrap: 'wrap', gap: 20 }} className="mailbox-attachments d-flex align-items-stretch clearfix overflow-auto">
                        {mailList[currentMailIndexData]?.Attachments?.length > 0
                          ? mailList[currentMailIndexData]?.Attachments.map(
                            (attachment: any, index: any) => {
                              return (
                                <li key={index} style={{ display: 'flex', gap: 10 }}>
                                  <span className="mailbox-attachment-icon">
                                    <FontAwesomeIcon icon={faFile as any} />
                                  </span>

                                  <div className="mailbox-attachment-info">
                                    <a
                                      href={attachment?.DownloadURL}
                                      className="mailbox-attachment-name"
                                    >
                                      <FontAwesomeIcon
                                        icon={faPaperclip as any}
                                      />{" "}
                                      {attachment?.Filename}
                                    </a>
                                    <span className="mailbox-attachment-size clearfix mt-1">
                                      <span>{attachment?.FileSize}</span>
                                      <a
                                        href={attachment?.DownloadURL}
                                        className="btn btn-default btn-sm float-right"
                                      >
                                        <FontAwesomeIcon
                                          icon={faCloudDownloadAlt as any}
                                        />
                                      </a>
                                    </span>
                                  </div>
                                </li>
                              );
                            }
                          )
                          : attachements?.map((attachment: any, index: any) => {
                            return (
                              <li key={index} style={{ display: 'flex', gap: 10 }}>
                                <span className="mailbox-attachment-icon">
                                  <FontAwesomeIcon icon={faFile as any} />
                                </span>

                                <div className="mailbox-attachment-info">
                                  <a
                                    href={attachment?.DownloadURL}
                                    className="mailbox-attachment-name"
                                  >
                                    <FontAwesomeIcon
                                      icon={faPaperclip as any}
                                    />{" "}
                                    {attachment?.Filename}
                                  </a>
                                  <span className="mailbox-attachment-size clearfix mt-1">
                                    <span>{attachment?.FileSize}</span>
                                    <a
                                      href={attachment?.DownloadURL}
                                      className="btn btn-default btn-sm float-right"
                                    >
                                      <FontAwesomeIcon
                                        icon={faCloudDownloadAlt as any}
                                      />
                                    </a>
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}

                {router.query.folder !== "Drafts" && (
                  <div className="card-footer">
                    <Button
                      type="button"
                      className="btn btn-default me-2"
                      onClick={() => {
                        setOpenDeleteMail({
                          open: true,
                          name: mailList[currentMailIndexData]?.SUBJECT,
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faTrashAlt as any} /> Delete
                    </Button>
                    <Button
                      type="button"
                      className="btn btn-default  me-2"
                      onClick={handlePrintmail}
                    >
                      <FontAwesomeIcon icon={faPrint as any} /> Print
                    </Button>
                    <Button
                      type="button"
                      className="btn btn-default  me-2"
                      onClick={() => {
                        console.log("mailList", mailList, currentMailIndexData, mailList[currentMailIndexData])
                        const newMailDetails = {
                          ...mailList[currentMailIndexData],
                          Attachments: attachements,
                        };
                        console.log("newMailDetails", newMailDetails)
                        onClickForwardMessage(newMailDetails);
                      }}
                    >
                      Forward
                    </Button>

                    <Button
                      type="button"
                      className="btn btn-default me-2"
                      onClick={() => {
                        const newMailDetails = {
                          ...mailList[currentMailIndexData],
                          Attachments: attachements,
                        };
                        newMailDetails.CC = ""
                        console.log("newMailDetails", newMailDetails)
                        onClickReplyMessage(newMailDetails);
                      }}
                    >
                      Reply
                    </Button>

                    <Button
                      type="button"
                      className="btn btn-default"
                      onClick={() => {
                        const newMailDetails = {
                          ...mailList[currentMailIndexData],
                          Attachments: attachements,
                        };
                        onClickReplyMessage(newMailDetails);
                      }}
                    >
                      Reply All
                    </Button>
                  </div>
                )}
              </div>
              <Card style={{ marginTop: 10 }}>
                <CardHeader
                  onClick={() => {
                    setIsCollapredMailRead(!isCollapsedMailRead);
                    getReadMailsLogs();
                  }}

                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <CardTitle>Mail Read Logs</CardTitle>

                    <i
                      className="pe-7s-angle-down"
                      style={{ fontSize: 30 }}

                    ></i>
                  </div>
                </CardHeader>
                <Collapse isOpen={isCollapsedMailRead}>
                  <CardBody>
                    <Table responsive bordered>
                      <tr>
                        <th>IPAddress</th>
                        <th>UserID</th>
                        <th>FolderName</th>
                        <th>Remarks</th>
                        <th>EntryDate</th>
                        <th>Msgnum</th>
                        <th>EmailID</th>
                      </tr>
                      <tbody>
                        {readMailLogs?.map((row: any, rowIndex: number) => (
                          <tr key={rowIndex}>
                            <td>{row.IPAddress}</td>
                            <td>{row.UserID}</td>
                            <td>{row.FolderName}</td>
                            <td>{row.Remarks}</td>
                            <td>{row.EntryDate}</td>
                            <td>{row.Msgnum}</td>
                            <td>{row.EmailID}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </CardBody>
                </Collapse>
              </Card>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {router.query.isTransfer === "true" && (
                <Card
                  style={{
                    height: "fit-content",
                    width: isMobile ? "100%" : sectionWidth,
                  }}
                >
                  <CardHeader>
                    <div>
                      <CardTitle>Comment Threads</CardTitle>
                      {commentThreads?.length > 0 && (
                        <Label style={{ color: "black" }}>
                          Task ID: {commentThreads[0]?.TaskID}
                        </Label>
                      )}
                    </div>
                    {router?.query?.isTransfer === "true" && countDownTimer && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          padding: 10,
                          marginRight: 20,
                          gap: 10,
                        }}
                      >
                        <Label style={{ fontWeight: "bold" }}>End Time :</Label>{" "}
                        <Label
                          style={{
                            fontWeight: "bold",
                            color: "red",
                            fontSize: 15,
                          }}
                        >
                          {countDownTimer}
                        </Label>
                      </div>
                    )}
                  </CardHeader>
                  <CardBody>
                    {commentThreads?.map((row: any, rowIndex: number) => (
                      <div key={rowIndex} style={{ marginBottom: 30 }}>
                        <span>
                          <span style={{ fontWeight: "bold" }}>Comments: </span>{" "}
                          {row.Comments}
                        </span>
                        <br />
                        <span>
                          <span style={{ fontWeight: "bold" }}>
                            Comment Date:{" "}
                          </span>
                          {row.CommentDate}
                        </span>
                        <br />
                        <span>
                          <span style={{ fontWeight: "bold" }}>User ID : </span>
                          {row.UserID}
                        </span>
                        <br />
                      </div>
                    ))}
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Delete Mail Mail */}
      <Modal
        isOpen={openDeleteMail.open}
        toggle={() => setOpenDeleteMail({ name: "", open: false })}
      >
        <ModalHeader
          toggle={() => setOpenDeleteMail({ name: "", open: false })}
          className="fw-bolder"
        >
          Delete Mail
        </ModalHeader>
        <ModalBody>
          <div className="form-group">
            Are you sure that you want to Delete this Mail "
            {openDeleteMail.name}"?
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="link"
            onClick={() => setOpenDeleteMail({ name: "", open: false })}
          >
            Cancel
          </Button>
          <Button color="primary" onClick={handleDeleteMail}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={isTransferComment}
        toggle={() => setIsTransferComment(false)}
      >
        <ModalHeader
          toggle={() => setIsTransferComment(false)}
          className="fw-bolder"
        >
          Add Comment
        </ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            value={transferComment}
            onChange={(e) => {
              setTransferComment(e.target.value);
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="link" onClick={() => setIsTransferComment(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={!transferComment}
            onClick={() => {
              if (router?.query?.isTransfer === "true") {
                onUpdateStatus();
              } else {
                onTransferMail();
              }
            }}
          >
            Submit{" "}
            {transferButtonLoading && (
              <Spinner style={{ width: 15, height: 15, marginLeft: 10 }} />
            )}{" "}
            {updateButtonLoading && (
              <Spinner style={{ width: 15, height: 15, marginLeft: 10 }} />
            )}
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={internalTransferComment}
        toggle={() => setIsInternalTransferComment(false)}
      >
        <ModalHeader
          toggle={() => setIsInternalTransferComment(false)}
          className="fw-bolder"
        >
          Add Comment
        </ModalHeader>
        <ModalBody>
          <Input
            type="textarea"
            value={transferComment}
            onChange={(e) => {
              setTransferComment(e.target.value);
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            color="link"
            onClick={() => setIsInternalTransferComment(false)}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={!transferComment}
            onClick={() => {
              onInternaltransfer();
              {
                internalTransferLoading && (
                  <Spinner style={{ width: 15, height: 15, marginLeft: 10 }} />
                );
              }
            }}
          >
            Submit
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
}

export default MailDetails;
