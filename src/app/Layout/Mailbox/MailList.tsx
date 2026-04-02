import {
  faCalendarAlt,
  faFilter,
  faSearch,
  faShare,
  faStar,
  faSyncAlt,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardTitle,
  Collapse,
  DropdownMenu,
  DropdownToggle,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  Table,
  UncontrolledButtonDropdown,
} from "reactstrap";
import "./mail.scss";
import { format, isToday } from 'date-fns';
const LoadingOverlay = require("react-loading-overlay-ts").default;

import { setLoading } from "@/reducers/Auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useRouter } from "next/router";
import Loader from "react-loaders";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import "react-toastify/dist/ReactToastify.css";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { SearchForm } from "./SearchForm";
import { useDebounce } from "./hooks/useDebounce";
import {
  DEBOUNCE_DELAY,
  emptyFilterOption,
  sortSelectOptions,
} from "./utils/constant";
import { decryptText } from "./utils";
import Tooltip from "rc-tooltip";
import { GrAttachment } from "react-icons/gr";
import Loading from "@/pages/loading";
const toast = require("react-toastify");

const animatedComponents = makeAnimated();
const WS_URL = "ws://103.175.163.10:8080/websocket";

export const MailList = ({
  setActiveState,
  active,
  setMailList,
  setPageNumber,
  setPrevIndexCount,
  setMailCount,
  isConversation,
  pageNumber,
  onClickMail,
  mailList,
  setFilterOptionData,
  setSearchQueryData,
  mailCount,
  decryptedData,
  setDecryptedData
}: any) => {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.authReducer.token);
  const loading = useSelector((state: any) => state.authReducer.loading);
  const router = useRouter();

  const mailFolderList = useSelector(
    (state: any) => state.mailReducer.mailFolderList
  );
  const [pageLimit, setPageLimit] = useState(0);
  const [state, setState] = useState({
    active: false,
  });
  const [searchText, setSearchText] = useState("");
  const [mails, setMails] = useState([]);
  const [filteredMails, setFilteredMails] = useState([]);
  const [page, setPage] = useState(1);
  const [allSelected, setAllSelected] = useState(false);
  const [selectedMails, setSelectedMails] = useState<any>([]);
  const [sorting, setSorting] = useState({
    type: "",
    asce: true,
  });
  const [filterOptions, setFilterOptions] = useState(emptyFilterOption);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [openMoveFolder, setOpenMoveFolder] = useState({
    open: false,
    Newfolderpath: "",
  });
  const searchQuery = useDebounce(searchText, DEBOUNCE_DELAY);
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [recordID, setRecordID] = useState("");
  const [vendor, setVendor] = useState<any>({
    VendorNameValueForAPI: "",
    VendorTagValueForAPI: "",
    VendorMappingForAPI: "",
  });
  const [isMailRead, setIsMailRead] = useState(false);
  const [isUnreadMails, setIsUnreadMails] = useState(true);
  const selectedEmailUser = useSelector(
    (state: any) => state.mailReducer.mailUserId
  );
  const [isRecordIdVerrfied, setIsRecordIdVerified] = useState(false);
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
  const email: any = router.query.email;
  const [isStarredMail, setIsStarredMail] = useState(false);
  const [bulkTagMail, setBulkTagMail] = useState(false);
  const [username, setUsername] = useState("");
  const [isFilterMail, setIsFilterMail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { sendJsonMessage, readyState, sendMessage } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log("WebSocket connection established.");
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true,
    onMessage: (event) => {
      const data = JSON.parse(event.data);
      toast.toast.success("New Mail Recieved", { style: { top: 80 } });
      if (pageNumber === 1) {
        setMails(data.emailLists);
        // localStorage.setItem("isFilterMail", "false");
        setFilteredMails(data.emailLists);
        setPageLimit(data.MailCount);
        setMailCount(data.MailCount);
        setTotalPages(data.TotalPages);
        setMailList(data.emailLists);
        setPrevIndexCount((data?.emailLists?.length || 0) * (pageNumber || 1));
        setVendor({
          VendorNameValueForAPI: data.VendorNameValueForAPI,
          VendorTagValueForAPI: data.VendorTagValueForAPI,
          VendorMappingForAPI: data.VendorMappingForAPI,
        });
      }
    },
  });

  useEffect(() => {
    console.log(mailList)
    setFilteredMails(mailList);
  }, [mailList]);

  useEffect(() => {
    if (localStorage.getItem("isFilterMail") === "true") {
      fetchFilterMails(pageNumber);
    } else {
      fetchMails(selectedFolder, true, isStarredMail, pageNumber);
    }
  }, [isStarredMail]);

  const Undo = ({ onUndo, closeToast }: any) => {
    const handleClick = () => {
      onUndo();
      closeToast();
    };

    return (
      <div>
        <h3>
          Mail Deleted <Button onClick={handleClick}>UNDO</Button>
        </h3>
      </div>
    );
  };

  useEffect(() => {
    setFilterOptionData({ ...filterOptions, SearchWords: searchQuery });
  }, [filterOptions]);

  useEffect(() => {
    if (token && filteredMails?.length > 0) {
      if (localStorage.getItem("undoMail")) {
        const data = JSON.parse(localStorage.getItem("undoMail") || "{}");
        if (data?.length > 0) {
          toast.toast(
            <Undo
              onUndo={() => {
                onUndoMail();
              }}
            />,
            { style: { top: 80 } }
          );
          setTimeout(() => {
            localStorage.removeItem("undoMail");
          }, 8000);
        }
      }
    }
  }, [token, filteredMails]);

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      sendMessage(
        `setCredentials:${localStorage.getItem("mailUserId") || localStorage.getItem("username")
        }`
      );
      sendMessage("fetchLatestEmail");
    }
  }, [username, sendJsonMessage, readyState]);

  useEffect(() => {
    if (router.query.folder) {
      setSelectedFolder(router?.query?.folder);
    }
  }, [router.query.folder]);

  useEffect(() => {
    if (router?.query?.folder && token) {
      getTaggingApi();
    }
  }, [token, selectedFolder]);

  const getTaggingApi = () => {
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
        setVendorMappingList(response.data.MappingTypes);
      })
      .catch((error) => { });
  };

  const handleSearchEmail = async (searchText: any) => {
    setPage(1);
  };

  const fetchFilterMails = async (pageNumber: number) => {
    console.log("fetchFilterMails")
    setIsLoading(true);
    try {
      const Params = {
        Userid: localStorage.getItem("username"),
        ...filterOptions,
        SearchWords: searchQuery,
        PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
        EmailID:
          email === "undefined" || !email
            ? selectedEmailUser || localStorage.getItem("mailUserId")
            : email,
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENC",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("res 2", res)

      const decrypted = decryptText(res.data);
      setDecryptedData(decrypted);
      setFilteredMails(decrypted.emailLists);
      setPageLimit(decrypted.MailCount);
      setMailCount(decrypted.MailCount);
      setTotalPages(decrypted.TotalPages);
      setMailList(decrypted.emailLists);
      setPrevIndexCount((decrypted?.emailLists?.length || 0) * (pageNumber || 1));
      setVendor({
        VendorNameValueForAPI: decrypted.VendorNameValueForAPI,
        VendorTagValueForAPI: decrypted.VendorTagValueForAPI,
        VendorMappingForAPI: decrypted.VendorMappingForAPI,
      });
    } catch (error) {
      console.log("Error in API call:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setState({ active: active });
  }, [active]);

  useEffect(() => {
    handleSearchEmail(searchQuery);
    setSearchQueryData(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (localStorage.getItem("isFilterMail") === "true") {
      setIsFilterMail(true);
    } else {
      setIsFilterMail(false);
    }
    if (router.query.folder && token && localStorage.getItem("isFilterMail")) {
      if (localStorage.getItem("isFilterMail") === "true") {
        fetchFilterMails(pageNumber);
      }
    }
  }, [router.query.folder, token, email]);

  useEffect(() => {
    const decrypted = decryptedData;
    if (decrypted) {
      setMails(decrypted.emailLists);
      // localStorage.setItem("isFilterMail", "false");
      setFilteredMails(decrypted.emailLists);
      setPageLimit(decrypted.MailCount);
      setMailCount(decrypted.MailCount);
      setTotalPages(decrypted.TotalPages);
      setMailList(decrypted.emailLists);
      setPrevIndexCount(
        (decrypted?.emailLists?.length || 0) * (pageNumber || 1)
      );
      setFilterOptions(emptyFilterOption);
      setVendor({
        VendorNameValueForAPI: decrypted.VendorNameValueForAPI,
        VendorTagValueForAPI: decrypted.VendorTagValueForAPI,
        VendorMappingForAPI: decrypted.VendorMappingForAPI,
      });
    }
  }, [decryptedData])

  useEffect(() => {
    if (allSelected) {
      const readMails = perPageMailsRead.map((mail: any) => ({
        Msgnum: mail.MSGNUM,
        MailFolderName: mail.FolderName,
      }));
      const UnreadMails = perPageMailsUnread.map((mail: any) => ({
        Msgnum: mail.MSGNUM,
        MailFolderName: mail.FolderName,
      }));
      setSelectedMails([...readMails, ...UnreadMails]);
    } else {
      setSelectedMails([]);
    }
  }, [allSelected]);

  const fetchMails = async (
    mailboxType: any,
    showLoading: boolean,
    isStartMail: boolean,
    pageNumber?: any
  ) => {
    console.log("fetchMails")
    if (!mailboxType) {
      return;
    }
    let folderName = router?.query?.folder;
    if (router?.query?.folder === "High") {
      folderName = "HIGH";
    }
    if (router?.query?.folder === "Low") {
      folderName = "LOW";
    }
    if (router?.query?.folder === "Medium") {
      folderName === "MEDIUM";
    }
    try {
      if (showLoading) {
        dispatch(setLoading(true));
      }
      const Params = {
        Userid: localStorage.getItem("username"),
        ...filterOptions,
        MailFolderName:
          mailboxType === "High" ||
            mailboxType === "Low" ||
            mailboxType === "Medium"
            ? "inbox"
            : mailboxType,
        PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
        EmailID:
          email === "undefined" || !email
            ? selectedEmailUser || localStorage.getItem("mailUserId")
            : email,
        Priority: folderName,
        IsStarredMail: isStartMail,
        IsTransfer:
          mailboxType === "High" ||
            mailboxType === "Low" ||
            mailboxType === "Medium"
            ? true
            : false,
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENC",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("res 3", res)

      const decrypted = decryptText(res.data);
      setMails(decrypted.emailLists);
      setDecryptedData(decrypted);
      // localStorage.setItem("isFilterMail", "false");
      setFilteredMails(decrypted.emailLists);
      setPageLimit(decrypted.MailCount);
      setMailCount(decrypted.MailCount);
      setTotalPages(decrypted.TotalPages);
      setMailList(decrypted.emailLists);
      setPrevIndexCount(
        (decrypted?.emailLists?.length || 0) * (pageNumber || 1)
      );

      setVendor({
        VendorNameValueForAPI: decrypted.VendorNameValueForAPI,
        VendorTagValueForAPI: decrypted.VendorTagValueForAPI,
        VendorMappingForAPI: decrypted.VendorMappingForAPI,
      });
    } catch (err) {
    } finally {
      if (showLoading) {
        dispatch(setLoading(false));
      }
    }
  };

  const perPageMailsRead: any = useMemo(() => {
    const skip = (page - 1) * pageLimit;
    const perPageFilterMails = filteredMails?.slice(skip, skip + pageLimit);
    if (sorting.type) {
      return perPageFilterMails.sort((a: any, b: any) => {
        if (sorting.asce) {
          return a[sorting.type].localeCompare(b[sorting.type], "en", {
            sensitivity: "base",
          });
        } else {
          return b[sorting.type].localeCompare(a[sorting.type], "en", {
            sensitivity: "base",
          });
        }
      });
    }
    return perPageFilterMails.filter((res: any) =>
      router.query.isTransfer === "true"
        ? res.Status === "DONE"
        : res.IsMailRead
    );
  }, [page, filteredMails, sorting]);

  const perPageMailsUnread: any = useMemo(() => {
    const skip = (page - 1) * pageLimit;
    const perPageFilterMails = filteredMails?.slice(skip, skip + pageLimit);
    if (sorting.type) {
      return perPageFilterMails.sort((a: any, b: any) => {
        if (sorting.asce) {
          return a[sorting.type].localeCompare(b[sorting.type], "en", {
            sensitivity: "base",
          });
        } else {
          return b[sorting.type].localeCompare(a[sorting.type], "en", {
            sensitivity: "base",
          });
        }
      });
    }
    return perPageFilterMails.filter((res: any) =>
      router.query.isTransfer === "true"
        ? res.Status === "PENDING"
        : !res.IsMailRead
    );
  }, [page, filteredMails, sorting]);

  const handleAllmailCheck = () => {
    setAllSelected((prev) => !prev);
  };

  const handleDeleteMails = async () => {
    try {
      if (!selectedMails.length) {
        return;
      }
      const data = selectedMails.map((res: any) => {
        return {
          id: res.Msgnum,
          folder: res.MailFolderName,
        };
      });
      localStorage.setItem("undoMail", JSON.stringify(data));
      const Params = {
        Userid: localStorage.getItem("username"),
        delEmailLists: selectedMails,
        EmailID:
          email === "undefined" || !email
            ? selectedEmailUser || localStorage.getItem("mailUserId")
            : email,
      };
      await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/DeleteEmail",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedMails([]);
      if (localStorage.getItem("isFilterMail") === "true") {
        const deletedMails = filteredMails.filter((mail: any) => {
          return selectedMails.some((selectedMail: any) => selectedMail.Msgnum === mail.MSGNUM);
        });
        deletedMails.map((response: any, index: any) => {
          const findIndex = filteredMails.findIndex((mail: any) => {
            if (mail.MSGNUM === response.MSGNUM) {
              return true;
            }
          });
          if (findIndex !== -1) {
            filteredMails.splice(findIndex, 1);
            setFilteredMails([...filteredMails]);
          }

        })
      } else {
        const deletedMails = filteredMails.filter((mail: any) => {
          return selectedMails.some((selectedMail: any) => selectedMail.Msgnum === mail.MSGNUM);
        });
        deletedMails.map((response: any, index: any) => {
          const findIndex = filteredMails.findIndex((mail: any) => {
            if (mail.MSGNUM === response.MSGNUM) {
              return true;
            }
          });
          if (findIndex !== -1) {
            filteredMails.splice(findIndex, 1);
            setFilteredMails([...filteredMails]);
          }

        })
      }
      setOpenDeleteModal(false);
    } catch (e) {
      console.log("exception", e);
    }
  };

  const handleRefreshMails = async () => {
    try {
      if (localStorage.getItem("isFilterMail") === "true") {
        fetchFilterMails(pageNumber);
      } else {
        fetchMails(selectedFolder, true, false);
      }
    } catch (error) {
      console.log("Error with Refresh mails:", error);
    }
  };

  const handleSortingSelect = (value: any) => {
    if (value.value == sorting.type) {
      setSorting((prevVal) => ({
        ...prevVal,
        asce: !prevVal.asce,
      }));
    } else {
      setSorting({
        type: value.value,
        asce: true,
      });
    }
  };

  const openMoveMails = () => {
    if (selectedMails.length === 0) return;
    setOpenMoveFolder({
      open: true,
      Newfolderpath: "",
    });
  };

  const onClickBulkTag = () => {
    setBulkTagMail(true);
  };

  const onSubmitBulkMail = () => {
    const Params = {
      Userid: localStorage.getItem("username"),
      EmailID:
        email === "undefined" || !email
          ? selectedEmailUser || localStorage.getItem("mailUserId")
          : email,
      vendorreq: selectedMails.map((res: any) => {
        const newObject = {
          Msgnum: res.Msgnum,
          Userid: localStorage.getItem("username"),
          FolderName: res.MailFolderName,
          VendorName: selectedVendorName?.value || "",
          VendorTag: selectedVendorTag?.value || "",
          MappingType: selectedVendorMapping?.value || "",
          RecordID: recordID || "",
          EmailID:
            email === "undefined" || !email
              ? selectedEmailUser || localStorage.getItem("mailUserId")
              : email,
          IsFutureVendor: false,
        };
        return newObject;
      }),
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UpdateMailTagBulk",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setBulkTagMail(false);
      });
  };

  const onSubmitBulkFilterMail = () => {
    let folderName = router?.query?.folder;
    if (router?.query?.folder === "High") {
      folderName = "HIGH";
    }
    if (router?.query?.folder === "Low") {
      folderName = "LOW";
    }
    if (router?.query?.folder === "Medium") {
      folderName === "MEDIUM";
    }
    const Params = {
      Userid: localStorage.getItem("username"),
      ...filterOptions,
      SearchWords: searchQuery,
      MailFolderName:
        selectedFolder === "High" ||
          selectedFolder === "Low" ||
          selectedFolder === "Medium"
          ? "inbox"
          : selectedFolder,
      PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
      EmailID:
        email === "undefined" || !email
          ? selectedEmailUser || localStorage.getItem("mailUserId")
          : email,
      Priority: folderName,
      IsStarredMail: isStarredMail,
      IsTransfer:
        selectedFolder === "High" ||
          selectedFolder === "Low" ||
          selectedFolder === "Medium"
          ? true
          : false,
      MailCount: mailCount,
      mappingTypes: selectedVendorMapping?.value
        ? [{ MappingType: selectedVendorMapping?.value }]
        : [],
      vendorNames: selectedVendorName?.value
        ? [{ VendorName: selectedVendorName?.value }]
        : [],
      vendorTag: selectedVendorTag?.value
        ? [{ Tagname: selectedVendorTag?.value }]
        : [],
    };
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UpdateMailTagBulkCondition",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setBulkTagMail(false);
      });
  };

  const handlePageChange = (page: any) => {
    setPage(page);
  };

  const handleOnClickMail = (mail: any) => {

    if (isConversation || router.pathname.includes("/conversationMail")) {
      router.push(
        `/conversationMail?id=${mail.MSGNUM
        }&folder=${selectedFolder}&conversation=${true}&GroupNum=${mail.GroupNum
        }&vendorName=${vendor.VendorNameValueForAPI}&vendorTag=${vendor.VendorTagValueForAPI
        }&vendorMapping=${vendor.VendorMappingForAPI}`
      );
    } else {
      router.push(
        `/mailbox?id=${mail.MSGNUM}&folder=${selectedFolder}&vendorName=${vendor.VendorNameValueForAPI
        }&vendorTag=${vendor.VendorTagValueForAPI}&vendorMapping=${vendor.VendorMappingForAPI
        }&isTransfer=${router.query.isTransfer || "false"}&email=${email}`
      );
    }
    onClickMail?.(mail, filterOptions);
  };

  const onUndoMail = async () => {
    const data = JSON.parse(localStorage.getItem("undoMail") || "{}");
    const Params = {
      Userid: localStorage.getItem("username"),
      shiftmaillist: data.map((res: any) => {
        return {
          Msgnum: res.id,
          OldMailFolderName: "Deleted Items",
          NewMailFolderName: res.folder,
        };
      }),
      EmailID:
        email === "undefined" || !email
          ? selectedEmailUser || localStorage.getItem("mailUserId")
          : email,
    };
    const res = await axios.post(
      "https://logpanel.insurancepolicy4u.com/api/Login/ShiftEmail",
      Params,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.status !== 500) {
      localStorage.removeItem("undoMail");
      toast.toast.success("Mail Restored", { style: { top: 80 } });
      if (localStorage.getItem("isFilterMail") === "true") {
        fetchFilterMails(pageNumber);
      } else {
        fetchMails(selectedFolder, true, false);
      }
    }
  };

  const MailBoxControls = () => (
    <div
      className="app-inner-layout__top-pane pt-0 justify-content-between"
      style={{ flexWrap: "wrap", gap: 10 }}
    >
      <div className="d-flex ali h-fit" style={{ gap: 20, width: "100%", overflowX: "auto" }}>
        <Button
          outline
          className="control-button whitespace-nowrap"
          active
          color="light"
          onClick={handleAllmailCheck}
        >
          <Input
            type="checkbox"
            checked={allSelected}
            className={`form-check-input-custom`}
            label="&nbsp;"
          />
        </Button>
        <div className="btn-group">
          <Button
            outline
            className="control-button me-1 whitespace-nowrap"
            active
            color="light"
            onClick={() => setOpenDeleteModal(true)}
          >
            <FontAwesomeIcon icon={faTrash as any} />
          </Button>
        </div>

        <Button
          outline
          className="control-button me-1 whitespace-nowrap"
          active
          color="light"
          onClick={handleRefreshMails}
        >
          <FontAwesomeIcon icon={faSyncAlt as any} />
        </Button>
        <Button
          outline
          className="control-button me-1 whitespace-nowrap"
          active
          color="light"
          onClick={openMoveMails}
        >
          Move Mails <FontAwesomeIcon icon={faShare as any}></FontAwesomeIcon>
        </Button>
        <Button
          outline
          className="control-button me-1 whitespace-nowrap"
          active
          color={isStarredMail ? "primary" : "light"}
          onClick={() => {
            setIsStarredMail(!isStarredMail);
          }}
        >
          Starred Mails
        </Button>
        <Button
          outline
          className="control-button me-1 whitespace-nowrap"
          active
          color="light"
          onClick={() => {
            onClickBulkTag();
          }}
        >
          Bulk Tag Mails
        </Button>

        <Select
          closeMenuOnSelect={true}
          components={animatedComponents}
          defaultValue={sortSelectOptions.filter(
            (option) => option.value == sorting.type
          )}
          onChange={handleSortingSelect}
          className={`react-sorting-select`}
          options={sortSelectOptions}
        />
      </div>
      {/* <div className="d-flex align-items-center" style={{ gap: 30 }}> */}

      {/* <span className="me-1 fw-bolder">{`${(page - 1) * pageLimit + 1}-${
          page * pageLimit > filteredMails.length
            ? filteredMails.length
            : page * pageLimit
        }/${pageLimit}`}</span> */}
      {/* <div className="btn-group ml-1">
          <Button
            outline
            className="me-2"
            active
            color="light"
            type="button"
            onClick={() => {
              handlePageChange(page - 1);
            }}
            // className="btn btn-default btn-sm"
            disabled={page < 2}
          >
            <FontAwesomeIcon icon={faChevronLeft as any} />
          </Button>
          <Button
            outline
            className="me-2"
            active
            color="light"
            onClick={() => {
              handlePageChange(page + 1);
            }}
            type="button"
            // className="btn btn-default btn-sm"
            disabled={
              (filteredMails.length % 50 == 0 ? page + 1 : page) * pageLimit >
              filteredMails.length
            }
          >
            <FontAwesomeIcon icon={faChevronRight as any}></FontAwesomeIcon>
          </Button>
        </div> */}
      {/* </div> */}
    </div>
  );

  const handleSearch = async (pageNumber: number) => {
    console.log("handleSearch")
    if (
      Object.values(filterOptions).every((item) => item?.length === 0) &&
      !selectedVendorMapping?.value &&
      !selectedVendorName?.value &&
      !selectedVendorTag?.value
    ) {
      setPageNumber(1);
      fetchMails(selectedFolder, true, false, 1);
      localStorage.setItem("isFilterMail", "false");
      setIsFilterMail(false);
    } else {
      dispatch(setLoading(true));
      const Params = {
        Userid: localStorage.getItem("username"),
        PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
        EmailID:
          email === "undefined" || !email
            ? selectedEmailUser || localStorage.getItem("mailUserId")
            : email,
        ...filterOptions,
        mappingTypes: selectedVendorMapping?.value
          ? [{ MappingType: selectedVendorMapping?.value }]
          : [],
        vendorNames: selectedVendorName?.value
          ? [{ VendorName: selectedVendorName?.value }]
          : [],
        vendorTag: selectedVendorTag?.value
          ? [{ Tagname: selectedVendorTag?.value }]
          : [],
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENC",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("res 4", res)

      const decrypted = decryptText(res.data);
      dispatch(setLoading(false));
      setPageLimit(decrypted.MailCount);
      setMailCount(decrypted.MailCount);
      setTotalPages(decrypted.TotalPages);
      localStorage.setItem("isFilterMail", "true");
      setIsFilterMail(true);
      setFilteredMails(decrypted.emailLists);
      setMailList(decrypted.emailLists);
    }
  };

  const handleCloseMoveMail = () => {
    setOpenMoveFolder({
      open: false,
      Newfolderpath: "",
    });
  };

  const handleMailCheckBox = (e: any, id: any, FolderName: any) => {
    if (e?.target?.checked) {
      setSelectedMails((prevVal: any) => [
        ...prevVal,
        { Msgnum: id, MailFolderName: FolderName },
      ]);
    } else {
      setSelectedMails((prevVal: any) => [
        ...prevVal.filter((mail: any) => mail.Msgnum !== id),
      ]);
    }
  };

  const handleMoveMails = async (folder: any) => {
    try {
      if (!folder) {
        setOpenMoveFolder({
          Newfolderpath: "",
          open: false,
        });
        return;
      }
      const _mails = selectedMails.map((mail: any) => ({
        ...mail,
        OldMailFolderName: mail.MailFolderName,
        NewMailFolderName: folder,
      }));

      const Params = {
        Userid: localStorage.getItem("username"),
        shiftmaillist: _mails,
        EmailID:
          email === "undefined" || !email
            ? selectedEmailUser || localStorage.getItem("mailUserId")
            : email,
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/ShiftEmail",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedMails([]);
      if (!res.data.ErrorMessage) {
        if (localStorage.getItem("isFilterMail") === "true") {
          fetchFilterMails(pageNumber);
        } else {
          fetchMails(selectedFolder, true, false);
        }
        setOpenMoveFolder({
          Newfolderpath: "",
          open: false,
        });
      }
    } catch (error) {
      console.log("Error with shift mails: ", error);
    }
  };

  useEffect(() => {
    setActiveState?.(state.active);
  }, [state.active]);

  const handlePageClick = (event: any) => {
    setPageNumber(event.selected + 1);
    if (localStorage.getItem("isFilterMail") === "true") {
      if (searchQuery) {
        fetchFilterMails(event.selected + 1);
      } else {
        handleSearch(event.selected + 1);
      }
    } else {
      fetchMails(selectedFolder, true, false, event.selected + 1);
    }
  };

  const onClickStarred = (mail: any) => {
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/UpdateStaredMail",
        {
          Userid: localStorage.getItem("username"),
          EmailID:
            email === "undefined" || !email
              ? selectedEmailUser || localStorage.getItem("mailUserId")
              : email,
          Msgnum: mail.MSGNUM,
          Foldername: mail.FolderName,
          IsStarred: !mail.IsStarred,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (localStorage.getItem("isFilterMail") === "true") {
          fetchFilterMails(pageNumber);
        } else {
          fetchMails(selectedFolder, true, pageNumber);
        }
      })
      .catch((error) => { });
  };

  return (
    <Fragment>
      {isLoading && <Loading />}
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
        <div style={{ height: '100vh', overflow: 'auto' }}>
          <div
            className="app-inner-layout__top-pane"
            style={{ gap: 28, height: "auto" }}
          >
            <div className="pane-left">
              <div className="mobile-app-menu-btn">
                <div
                  onClick={() => {
                    setState((prevVal) => ({
                      ...prevVal,
                      active: !state.active,
                    }));
                  }}
                >
                  <i
                    className={state.active ? "pe-7s-close" : "pe-7s-menu"}
                    style={{ width: 42, height: 42, fontSize: 32 }}
                  ></i>
                </div>
              </div>
              <h4 className="mb-0">
                {searchText ||
                  !Object.values(filterOptions).every((item) => item == "")
                  ? "Seach Result"
                  : selectedFolder}
              </h4>
            </div>
            <div className="pane-right">
              <InputGroup>

                <Input
                  placeholder="Search..."
                  name="SearchWords"
                  onChange={(e) => {
                    setSearchText(e.target.value);
                  }}

                />
                <Tooltip
                  placement="top"
                  overlay={<Label>Search Now</Label>}
                >
                  <div
                    className="input-group-text cursor-pointer"
                    onClick={async () => {
                      if (searchText) {
                        dispatch(setLoading(true));
                        const Params = {
                          Userid: localStorage.getItem("username"),
                          ...emptyFilterOption,
                          SearchWords: searchText,
                          PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
                          EmailID:
                            email === "undefined" || !email
                              ? selectedEmailUser || localStorage.getItem("mailUserId")
                              : email,
                        };
                        const res = await axios.post(
                          "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENC",
                          Params,
                          {
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          }
                        );
                        console.log("res 5", res)

                        dispatch(setLoading(false));
                        localStorage.setItem("isFilterMail", "true");
                        setIsFilterMail(true);
                        const decrypted = decryptText(res.data);
                        setDecryptedData(decrypted);
                        setFilteredMails(decrypted.emailLists);
                        setPageLimit(decrypted.MailCount);
                        setMailCount(decrypted.MailCount);
                        setTotalPages(decrypted.TotalPages);
                        setMailList(decrypted.emailLists);
                        setPrevIndexCount(
                          (decrypted?.emailLists?.length || 0) * (pageNumber || 1)
                        );
                        setVendor({
                          VendorNameValueForAPI: decrypted.VendorNameValueForAPI,
                          VendorTagValueForAPI: decrypted.VendorTagValueForAPI,
                          VendorMappingForAPI: decrypted.VendorMappingForAPI,
                        });
                      } else {
                        dispatch(setLoading(false));
                        if (localStorage.getItem("isFilterMail") === "true") {
                          fetchFilterMails(pageNumber);
                        } else {
                          fetchMails(router.query.folder, true, false);
                          localStorage.setItem("isFilterMail", "false");
                          setIsFilterMail(false);
                        }
                      }
                    }}>
                    <FontAwesomeIcon icon={faSearch as any} />
                  </div>
                </Tooltip>
                {/* <Button  
                onClick={async () => {
                    if (searchText) {
                      dispatch(setLoading(true));
                      const Params = {
                        Userid: localStorage.getItem("username"),
                        ...emptyFilterOption,
                        SearchWords: searchText,
                        PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
                        EmailID:
                          email === "undefined" || !email
                            ? selectedEmailUser || localStorage.getItem("mailUserId")
                            : email,
                      };
                      const res = await axios.post(
                        "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENC",
                        Params,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );
                      dispatch(setLoading(false));
                      localStorage.setItem("isFilterMail", "true");
                      setIsFilterMail(true);
                      const decrypted = decryptText(res.data);
                      setDecryptedData(decrypted);
                      setFilteredMails(decrypted.emailLists);
                      setPageLimit(decrypted.MailCount);
                      setMailCount(decrypted.MailCount);
                      setTotalPages(decrypted.TotalPages);
                      setMailList(decrypted.emailLists);
                      setPrevIndexCount(
                        (decrypted?.emailLists?.length || 0) * (pageNumber || 1)
                      );
                      setVendor({
                        VendorNameValueForAPI: decrypted.VendorNameValueForAPI,
                        VendorTagValueForAPI: decrypted.VendorTagValueForAPI,
                        VendorMappingForAPI: decrypted.VendorMappingForAPI,
                      });
                    } else {
                      dispatch(setLoading(false));
                      if (localStorage.getItem("isFilterMail") === "true") {
                        fetchFilterMails(pageNumber);
                      } else {
                        fetchMails(router.query.folder, true, false);
                        localStorage.setItem("isFilterMail", "false");
                        setIsFilterMail(false);
                      }
                    }
                }}
                >
                  
                  Search now
                </Button> */}
              </InputGroup>
              <UncontrolledButtonDropdown>
                <DropdownToggle color="link">
                  <FontAwesomeIcon icon={faFilter as any} size="lg" />
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-xl rm-pointers">
                  <SearchForm
                    filterOptions={filterOptions}
                    setFilterOptions={setFilterOptions}
                    vendorList={vendorList}
                    selectedVendorName={selectedVendorName}
                    vendorTagList={vendorTagList}
                    selectedVendorTag={selectedVendorTag}
                    vendorMappingList={vendorMappingList}
                    selectedVendorMapping={selectedVendorMapping}
                    setSelectedVendorMapping={setSelectedVendorMapping}
                    setSelectedVendorTag={setSelectedVendorTag}
                    setSelectedVendorName={setSelectedVendorName}
                    setVendorTagList={setVendorTagList}
                    setVendorList={setVendorList}
                  />
                  <Nav vertical>
                    <NavItem className="nav-item-divider" />
                    <NavItem className="nav-item-btn text-center">
                      <Button
                        size="sm"
                        className="btn-shadow"
                        color="primary"
                        onClick={() => {
                          handleSearch(pageNumber);
                        }}
                      >
                        Search
                      </Button>
                    </NavItem>
                  </Nav>
                </DropdownMenu>
              </UncontrolledButtonDropdown>
            </div>
          </div>
          <MailBoxControls />
          <div className="bg-white">
            {loading ? (
              <div
                style={{
                  height: "50vh",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Loader active={loading} type="ball-pulse-rise" />
              </div>
            ) : (
              <div>
                {router?.query?.folder?.toString().toLowerCase() === "inbox" ? <div>
                  <div>
                    <CardTitle
                      onClick={() => {
                        setIsMailRead(!isMailRead);
                      }}
                      className="card-header"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <h6 className="card-header-title fw-bolder mb-0">
                          {router.query.isTransfer === "true"
                            ? "Done"
                            : "Read Mails"}
                        </h6>

                        <i
                          className="pe-7s-angle-down"
                          style={{ fontSize: 30 }}
                        ></i>
                      </div>
                    </CardTitle>
                    <Collapse isOpen={isMailRead}>
                      <Table
                        responsive
                        className="text-nowrap table-lg mb-0"
                        hover
                      >
                        <tbody>
                          {!perPageMailsRead.length ? (
                            <div className="d-flex justify-content-center font-weight-bold">
                              No Data Found
                            </div>
                          ) : (
                            perPageMailsRead?.map(
                              (mail: any, index: any) =>
                                (router.query.isTransfer === "true"
                                  ? mail.Status === "DONE"
                                  : mail.IsMailRead) && (
                                  <tr
                                    key={`mail-container-${mail.MSGNUM}-${index}`}
                                  >
                                    <td
                                      className="text-center"
                                      style={{ width: "78px" }}
                                    >
                                      <Input
                                        type="checkbox"
                                        onChange={(e) =>
                                          handleMailCheckBox(
                                            e,
                                            mail.MSGNUM,
                                            mail.FolderName
                                          )
                                        }
                                        checked={
                                          selectedMails.filter(
                                            (item: any) =>
                                              item.Msgnum == mail.MSGNUM
                                          ).length > 0
                                        }
                                        className="form-check-input-custom"
                                        id="eCheckbox1"
                                        label="&nbsp;"
                                      />
                                    </td>
                                    <td className="text-start ps-1">
                                      {mail.IsStarred ? (
                                        <FontAwesomeIcon
                                          icon={faStar as any}
                                          style={{ cursor: "pointer" }}
                                          onClick={() => {
                                            onClickStarred(mail);
                                          }}
                                        />
                                      ) : (
                                        <i
                                          style={{
                                            height: 14,
                                            width: 14,
                                            cursor: "pointer",
                                          }}
                                          onClick={() => {
                                            onClickStarred(mail);
                                          }}
                                          className="pe-7s-star"
                                        />
                                      )}
                                    </td>
                                    {router.pathname.includes(
                                      "/conversationMail"
                                    ) && <td>{mail.Msgcnt || 0}</td>}
                                    <td
                                      className="cursor-pointer"
                                      onClick={() => handleOnClickMail(mail)}
                                    >
                                      <div className="widget-content p-0">
                                        <div className="widget-content-wrapper">
                                          <div className="widget-content-left">
                                            <div className="widget-heading">
                                              {mail.FROMMAIL.split(" <")[0]}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td
                                      className="text-start mail-subject-wrapper cursor-pointer"
                                      onClick={() => handleOnClickMail(mail)}
                                    >
                                      <span className="mail-subject">
                                        {mail.SUBJECT}
                                      </span>
                                    </td>
                                    {router.query.isTransfer === "true" && (
                                      <td>
                                        <div>
                                          <Label
                                            style={{
                                              fontWeight: "bold",
                                              color: "red",
                                              fontSize: 15,
                                            }}
                                          >
                                            {mail?.Endtime}
                                          </Label>
                                        </div>
                                      </td>
                                    )}
                                    <td className="text-end">
                                      <FontAwesomeIcon
                                        className="opacity-4 me-2"
                                        icon={faCalendarAlt as any}
                                      />
                                      {mail.RecieveDate}
                                    </td>
                                  </tr>
                                )
                            )
                          )}
                        </tbody>
                      </Table>
                    </Collapse>
                  </div>
                  <div>
                    <CardTitle
                      onClick={() => {
                        setIsUnreadMails(!isUnreadMails);
                      }}
                      className="card-header"
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <h6 className="card-header-title fw-bolder mb-0">
                          {router.query.isTransfer === "true"
                            ? "Pending"
                            : "UnRead Mails"}
                        </h6>

                        <i
                          className="pe-7s-angle-down"
                          style={{ fontSize: 30 }}
                        ></i>
                      </div>
                    </CardTitle>
                    <Collapse isOpen={isUnreadMails}>
                      <div
                        className="text-nowrap table-lg mb-0"
                      >
                        <div className="hidden sm:block border !w-full">
                          {!perPageMailsUnread.length ? (
                            <div className="d-flex justify-content-center font-weight-bold">
                              No Data Found
                            </div>
                          ) : (
                            perPageMailsUnread?.map(
                              (mail: any, index: any) =>
                                (router.query.isTransfer === "true"
                                  ? mail.Status === "PENDING" ||
                                  mail.Status === ""
                                  : !mail.IsMailRead) && (
                                  <div
                                    key={`mail-container-${mail.MSGNUM}-${index}`}
                                    className="flex justify-between items-center !w-full  h-16 px-2"
                                  >

                                    <div className="flex gap-x-3 !w-2/5">
                                      <div
                                        className="text-center"
                                      // style={{ width: "78px" }}
                                      >
                                        <Input
                                          type="checkbox"
                                          onChange={(e) =>
                                            handleMailCheckBox(
                                              e,
                                              mail.MSGNUM,
                                              mail.FolderName
                                            )
                                          }
                                          checked={
                                            selectedMails.filter(
                                              (item: any) =>
                                                item.Msgnum == mail.MSGNUM
                                            ).length > 0
                                          }
                                          className="form-check-input-custom"
                                          id="eCheckbox1"
                                          label="&nbsp;"
                                        />
                                      </div>
                                      <div className="text-start ps-1">
                                        {mail.IsStarred ? (
                                          <FontAwesomeIcon
                                            icon={faStar as any}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => {
                                              onClickStarred(mail);
                                            }}
                                          />
                                        ) : (
                                          <i
                                            style={{
                                              height: 14,
                                              width: 14,
                                              cursor: "pointer",
                                            }}
                                            onClick={() => {
                                              onClickStarred(mail);
                                            }}
                                            className="pe-7s-star"
                                          />
                                        )}
                                      </div>
                                      {router.pathname.includes(
                                        "/conversationMail"
                                      ) && <div>{mail.Msgcnt || 0}</div>}

                                      <div
                                        className="cursor-pointer"
                                        onClick={() => handleOnClickMail(mail)}
                                      >
                                        <div className="widget-content p-0">
                                          <div className="widget-content-wrapper">
                                            <div className="widget-content-left">
                                              <div className="widget-heading">
                                                {mail.FROMMAIL.split(" <")[0]}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-start flex justify-start pl-3 mr-3  text-sm items-center w-full h-full overflow-hidden">
                                      <div
                                        className="text-start cursor-pointer flex justify-start items-start w-11/12"
                                        onClick={() => handleOnClickMail(mail)}
                                      >
                                        {
                                          mail.SUBJECT
                                        }
                                      </div>
                                    </div>

                                    <div className="font-bold">
                                      {router.query.isTransfer === "true" && (
                                        <div>
                                          <div>
                                            <Label
                                              style={{
                                                fontWeight: "bold",
                                                color: "red",
                                                fontSize: 15,
                                              }}
                                            >
                                              {mail?.Endtime}
                                            </Label>
                                          </div>
                                        </div>
                                      )}
                                      <div className="text-end" >
                                        {/* <FontAwesomeIcon
                                        className="opacity-4 me-2"
                                        icon={faCalendarAlt as any}
                                      /> */}
                                        {mail.RecieveDate}
                                      </div>
                                    </div>
                                  </div>
                                )
                            )
                          )}
                        </div>

                        <div className="block sm:hidden border !w-full !overflow-hidden">
                          {!perPageMailsUnread.length ? (
                            <div className="d-flex justify-content-center font-weight-bold">
                              No Data Found
                            </div>
                          ) : (
                            perPageMailsUnread?.map(
                              (mail: any, index: any) =>
                                (router.query.isTransfer === "true"
                                  ? mail.Status === "PENDING" ||
                                  mail.Status === ""
                                  : !mail.IsMailRead) && (
                                  <div
                                    key={`mail-container-${mail.MSGNUM}-${index}`}
                                    className="flex justify-between items-center !w-full  h-16 px-2"
                                  >

                                    <div className="flex gap-x-3 items-center">
                                      <div
                                        className="text-center"
                                      // style={{ width: "78px" }}
                                      >
                                        <Input
                                          type="checkbox"
                                          onChange={(e) =>
                                            handleMailCheckBox(
                                              e,
                                              mail.MSGNUM,
                                              mail.FolderName
                                            )
                                          }
                                          checked={
                                            selectedMails.filter(
                                              (item: any) =>
                                                item.Msgnum == mail.MSGNUM
                                            ).length > 0
                                          }
                                          className="form-check-input-custom"
                                          id="eCheckbox1"
                                          label="&nbsp;"
                                        />
                                      </div>
                                      <div className="text-start ps-1">
                                        {mail.IsStarred ? (
                                          <FontAwesomeIcon
                                            icon={faStar as any}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => {
                                              onClickStarred(mail);
                                            }}
                                          />
                                        ) : (
                                          <i
                                            style={{
                                              height: 14,
                                              width: 14,
                                              cursor: "pointer",
                                            }}
                                            onClick={() => {
                                              onClickStarred(mail);
                                            }}
                                            className="pe-7s-star"
                                          />
                                        )}
                                      </div>
                                      {router.pathname.includes(
                                        "/conversationMail"
                                      ) && <div>{mail.Msgcnt || 0}</div>}

                                      <div
                                        className="cursor-pointer flex flex-col overflow-hidden"
                                        onClick={() => handleOnClickMail(mail)}
                                      >
                                        <div className="widget-content p-0">
                                          <div className="widget-content-wrapper">
                                            <div className="widget-content-left">
                                              <div className="widget-heading">
                                                {mail.FROMMAIL.split(" <")[0]}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        {mail.SUBJECT.length > 35 ? mail.SUBJECT.substring(0, 35) + '....' : mail.SUBJECT}
                                      </div>
                                    </div>

                                    <div className="font-bold">
                                      {router.query.isTransfer === "true" && (
                                        <div>
                                          <div>
                                            <Label
                                              style={{
                                                fontWeight: "bold",
                                                color: "red",
                                                fontSize: 15,
                                              }}
                                            >
                                              {mail?.Endtime}
                                            </Label>
                                          </div>
                                        </div>
                                      )}
                                      <div className="text-end" >
                                        {/* <FontAwesomeIcon
                                        className="opacity-4 me-2"
                                        icon={faCalendarAlt as any}
                                      /> */}
                                        {(() => {
                                          const date = new Date(mail.RecieveDate);
                                          if (isToday(date)) {
                                            return format(date, 'HH:mm');
                                          } else {
                                            return format(date, 'dd MMM');
                                          }
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                )
                            )
                          )}
                        </div>

                      </div>
                    </Collapse>
                  </div>
                </div> : <div>
                  <Collapse isOpen={isUnreadMails}>
                    <Table
                      responsive
                      className="text-nowrap table-lg mb-0"
                      hover
                    >
                      <tbody>
                        {!filteredMails.length ? (
                          <div className="d-flex justify-content-center font-weight-bold">
                            No Data Found
                          </div>
                        ) : (
                          filteredMails?.map(
                            (mail: any, index: any) =>
                              (router.query.isTransfer === "true"
                                ? mail.Status === "PENDING" ||
                                mail.Status === ""
                                : !mail.IsMailRead) && (
                                <tr
                                  key={`mail-container-${mail.MSGNUM}-${index}`}
                                >
                                  <td
                                    className="text-center"
                                    style={{ width: "78px" }}
                                  >
                                    <Input
                                      type="checkbox"
                                      onChange={(e) =>
                                        handleMailCheckBox(
                                          e,
                                          mail.MSGNUM,
                                          mail.FolderName
                                        )
                                      }
                                      checked={
                                        selectedMails.filter(
                                          (item: any) =>
                                            item.Msgnum == mail.MSGNUM
                                        ).length > 0
                                      }
                                      className="form-check-input-custom"
                                      id="eCheckbox1"
                                      label="&nbsp;"
                                    />
                                  </td>
                                  <td className="text-start ps-1">
                                    {mail.IsStarred ? (
                                      <FontAwesomeIcon
                                        icon={faStar as any}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          onClickStarred(mail);
                                        }}
                                      />
                                    ) : (
                                      <i
                                        style={{
                                          height: 14,
                                          width: 14,
                                          cursor: "pointer",
                                        }}
                                        onClick={() => {
                                          onClickStarred(mail);
                                        }}
                                        className="pe-7s-star"
                                      />
                                    )}
                                  </td>
                                  {router.pathname.includes(
                                    "/conversationMail"
                                  ) && <td>{mail.Msgcnt || 0}</td>}
                                  <td
                                    className="cursor-pointer"
                                    onClick={() => handleOnClickMail(mail)}
                                  >
                                    <div className="widget-content p-0">
                                      <div className="widget-content-wrapper">
                                        <div className="widget-content-left">
                                          <div className="widget-heading">
                                            {mail.FROMMAIL.split(" <")[0]}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td
                                    className="text-start mail-subject-wrapper cursor-pointer"
                                    onClick={() => handleOnClickMail(mail)}
                                  >
                                    <span className="mail-subject">
                                      {mail.SUBJECT}
                                    </span>
                                  </td>
                                  {router.query.isTransfer === "true" && (
                                    <td>
                                      <div>
                                        <Label
                                          style={{
                                            fontWeight: "bold",
                                            color: "red",
                                            fontSize: 15,
                                          }}
                                        >
                                          {mail?.Endtime}
                                        </Label>
                                      </div>
                                    </td>
                                  )}
                                  <td className="text-end">
                                    <FontAwesomeIcon
                                      className="opacity-4 me-2"
                                      icon={faCalendarAlt as any}
                                    />
                                    {mail.RecieveDate}
                                  </td>
                                </tr>
                              )
                          )
                        )}
                      </tbody>
                    </Table>
                  </Collapse> </div>}
                <div
                  className="app-inner-layout__bottom-pane d-block text-center"
                  style={{ float: "right" }}
                >
                  <ReactPaginate
                    previousLabel="Previous"
                    nextLabel="Next"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    breakLabel="..."
                    breakClassName="page-item"
                    breakLinkClassName="page-link"
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    forcePage={pageNumber - 1}
                    onPageChange={handlePageClick}
                    containerClassName="pagination"
                    activeClassName="active"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card >

      {/* Move selected mails */}
      <Modal isOpen={openMoveFolder.open} toggle={handleCloseMoveMail} >
        <ModalHeader toggle={handleCloseMoveMail} className="fw-bolder">
          Move Folder
        </ModalHeader>
        <ModalBody>
          <div className="form-group">
            <label htmlFor="moveMailsSelect" className="mb-2 fw-bolder">
              Move Mails To:
            </label>

            <Select
              // className="form-control"
              id="moveMailsSelect"
              placeholder="Select New Folder"
              onChange={(e: any) =>
                setOpenMoveFolder((prevVal: any) => ({
                  ...prevVal,
                  Newfolderpath: e.value,
                }))
              }
              closeMenuOnSelect={true}
              components={animatedComponents}
              defaultValue={openMoveFolder.Newfolderpath}
              // onChange={handleSortingSelect}
              className={`react-sorting-select`}
              options={mailFolderList?.map((folder: any) => ({
                label: folder.FolderName,
                value: folder.FolderName,
              }))}
            ></Select>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="link" onClick={handleCloseMoveMail}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => handleMoveMails(openMoveFolder.Newfolderpath)}
          >
            Move
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete selected mails */}
      <Modal Modal isOpen={openDeleteModal} toggle={() => setOpenDeleteModal(false)}>
        <ModalHeader
          toggle={() => setOpenDeleteModal(false)}
          className="fw-bolder"
        >
          Delete Mails
        </ModalHeader>
        <ModalBody>
          <div className="form-group">
            Are you sure that you want to delete selected mails?
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="link" onClick={() => setOpenDeleteModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleDeleteMails}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Bulk Tag mails */}
      <Modal Modal isOpen={bulkTagMail} toggle={() => setBulkTagMail(false)}>
        <ModalHeader toggle={() => setBulkTagMail(false)} className="fw-bolder">
          Bulk Tag Mails
        </ModalHeader>
        <ModalBody>
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
                selectedVendorMapping?.value ? selectedVendorMapping : null
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
              value={selectedVendorName?.value ? selectedVendorName : null}
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
              value={selectedVendorTag?.value ? selectedVendorTag : null}
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
                    if (!response.data.LeadStatus?.[0]?.ErrorMessage) {
                      setIsRecordIdVerified(true);
                    } else {
                      setIsRecordIdVerified(false);
                    }
                  })
                  .catch((error) => { });
              }}
            />
          </div>
          {isFilterMail ? (
            <div
              style={{
                textAlign: "center",
                marginTop: "20px",
                fontSize: "17px",
                fontWeight: 700,
                color: "#545cd8",
                cursor: 'pointer'
              }}
              onClick={() => {
                onSubmitBulkFilterMail();
              }}
            >
              {" "}
              Bulk Tag all {mailCount} Mails{" "}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="link" onClick={() => setBulkTagMail(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            disabled={recordID ? !isRecordIdVerrfied : false}
            onClick={() => {
              if (localStorage.getItem("isFilterMail") === "true") {
                if (selectedMails.length === 0) {
                  onSubmitBulkFilterMail();
                } else {
                  onSubmitBulkMail();
                }
                return;
              }
              if (selectedMails.length === 0) {
                return;
              }
              onSubmitBulkMail();
            }}
          >
            Submit
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment >
  );
};