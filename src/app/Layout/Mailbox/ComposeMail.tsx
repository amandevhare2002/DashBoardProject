import {
  faEnvelope,
  faPaperclip,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GrammarlyEditorPlugin } from "@grammarly/editor-sdk-react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { useRouter } from "next/router";
import { Fragment, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import { format, parse } from 'date-fns';
import {
  Button,
  Card,
  Collapse,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
} from "reactstrap";
import { RCDatePicker } from "../Common/DatePicker";
import { MultiSelect } from "./MultiSelect";
import { Hours, Minute, TableHead } from "./constant";
import { useDebounce } from "./hooks/useDebounce";
import {
  Branch,
  Company,
  DepartmentType,
  ProductName,
  ProductType,
  Products,
  Suppliersperson,
} from "./interface";
const toast = require("react-toastify");
import "react-toastify/dist/ReactToastify.css";
import Pako from "pako";

const ComposeMail = (props: any) => {
  const token = useSelector((state: any) => state.authReducer.token);
  const router = useRouter();
  const [mailDetails, setMailDetails] = useState<any>({
    To: [],
    CC: [],
    BCC: [],
    Subject: "",
    BodyText: null,
  });
  const [openCC, setOpenCC] = useState(false);
  const [Attachments, setAttachments] = useState<any>([]);
  const [isSendMail, setIsSendMail] = useState<boolean>(false);
  const [composeMailData, setComposeMailData] = useState<{
    product: Array<Products>;
    subProduct: Array<ProductType>;
    subSubProduct: Array<ProductName>;
    type: Array<DepartmentType>;
    company: Array<Company>;
    branch: Array<Branch>;
    staff: Array<Suppliersperson>;
  }>({
    product: [],
    subProduct: [],
    subSubProduct: [],
    type: [],
    company: [],
    branch: [],
    staff: [],
  });
  const [selectedSupplierData, setSelectedSupplierData] = useState({
    selectedProduct: { value: "", label: "" },
    selectedSubProduct: { value: "", label: "" },
    selectedSubSubProduct: { value: "", label: "" },
    selectedCompany: [],
    selectedType: [],
    selectedBranch: [],
  });
  const [branches, setBranches] = useState([]);
  const [department, setDepartment] = useState([]);
  const [reminder, setReminder] = useState<{
    inputType: string;
    reminderType: string;
    company: string;
    reminderDate: Date | null;
    reminderSendFrom: string;
    Rem_Hour: string;
    Rem_Min: string;
    freq: string;
    taskDate: Date | null;
    reminderFor: string;
    leadId: string;
    reminderID: string;
  }>({
    inputType: "",
    reminderType: "",
    company: "",
    reminderDate: null,
    reminderSendFrom: "",
    Rem_Hour: "00",
    Rem_Min: "00",
    freq: "",
    taskDate: null,
    reminderFor: "",
    leadId: "",
    reminderID: "",
  });
  const searchQuery = useDebounce(reminder.leadId, 500);
  const [staffModal, setStaffModal] = useState(false);
  const [isAddDetails, setIsAddDetails] = useState(false);
  const editorRef = useRef(null);
  const selectedEmailUser = useSelector(
    (state: any) => state.mailReducer.mailUserId
  );
  const [buttonLoading, setButtonLoading] = useState(false);

  const { ids } = props;
  const clientID = ids.clientID;
  const apikey = ids.apikey;
  console.log("idsidsidsidsidsidsidsids", ids);
  useEffect(() => {
    if (token && props.messageDetails) {
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetSignature",
          {
            Userid: localStorage.getItem("username"),
            EmailID:
              selectedEmailUser ||
              "" ||
              localStorage.getItem("mailUserId") ||
              "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          const html = `<p>&nbsp;</p>
          <p>${response.data?.Signature?.[0]?.PersonName}<br>
          <strong>${response.data?.Signature?.[0]?.Department}<br>
          <span style="color: #3d85c6">${response.data?.Signature?.[0]?.CompanyName} </span></strong><br>
          ${response.data?.Signature?.[0]?.Address1 ? `${response.data?.Signature?.[0]?.Address1}<br>` : ''}
          ${response.data?.Signature?.[0]?.Address2 ? `${response.data?.Signature?.[0]?.Address2}<br>` : ''}
          ${response.data?.Signature?.[0]?.Mobilenum ? `${response.data?.Signature?.[0]?.Mobilenum}<br>` : ''}
          ${response.data?.Signature?.[0]?.WebSiteAdd} <br />
          ${response.data?.Signature?.[0]?.TwitterUrl ? `<a style="text-decoration: none" href=${response.data?.Signature?.[0]?.TwitterUrl} target="_blank"><img src="/images/twitter.png" width="25px" height="25px" style="margin-left:10px; margin-top: 5px" /> </a>` : ''}
          ${response.data?.Signature?.[0]?.FacebookUrl ? `<a style="text-decoration: none" href=${response.data?.Signature?.[0]?.FacebookUrl} target="_blank"><img src="/images/facebook.png" width="25px" height="25px" style="margin-left:10px; margin-top: 5px" /> </a>` : ''}
          ${response.data?.Signature?.[0]?.LinkedinUrl ? `<a style="text-decoration: none" href=${response.data?.Signature?.[0]?.LinkedinUrl} target="_blank"><img src="/images/linkdin.png" width="25px" height="25px" style="margin-left:10px; margin-top: 5px" /> </a>` : ''}
          ${response.data?.Signature?.[0]?.TwitterUrl ? `<a style="text-decoration: none" href=${response.data?.Signature?.[0]?.TwitterUrl} target="_blank"><img src="/images/instagram.png" width="25px" height="25px" style="margin-left:10px; margin-top: 5px" /> </a>` : ''}
          </p>`;

          const details = `<br><br>  
          ---------- Forwarded message ---------<br>
          From: ${props.messageDetails.FROMMAIL}<br>
          Date: ${props.messageDetails.RecieveDate}<br>
          Subject: ${props.messageDetails.SUBJECT}<br>
          To: ${props.messageDetails.Tomail}<br>
          CC: ${props.messageDetails.CC}<br><br>
          `;

          const detailsforReply = `<br><br>  
          ---------- Reply message ---------<br>
          From: ${props.messageDetails.FROMMAIL}<br>
          Date: ${props.messageDetails.RecieveDate}<br>
          Subject: ${props.messageDetails.SUBJECT}<br>
          To: ${props.messageDetails.Tomail}<br>
          CC: ${props.messageDetails.CC}<br><br>
          `;
          if (props.messageDetails && props.isForwardMail) {
            const attachmentsData = props?.messageDetails?.Attachments?.map(
              (res: any) => {
                return {
                  ContentType: "image/png",
                  Filename: res.Filename,
                  base64string: res.DownloadURL,
                };
              }
            );
            setAttachments(attachmentsData);
            setMailDetails({
              ...mailDetails,
              Subject: props.messageDetails.SUBJECT.includes("Fwd")
                ? `${props.messageDetails.SUBJECT}`
                : `Fwd:${props.messageDetails.SUBJECT}`,
              BodyText: `${html} ${details} ${props.messageDetails.Bodyhtml} `,
            });
          }

          if (props.messageDetails && props.isReply) {
            const toMail = props?.messageDetails?.FROMMAIL?.split(",")?.map(
              (res: any) => {
                const object = {
                  value: res,
                  label: res,
                };
                return object;
              }
            );
            const CCMail = props?.messageDetails?.CC?.split(",")?.map(
              (res: any) => {
                const object = {
                  value: res,
                  label: res,
                };
                return object;
              }
            );
            const BCCMail = props?.messageDetails?.Bcc?.split(",")?.map(
              (res: any) => {
                const object = {
                  value: res,
                  label: res,
                };
                return object;
              }
            );
            const attachmentsData = props?.messageDetails?.Attachments?.map(
              (res: any) => {
                return {
                  ContentType: "image/png",
                  Filename: res.Filename,
                  base64string: res.DownloadURL,
                };
              }
            );
            setAttachments(attachmentsData);
            setMailDetails({
              ...mailDetails,
              Subject: `Re:${props.messageDetails.SUBJECT}`,
              BodyText: `${html} ${detailsforReply} ${props.messageDetails.Bodyhtml} `,
              CC: CCMail.filter((res: any) => { if (res.value) { return res } }),
              BCC: BCCMail.filter((res: any) => { if (res.value) { return res } }),
              To: toMail.filter((res: any) => { if (res.value) { return res } }),
            });
          }
        })
        .catch((error) => { });
    }
    if (!props.messageDetails) {
      setMailDetails({ To: [], CC: [], BCC: [], Subject: "", BodyText: null });
      getSuppliers();
    }
  }, [props.messageDetails, token]);

  useEffect(() => {
    localStorage.setItem("mailSent", "false");
  }, []);

  useEffect(() => {
    localStorage.setItem("mailDetails", JSON.stringify(mailDetails || "{}"));
  }, [mailDetails]);

  useEffect(() => {
    return () => {
      unmountComponent();
    };
  }, []);
  const unmountComponent = () => {
    if (localStorage.getItem("mailSent") === "true") {
      return;
    }
    const mailData = JSON.parse(localStorage.getItem("mailDetails") || "{}");
    const Params = {
      Userid: localStorage.getItem("username"),
      Msgnum:
        router.query.folder === "Drafts" ? props.messageDetails.Msgnum : 0,
      Subject: mailData.Subject,
      Tomail: mailData.To.map((res: any) => {
        return res.value;
      }).toString(),
      CCMail: mailData.CC.map((res: any) => {
        return res.value;
      }).toString(),
      BCCMail: mailData.BCC.map((res: any) => {
        return res.value;
      }).toString(),
      BodyString: mailData.BodyText,
      mailAttachments: [],
      EmailID:
        selectedEmailUser || "" || localStorage.getItem("mailUserId") || "",
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/SaveDraftMail",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        toast.toast.success("Saved to Draft", { style: { top: 80 } });
      })
      .catch((error) => { });
  };

  useEffect(() => {
    if (searchQuery.length > 3) {
      const Params = {
        Userid: localStorage.getItem("username"),
        RecordID: searchQuery,
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
          if (response.data.LeadStatus?.[0]?.ErrorMessage !== "Invalid") {
            getTemplate(searchQuery);
          }
        })
        .catch((error) => { });
    }
  }, [searchQuery]);

  const getTemplate = (recordID: string) => {
    const Params = {
      Userid: localStorage.getItem("username"),
      RecordID: recordID,
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetLeadTemplateForMail",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setMailDetails({
          ...mailDetails,
          BodyText: `${response.data.Resp} ${mailDetails.BodyText}`,
        });
      })
      .catch((error) => { });
  };

  const getSuppliers = async () => {
    try {
      const Params = {
        Userid: localStorage.getItem("username"),
        InputType: "INSURANCE",
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetSuppliers",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComposeMailData({ ...composeMailData, product: res.data.products });
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/GetSignature",
          {
            Userid: localStorage.getItem("username"),
            EmailID:
              selectedEmailUser ||
              "" ||
              localStorage.getItem("mailUserId") ||
              "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          const html = `<p>&nbsp;</p>
        <p>${response.data?.Signature?.[0]?.PersonName}<br>
        <strong>${response.data?.Signature?.[0]?.Department}<br>
        <span style="color: #3d85c6">${response.data?.Signature?.[0]?.CompanyName} </span></strong><br>
        ${response.data?.Signature?.[0]?.Address1 ? `${response.data?.Signature?.[0]?.Address1}<br>` : ''}
        ${response.data?.Signature?.[0]?.Address2 ? `${response.data?.Signature?.[0]?.Address2}<br>` : ''}
        ${response.data?.Signature?.[0]?.Mobilenum ? `${response.data?.Signature?.[0]?.Mobilenum}<br>` : ''}
        ${response.data?.Signature?.[0]?.WebSiteAdd} <br />
        ${response.data?.Signature?.[0]?.TwitterUrl ? `<a style="text-decoration: none" href=${response.data?.Signature?.[0]?.TwitterUrl} target="_blank"><img src="/images/twitter.png" width="25px" height="25px" style="margin-left:10px; margin-top: 5px" /> </a>` : ''}
        ${response.data?.Signature?.[0]?.FacebookUrl ? `<a style="text-decoration: none" href=${response.data?.Signature?.[0]?.FacebookUrl} target="_blank"><img src="/images/facebook.png" width="25px" height="25px" style="margin-left:10px; margin-top: 5px" /> </a>` : ''}
        ${response.data?.Signature?.[0]?.LinkedinUrl ? `<a style="text-decoration: none" href=${response.data?.Signature?.[0]?.LinkedinUrl} target="_blank"><img src="/images/linkdin.png" width="25px" height="25px" style="margin-left:10px; margin-top: 5px" /> </a>` : ''}
        ${response.data?.Signature?.[0]?.TwitterUrl ? `<a style="text-decoration: none" href=${response.data?.Signature?.[0]?.TwitterUrl} target="_blank"><img src="/images/instagram.png" width="25px" height="25px" style="margin-left:10px; margin-top: 5px" /> </a>` : ''}
       
        </p>`;
          setMailDetails({
            ...mailDetails,
            To: !props.messageDetails ? [] : mailDetails.To,
            CC: !props.messageDetails ? [] : mailDetails.CC,
            BCC: !props.messageDetails ? [] : mailDetails.BCC,
            Subject: !props.messageDetails ? "" : mailDetails.Subject,
            BodyText: `${props.htmlContent} ${html}`,
          });
        })
        .catch((error) => { });
    } catch (error) {
      console.log("Error with submit mail: ", error);
    }
  };

  const handleChangeSummernote = (content: any) => {
    setMailDetails((prevVal: any) => ({
      ...prevVal,
      BodyText: content,
    }));
  };



  const handleCCOpen = () => {
    setOpenCC((prev) => !prev);
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    if (name) {
      setMailDetails((prevVal: any) => ({
        ...prevVal,
        [name]: value,
      }));
    }
  };

  const keyStr = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_KEY;
  const key = new TextEncoder().encode(keyStr);
  const iv = new Uint8Array(16);
  const handleSubmitMail = async () => {
    setButtonLoading(true);
    try {
      const Params = {
        Userid: localStorage.getItem("username"),
        ...mailDetails,
        To: mailDetails.To.map((res: any) => {
          return res.value;
        }).toString(),
        CC: mailDetails.CC.map((res: any) => {
          return res.value;
        }).toString(),
        BCC: mailDetails.BCC.map((res: any) => {
          return res.value;
        }).toString(),
        BodyText: mailDetails.BodyText,
        Attachments: Attachments,
        EmailID:
          selectedEmailUser || "" || localStorage.getItem("mailUserId") || "",
      };

      const jsonString = JSON.stringify(Params); // Note: Changed from { params }
      const gzipped = Pako.gzip(jsonString);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["encrypt"]
      );

      // encrypt
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        gzipped
      );

      // convert to base64
      const encryptedBytes = new Uint8Array(encryptedBuffer);
      const buffer = Buffer.from(encryptedBytes);
      const base64string = buffer.toString('base64');

      // const payload = encryptText(Params);
      // const decryptedPayload = decryptText(payload);
      // console.log("decryptedPayload: ", decryptedPayload);
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/SendEmailV2",
        { EncryptedData: base64string },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data == "Sent") {
        setIsSendMail(false);
        setButtonLoading(false);
        localStorage.setItem("mailSent", "true");
        router.push(`mailbox?folder=Inbox`);
        handleDiscardMail();
      }
    } catch (error) {
      setIsSendMail(false);
      setButtonLoading(false);
      console.log("Error with submit mail: ", error);
    }
  };

  const handleSubmitReminder = async () => {
    const reminders: any = [];

    // Group data by the "company" field
    const groupedData = composeMailData.staff.reduce(
      (result: any, item: any) => {
        const company = item.company;
        if (!result[company]) {
          result[company] = {
            TaskFor: company,
            reminderpersons: [],
          };
          reminders.push(result[company]);
        }
        result[company].reminderpersons.push({
          PersonName: item.PersonName,
          Mobile: item.PersonPhone,
          EmailID: item.value,
          EmailSentType: item.EmailSentType,
        });
        return result;
      },
      {}
    );

    let formattedDate = null;
    if (reminder?.reminderDate instanceof Date && !isNaN(reminder.reminderDate.getTime())) {
      formattedDate = format(reminder.reminderDate, 'yyyy-MM-dd');
    }

    let formattedTaskDate = null;
    if (reminder?.taskDate instanceof Date && !isNaN(reminder.taskDate.getTime())) {
      formattedTaskDate = format(reminder.taskDate, 'yyyy-MM-dd');
    }

    const Params = {
      Userid: localStorage.getItem("username"),
      InputType: reminder.inputType,
      EntryType: reminder.reminderFor,
      remind_id: reminder.reminderID,
      company: reminder.company,
      reminder_date: formattedDate,
      Task_date: formattedTaskDate,
      Details: mailDetails.BodyText,
      Reminder_Type: reminder.reminderType,
      Rem_Hour: reminder.Rem_Hour,
      Rem_Min: reminder.Rem_Min,
      Freq: reminder.freq,
      Subject: mailDetails.Subject,
      dailyfreq: reminder.freq,
      Comments: "testing comments",
      Leadid: reminder.leadId,
      SendFrom: reminder.reminderSendFrom,
      reminderfor: reminders,
      reminderfiles: [],
      Attachments: Attachments,
    };

    setButtonLoading(true);
    try {
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GenerateReminders",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200 || res.status === 201) {
        router.back();
        setButtonLoading(false);
      }
    } catch (error) {
      setButtonLoading(false);
      console.error("Error submitting reminder:", error);
    }
  };

  const handleFileSelect = async (event: any) => {
    const { files: tempFiles } = event.target;
    const files = [...tempFiles];
    if (files?.length) {
      const tempAttachment: any = [];
      for await (const file of files) {
        function getFile() {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
              const result = {
                id: Attachments.length
                  ? Attachments[Attachments.length - 1]?.id + 1
                  : Math.floor(Math.random() * 100000),
                Filename: file["name"],
                ContentType: file["type"],
                base64string: reader.result,
              };
              resolve(result);
            };
            reader.onerror = function (error) {
              console.log("Error: ", error);
              reject();
            };
          });
        }

        const base64File = await getFile();
        tempAttachment.push(base64File);
      }

      setAttachments([...Attachments, ...tempAttachment]);
    }
  };

  const handleRemoveFile = (id: any) => {
    setAttachments((prevVal: any) =>
      prevVal.filter((file: any) => file.id !== id)
    );
  };

  const handleDiscardMail = () => {
    localStorage.setItem("mailSent", "true");
    props?.handleDiscardMailData()
  };

  const onChangeProduct = (e: any) => {
    setSelectedSupplierData({ ...selectedSupplierData, selectedProduct: e });
    setComposeMailData({ ...composeMailData, subProduct: e.res.productTypes });
  };

  const onChangeSubProduct = (e: any) => {
    setSelectedSupplierData({ ...selectedSupplierData, selectedSubProduct: e });
    setComposeMailData({
      ...composeMailData,
      subSubProduct: e.res.productNames,
      company: e.res.suppliers,
    });
  };

  const onChangeCompany = (e: any) => {
    setSelectedSupplierData({ ...selectedSupplierData, selectedCompany: e });
  };

  useEffect(() => {
    let branchArray: any = [];
    selectedSupplierData.selectedCompany?.map((res: any) => {
      const branchArrayData = res.res.branches.map((response: any) => {
        const object = {
          ...response,
          company: res.label,
        };
        return object;
      });
      console.log("branchArrayData", branchArrayData)
      branchArray = branchArray.concat(branchArrayData);
    });
    setBranches(branchArray);
  }, [selectedSupplierData.selectedCompany]);

  useEffect(() => {
    setComposeMailData({ ...composeMailData, branch: branches });
  }, [branches]);

  const onChangeBranch = (e: any) => {
    setSelectedSupplierData({ ...selectedSupplierData, selectedBranch: e });
  };

  useEffect(() => {
    let departmentArray: any = [];
    selectedSupplierData.selectedBranch.map((res: any) => {
      const departmentArrayData = res.res.departmentTypes.map(
        (response: any) => {
          const object = {
            ...response,
            company: res.res.company,
          };
          return object;
        }
      );
      departmentArray = departmentArray.concat(departmentArrayData);
    });
    setDepartment(departmentArray);
  }, [selectedSupplierData.selectedBranch]);

  useEffect(() => {
    setComposeMailData({ ...composeMailData, type: department });
  }, [department]);

  const onChangeType = (e: any) => {
    setSelectedSupplierData({ ...selectedSupplierData, selectedType: e });
  };

  useEffect(() => {
    if (selectedSupplierData.selectedType.length > 0) {
      const mailToData: any = [];
      const mailCCData: any = [];
      const mailBCCData: any = [];
      selectedSupplierData.selectedType.map((res: any) => {
        res.res.suppliersperson.map((response: any) => {
          if (response.EmailSentType === "TO") {
            mailToData.push({
              value: response.PersonID,
              label: response.PersonID,
              company: res.res.company,
              EmailSentType: response.EmailSentType,
              PersonID: response.PersonID,
              PersonName: response.PersonName,
              PersonPhone: response.PersonPhone,
            });
          }
          if (response.EmailSentType === "CC") {
            mailCCData.push({
              value: response.PersonID,
              label: response.PersonID,
              company: res.res.company,
              EmailSentType: response.EmailSentType,
              PersonID: response.PersonID,
              PersonName: response.PersonName,
              PersonPhone: response.PersonPhone,
            });
          }
          if (response.EmailSentType === "BCC") {
            mailBCCData.push({
              value: response.PersonID,
              label: response.PersonID,
              company: res.res.company,
              EmailSentType: response.EmailSentType,
              PersonID: response.PersonID,
              PersonName: response.PersonName,
              PersonPhone: response.PersonPhone,
            });
          }
        });
      });

      setComposeMailData({
        ...composeMailData,
        staff: [...mailToData, ...mailCCData, ...mailBCCData],
      });
      setStaffModal(true);
    }
  }, [selectedSupplierData.selectedType]);

  const generateReminderID = async (inputType: string) => {
    const Params = {
      Userid: localStorage.getItem("username"),
      InputType: inputType,
    };
    try {
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GenerateReminderID",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReminder({ ...reminder, reminderID: res.data, inputType: inputType });
    } catch (error) { }
  };

  const onChangeEmailType = (e: any, index: number) => {
    const state = [...composeMailData.staff];
    state[index].EmailSentType = e.target.value;
    setComposeMailData({ ...composeMailData, staff: state });
  };

  const onSubmitStaff = () => {
    const mailToData: any = [];
    const mailCCData: any = [];
    const mailBCCData: any = [];

    const state = [...composeMailData.staff];

    state.map((response) => {
      if (response.EmailSentType === "TO") {
        mailToData.push(response);
      }
      if (response.EmailSentType === "CC") {
        mailCCData.push(response);
      }
      if (response.EmailSentType === "BCC") {
        mailBCCData.push(response);
      }
    });
    setMailDetails({
      ...mailDetails,
      To: mailToData,
      CC: mailCCData,
      BCC: mailBCCData,
    });
    setStaffModal(false);
  };


  return (
    <Fragment>
      <Modal
        isOpen={isSendMail}
        toggle={() => {
          setIsSendMail(false);
        }}
      >
        <ModalHeader>Confirmation Modal</ModalHeader>
        <ModalBody>
          Please Ensure your have checked all grammer Error before sending mail
        </ModalBody>
        <ModalFooter>
          <div
            style={{
              display: "flex",
              gap: 5,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="submit"
              className="btn btn-primary ml-2"
              disabled={buttonLoading}
              onClick={() => {
                handleSubmitMail();
              }}
            >
              <FontAwesomeIcon
                className="far fa-envelope"
                icon={faEnvelope as any}
              />{" "}
              Send{" "}
              {buttonLoading && (
                <Spinner style={{ width: 15, height: 15, marginLeft: 10 }} />
              )}
            </button>

            <Button
              type="reset"
              className="btn btn-default"
              onClick={() => {
                setIsSendMail(false);
              }}
            >
              <FontAwesomeIcon className="fas fa-times" icon={faTimes as any} />{" "}
              Close
            </Button>
          </div>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={staffModal}
        size="lg"
        style={{ maxWidth: 900 }}
        toggle={() => {
          setStaffModal(false);
        }}
      >
        <ModalHeader>Supplier Persons</ModalHeader>
        <ModalBody>
          <Table bordered responsive>
            <tr>
              {TableHead.map((res: any) => (
                <th>{res}</th>
              ))}
            </tr>
            <tbody>
              {composeMailData.staff?.map((res: any, index: number) => {
                return (
                  <tr>
                    <td>{res.company}</td>
                    <td>{res.PersonID}</td>
                    <td>{res.PersonName}</td>
                    <td>{res.PersonPhone}</td>
                    <td>
                      <Input
                        value={res.EmailSentType}
                        type="select"
                        onChange={(e) => {
                          onChangeEmailType(e, index);
                        }}
                      >
                        <option>TO</option>
                        <option>CC</option>
                        <option>BCC</option>
                      </Input>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <div
            style={{
              display: "flex",
              gap: 5,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="submit"
              className="btn btn-primary ml-2"
              onClick={() => {
                onSubmitStaff();
              }}
            >
              Submit
            </button>
            <Button
              type="reset"
              className="btn btn-default"
              onClick={() => {
                setStaffModal(false);
              }}
            >
              <FontAwesomeIcon className="fas fa-times" icon={faTimes as any} />{" "}
              Close
            </Button>
          </div>
        </ModalFooter>
      </Modal>
      <Card className="app-inner-layout__content">
        <div className="card card-primary card-outline">
          <div className="card-header">
            <h3 className="card-title">Compose New Message</h3>
          </div>

          <div className="card-body">
            <div>
              <div
                onClick={() => {
                  setIsAddDetails(!isAddDetails);
                }}
                className="card-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <h6 className="card-header-title fw-bolder mb-0">
                  Add Details
                </h6>
                <i className="pe-7s-angle-down" style={{ fontSize: 30 }} />
              </div>
              <Collapse isOpen={isAddDetails}>
                <Form
                  style={{
                    display: "flex",
                    marginBottom: "10px",
                    gap: 20,
                    flexWrap: "wrap",
                    paddingTop: 10,
                  }}
                >
                  <FormGroup style={{ width: 120 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      PRODUCT
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      value={selectedSupplierData.selectedProduct}
                      name="product"
                      onChange={onChangeProduct}
                      options={composeMailData.product.map((res: Products) => {
                        return {
                          value: res.product,
                          label: res.product,
                          res: res,
                        };
                      })}
                    />
                  </FormGroup>
                  <FormGroup style={{ width: 120 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      SUB PRODUCT
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      value={selectedSupplierData.selectedSubProduct}
                      options={composeMailData.subProduct.map(
                        (res: ProductType) => {
                          return {
                            value: res.producttype,
                            label: res.producttype,
                            res: res,
                          };
                        }
                      )}
                      onChange={onChangeSubProduct}
                    />
                  </FormGroup>
                  <FormGroup style={{ width: 150 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      SUB SUB PRODUCT
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      value={selectedSupplierData.selectedSubSubProduct}
                      options={composeMailData.subSubProduct.map(
                        (res: ProductName) => {
                          return {
                            value: res.ProdName,
                            label: res.ProdName,
                          };
                        }
                      )}
                      onChange={(e: any) => {
                        setSelectedSupplierData({
                          ...selectedSupplierData,
                          selectedSubSubProduct: e,
                        });
                      }}
                    />
                  </FormGroup>
                  <FormGroup style={{ width: 250 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      COMPANY
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isMulti
                      closeMenuOnSelect={false}
                      value={selectedSupplierData.selectedCompany}
                      options={composeMailData.company.map((res: Company) => {
                        return {
                          value: res.SupplierName,
                          label: `${res.SupplierName} - (${res.BranchCountNew})`,
                          res: res,
                        } as any;
                      })}
                      onChange={onChangeCompany}
                    />
                  </FormGroup>
                  <FormGroup style={{ width: 250 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      BRANCH
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      closeMenuOnSelect={false}
                      isMulti
                      value={selectedSupplierData.selectedBranch}
                      options={composeMailData.branch.map((res: Branch) => {
                        return {
                          value: res.BranchName,
                          label: `${res.BranchName} - (${res.BranchCount})`,
                          res: res,
                        } as any;
                      })}
                      onChange={onChangeBranch}
                    />
                  </FormGroup>
                  <FormGroup style={{ width: 250 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      DEPARTMENT
                    </Label>
                    <Select
                      styles={{
                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                      }}
                      isMulti
                      closeMenuOnSelect={false}
                      value={selectedSupplierData.selectedType}
                      options={composeMailData.type.map(
                        (res: DepartmentType) => {
                          return {
                            value: res.DepartmentName,
                            label: `${res.DepartmentName} - (${res.PersonCount})`,
                            res: res,
                          } as any;
                        }
                      )}
                      onChange={onChangeType}
                    />
                  </FormGroup>
                  <FormGroup style={{ width: 120 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Input Type
                    </Label>
                    <Input
                      name="inputType"
                      type="select"
                      value={reminder.inputType}
                      onChange={(e) => {
                        if (e.target.value) {
                          setReminder({
                            ...reminder,
                            inputType: e.target.value,
                          });
                          generateReminderID(e.target.value);
                        }
                      }}
                    >
                      <option></option>
                      <option>QUOTE</option>
                      <option>REMINDER</option>
                    </Input>
                  </FormGroup>
                  <FormGroup style={{ width: 120 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Reminder ID
                    </Label>
                    <Input
                      name="reminderID"
                      value={reminder.reminderID}
                    // onChange={(e) => {
                    //   if (e.target.value) {
                    //     setReminder({
                    //       ...reminder,
                    //       reminderID: e.target.value,
                    //     });
                    //   }
                    // }}
                    />
                  </FormGroup>
                  <FormGroup style={{ width: 150 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Company
                    </Label>
                    <Input
                      name="company"
                      type="select"
                      value={reminder.company}
                      onChange={(e) => {
                        if (e.target.value) {
                          setReminder({
                            ...reminder,
                            company: e.target.value,
                          });
                        }
                      }}
                    >
                      <option></option>
                      <option>D.A.Y. Insurance</option>
                    </Input>
                  </FormGroup>
                  <FormGroup style={{ width: 150 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Reminder Date
                    </Label>
                    <RCDatePicker
                      placeholder={""}
                      value={reminder.reminderDate}
                      name="reminderDate"
                      onChange={(e) => {
                        // const today = e;
                        // const yyyy = today.getFullYear();
                        // let mm: any = today.getMonth() + 1; // Months start at 0!
                        // let dd: any = today.getDate();

                        // if (dd < 10) dd = "0" + dd;
                        // if (mm < 10) mm = "0" + mm;

                        // const formattedToday = dd + "/" + mm + "/" + yyyy;
                        setReminder({ ...reminder, reminderDate: e });
                      }}
                    />
                  </FormGroup>
                  <FormGroup style={{ width: 150 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Reminder Send Form
                    </Label>
                    <Input
                      name="reminderSendFrom"
                      type="select"
                      value={reminder.reminderSendFrom}
                      onChange={(e) => {
                        if (e.target.value) {
                          setReminder({
                            ...reminder,
                            reminderSendFrom: e.target.value,
                          });
                        }
                      }}
                    >
                      <option></option>
                      <option>Common ID</option>
                      <option>Own ID</option>
                    </Input>
                  </FormGroup>
                  <FormGroup style={{ width: 250 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Reminder Time (HH:MM)
                    </Label>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Input
                        name="Rem_Hour"
                        type="select"
                        value={reminder.Rem_Hour}
                        onChange={(e) => {
                          if (e.target.value) {
                            setReminder({
                              ...reminder,
                              Rem_Hour: e.target.value,
                            });
                          }
                        }}
                      >
                        {Hours.map((res) => (
                          <option>{res}</option>
                        ))}
                      </Input>
                      <Input
                        name="Rem_Min"
                        type="select"
                        value={reminder.Rem_Min}
                        onChange={(e) => {
                          if (e.target.value) {
                            setReminder({
                              ...reminder,
                              Rem_Min: e.target.value,
                            });
                          }
                        }}
                      >
                        {Minute.map((res) => (
                          <option>{res}</option>
                        ))}
                      </Input>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Reminder Type
                    </Label>
                    <Input
                      type="select"
                      value={reminder.reminderType}
                      onChange={(e) => {
                        if (e.target.value) {
                          setReminder({
                            ...reminder,
                            reminderType: e.target.value,
                          });
                        }
                      }}
                    >
                      <option></option>
                      <option>Once</option>
                      <option>Repeat</option>
                      <option>Fix</option>
                    </Input>
                  </FormGroup>
                  <FormGroup style={{ width: 150 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Daily Frequency
                    </Label>
                    <Input
                      name="freq"
                      type="select"
                      value={reminder.freq}
                      onChange={(e) => {
                        if (e.target.value) {
                          setReminder({
                            ...reminder,
                            freq: e.target.value,
                          });
                        }
                      }}
                    >
                      <option></option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                      <option>6</option>
                      <option>7</option>
                      <option>8</option>
                      <option>9</option>
                      <option>10</option>
                    </Input>
                  </FormGroup>
                  <FormGroup style={{ width: 150 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Task Date
                    </Label>
                    <RCDatePicker
                      placeholder={""}
                      value={reminder.taskDate}
                      name="taskDate"
                      onChange={(e) => {
                        setReminder({ ...reminder, taskDate: e });
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Reminder For
                    </Label>
                    <Input
                      type="select"
                      value={reminder.reminderFor}
                      onChange={(e) => {
                        if (e.target.value) {
                          setReminder({
                            ...reminder,
                            reminderFor: e.target.value,
                          });
                        }
                      }}
                    >
                      <option>Vendor</option>
                      <option>Party</option>
                      <option>Other</option>
                    </Input>
                  </FormGroup>
                  <FormGroup style={{ width: 150 }}>
                    <Label style={{ fontWeight: "bold", marginBottom: 5 }}>
                      Enter Lead ID
                    </Label>
                    <Input
                      name="leadId"
                      value={reminder.leadId}
                      onChange={(e) => {
                        setReminder({
                          ...reminder,
                          leadId: e.target.value,
                        });
                      }}
                    />
                  </FormGroup>
                </Form>
              </Collapse>
            </div>
            {/* {props.messageDetails &&     <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Select
                    options={vendorMappingList?.map((res: any) => {
                      return { value: res.Colvalue, label: res.Colvalue };
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
                    }}
                    placeholder={"Vendor Tag"}
                    value={selectedVendorMapping?.value ? selectedVendorMapping : null}
                  />
                  <Select
                    options={vendorList?.map((res: any) => {
                      return { value: res.Colvalue, label: res.Colvalue };
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
                    }}
                    isClearable
                    value={
                      selectedVendorName?.value ? selectedVendorName : null
                    }
                  />
                  <Select
                    options={vendorTagList?.map((res: any) => {
                      return { value: res.Colvalue, label: res.Colvalue };
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
                    value={selectedVendorTag?.value ? selectedVendorTag : null}
                  />
                  <Button
                    onClick={() => {
                      onUpdateTag();
                    }}
                    color="primary"
                  >
                    {" "}
                    Update
                  </Button>
                </div>} */}
            <div className="form-group d-flex mb-3">
              <div className="input-group d-flex flex-nowrap">
                <MultiSelect
                  name={"To"}
                  onChange={(e: any, name: any) => {
                    const updatedEmails = e.map((item: any) => ({
                      ...item,
                      EmailSentType: "TO",
                      company: item?.company ? item?.company : "",
                      PersonName: item?.PersonName ? item?.PersonName : "",
                      PersonPhone: item?.PersonPhone ? item?.PersonPhone : "",
                      PersonID: item?.PersonID ? item?.PersonID : "",
                    }));
                    let ccdata = composeMailData?.staff?.filter((comTo: any) => comTo?.EmailSentType !== "TO")
                    const combinedEmails = [...updatedEmails, ...ccdata];
                    setComposeMailData({ ...composeMailData, "staff": combinedEmails })
                    setMailDetails({ ...mailDetails, To: e });
                  }}
                  value={mailDetails.To}
                />
                <button
                  className="btn btn-secondary float-right ms -2 pt-0 pb-0"
                  onClick={handleCCOpen}
                >
                  CC
                </button>
              </div>
            </div>
            {openCC && (
              <>
                <div className="form-group">
                  <div className="input-group mb-3 d-flex flex-nowrap">
                    <MultiSelect
                      name={"CC"}
                      onChange={(e: any, name: any) => {
                        const updatedEmails = e.map((item: any) => ({
                          ...item,
                          EmailSentType: "CC",
                          company: item?.company ? item?.company : "",
                          PersonName: item?.PersonName ? item?.PersonName : "",
                          PersonPhone: item?.PersonPhone ? item?.PersonPhone : "",
                          PersonID: item?.PersonID ? item?.PersonID : "",
                        }));
                        let ccdata = composeMailData?.staff?.filter((comTo: any) => comTo?.EmailSentType !== "CC")
                        const combinedEmails = [...updatedEmails, ...ccdata];
                        setComposeMailData({ ...composeMailData, "staff": combinedEmails })
                        setMailDetails({ ...mailDetails, CC: e });
                      }}
                      value={mailDetails.CC}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-group mb-3 d-flex flex-nowrap">
                    <MultiSelect
                      name={"BCC"}
                      onChange={(e: any, name: any) => {
                        const updatedEmails = e.map((item: any) => ({
                          ...item,
                          EmailSentType: "BCC",
                          company: item?.company ? item?.company : "",
                          PersonName: item?.PersonName ? item?.PersonName : "",
                          PersonPhone: item?.PersonPhone ? item?.PersonPhone : "",
                          PersonID: item?.PersonID ? item?.PersonID : "",
                        }));
                        let ccdata = composeMailData?.staff?.filter((comTo: any) => comTo?.EmailSentType !== "BCC")
                        const combinedEmails = [...updatedEmails, ...ccdata];
                        setComposeMailData({ ...composeMailData, "staff": combinedEmails })
                        setMailDetails({ ...mailDetails, BCC: e });
                      }}
                      value={mailDetails.BCC}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="form-group mb-3">
              <input
                className="form-control"
                placeholder="Subject:"
                name="Subject"
                value={mailDetails.Subject}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <GrammarlyEditorPlugin
                // clientId="client_D2WZPePXQhCkEZTUZJ2dse"
                clientId="daf454ca-92df-438d-85da-63bfbaf8b688"
                // clientId={clientID}
                onError={(e) => { }}
                onSeekingCapture={(e) => { }}
              >
                <Editor
                  onInit={(evt: any, editor: any) =>
                    (editorRef.current = editor)
                  }
                  apiKey="8s3fkrr9r5ylsjtqbesp0wk79pn46g4do9p1dg9249yn8tx5"
                  // apiKey={apikey}
                  onEditorChange={(content: any) => {
                    handleChangeSummernote(content);
                  }}
                  value={mailDetails.BodyText ?? ""}
                  init={{
                    height: 500,
                    menubar: true,
                    plugins: [
                      "advlist autolink lists link image charmap print preview anchor ",
                      "searchreplace visualblocks code fullscreen",
                      "insertdatetime media  paste code help wordcount",
                      "table",
                    ],
                    toolbar:
                      "table undo redo | formatselect | " +
                      "bold italic backcolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist outdent indent | " +
                      "removeformat",
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  }}
                />
              </GrammarlyEditorPlugin>
            </div>
            <div className="form-group">
              <div className="btn btn-default btn-file">
                <FontAwesomeIcon
                  className="fas fa-paperclip"
                  icon={faPaperclip as any}
                />{" "}
                Attachment
                <input
                  type="file"
                  name="attachment"
                  onChange={handleFileSelect}
                  multiple
                />
              </div>
              <div className="files-container">
                {Attachments?.map((file: any, index: any) => (
                  <div
                    className="file-wrapper"
                    key={`selected-files-${file.id}-${index}`}
                  >
                    <span>{file.Filename}</span>
                    <FontAwesomeIcon
                      className="fa-solid fa-xmark"
                      icon={faTimes as any}
                      onClick={() => handleRemoveFile(file.id)}
                    />
                  </div>
                ))}
              </div>
              <p className="help-block">Max. 25MB</p>
            </div>
          </div>

          <div className="card-footer">
            <div className="float-right me-2">
              <button
                type="submit"
                className="btn btn-primary ml-2"
                onClick={() => {
                  setIsSendMail(true);
                }}
              >
                <FontAwesomeIcon
                  className="far fa-envelope"
                  icon={faEnvelope as any}
                />{" "}
                Send
              </button>
            </div>
            <div className="float-right me-2">
              <button
                type="submit"
                className="btn btn-primary ml-2"
                onClick={() => {
                  handleSubmitReminder();
                }}
              >
                <FontAwesomeIcon
                  className="far fa-envelope"
                  icon={faEnvelope as any}
                />{" "}
                Add Reminder{" "}
                {buttonLoading && (
                  <Spinner style={{ width: 15, height: 15, marginLeft: 10 }} />
                )}
              </button>
            </div>
            <Button
              type="reset"
              className="btn btn-default"
              onClick={handleDiscardMail}
            >
              <FontAwesomeIcon className="fas fa-times" icon={faTimes as any} />{" "}
              Discard
            </Button>
          </div>
        </div>
      </Card>
    </Fragment>
  );
};

export default ComposeMail;
