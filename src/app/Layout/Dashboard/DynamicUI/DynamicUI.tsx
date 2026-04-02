import axios from "axios";
import update from "immutability-helper";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap_white.css";
import { ChangeEvent, useEffect, useState } from "react";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";
import { RCDatePicker } from "../../Common/DatePicker";
import { IDynamicUI, Uibuttonfield, Uiitem, Uiitemsvalue } from "./interface";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import Loader from "react-loaders";
import Select from "react-select";
const toast = require("react-toastify");
import "react-toastify/dist/ReactToastify.css";
import Loading from '@/app/loading';

export const DynamicUI = () => {
  const [toggle, setToggle] = useState(true);
  const [documentData, setDoucment] = useState(false);
  const [dynamicUIData, setDynamicUIData] = useState<IDynamicUI | any>(null);
  const token = useSelector((state: any) => state.authReducer.token);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [buttonLoading, setButtonLoading] = useState(false);
  const [sectionsList, setSectionsList] = useState([]);
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

  useEffect(() => {
    if (token && router.asPath.split("/")[2]) {
      setLoading(true);
      getDynamicUIData(router.asPath);
    }
  }, [token, router]);

  const getDynamicUIData = async (pathName: string) => {
    setLoading(true);
    const result = await axios.post(
      `https://logpanel.insurancepolicy4u.com/api/Login/GetDynamicUI?MenuID=${pathName.split("/")[2]
      }&Userid=${localStorage.getItem("username")}&ipaddress=122.176.54.19`,
      null,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const newArray = result?.data?.uiitems?.map((res: Uiitem) => {
      const object = {
        ...res,
        fieldValue: "",
        sectionsLists: res.sectionsLists?.map((response: any) => {
          const object = {
            ...response,
          };
          object.Sec_ColIDX =
            object.Sec_ColIDX === 0 ? res.ColIDX : object.Sec_ColIDX;
          object.Sec_RowIDX =
            object.Sec_RowIDX === 0 ? res.RowIDX : object.Sec_RowIDX;
          return object;
        }),
      };
      return object;
    });
    setDynamicUIData({ ...result.data, uiitems: newArray });
    setSectionsList(result.data.UiSections);
    setSelectedSection({
      value: result?.data?.DefaultSectionID?.toString(),
      label: result?.data?.DefaultSectionName,
    });
    setDefaultSection({
      value: result?.data?.DefaultSectionID?.toString(),
      label: result?.data?.DefaultSectionName,
    });
    setLoading(false);
  };
  console.log("dyanimc data", dynamicUIData)
  console.log("selection lise", sectionsList)
  console.log("default section", defaultSection)
  const onChangeInput = (e: ChangeEvent<HTMLInputElement>, field: Uiitem) => {
    const index = dynamicUIData?.uiitems.findIndex(
      (res: Uiitem) => res.FieldID === field.FieldID
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

  const onChangeFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    field: Uiitem
  ) => {
    const file: any = e.target.files?.[0];
    const reader: any = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const index = dynamicUIData?.uiitems.findIndex(
        (res: Uiitem) => res.FieldID === field.FieldID
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

  const onClickButton = (field: Uiitem) => {
    let isUpload = false;
    const index = dynamicUIData?.uiitems.findIndex(
      (res: Uiitem) => res.FieldID === field.FieldID
    );
    const newArray: Array<{ FieldValue: string | undefined; FieldID: number }> =
      [];
    dynamicUIData?.uiitems?.[index || 0]?.uibuttonfields?.map(
      (response: Uibuttonfield) => {
        dynamicUIData.uiitems.map((res: Uiitem) => {
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
      (res: Uiitem) => res.FieldID === field.FieldID
    );
    dynamicUIData.uiitems[index] = {
      ...dynamicUIData.uiitems[index],
      fieldValue: e.target.value,
    };
    setDynamicUIData({ ...dynamicUIData });
    const requiredFields = field?.ConditionalFields.split(",");
    const requiredFieldsData: any = [];
    requiredFields.map((res: any) => {
      dynamicUIData.uiitems.map((response: Uiitem) => {
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
                (res: Uiitem) => res.FieldID === clickeventData.FieldID
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

  console.log("dynamicUIData", dynamicUIData)
  const ChatPopup = (props?: any) => {
    return (
      <div className="chat-box" style={{ right: props.right || 20 }}>
        <div className="header">
          <div className="avatar-wrapper avatar-big">
            <img
              width={42}
              className="rounded-circle"
              src={"/images/avatars/1.jpg"}
              alt=""
            />
          </div>
          <span className="name">Staff</span>
          <span className="options">
            <i
              className="pe-7s-close"
              onClick={() => {
                setToggle(!toggle);
              }}
            ></i>
          </span>
        </div>
        <div
          className="chat-room"
          style={{ display: toggle ? undefined : "none" }}
        >
          <div className="message message-left">
            <div className="avatar-wrapper avatar-small">
              <img
                width={22}
                className="rounded-circle"
                src={"/images/avatars/2.jpg"}
                alt=""
              />
            </div>
            <div className="bubble bubble-light">Hey anhat!</div>
          </div>
          <div className="message message-right">
            <div className="avatar-wrapper avatar-small">
              <img
                width={22}
                className="rounded-circle"
                src={"/images/avatars/3.jpg"}
                alt=""
              />
            </div>
            <div className="bubble bubble-dark">what is going on?</div>
          </div>
        </div>
        <div
          className="type-area"
          style={{ display: toggle ? undefined : "none" }}
        >
          <div className="input-wrapper">
            <input
              type="text"
              id="inputText"
              placeholder="Type messages here..."
            />
          </div>
          <button className="button-send">Send</button>
        </div>
      </div>
    );
  };
  return (
    <div>
      {loading ? <Loading /> : null}
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
      <Modal isOpen={onShowUploadedFile}>
        <ModalHeader>File List</ModalHeader>
        <ModalBody>
          {fileArray?.map((res: any) => {
            return (
              <a target="_blank" href={res.DownloadLink}>
                Download Link
              </a>
            );
          })}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              setOnShowUplaodedFile(false);
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </Modal>
      {loading ? (
        <div className="loader-container" style={{ width: "100%" }}>
          <div className="loader-container-inner">
            <div className="text-center">
              <Loader active={loading} type="ball-pulse-rise" />
            </div>
            <h6 className="mt-5">
              Please wait while we load all the Components examples
              <small>
                Because this is a demonstration we load at once all the
                Components examples. This wouldn't happen in a real live app!
              </small>
            </h6>
          </div>
        </div>
      ) : dynamicUIData?.uiitems?.length > 0 ? (
        <div style={{ marginTop: 10 }} id="dynamic-ui">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              gap: 10,
            }}
          >
            <Select
              options={sectionsList?.map((res: any) => {
                const object = {
                  value: res.SectionID,
                  label: res.SectionName,
                };
                return object;
              })}
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  width: 200,
                }),
              }}
              value={selectedSection}
              onChange={(e: any) => {
                setSelectedSection(e);
              }}
            />
            <Button
              color="light"
              onClick={() => {
                setButtonLoading(true);
                router.push({
                  pathname: "/1/1",
                  query: {
                    mainId: router.query.mainMenuId,
                    menuId: router.query.id,
                    moduleId: dynamicUIData?.ModuleID,
                    isEdit: true,
                  },
                });
              }}
              style={{ display: "flex", gap: 5, alignItems: "center" }}
            >
              Edit Module{" "}
              {buttonLoading && (
                <Loader active={buttonLoading} type="ball-clip-rotate" />
              )}
            </Button>
            <Button
              color="primary"
              onClick={() => {
                const html2pdf = require("html2pdf.js");
                var element = document.getElementById("dynamic-ui");
                html2pdf(element);
              }}
            >
              Download as pdf
            </Button>
          </div>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100vh",
              overflow: "auto",
            }}
          >
            {dynamicUIData?.uiitems?.map((cellData: any) => {
              const currentSection = cellData?.sectionsLists?.find(
                (res: any) => res.SectionID === Number(selectedSection.value)
              );
              if (
                cellData?.sectionsLists?.length === 0 ||
                currentSection?.SectionID === Number(selectedSection.value)
              ) {
                return (
                  <div
                    style={{
                      position: "absolute",
                      top: currentSection?.Sec_ColIDX,
                      left: currentSection?.Sec_RowIDX,
                    }}
                  >
                    {cellData && cellData.inputtype === "TEXTBOX" && (
                      <Tooltip
                        placement="right"
                        trigger={["hover"]}
                        overlay={<span>{cellData.ToolTiptext}</span>}
                      >
                        <div
                          className={cellData.IsMandatory ? "required" : ""}
                          style={{
                            height: Number(cellData.FieldHeight),
                            width: Number(cellData.FieldWidth),
                          }}
                        >
                          {(cellData.PlaceHolder_Label === "Label" ||
                            cellData.PlaceHolder_Label === "Both") && (
                              <Label style={{ fontWeight: "bold" }}>
                                {cellData.FieldName}
                              </Label>
                            )}
                          {cellData.IsCalender ? (
                            <RCDatePicker
                              placeholder={""}
                              value={cellData?.uiitemsvalues?.[0].UIValue}
                              name={cellData.FieldName}
                              onChange={(e) => {
                                const index = dynamicUIData?.uiitems.findIndex(
                                  (res: Uiitem) =>
                                    res.FieldID === cellData.FieldID
                                );
                                const updatedState = update(cellData, {
                                  uiitemsvalues: {
                                    [0]: {
                                      UIValue: { $set: e },
                                    },
                                  },
                                });
                                dynamicUIData.uiitems[index] = updatedState;
                                setDynamicUIData({ ...dynamicUIData });
                              }}
                            />
                          ) : (
                            (cellData.PlaceHolder_Label === "Placeholder" ||
                              cellData.PlaceHolder_Label === "Both") && (
                              <Input
                                type={"textarea"}
                                style={{ width: "100%" }}
                                name={cellData.FieldName}
                                onChange={(e) => {
                                  onChangeInput(e, cellData);
                                }}
                                value={cellData?.uiitemsvalues?.[0].UIValue}
                              />
                            )
                          )}
                        </div>
                      </Tooltip>
                    )}
                    {cellData && cellData.inputtype === "LABEL" && (
                      <Tooltip
                        placement="right"
                        trigger={["hover"]}
                        overlay={<span>{cellData.ToolTiptext}</span>}
                      >
                        <div
                          style={{
                            height: Number(cellData.FieldHeight),
                            width: Number(cellData.FieldWidth),
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <span
                            className={cellData.IsMandatory ? "required" : ""}
                          >
                            {(cellData.PlaceHolder_Label === "Label" ||
                              cellData.PlaceHolder_Label === "Both") && (
                                <Label style={{ fontWeight: "bold" }}>
                                  {cellData.FieldName}
                                </Label>
                              )}
                          </span>
                          {(cellData.PlaceHolder_Label === "Placeholder" ||
                            cellData.PlaceHolder_Label === "Both") && (
                              <>
                                {cellData?.uiitemsvalues?.[0].UIValue ? (
                                  <Label>
                                    {cellData?.uiitemsvalues?.[0].UIValue}
                                  </Label>
                                ) : (
                                  <div>- </div>
                                )}
                              </>
                            )}
                        </div>
                      </Tooltip>
                    )}
                    {cellData && cellData.inputtype === "DROPDOWN" && (
                      <Tooltip
                        placement="right"
                        trigger={["hover"]}
                        overlay={<span>{cellData.ToolTiptext}</span>}
                      >
                        <div
                          className={cellData.IsMandatory ? "required" : ""}
                          style={{
                            height: Number(cellData.FieldHeight),
                            width: Number(cellData.FieldWidth),
                          }}
                        >
                          {(cellData.PlaceHolder_Label === "Label" ||
                            cellData.PlaceHolder_Label === "Both") && (
                              <Label style={{ fontWeight: "bold" }}>
                                {cellData.FieldName}
                              </Label>
                            )}
                          <Input
                            name={cellData.FieldName}
                            type="select"
                            value={cellData?.fieldValue}
                            style={{ width: "100%" }}
                            onChange={(e) => onChangeDropdown(e, cellData)}
                          >
                            {cellData?.uiitemsvalues?.map(
                              (option: Uiitemsvalue, index: number) => (
                                <option key={index} value={option.UIValue}>
                                  {option.UIValue}
                                </option>
                              )
                            )}
                          </Input>
                        </div>
                      </Tooltip>
                    )}
                    {cellData && cellData.inputtype === "BUTTON" && (
                      <div
                        style={{
                          height: Number(cellData.FieldHeight),
                          width: Number(cellData.FieldWidth),
                        }}
                      >
                        <Button
                          className="mb-2 me-2"
                          color="primary"
                          style={{ width: "100%" }}
                          onClick={() => {
                            onClickButton(cellData);
                          }}
                        >
                          {cellData.FieldName}
                        </Button>
                      </div>
                    )}
                    {cellData && cellData.inputtype === "FILEUPLOAD" && (
                      <div
                        style={{
                          height: Number(cellData.FieldHeight),
                          width: Number(cellData.FieldWidth),
                        }}
                      >
                        {(cellData.PlaceHolder_Label === "Label" ||
                          cellData.PlaceHolder_Label === "Both") && (
                            <Label style={{ fontWeight: "bold" }}>
                              {cellData.FieldName}
                            </Label>
                          )}
                        <Input
                          onChange={(e) => {
                            onChangeFileUpload(e, cellData);
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
              }
            })}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <Button
            color="primary"
            onClick={() => {
              router.push({
                pathname: "/1/1",
                query: {
                  mainId: router.query.mainMenuId,
                  menuId: router.query.id,
                  create: true,
                },
              });
            }}
          >
            Create Module
          </Button>
        </div>
      )}
    </div>
  );
};
