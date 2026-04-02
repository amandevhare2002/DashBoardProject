import {
  faMinus,
  faPlus,
  faShare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useRouter } from "next/router";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  Button,
  Card,
  CardHeader,
  Collapse,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { setLoading } from "../../../reducers/Auth";
import { setMailFolderList, setSelectedFolder } from "../../../reducers/mail";
import { useMailService } from "./services/mail.service";
const animatedComponents = makeAnimated();

export const FolderList = ({
  onClickFolder,
  handleNewMail,
}: {
  onClickFolder?: any;
  handleNewMail?: any;
}) => {
  const [isCollapseSubFolder, setIsCollapseSubFolder] = useState<any>({});
  const [openCreateFolder, setOpenCreateFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const router = useRouter();
  console.log("router.query",router.query)
  const currentFolder: any = router.query.folder;
  const email: any = router.query.email;
  const isMailList:any = router.query.isMailList;
  
  const [openDeleteFolder, setOpenDeleteFolder] = useState({
    name: "",
    open: false,
  });
  const [openMoveFolder, setOpenMoveFolder] = useState({
    Oldfolderpath: "",
    Newfolderpath: "",
    open: false,
  });
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.authReducer.token);
  const [isConversationCollapsed, setIsConversationCollapsed] = useState(true);
  const [isFolderCollapsed, setIsFolderCollapsed] = useState(true);
  const loading = useSelector((state: any) => state.authReducer.loading);
  const mailUserId = useSelector((state:any) => state.mailReducer.mailUserId)
  const selectedFolder = useSelector(
    (state: any) => state.mailReducer.selectedFolder
  );
  const mailFolderList = useSelector(
    (state: any) => state.mailReducer.mailFolderList
  );
  const mailService = useMailService(token);
  const selectedEmailUser = useSelector(
    (state: any) => state.mailReducer.mailUserId
  );
  const [isCollapsedOthers, setIsCollapsedOthers] = useState(false);
  const [isCollapsedTransfer, setIsCollapsedTransfer] = useState(false);
  const [priorityList, setPriorityList] = useState([]);
  console.log("priorityList",priorityList)
  const [selectedSubFolder, setSelectedSubFolder] = useState("");

  const handleCollapseSubFolder = (key: any) => {
    const t = isCollapseSubFolder[key];
    setIsCollapseSubFolder({ ...isCollapseSubFolder, [key]: !t });
  };

  useEffect(() => {
    if (router.pathname.includes("conversationMail")) {
      setIsConversationCollapsed(true);
      setIsFolderCollapsed(false);
      setIsCollapsedTransfer(false);
    }
    if (
      router.query.isTransfer === "false" ||
      (!router.query.isTransfer &&
        !router.pathname.includes("conversationMail"))
    ) {
      setIsConversationCollapsed(false);
      setIsFolderCollapsed(true);
      setIsCollapsedTransfer(false);
    }
    if (router.query.isTransfer === "true") {
      setIsConversationCollapsed(false);
      setIsFolderCollapsed(false);
      setIsCollapsedTransfer(true);
    }
  }, [router]);

  const filteredFolders = useMemo(() => {
    let filterFolders: any = {
      folders: [],
      accordionFolders: {},
    };
    mailFolderList?.map((folder: any) => {
      const folderRoutes: any = folder.FolderName.split("/");
      const key: any = folderRoutes[0];
      const childRoutes: any = folderRoutes[1];
      if (childRoutes) {
        if (filterFolders.accordionFolders[key]) {
          filterFolders.accordionFolders[key].push(childRoutes);
        } else {
          filterFolders.accordionFolders[key] = [childRoutes];
        }
      } else {
        if (key == "Inbox") {
          filterFolders.folders.splice(0, 0, {
            name: key,
            Seqno: folder.Seqno === -1 ? 1000 : folder.Seqno,
          });
        } else {
          filterFolders.folders.push({
            name: key,
            Seqno: folder.Seqno === -1 ? 1000 : folder.Seqno,
          });
        }
      }
    });

    filterFolders.folders.sort((a: any, b: any) => a.Seqno - b.Seqno);
    if (!selectedFolder) {
      dispatch(setSelectedFolder(filterFolders.folders[0]));
    }

    return filterFolders;
  }, [mailFolderList]);
  console.log("filteredFolders",filteredFolders)

  const handleFolderClick = (key: any, type: string, email?: string) => {
    console.log("key-type",key,type)
    dispatch(setSelectedFolder(key));
    if (type === "Conversation") {
      router.push(`/conversationMail?folder=${key}`);
    } else if (type === "Folder") {
      router.push(`/mailbox?folder=${key}&isMailList=${true}`);
    } else if (type === "Transfer") {
      router.push(
        `/mailbox?folder=${key}&isTransfer=${true}&email=${email}&isMailList=${true}`
      );
    }
    onClickFolder?.(key, type);
  };

  useEffect(() => {
      if(isMailList && currentFolder=== "Inbox"){
        console.log("onClickFolder")
        onClickFolder("Inbox","Folder")
      }
  },[isMailList,currentFolder,mailUserId])

  const handleCreateFolder = async () => {
    try {
      if (!folderName) {
        setOpenCreateFolder(false);
        return;
      }
      const res = await mailService.createMailFolder(folderName);
      if (!res.ErrorMessage) {
        fetchMailFolderList();
      }
    } catch (error) {
      console.log("Error with create folder: ", error);
    } finally {
      setOpenCreateFolder(false);
      setFolderName("");
    }
  };

  const handleDeleteFolder = async (folder: any) => {
    try {
      const res = await mailService.deleteMailFolder(folder);
      if (!res.ErrorMessage) {
        fetchMailFolderList();
      }
    } catch (error) {
      console.log("Error with delete folder: ", error);
    } finally {
      setOpenDeleteFolder({ name: "", open: false });
    }
  };

  const handleOpenDelete = (folder: any) => {
    setOpenDeleteFolder({
      name: folder,
      open: true,
    });
  };

  const handleOpenMove = (folder: any) => {
    setOpenMoveFolder({
      Newfolderpath: "",
      Oldfolderpath: folder,
      open: true,
    });
  };

  const handleMoveFolder = async (oldFolder: any, newFolder: any) => {
    try {
      if (!newFolder) {
        handleCloseMoveMail();
        return;
      }
      const res = await mailService.moveMailFolder(oldFolder, newFolder);
      if (!res.ErrorMessage) {
        fetchMailFolderList();
        dispatch(setSelectedFolder(newFolder));
      }
    } catch (error) {
      console.log("Error with move folder: ", error);
    } finally {
      handleCloseMoveMail();
    }
  };

  useEffect(() => {
    if (token) {
      fetchMailFolderList();
      getPriprityWiseList();

    }
  }, [token]);

  const getPriprityWiseList = () => {
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/TransferMailPriorityWiseStaffList",
        {
          EmailID:
            selectedEmailUser || "" || localStorage.getItem("mailUserId") || "",
          Userid: localStorage.getItem("username"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setPriorityList(response.data.priorityNames);
      })
      .catch((error) => {});
  };

  const fetchMailFolderList = async () => {
    try {
      if(mailFolderList && mailFolderList.length<0){
        return 
      }
      dispatch(setLoading(true));
      const Params = {
        Userid: localStorage.getItem("username"),
        EmailID:
          selectedEmailUser || "" || localStorage.getItem("mailUserId") || "",
      };
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetMailFolderList",
        Params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setMailFolderList(res.data.mailfoldername));
    } catch (err) {
      console.log("Error:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCloseMoveMail = () => {
    setOpenMoveFolder({
      Newfolderpath: "",
      Oldfolderpath: "",
      open: false,
    });
  };

  const handleComposeMail = () => {
    router.push("/mailbox?create=new-mail");
    handleNewMail();
  };

  return (
    <Fragment>
      <Card className="app-inner-layout__sidebar">
        <div className="d-flex mb-2 mt-1 w-100">
          <button
            className="btn btn-primary btn-block w-100 ms-2 me-2"
            onClick={handleComposeMail}
          >
            Compose Mail
          </button>
        </div>
        <div
          className="card-header"
          onClick={() => {
            setIsConversationCollapsed(!isConversationCollapsed);
            if (!isConversationCollapsed) {
              setIsFolderCollapsed(false);
            }
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
            <h6 className="card-header-title fw-bolder mb-0">
              Conversation Folders
            </h6>
            <i className="pe-7s-angle-down" style={{ fontSize: 30 }}></i>
          </div>
        </div>
        <Collapse isOpen={isConversationCollapsed}>
          <div className="card-body p-0">
            <div
              className="flex-column accordion"
              style={{ maxHeight: "63vh", overflow: "auto" }}
            >
              {filteredFolders.folders?.map(
                (folder: { name: string; Seqno: number }, index: any) => {
                  return (
                    <CardHeader
                      className="card-header d-flex justify-content-between no-after"
                      style={{
                        backgroundColor:
                          currentFolder?.toLowerCase() ===
                          folder.name?.toLowerCase()
                            ? "#545cd8"
                            : "#ffff",
                      }}
                      key={`accordion-title-${index}`}
                    >
                      <h2 className="mb-0 w-100 d-flex">
                        <Button
                          className="btn btn-block text-start w-100"
                          style={{
                            color:
                              currentFolder?.toLowerCase() ===
                              folder.name?.toLowerCase()
                                ? "#ffff"
                                : "#495057",
                            backgroundColor: "transparent",
                            border: 0
                          }}
                          onClick={() =>
                            handleFolderClick(folder.name, "Conversation")
                          }
                        >
                          {folder.name}
                        </Button>
                      </h2>
                      <h2 className="mb-0 d-flex">
                        <Button
                          className="btn btn-block text-start m-0 pe-2"
                          type="button"
                          style={{
                            color:
                              currentFolder?.toLowerCase() ===
                              folder.name?.toLowerCase()
                                ? "#ffff"
                                : "#495057",
                            backgroundColor: "transparent",
                            border: 0
                          }}
                          onClick={() => handleOpenDelete(folder.name)}
                        >
                          <FontAwesomeIcon icon={faTrash as any} />
                        </Button>
                        <Button
                          className="btn btn-block text-start m-0 ps-2"
                          type="button"
                          style={{
                            color:
                              currentFolder?.toLowerCase() ===
                              folder.name?.toLowerCase()
                                ? "#ffff"
                                : "#495057",
                            backgroundColor: "transparent",
                            border: 0
                          }}
                          onClick={() => handleOpenMove(folder.name)}
                        >
                          <FontAwesomeIcon icon={faShare as any} />
                        </Button>
                      </h2>
                    </CardHeader>
                  );
                }
              )}
              {Object.entries(filteredFolders.accordionFolders)?.map(
                (value: any, index: any) => {
                  return (
                    <div
                      className={`card mb-0 ${
                        !isCollapseSubFolder[value[0]] ? "collapsed-card" : ""
                      }`}
                      key={`accordion-title-${index}`}
                    >
                      <CardHeader
                        className="d-flex justify-content-between cursor-pointer"
                        onClick={() => {
                          handleCollapseSubFolder(value[0]);
                        }}
                      >
                        <h3 className="card-title accordion__title mb-0">
                          {value[0]}
                        </h3>
                        <div className="card-tools">
                          {/* <Button type="button" className="btn btn-tool" outline data-card-widget="collapse"> */}
                          <FontAwesomeIcon
                            icon={
                              !isCollapseSubFolder[value[0]]
                                ? (faPlus as any)
                                : faMinus
                            }
                          />
                          {/* </Button> */}
                        </div>
                      </CardHeader>
                      <Collapse
                        isOpen={isCollapseSubFolder[value[0]]}
                        className="card-body p-0"
                      >
                        {value[1]?.map((subFolder: any, idx: any) => {
                          return (
                            <div
                              className="card-header d-flex justify-content-between no-after"
                              style={{
                                backgroundColor:
                                  currentFolder === value[0] + "/" + subFolder
                                    ? "#545cd8"
                                    : "#ffff",
                              }}
                              key={`accordion-item-${idx}`}
                            >
                              <h2 className="mb-0 w-100 d-flex">
                                <Button
                                  className="btn btn-block text-start w-100"
                                  style={{
                                    color:
                                      currentFolder ===
                                      value[0] + "/" + subFolder
                                        ? "#ffff"
                                        : "#495057",
                                    backgroundColor: "transparent",
                                    border: 0
                                  }}
                                  type="button"
                                  onClick={() =>
                                    handleFolderClick(
                                      value[0] + "/" + subFolder,
                                      "Conversation"
                                    )
                                  }
                                >
                                  {subFolder}
                                </Button>
                              </h2>
                              <h2 className="mb-0 d-flex">
                                <Button
                                  className="btn btn-block text-start m-0 pe-2"
                                  type="button"
                                  style={{
                                    color:
                                      currentFolder ===
                                      value[0] + "/" + subFolder
                                        ? "#ffff"
                                        : "#495057",
                                    backgroundColor: "transparent",
                                    border: 0
                                  }}
                                  onClick={() =>
                                    handleOpenDelete(value[0] + "/" + subFolder)
                                  }
                                >
                                  <FontAwesomeIcon icon={faTrash as any} />
                                </Button>
                                <Button
                                  className="btn btn-block text-start m-0 ps-2"
                                  type="button"
                                  style={{
                                    color:
                                      currentFolder ===
                                      value[0] + "/" + subFolder
                                        ? "#ffff"
                                        : "#495057",
                                    backgroundColor: "transparent",
                                    border: 0
                                  }}
                                  onClick={() =>
                                    handleOpenMove(value[0] + "/" + subFolder)
                                  }
                                >
                                  <FontAwesomeIcon icon={faShare as any} />
                                </Button>
                              </h2>
                            </div>
                          );
                        })}
                      </Collapse>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </Collapse>
        <div
          className="card-header"
          onClick={() => {
            setIsFolderCollapsed(!isFolderCollapsed);
            if (!isFolderCollapsed) {
              setIsConversationCollapsed(false);
            }
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
            <h6 className="card-header-title fw-bolder mb-0">Folders</h6>

            <i className="pe-7s-angle-down" style={{ fontSize: 30 }}></i>
          </div>
        </div>
        <Collapse isOpen={isFolderCollapsed}>
          <div className="card-body p-0">
            <div
              className="flex-column accordion"
              style={{ maxHeight: "63vh", overflow: "auto" }}
            >
              {filteredFolders.folders?.map(
                (folder: { name: string; Seqno: number }, index: any) => {
                  if (folder.Seqno !== 1000) {
                    return (
                      <CardHeader
                        className="card-header d-flex justify-content-between no-after"
                        style={{
                          backgroundColor:
                            currentFolder?.toLowerCase() ===
                            folder.name?.toLowerCase()
                              ? "#545cd8"
                              : "#ffff",
                        }}
                        key={`accordion-title-${index}`}
                      >
                        <h2 className="mb-0 w-100 d-flex">
                          <Button
                            className="btn btn-block text-start w-100"
                            style={{
                              color:
                                currentFolder?.toLowerCase() ===
                                folder.name?.toLowerCase()
                                  ? "#ffff"
                                  : "#495057",
                              backgroundColor: "transparent",
                              border: 0
                            }}
                            type="button"
                            onClick={() =>
                              handleFolderClick(folder.name, "Folder")
                            }
                          >
                            {folder.name}
                          </Button>
                        </h2>
                        <h2 className="mb-0 d-flex">
                          <Button
                            className="btn btn-block text-start m-0 pe-2"
                            type="button"
                            style={{
                              color:
                                currentFolder?.toLowerCase() ===
                                folder.name?.toLowerCase()
                                  ? "#ffff"
                                  : "#495057",
                              backgroundColor: "transparent",
                              border: 0
                            }}
                            onClick={() => handleOpenDelete(folder.name)}
                          >
                            <FontAwesomeIcon icon={faTrash as any} />
                          </Button>
                          <Button
                            className="btn btn-block text-start m-0 ps-2"
                            type="button"
                            style={{
                              color:
                                currentFolder?.toLowerCase() ===
                                folder.name?.toLowerCase()
                                  ? "#ffff"
                                  : "#495057",
                              backgroundColor: "transparent",
                              border: 0
                            }}
                            onClick={() => handleOpenMove(folder.name)}
                          >
                            <FontAwesomeIcon icon={faShare as any} />
                          </Button>
                        </h2>
                      </CardHeader>
                    );
                  }
                }
              )}
              <div>
                <CardHeader
                  className="d-flex justify-content-between cursor-pointer"
                  onClick={() => {
                    setIsCollapsedOthers(!isCollapsedOthers);
                  }}
                >
                  <h3 className="card-title accordion__title mb-0">Others</h3>
                  <div className="card-tools">
                    <FontAwesomeIcon
                      icon={!isCollapsedOthers ? (faPlus as any) : faMinus}
                    />
                  </div>
                </CardHeader>
                <Collapse isOpen={isCollapsedOthers}>
                  {filteredFolders.folders?.map(
                    (folder: { name: string; Seqno: number }, index: any) => {
                      if (folder.Seqno === 1000) {
                        return (
                          <CardHeader
                            className="card-header d-flex justify-content-between no-after"
                            style={{
                              backgroundColor:
                                currentFolder?.toLowerCase() ===
                                folder.name?.toLowerCase()
                                  ? "#545cd8"
                                  : "#ffff",
                            }}
                            key={`accordion-title-${index}`}
                          >
                            <h2 className="mb-0 w-100 d-flex">
                              <Button
                                className="btn btn-block text-start w-100"
                                style={{
                                  color:
                                    currentFolder?.toLowerCase() ===
                                    folder.name?.toLowerCase()
                                      ? "#ffff"
                                      : "#495057",
                                  backgroundColor: "transparent",
                                  border: 0
                                }}
                                type="button"
                                onClick={() =>
                                  handleFolderClick(folder.name, "Folder")
                                }
                              >
                                {folder.name}
                              </Button>
                            </h2>
                            <h2 className="mb-0 d-flex">
                              <Button
                                className="btn btn-block text-start m-0 pe-2"
                                type="button"
                                style={{
                                  color:
                                    currentFolder?.toLowerCase() ===
                                    folder.name?.toLowerCase()
                                      ? "#ffff"
                                      : "#495057",
                                  backgroundColor: "transparent",
                                  border: 0
                                }}
                                onClick={() => handleOpenDelete(folder.name)}
                              >
                                <FontAwesomeIcon icon={faTrash as any} />
                              </Button>
                              <Button
                                className="btn btn-block text-start m-0 ps-2"
                                type="button"
                                style={{
                                  color:
                                    currentFolder?.toLowerCase() ===
                                    folder.name?.toLowerCase()
                                      ? "#ffff"
                                      : "#495057",
                                  backgroundColor: "transparent",
                                  border: 0
                                }}
                                onClick={() => handleOpenMove(folder.name)}
                              >
                                <FontAwesomeIcon icon={faShare as any} />
                              </Button>
                            </h2>
                          </CardHeader>
                        );
                      }
                    }
                  )}
                </Collapse>
              </div>
              {Object.entries(filteredFolders.accordionFolders)?.map(
                (value: any, index: any) => {
                  return (
                    <div
                      className={`card mb-0 ${
                        !isCollapseSubFolder[value[0]] ? "collapsed-card" : ""
                      }`}
                      key={`accordion-title-${index}`}
                    >
                      <CardHeader
                        className="d-flex justify-content-between cursor-pointer"
                        onClick={() => {
                          handleCollapseSubFolder(value[0]);
                        }}
                      >
                        <h3 className="card-title accordion__title mb-0">
                          {value[0]}
                        </h3>
                        <div className="card-tools">
                          {/* <Button type="button" className="btn btn-tool" outline data-card-widget="collapse"> */}
                          <FontAwesomeIcon
                            icon={
                              !isCollapseSubFolder[value[0]]
                                ? (faPlus as any)
                                : faMinus
                            }
                          />
                          {/* </Button> */}
                        </div>
                      </CardHeader>
                      <Collapse
                        isOpen={isCollapseSubFolder[value[0]]}
                        className="card-body p-0"
                      >
                        {value[1]?.map((subFolder: any, idx: any) => {
                          return (
                            <div
                              className="card-header d-flex justify-content-between no-after"
                              style={{
                                backgroundColor:
                                  currentFolder === value[0] + "/" + subFolder
                                    ? "#545cd8"
                                    : "#ffff",
                              }}
                              key={`accordion-item-${idx}`}
                            >
                              <h2 className="mb-0 w-100 d-flex">
                                <Button
                                  className="btn btn-block text-start w-100"
                                  style={{
                                    color:
                                      currentFolder ===
                                      value[0] + "/" + subFolder
                                        ? "#ffff"
                                        : "#495057",
                                    backgroundColor: "transparent",
                                    border: 0
                                  }}
                                  type="button"
                                  onClick={() =>
                                    handleFolderClick(
                                      value[0] + "/" + subFolder,
                                      "Folder"
                                    )
                                  }
                                >
                                  {subFolder}
                                </Button>
                              </h2>
                              <h2 className="mb-0 d-flex">
                                <Button
                                  className="btn btn-block text-start m-0 pe-2"
                                  type="button"
                                  style={{
                                    color:
                                      currentFolder ===
                                      value[0] + "/" + subFolder
                                        ? "#ffff"
                                        : "#495057",
                                    backgroundColor: "transparent",
                                    border: 0
                                  }}
                                  onClick={() =>
                                    handleOpenDelete(value[0] + "/" + subFolder)
                                  }
                                >
                                  <FontAwesomeIcon icon={faTrash as any} />
                                </Button>
                                <Button
                                  className="btn btn-block text-start m-0 ps-2"
                                  type="button"
                                  style={{
                                    color:
                                      currentFolder ===
                                      value[0] + "/" + subFolder
                                        ? "#ffff"
                                        : "#495057",
                                    backgroundColor: "transparent",
                                    border: 0
                                  }}
                                  onClick={() =>
                                    handleOpenMove(value[0] + "/" + subFolder)
                                  }
                                >
                                  <FontAwesomeIcon icon={faShare as any} />
                                </Button>
                              </h2>
                            </div>
                          );
                        })}
                      </Collapse>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </Collapse>
        <div>
          <div
            className="card-header"
            onClick={() => {
              setIsCollapsedTransfer(!isCollapsedTransfer);
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
              <h6 className="card-header-title fw-bolder mb-0">
                Transfer Folders
              </h6>

              <i className="pe-7s-angle-down" style={{ fontSize: 30 }}></i>
            </div>
          </div>
          <Collapse isOpen={isCollapsedTransfer}>
            {priorityList?.map((res: any, index: number) => {
              return (
                <div
                  className={`card mb-0 ${
                    !isCollapseSubFolder[res.Priority] ? "collapsed-card" : ""
                  }`}
                  key={`accordion-title-${index}`}
                >
                  <CardHeader
                    className="d-flex justify-content-between cursor-pointer"
                    onClick={() => {
                      handleCollapseSubFolder(res.Priority);
                    }}
                  >
                    <h2 className="mb-0 w-100 d-flex">
                      <Button
                        className="btn btn-block text-start w-100"
                        style={{
                          color: "#495057",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: 'transparent'
                        }}
                        type="button"
                      >
                        {res.Priority}{" "}
                        {res?.EmailList?.length > 0 ? (
                          <FontAwesomeIcon
                            icon={
                              !isCollapseSubFolder[res.Priority]
                                ? (faPlus as any)
                                : faMinus
                            }
                          />
                        ) : null}
                      </Button>
                    </h2>
                  </CardHeader>
                  <Collapse
                    isOpen={isCollapseSubFolder[res.Priority]}
                    className="card-body p-0"
                  >
                    {res.EmailList.map((subFolder: any, idx: any) => {
                      return (
                        <div
                          className="card-header d-flex justify-content-between no-after"
                          style={{
                            backgroundColor:
                              currentFolder === res.Priority &&
                              subFolder.Email === email
                                ? "#545cd8"
                                : "#ffff",
                          }}
                          key={`accordion-item-${idx}`}
                        >
                          <h2 className="mb-0 w-100 d-flex">
                            <Button
                              className="btn btn-block text-start w-100"
                              style={{
                                color:
                                  currentFolder === res.Priority &&
                                  subFolder.Email === email
                                    ? "#ffff"
                                    : "#495057",
                                    backgroundColor: 'transparent',
                                    border: 0
                              }}
                              type="button"
                              onClick={() => {
                                handleFolderClick(
                                  res.Priority,
                                  "Transfer",
                                  subFolder.Email
                                );
                              }}
                            >
                              {subFolder.Email} - {`(${subFolder.MailCount})`}
                            </Button>
                          </h2>
                        </div>
                      );
                    })}
                  </Collapse>
                </div>
              );
            })}
          </Collapse>
          <div className="d-flex mt-2 w-100">
            <Button
              className="btn btn-secondary btn-block w-100 ms-2 me-2"
              onClick={() => setOpenCreateFolder(true)}
            >
              Create Folder
            </Button>
          </div>
        </div>
      </Card>

      {/* Create Mail Folder */}
      <Modal
        isOpen={openCreateFolder}
        toggle={() => setOpenCreateFolder(false)}
      >
        <ModalHeader
          toggle={() => setOpenCreateFolder(false)}
          className="fw-bolder"
        >
          Create Mail Folder
        </ModalHeader>
        <ModalBody>
          <div className="form-group">
            <label htmlFor="moveMailsSelect" className="mb-2 fw-bolder">
              Enter Mail Folder Name:
            </label>

            <Input
              placeholder="Folder Name"
              type="text"
              onChange={(e) => {
                setFolderName(e.target.value);
              }}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="link" onClick={() => setOpenCreateFolder(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleCreateFolder}>
            Create
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Mail Folder */}
      <Modal
        isOpen={openDeleteFolder.open}
        toggle={() => setOpenDeleteFolder({ name: "", open: false })}
      >
        <ModalHeader
          toggle={() => setOpenDeleteFolder({ name: "", open: false })}
          className="fw-bolder"
        >
          Delete Folder
        </ModalHeader>
        <ModalBody>
          <div className="form-group">
            Are you sure that you want to Delete this Folder "
            {openDeleteFolder.name}"?
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="link"
            onClick={() => setOpenDeleteFolder({ name: "", open: false })}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => handleDeleteFolder(openDeleteFolder.name)}
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* Move Selected Folder */}
      <Modal isOpen={openMoveFolder.open} toggle={handleCloseMoveMail}>
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
            onClick={() =>
              handleMoveFolder(
                openMoveFolder.Oldfolderpath,
                openMoveFolder.Newfolderpath
              )
            }
          >
            Move
          </Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
};
