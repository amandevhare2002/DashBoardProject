import {
    faCalendarAlt,
    faFilter,
    faSearch,
    faShare,
    faStar,
    faSyncAlt,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
import zIndex from "@mui/material/styles/zIndex";
import { IoAttach } from "react-icons/io5";
import { Accordion, AccordionDetails, AccordionSummary, Box, Tab, Tabs, Typography } from "@mui/material";
import { GrAttachment } from "react-icons/gr";
import Loading from "@/pages/loading";
import Pako from "pako";
import * as signalR from '@microsoft/signalr';
import { toast, ToastContainer } from "react-toastify";


const crypto = require("crypto");

const animatedComponents = makeAnimated();
const LoadingOverlay = require("react-loading-overlay-ts").default;

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            className="w-full"
        >
            {value === index && (
                <Box sx={{ p: 3, width: "100%" }} >
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}
const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_SECRET_KEY;

export const MailList2 = ({
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
    setDecryptedData,
    value,
    setValue,
}: any) => {
    console.log("mailList", mailList)
    console.log("decryptedData", decryptedData)
    console.log("mailCount", mailCount)
    const router = useRouter();
    const dispatch = useDispatch();
    const email: any = router.query.email;
    console.log("emailemailemailemail", email)
    const token = useSelector((state: any) => state.authReducer.token);
    const loading = useSelector((state: any) => state.authReducer.loading);
    const [accordianView, setAccordianView] = useState(false)
    const [allSelected, setAllSelected] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    const [totalPages, setTotalPages] = useState(0);
    const [selectedFolder, setSelectedFolder] = useState<any>(null);
    const [searchText, setSearchText] = useState("");
    const searchQuery = useDebounce(searchText, DEBOUNCE_DELAY);
    const [isStarredMail, setIsStarredMail] = useState(false);
    const [selectedMails, setSelectedMails] = useState<any>([]);
    console.log("selectedMailsselectedMails", selectedMails)
    const [vendorMappingList, setVendorMappingList] = useState([]);
    const [filterOptions, setFilterOptions] = useState(emptyFilterOption);
    const [selectedVendorMapping, setSelectedVendorMapping] = useState({
        value: "",
        label: "",
    });
    const [selectedVendorName, setSelectedVendorName] = useState({
        value: "",
        label: "",
    });
    const [selectedVendorTag, setSelectedVendorTag] = useState({
        value: "",
        label: "",
    });
    const [vendor, setVendor] = useState<any>({
        VendorNameValueForAPI: "",
        VendorTagValueForAPI: "",
        VendorMappingForAPI: "",
    });
    const [vendorList, setVendorList] = useState([]);
    const [vendorTagList, setVendorTagList] = useState([]);
    const [bulkTagMail, setBulkTagMail] = useState(false);
    const [recordID, setRecordID] = useState("");
    const [isRecordIdVerrfied, setIsRecordIdVerified] = useState(false);
    console.log("selectedMails", selectedMails)
    const [isFilterMail, setIsFilterMail] = useState(false);
    const selectedEmailUser = useSelector(
        (state: any) => state.mailReducer.mailUserId
    );
    console.log("selectedEmailUserselectedEmailUser", selectedEmailUser)
    const mailFolderList = useSelector(
        (state: any) => state.mailReducer.mailFolderList
    );

    const [openMoveFolder, setOpenMoveFolder] = useState({
        open: false,
        Newfolderpath: "",
    });
    const [state, setState] = useState({
        active: false,
    });
    const [processMails, setProcessMails] = useState()

    const [isLoading, setIsLoading] = useState(false);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const isExecutedRef = useRef(false); // Use ref instead of variable for execution tracking

    // SignalR Integration
    // useEffect(() => {
    //     let isMounted = true;
    //     const emailId = selectedEmailUser || localStorage.getItem("username");
    //     if (!emailId || connection) return; // Skip if already connected

    //     console.log("Setting up SignalR connection...");

    //     const setupSignalRConnection = async () => {
    //         try {
    //             const userPayload = {
    //                 UserID: emailId,
    //                 ReferID: localStorage.getItem("username"),
    //                 Token: localStorage.getItem("token")
    //             };
    //             const jsonString = JSON.stringify(userPayload);
    //             const gzipped = Pako.gzip(jsonString);
    //             const keyBytes = Buffer.from(encryptionKey.slice(0, 16), "utf8");
    //             const iv = Buffer.alloc(16, 0);
    //             const cipher = crypto.createCipheriv("aes-128-cbc", keyBytes, iv);
    //             const encrypted = Buffer.concat([cipher.update(gzipped), cipher.final()]);
    //             const base64Result = encrypted.toString("base64");
    //             const encodedEmail = encodeURIComponent(base64Result);

    //             const url = `https://ms.pkgrp.in/emailHub?email=${encodedEmail}`;
    //             const newConnection = new signalR.HubConnectionBuilder()
    //                 .withUrl(url, {
    //                     transport: signalR.HttpTransportType.WebSockets,
    //                     withCredentials: true,
    //                 })
    //                 .withAutomaticReconnect([0, 2000, 5000, 10000])
    //                 .configureLogging(signalR.LogLevel.Information)
    //                 .build();

    //             // Single event handler setup
    //             newConnection.on("ReceiveEmail", (subject, body) => {
    //                 console.log("ReceiveEmail event triggered with arguments:", subject.Subject);
    //                 const emailData = JSON.parse(subject);

    //                 // Access the fields
    //                 const emailSubject = emailData.Subject;
    //                 const emailFrom = emailData.From;
    //                 const emailReceivedDate = emailData.RecDate;
    //                 const newEmail = {
    //                     SUBJECT: emailSubject,
    //                     Bodyhtml: emailData.Body,
    //                     From: '', // Update if server provides From field
    //                     RecieveDate: emailReceivedDate,
    //                     FolderName: "inbox",
    //                     IsMailRead: false,
    //                     IsStarred: false,
    //                     FROMMAIL: emailFrom,
    //                     Msgcnt: 0,
    //                     Status: "",
    //                     Endtime: "",
    //                     IsAttachment: false,
    //                 };

    //                 toast.info(`New email: ${emailData.Subject}`, {
    //                     toastId: `email-${emailData.MessageId || Date.now()}`, // Prevent duplicates
    //                     style: { top: 50 },
    //                 });

    //                 if (selectedFolder && selectedFolder.toLowerCase() === "inbox") {
    //                     setMailList((prev: any) => [newEmail, ...prev]);
    //                     setMailCount((prev: any) => (prev || 0) + 1);
    //                     setDecryptedData((prev: any) => {
    //                         const updatedEmailData = [...(prev.emaildata || [])];
    //                         if (updatedEmailData[value]?.displayEmails?.emailLists) {
    //                             updatedEmailData[value].displayEmails.emailLists = [
    //                                 newEmail,
    //                                 ...updatedEmailData[value].displayEmails.emailLists,
    //                             ];
    //                             updatedEmailData[value].displayEmails.MailCount = (updatedEmailData[value].displayEmails.MailCount || 0) + 1;
    //                         }
    //                         return { ...prev, emaildata: updatedEmailData };
    //                     });
    //                 }
    //             });

    //             newConnection.on("Ping", (message) => {
    //                 console.log("Ping response:", message);
    //             });

    //             await newConnection.start();
    //             if (isMounted) {
    //                 console.log("✅ Connected to SignalR Hub", newConnection.connectionId);
    //                 setConnection(newConnection);
    //             }
    //         } catch (err) {
    //             console.error("SignalR Connection Error:", err);
    //             if (isMounted) {
    //                 toast.error("Email notifications disconnected. Retrying...");
    //                 setTimeout(setupSignalRConnection, 5000);
    //             }
    //         }
    //     };

    //     setupSignalRConnection();

    //     return () => {
    //         if (connection) {
    //             connection?.stop()
    //                 .then(() => console.log("SignalR connection stopped."))
    //                 .catch((err: any) => console.error("Error stopping SignalR connection:", err));
    //             setConnection(null);
    //         }
    //         isExecutedRef.current = false;
    //     };
    // }, [token, selectedEmailUser, selectedFolder, setMailList, setMailCount, setDecryptedData, value]);


    useEffect(() => {
        let isMounted = true;
        const emailId = selectedEmailUser || localStorage.getItem("username");
        if (!emailId || connection) return; // Skip if already connected

        console.log("Setting up SignalR connection...");

        const setupSignalRConnection = async () => {
            try {
                const userPayload = {
                    UserID: emailId,
                    ReferID: localStorage.getItem("username"),
                    Token: localStorage.getItem("token")
                };
                const jsonString = JSON.stringify(userPayload);
                const gzipped = Pako.gzip(jsonString);
                const keyBytes = Buffer.from(encryptionKey.slice(0, 16), "utf8");
                const iv = Buffer.alloc(16, 0);
                const cipher = crypto.createCipheriv("aes-128-cbc", keyBytes, iv);
                const encrypted = Buffer.concat([cipher.update(gzipped), cipher.final()]);
                const base64Result = encrypted.toString("base64");
                const encodedEmail = encodeURIComponent(base64Result);

                const url = `https://ms.pkgrp.in/emailHub?email=${encodedEmail}`;
                const newConnection = new signalR.HubConnectionBuilder()
                    .withUrl(url, {
                        transport: signalR.HttpTransportType.WebSockets,
                        withCredentials: true,
                    })
                    .withAutomaticReconnect([0, 2000, 5000, 10000])
                    .configureLogging(signalR.LogLevel.Information)
                    .build();

                // Single event handler setup
                newConnection.on("ReceiveEmail", (subject, body) => {
                    if (!isMounted) return;
                    console.log("New email received:", subject);
                    try {
                        const emailData = typeof subject === 'string' ? JSON.parse(subject) : subject;

                        const newEmail = {
                            SUBJECT: emailData.Subject,
                            Bodyhtml: emailData.Body,
                            From: emailData.From || '',
                            RecieveDate: emailData.RecDate,
                            FolderName: "inbox",
                            IsMailRead: false,
                            IsStarred: false,
                            FROMMAIL: emailData.From,
                            Msgcnt: 0,
                            Status: "",
                            Endtime: "",
                            IsAttachment: false,
                        };

                        toast.info(`New email: ${emailData.Subject}`, {
                            toastId: `email-${emailData.MessageId || Date.now()}`, // Prevent duplicates
                            style: { top: 50 },
                        });

                        if (selectedFolder && selectedFolder.toLowerCase() === "inbox") {
                            setMailList((prev: any) => [newEmail, ...prev]);
                            setMailCount((prev: any) => (prev || 0) + 1);
                            setDecryptedData((prev: any) => {
                                const updatedEmailData = [...(prev.emaildata || [])];
                                if (updatedEmailData[value]?.displayEmails?.emailLists) {
                                    updatedEmailData[value].displayEmails.emailLists = [
                                        newEmail,
                                        ...updatedEmailData[value].displayEmails.emailLists,
                                    ];
                                    updatedEmailData[value].displayEmails.MailCount = (updatedEmailData[value].displayEmails.MailCount || 0) + 1;
                                }
                                return { ...prev, emaildata: updatedEmailData };
                            });
                        }
                    } catch (err) {
                        console.error("Error processing email:", err);
                    }
                });

                newConnection.on("Ping", (message) => {
                    console.log("Ping response:", message);
                });

                await newConnection.start();
                if (isMounted) {
                    console.log("✅ Connected to SignalR Hub", newConnection.connectionId);
                    setConnection(newConnection);
                }
            } catch (err) {
                console.error("SignalR Connection Error:", err);
                if (isMounted) {
                    toast.error("Email notifications disconnected. Retrying...", {
                        style: { top: 50, zIndex: 9999 },
                    });
                    setTimeout(setupSignalRConnection, 5000);
                }
            }
        };

        setupSignalRConnection();

        return () => {
            isMounted = false;
            if (connection) {
                connection.stop().catch((err: any) =>
                    console.error("Error stopping connection:", err)
                );
            }
        };
    }, [token, selectedEmailUser, selectedFolder, setMailList, setMailCount, setDecryptedData, value]);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    const handleAllmailCheck = () => {
        setAllSelected((prev) => !prev);
    };

    useEffect(() => {
        if (router.query.folder) {
            setSelectedFolder(router?.query?.folder);
        }
    }, [router.query.folder]);


    const fetchFilterMails = async (pageNumber: number) => {
        dispatch(setLoading(true));
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
        try {
            const res = await axios.post(
                "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENCv2",
                Params,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            console.log("res 2", res);
            dispatch(setLoading(false));
            localStorage.setItem("isFilterMail", "true");
            setIsFilterMail(true);
            const decrypted = decryptText(res.data);
            setDecryptedData(decrypted);
            setMailCount(decrypted?.emaildata?.[value]?.displayEmails?.MailCount || 0);
            setMailList(decrypted?.emaildata?.[value]?.displayEmails?.emailLists || []);
            setTotalPages(decrypted?.emaildata?.[value]?.displayEmails?.TotalPages || 0);
            setVendor({
                VendorNameValueForAPI: decrypted?.emaildata?.[value]?.displayEmails?.VendorNameValueForAPI || "",
                VendorTagValueForAPI: decrypted?.emaildata?.[value]?.displayEmails?.VendorTagValueForAPI || "",
                VendorMappingForAPI: decrypted?.emaildata?.[value]?.displayEmails?.VendorMappingForAPI || "",
            });
        } catch (err) {
            console.error("Error fetching filter mails:", err);
        }
    };
    useEffect(() => {
        if (localStorage.getItem("isFilterMail") === "true") {
            fetchFilterMails(pageNumber);
        } else {
            fetchMails(selectedFolder, true, isStarredMail, pageNumber);
        }
    }, [isStarredMail]);
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
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
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

    const getAllMailView = useMemo(() => {
        setVendor({
            VendorNameValueForAPI: decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails.VendorNameValueForAPI,
            VendorTagValueForAPI: decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails.VendorTagValueForAPI,
            VendorMappingForAPI: decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails.VendorMappingForAPI,
        });

        setMailCount(decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails?.MailCount)
        setMailList(decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails?.emailLists)
        console.log("decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails?.PageNumber", decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails)
        setPageNumber(decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails?.PageNumber)
        setTotalPages(decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails?.TotalPages)
        if (accordianView) {
            const unreadEmails = decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails && decryptedData?.emaildata[value]?.displayEmails?.emailLists.filter((email: any) => email.IsMailRead === false);
            const readEmails = decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails && decryptedData?.emaildata[value]?.displayEmails?.emailLists.filter((email: any) => email.IsMailRead === true);

            return {
                unreadEmails,
                readEmails
            }
        }
    }, [accordianView, value, decryptedData, setMailList, setMailCount, setPageNumber, setTotalPages]);
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
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setSelectedMails([]);
            if (localStorage.getItem("isFilterMail") === "true") {
                // const deletedMails = filteredMails.filter((mail: any) => {
                //     return selectedMails.some((selectedMail: any) => selectedMail.Msgnum === mail.MSGNUM);
                // });
                // deletedMails.map((response: any, index: any) => {
                //     const findIndex = filteredMails.findIndex((mail: any) => {
                //         if (mail.MSGNUM === response.MSGNUM) {
                //             return true;
                //         }
                //     });
                //     if (findIndex !== -1) {
                //         filteredMails.splice(findIndex, 1);
                //         setFilteredMails([...filteredMails]);
                //     }

                // })
            } else {
                // const deletedMails = filteredMails.filter((mail: any) => {
                //     return selectedMails.some((selectedMail: any) => selectedMail.Msgnum === mail.MSGNUM);
                // });
                // deletedMails.map((response: any, index: any) => {
                //     const findIndex = filteredMails.findIndex((mail: any) => {
                //         if (mail.MSGNUM === response.MSGNUM) {
                //             return true;
                //         }
                //     });
                //     if (findIndex !== -1) {
                //         filteredMails.splice(findIndex, 1);
                //         setFilteredMails([...filteredMails]);
                //     }

                // })
            }
            setOpenDeleteModal(false);
        } catch (e) {
            console.log("exception", e);
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

    const onProcessMail = () => {
        try {
            const payload = {
                UserId: localStorage.getItem("username"),
                EmailID:
                    email === "undefined" || !email
                        ? selectedEmailUser || localStorage.getItem("mailUserId")
                        : email,
                MsgNums: selectedMails.map((mail: any) => ({
                    Msgnum: mail.Msgnum,
                    Foldername: mail.MailFolderName,
                })),
            };
            const result = axios.post(
                "https://logpanel.insurancepolicy4u.com/api/Login/Processmail",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            result.then((response) => {
                setProcessMails(response.data);
                toast.info(response.data, {
                    toastId: `mail-processing-${Date.now()}`, // Prevent duplicates
                    style: { top: 50 },
                });
            });
        } catch (err) {
            console.error("Error processing mail:", err);
        }
    }

    const MailBoxControls = () => (
        <div
            className="app-inner-layout__top-pane pt-0 justify-content-between"
            style={{ flexWrap: "wrap", gap: 10 }}
        >
            <div className="d-flex ali h-fit" style={{ gap: 20, width: "100%" }}>
                <Tooltip placement="top" overlay={<Label>Change View</Label>}>
                    <Button
                        outline
                        className="control-button whitespace-nowrap"
                        active
                        color="light"
                        onClick={() => setAccordianView(!accordianView)}
                    >
                        View
                    </Button>
                </Tooltip>
                <Tooltip placement="top" overlay={<Label>Select All</Label>}>
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
                            onChange={handleAllmailCheck} // Add onChange to Input
                            className="form-check-input-custom"
                            label=" "
                        />
                    </Button>
                </Tooltip>
                <Tooltip placement="top" overlay={<Label>Delete</Label>}>
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
                </Tooltip>
                <Tooltip placement="top" overlay={<Label>Refresh</Label>}>
                    <Button
                        outline
                        className="control-button me-1 whitespace-nowrap"
                        active
                        color="light"
                        onClick={handleRefreshMails}
                    >
                        <FontAwesomeIcon icon={faSyncAlt as any} />
                    </Button>
                </Tooltip>
                <Button
                    outline
                    className="control-button me-1 whitespace-nowrap"
                    active
                    color="light"
                    onClick={openMoveMails}
                >
                    Move Mails <FontAwesomeIcon icon={faShare as any} />
                </Button>
                <Button
                    outline
                    className="control-button me-1 whitespace-nowrap"
                    active
                    color={isStarredMail ? "primary" : "light"}
                    onClick={() => setIsStarredMail(!isStarredMail)}
                >
                    Starred Mails
                </Button>
                <Button
                    outline
                    className="control-button me-1 whitespace-nowrap"
                    active
                    color="light"
                    onClick={onClickBulkTag}
                >
                    Bulk Tag Mails
                </Button>
                <Button
                    outline
                    className="control-button me-1 whitespace-nowrap"
                    active
                    color="light"
                    onClick={onProcessMail}
                >
                    Process Mail
                </Button>
            </div>
        </div>
    );

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
                "vendorTag": [{
                    "Tagname": decryptedData?.emaildata && decryptedData.emaildata[value]?.TabName
                }],
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
                "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENCv2",
                Params,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const decrypted = decryptText(res.data);
            console.log("decrypted", decrypted)
            //   setMails(decrypted.emailLists);
            //   setDecryptedData(decrypted);
            setDecryptedData(decrypted)
            // localStorage.setItem("isFilterMail", "false");
            //   setFilteredMails(decrypted.emailLists);
            //   setPageLimit(decrypted.MailCount);
            setMailCount(decrypted?.emaildata?.[value]?.displayEmails?.MailCount || 0);
            setMailList(decrypted?.emaildata?.[value]?.displayEmails?.emailLists || []);
            setTotalPages(decrypted?.emaildata?.[value]?.displayEmails?.TotalPages || 0);
            //   setPrevIndexCount(
            //     (decrypted?.emailLists?.length || 0) * (pageNumber || 1)
            //   );

            //   setVendor({
            //     VendorNameValueForAPI: decrypted.VendorNameValueForAPI,
            //     VendorTagValueForAPI: decrypted.VendorTagValueForAPI,
            //     VendorMappingForAPI: decrypted.VendorMappingForAPI,
            //   });
        } catch (err) {
            console.error("Error fetching mails:", err);
        } finally {
            if (showLoading) {
                dispatch(setLoading(false));
            }
        }
    };

    useEffect(() => {
        if (allSelected) {
            const mails: any = decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails && decryptedData?.emaildata[value]?.displayEmails?.emailLists?.map((mail: any, index: number) => ({
                Msgnum: mail.MSGNUM,
                MailFolderName: mail.FolderName
            })) || []
            console.log("mails", mails)
            setSelectedMails(mails);
        } else {
            setSelectedMails([]);
        }
    }, [allSelected, decryptedData, value]);


    const handlePageClick = (event: any) => {
        setPageNumber(event.selected + 1);
        if (localStorage.getItem("isFilterMail") === "true") {
            if (searchQuery) {

                fetchFilterMails(event.selected + 1);
            } else {
                console.log('fhandleSearch')
                handleSearch(event.selected + 1, false);
            }
        } else {
            fetchMails(selectedFolder, true, false, event.selected + 1);
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
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            )
            .then((response: any) => {
                setVendorMappingList(response.data.MappingTypes);
            })
            .catch((error: any) => {
                console.log("error", error)
                if (error.message === "Authorization has been denied for this request.") {
                    router.push("/login")
                }
            });
    };

    useEffect(() => {
        if (router?.query?.folder && token) {
            getTaggingApi();
        }
    }, [token, selectedFolder]);

    const onSubmitBulkMail = () => {
        console.log('Enter on On Submit Bulk')
        setIsLoading(true)
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
                setIsLoading(false)
                window.location.reload();
            }).catch((err) => {
                setIsLoading(false)
            })
    };

    const onSubmitBulkFilterMail = () => {
        console.log('Enter in bulk submit filter');
        setLoading(true)

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
                setIsLoading(false)
            }).catch((err) => {
                setIsLoading(false)

            })
    };

    const handleOnClickMail = (mail: any) => {
        // dispatch(setLoading(true));
        if (isConversation || router.pathname.includes("/conversationMail")) {
            {
                loading &&
                    router.push(
                        `/conversationMail?id=${mail.MSGNUM
                        }&folder=${selectedFolder}&conversation=${true}&GroupNum=${mail.GroupNum
                        }&vendorName=${vendor.VendorNameValueForAPI}&vendorTag=${vendor.VendorTagValueForAPI
                        }&vendorMapping=${vendor.VendorMappingForAPI}`
                    );
            }
        } else {
            router.push(
                `/mailbox?id=${mail.MSGNUM}&folder=${selectedFolder}&vendorName=${vendor.VendorNameValueForAPI
                }&vendorTag=${vendor.VendorTagValueForAPI}&vendorMapping=${vendor.VendorMappingForAPI
                }&isTransfer=${router.query.isTransfer || "false"}&email=${email}`
            );
        }
        onClickMail?.(mail, filterOptions);
    };


    const handleSearch = async (pageNumber: number, pageState: boolean) => {
        console.log("handleSearch", pageNumber)
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
                // PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
                PageNumber: pageState ? 0 : pageNumber - 1,
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
                "https://logpanel.insurancepolicy4u.com/api/Login/FilterEmailsENCv2",
                Params,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("res 4", res)

            const decrypted = decryptText(res.data);
            // const decrypted = (res.data); 

            dispatch(setLoading(false));
            setDecryptedData(decrypted)
            //   setPageLimit(decrypted.MailCount);

            //   setMailCount(decrypted.MailCount);
            setMailCount(decrypted?.emaildata && decrypted.emaildata[value]?.displayEmailsemaildata?.MailCount);
            //   setTotalPages(decrypted.TotalPages);
            localStorage.setItem("isFilterMail", "true");
            setIsFilterMail(true);
            //   setFilteredMails(decrypted.emailLists);
            //   setMailList(decrypted.emailLists);
            setMailList(decrypted?.emaildata && decrypted.emaildata[value]?.displayEmails?.emailLists)

        }
    };
    return (
        <>
            <ToastContainer
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
            {
                isLoading ? <Loading /> : (
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
                                        {/* {searchText ||
                                    !Object.values(filterOptions).every((item) => item == "")
                                    ? "Seach Result"
                                    : selectedFolder} */}
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

                                            value={searchText}

                                        />
                                        <Tooltip
                                            placement="top"
                                            overlay={<Label>Search Now</Label>}
                                        >
                                            <div
                                                className="input-group-text cursor-pointer"
                                                onClick={async () => {
                                                    console.log("searchText", searchText)
                                                    if (searchText) {
                                                        console.log("searchText2", searchText)
                                                        dispatch(setLoading(true));
                                                        setFilterOptions(emptyFilterOption);
                                                        const Params = {
                                                            Userid: localStorage.getItem("username"),
                                                            ...emptyFilterOption,
                                                            SearchWords: searchText,
                                                            // PageNumber: pageNumber > 0 ? pageNumber - 1 : 0,
                                                            PageNumber: 0,
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
                                                                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                                                                },
                                                            }
                                                        );
                                                        console.log("res 5", res)

                                                        dispatch(setLoading(false));
                                                        localStorage.setItem("isFilterMail", "true");
                                                        setIsFilterMail(true);
                                                        const decrypted = decryptText(res.data);
                                                        setDecryptedData(decrypted);
                                                        // setFilteredMails(decrypted.emailLists);
                                                        // setPageLimit(decrypted.MailCount);
                                                        // setMailCount(decrypted.MailCount);
                                                        // setTotalPages(decrypted.TotalPages);
                                                        // setMailList(res?.data?.emailLists);
                                                        // setPrevIndexCount(
                                                        //     (decrypted?.emailLists?.length || 0) * (pageNumber || 1)
                                                        // );
                                                        // setVendor({
                                                        //     VendorNameValueForAPI: decrypted.VendorNameValueForAPI,
                                                        //     VendorTagValueForAPI: decrypted.VendorTagValueForAPI,
                                                        //     VendorMappingForAPI: decrypted.VendorMappingForAPI,
                                                        // });
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
                                                <FontAwesomeIcon icon={faSearch as any} />
                                            </div>
                                        </Tooltip>

                                    </InputGroup>
                                    <UncontrolledButtonDropdown>
                                        <DropdownToggle color="link">
                                            <FontAwesomeIcon icon={faFilter as any} size="lg" onClick={() => setSearchText('')} />
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
                                                            console.log("adasa", searchText)
                                                            setSearchText('')
                                                            handleSearch(pageNumber, true);
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
                                <div>
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
                                        <>
                                            {router?.query?.folder?.toString().toLowerCase() === "inbox" && (<>
                                                <Tabs
                                                    value={value}
                                                    onChange={handleChange}
                                                    aria-label="basic tabs example"
                                                    textColor="primary"
                                                    indicatorColor="primary"
                                                    sx={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center", width: "100%", minWidth: "55px!important" }}
                                                >
                                                    {
                                                        decryptedData && decryptedData.emaildata.length > 0 && decryptedData.emaildata.map((tab: any, i: number) => (

                                                            <Tab
                                                                className=''
                                                                label={
                                                                    <div style={{ width: "100%", height: "30px", padding: "10px" }} className=''>
                                                                        {tab?.TabName}
                                                                    </div>
                                                                }
                                                                {...a11yProps(i)}
                                                                sx={{ minWidth: "59px", marginLeft: "0px", borderRadius: "2px 2px 0px 0px" }}
                                                            />
                                                        ))
                                                    }
                                                </Tabs>
                                            </>
                                            )}

                                            <CustomTabPanel value={value} index={value}>
                                                <>
                                                    {
                                                        accordianView ? (<>
                                                            <Accordion>
                                                                <AccordionSummary
                                                                    expandIcon={<ExpandMoreIcon />}
                                                                    aria-controls="panel1-content"
                                                                    id="panel1-header"
                                                                >
                                                                    Read Mails
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    {
                                                                        getAllMailView?.readEmails && getAllMailView?.readEmails.length > 0 && getAllMailView?.readEmails?.map((mail: any, index: number) => <div
                                                                            className="text-nowrap table-lg mb-0"
                                                                        >
                                                                            <div className="hidden sm:block border !w-full">
                                                                                {(
                                                                                    // (router.query.isTransfer === "true"
                                                                                    //     ? mail.Status === "PENDING" ||
                                                                                    //     mail.Status === ""
                                                                                    //     : !mail.IsMailRead) && 
                                                                                    (
                                                                                        <div
                                                                                            key={`mail-container-${mail.MSGNUM}-${index}`}
                                                                                            className="flex justify-between items-center !w-full  h-16 px-2"
                                                                                        >

                                                                                            <div className="flex gap-x-3 !w-2/5">
                                                                                                <div
                                                                                                    className="text-center"
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
                                                                                                                // onClickStarred(mail);
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
                                                                                                                // onClickStarred(mail);
                                                                                                            }}
                                                                                                            className="pe-7s-star"
                                                                                                        />
                                                                                                    )}
                                                                                                </div>
                                                                                                {router.pathname.includes(
                                                                                                    "/conversationMail"
                                                                                                ) && <div>{mail.Msgcnt || 0}</div>}

                                                                                                <div
                                                                                                    className="cursor-pointer flex  items-center"
                                                                                                    onClick={() => handleOnClickMail(mail)}
                                                                                                >


                                                                                                    {mail.FROMMAIL.split(" <")[0] && mail.FROMMAIL.split(" <")[0].length > 20 ? mail.FROMMAIL.split(" <")[0].slice(0, 20) + ".." : mail.FROMMAIL.split(" <")[0]}


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

                                                                                            <div className="">
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

                                                                                                <div className="text-end flex items-center" >
                                                                                                    {
                                                                                                        mail?.IsAttachment && (
                                                                                                            <GrAttachment color="blue" className="text-xs" />
                                                                                                        )
                                                                                                    }
                                                                                                    {mail.RecieveDate}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        )}
                                                                </AccordionDetails>
                                                            </Accordion>
                                                            <Accordion>
                                                                <AccordionSummary
                                                                    expandIcon={<ExpandMoreIcon />}
                                                                    aria-controls="panel1-content"
                                                                    id="panel1-header"
                                                                >
                                                                    UnRead Mails
                                                                </AccordionSummary>
                                                                <AccordionDetails>
                                                                    {
                                                                        getAllMailView?.unreadEmails && getAllMailView?.unreadEmails.length > 0 && getAllMailView?.unreadEmails?.map((mail: any, index: number) => <div
                                                                            className="text-nowrap table-lg mb-0 "
                                                                        >
                                                                            <div className="hidden sm:block border !w-full font-bold">
                                                                                {(
                                                                                    // (router.query.isTransfer === "true"
                                                                                    //     ? mail.Status === "PENDING" ||
                                                                                    //     mail.Status === ""
                                                                                    //     : !mail.IsMailRead) && 
                                                                                    (
                                                                                        <div
                                                                                            key={`mail-container-${mail.MSGNUM}-${index}`}
                                                                                            className="flex justify-between items-center !w-full  h-16 px-2 "
                                                                                        >

                                                                                            <div className="flex gap-x-3 !w-2/5">
                                                                                                <div
                                                                                                    className="text-center"
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
                                                                                                                // onClickStarred(mail);
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
                                                                                                                // onClickStarred(mail);
                                                                                                            }}
                                                                                                            className="pe-7s-star"
                                                                                                        />
                                                                                                    )}
                                                                                                </div>
                                                                                                {router.pathname.includes(
                                                                                                    "/conversationMail"
                                                                                                ) && <div>{mail.Msgcnt || 0}</div>}

                                                                                                <div
                                                                                                    className="cursor-pointer flex font-bold items-center"
                                                                                                    onClick={() => handleOnClickMail(mail)}
                                                                                                >
                                                                                                    {/* {
                                                                                                mail?.IsAttachment && (
                                                                                                    <GrAttachment color="blue" className="text-xs"/>
                                                                                                )
                                                                                            } */}

                                                                                                    {mail.FROMMAIL.split(" <")[0] && mail.FROMMAIL.split(" <")[0].length > 20 ? mail.FROMMAIL.split(" <")[0].slice(0, 20) + ".." : mail.FROMMAIL.split(" <")[0]}
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
                                                                                                <div className="text-end flex items-center" >
                                                                                                    {
                                                                                                        mail?.IsAttachment && (
                                                                                                            <GrAttachment color="blue" className="text-xs" />
                                                                                                        )
                                                                                                    }
                                                                                                    {mail.RecieveDate}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        )}
                                                                </AccordionDetails>
                                                            </Accordion>
                                                        </>) : (
                                                            <>
                                                                {
                                                                    decryptedData?.emaildata && decryptedData.emaildata[value]?.displayEmails && decryptedData?.emaildata[value]?.displayEmails?.emailLists?.map((mail: any, index: number) => (
                                                                        <>
                                                                            <div
                                                                                className="text-nowrap table-lg mb-0"
                                                                            >
                                                                                <div className={`border !w-full ${mail?.IsMailRead ? "font-bold" : ""} `}>
                                                                                    {(
                                                                                        // (router.query.isTransfer === "true"
                                                                                        //     ? mail.Status === "PENDING" ||
                                                                                        //     mail.Status === ""
                                                                                        //     : !mail.IsMailRead) && 
                                                                                        (
                                                                                            <div
                                                                                                key={`mail-container-${mail.MSGNUM}-${index}`}
                                                                                                className="flex justify-between items-center !w-full  h-16 px-2"
                                                                                            >

                                                                                                <div className="flex gap-x-3 !w-2/5">
                                                                                                    <div
                                                                                                        className="text-center"
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
                                                                                                                    // onClickStarred(mail);
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
                                                                                                                    // onClickStarred(mail);
                                                                                                                }}
                                                                                                                className="pe-7s-star"
                                                                                                            />
                                                                                                        )}
                                                                                                    </div>
                                                                                                    {router.pathname.includes(
                                                                                                        "/conversationMail"
                                                                                                    ) && <div>{mail.Msgcnt || 0}</div>}

                                                                                                    {/* <div
                                                                                                        className="cursor-pointer flex flex-col sm:flex-row   items-start"
                                                                                                        onClick={() => handleOnClickMail(mail)}
                                                                                                    > */}
                                                                                                    {/* {
                                                                                                mail?.IsAttachment && (
                                                                                                    <GrAttachment color="blue" className="text-xs"/>
                                                                                                )
                                                                                            } */}

                                                                                                    {/* {mail.FROMMAIL.split(" <")[0] && mail.FROMMAIL.split(" <")[0].length > 20 ? mail.FROMMAIL.split(" <")[0].slice(0, 20) + ".." : mail.FROMMAIL.split(" <")[0]}
                                                                                                        <p>
                                                                                                            {
                                                                                                                mail.SUBJECT && mail.SUBJECT.length > 20 ? mail.SUBJECT.slice(0, 20) + "..." : mail.SUBJECT
                                                                                                            }
                                                                                                        </p>
                                                                                                    </div> */}

                                                                                                    <div
                                                                                                        className="cursor-pointer flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-1 sm:gap-4"
                                                                                                        onClick={() => handleOnClickMail(mail)}
                                                                                                    >
                                                                                                        {/* Sender - always shows first 20 chars + ellipsis if longer */}
                                                                                                        <span className="truncate">
                                                                                                            {mail.FROMMAIL.split(" <")[0] && mail.FROMMAIL.split(" <")[0].length > 20
                                                                                                                ? mail.FROMMAIL.split(" <")[0].slice(0, 20) + ".."
                                                                                                                : mail.FROMMAIL.split(" <")[0]}
                                                                                                        </span>

                                                                                                        {/* Subject - full text on desktop, truncated on mobile */}
                                                                                                        <span className="hidden sm:block">{mail.SUBJECT.slice(0, 60) + "..."}</span>
                                                                                                        <span className="sm:hidden">
                                                                                                            {mail.SUBJECT && mail.SUBJECT.length > 20
                                                                                                                ? mail.SUBJECT.slice(0, 20) + "..."
                                                                                                                : mail.SUBJECT}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div className="text-start flex justify-start pl-3 mr-3  text-sm items-center w-full h-full overflow-hidden">
                                                                                                    <div
                                                                                                        className="text-start cursor-pointer flex justify-start items-start w-11/12"
                                                                                                        onClick={() => handleOnClickMail(mail)}
                                                                                                    >
                                                                                                        {/* {
                                                                                                    mail.SUBJECT
                                                                                                } */}
                                                                                                    </div>
                                                                                                </div>

                                                                                                <div className="flex flex-col">
                                                                                                    {router.query.isTransfer === "true" && (
                                                                                                        <div>
                                                                                                            <div>
                                                                                                                <Label
                                                                                                                    style={{
                                                                                                                        fontWeight: "bold",
                                                                                                                        color: "red",
                                                                                                                        fontSize: 10,
                                                                                                                    }}
                                                                                                                >
                                                                                                                    {mail?.Endtime}
                                                                                                                </Label>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}
                                                                                                    <div className="text-end flex items-center text-xs text-wrap min-w-20" >
                                                                                                        {
                                                                                                            mail?.IsAttachment && (
                                                                                                                <GrAttachment color="blue" className="text-xs" />
                                                                                                            )
                                                                                                        }

                                                                                                        {mail.RecieveDate}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                        </>
                                                                    )
                                                                    )
                                                                }

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
                                                                        // forcePage={pageNumber - 1}
                                                                        forcePage={pageNumber}
                                                                        onPageChange={handlePageClick}
                                                                        containerClassName="pagination"
                                                                        activeClassName="active"
                                                                    />
                                                                </div>
                                                            </>
                                                        )
                                                    }

                                                </>
                                            </CustomTabPanel>
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>
                    </Card >
                )
            }


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
                    <Button color="primary"
                        onClick={handleDeleteMails}
                    >
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
                                                Authorization: `Bearer ${localStorage.getItem("token")}`,
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
                        disabled={(recordID ? !isRecordIdVerrfied : false) || (isLoading)}
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

        </>
    )
}