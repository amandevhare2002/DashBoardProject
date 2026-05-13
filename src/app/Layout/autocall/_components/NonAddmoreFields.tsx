import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox, RadioGroup, Radio } from "@mui/material";
import moment from "moment";
import ReactDatePicker from "react-datepicker";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import AsyncSelect from "react-select/async";
import { Button, FormGroup, Input, InputGroup, Label } from "reactstrap";
import Tooltip from "rc-tooltip";
import axios from "axios";
import { toast } from "react-toastify";
import { Resizable } from "re-resizable";
import { CSSProperties } from "react";
import { BoxComponent } from "./dnd/Box";

interface StandaloneFieldsProps {
  fields: any[];
  value: number;
  isDrag: boolean;
  onResize: (e: any, direction: any, ref: any, d: any, field: any) => void;
  setModalData: (data: any) => void;
  setIsModalOpen: (open: boolean) => void;
  saveData: any;
  setSaveData: (data: any) => void;
  information: any;
  isModify: boolean;
  promiseOptions: (
    inputValue: string,
    i?: number,
    isAddMore?: boolean,
  ) => Promise<any[]>;
  onInputChange: (fieldId: any) => void;
  setColumnSelect: (fieldId: any) => void;
  handleCalculateData: (field: any, index: number, value: any) => void;
  calculateFormula: (
    formula: any,
    data: any,
    personalDetails: any,
    addMoreIndex?: number,
  ) => any;
  setUpdatedPersonalDetails: (details: any) => void;
  updatedPersonalDetails: any;
  applyAllFormulas: (data: any, details: any, addMoreIndex?: number) => any;
  menuID: any;
  menuIDQuery: any;
  confirm: any;
  isMobile: boolean;
  isPDFPreviewOpen?: boolean;
  // Props for button functionality
  setValue?: (value: number) => void;
  onTabChange?: (tabIndex: number) => void;
  mainColField?: any;
  currentRecordID?: string;
  setHideSubmit?: (hide: boolean, mainColValue?: string) => void;
  handleProfileInformation?: (
    recordID: string,
    moduleID: string,
    isEdit?: boolean,
    ValueType?: string,
    mainColValue?: string,
  ) => void;
  setLoading?: (loading: boolean) => void;
  handleSubmit?: (params: any) => void;
  handleExcelFileUpload?: (field: any) => void;
  getCalculatorData?: (url: string, data: any) => void;
  setTableMetadata?: (metadata: any) => void;
  selectedRowsByTable?: any;
  isOpen?: boolean;
  setIsButtonLoading?: (loading: boolean) => void;
}

export const StandaloneFields = ({
  fields,
  value,
  isDrag,
  onResize,
  setModalData,
  setIsModalOpen,
  saveData,
  setSaveData,
  information,
  isModify,
  promiseOptions,
  onInputChange,
  setColumnSelect,
  handleCalculateData,
  calculateFormula,
  setUpdatedPersonalDetails,
  updatedPersonalDetails,
  applyAllFormulas,
  menuID,
  menuIDQuery,
  confirm,
  isMobile,
  isPDFPreviewOpen = false,
  setValue,
  onTabChange,
  mainColField,
  currentRecordID,
  setHideSubmit,
  handleProfileInformation,
  setLoading,
  handleSubmit,
  handleExcelFileUpload,
  getCalculatorData,
  setTableMetadata,
  selectedRowsByTable,
  isOpen,
  setIsButtonLoading,
}: StandaloneFieldsProps) => {
  const getFieldValue = (field: any) => {
    return saveData[field.FieldName] || field.FieldValue || "";
  };

  const handleFieldChange = (field: any, value: any) => {
    const nextState = [...updatedPersonalDetails];

    // Update the field value
    nextState.forEach((tab: any) => {
      if (tab?.Values) {
        tab.Values = tab.Values.map((f: any) => {
          if (f.FieldID === field.FieldID) {
            return { ...f, FieldValue: value };
          }
          return f;
        });
      }
    });

    const updatedSaveData = { ...saveData, [field.FieldName]: value };
    const calculatedSaveData = applyAllFormulas(updatedSaveData, nextState);

    setUpdatedPersonalDetails(nextState);
    setSaveData(calculatedSaveData);

    if (field.IscalcapiCall) {
      handleCalculateData(field, 0, value);
    }
  };

  const getButtonStyles = (field: any) => {
    return {
      backgroundColor: field.Bgcolor || field.Fieldbgcolor || "",
      color: field.fontcolor || field.TextFontColor || "",
      fontSize: `${field.FontSize}px` || `${field.TextFontSize}px` || "14px",
      fontFamily: field.Fontname || "Bookman Old Style",
      textAlign: field.Align || field.TextAlignment || "center",
      borderRadius:
        field?.Shape === "ROUNDED"
          ? "8px"
          : field?.Shape === "CIRCLE"
            ? "50%"
            : field?.Shape === "PILL"
              ? "9999px"
              : "0",
      fontWeight: field.IsBold || field.IsTextBold ? "bold" : "normal",
      fontStyle: field.IsItallic || field.IsTextItalic ? "italic" : "normal",
      textDecoration:
        field.IsUnderline || field.IsTextUnderLine ? "underline" : "none",
    };
  };

  const handleButtonClick = async (buttonField: any) => {
    if (!buttonField.APIURL) {
      toast.error("No API URL configured for this button", {
        style: { top: 80 },
      });
      return;
    }

    if (buttonField.IsConfirmCheck) {
      const { confirmed } = await confirm({
        title: buttonField.ConfirmationMessage || "Are you sure?",
      });
      if (!confirmed) return;
    }

    try {
      setLoading?.(true);
      setIsButtonLoading?.(true);

      // Build payload from buttonFields configuration
      const payload: any[] = [];

      if (buttonField.buttonFields && buttonField.buttonFields.length > 0) {
        buttonField.buttonFields.forEach((buttonConfig: any) => {
          // Find the actual field in updatedPersonalDetails
          let foundField: any = null;
          updatedPersonalDetails.forEach((tab: any) => {
            tab?.Values?.forEach((fld: any) => {
              if (Number(fld.FieldID) === Number(buttonConfig.FieldID)) {
                foundField = fld;
              }
            });
          });

          if (foundField) {
            payload.push({
              FieldID: foundField.FieldID,
              FieldName: foundField.FieldName,
              FieldValue:
                saveData[foundField.FieldName] || foundField.FieldValue || "",
            });
          }
        });
      }

      const data = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuIDQuery || menuID,
        PostedJson: payload,
        ButtonID: buttonField.FieldID,
      };

      const result = await axios.post(buttonField.APIURL, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (result.data.Message !== "Invalid Request") {
        toast.success(result.data.Message || "Success", { style: { top: 80 } });

        // Handle response data updates
        if (result.data.Table) {
          setTableMetadata?.({
            isDetailPopupOpen: result.data.IsDetailPopupOpen || false,
            moduleID: result.data.Table?.[0]?.ModuleID || null,
            fieldID: result.data.FieldID || null,
            defaultVisible: result.data.DefaultTabSelected || null,
            tablebuttons: result.data.tablebuttons || null,
            tableWidth: result.data.TableWidth || null,
            ischeckBoxReq: result.data.IscheckBoxReq || null,
            headerData: result.data.HeaderData || null,
            footerData: result.data.FooterData || null,
            filename: result.data.Filename || null,
            logo: result.data.logo || null,
            tableproperty: result.data.tableproperty || null,
            outsideBorder: result.data.outsideBorder || null,
            insideBorder: result.data.InsideBorder || null,
            orientation: result.data.Orientation || null,
            tableFormatting: result.data.TableFormatting || null,
            headerRows: result.data.HeaderRows || null,
            footerRows: result.data.FooterRows || null,
            tableheaderfooterCSS: result.data || null,
            pageitemscnt: result.data.Pageitemscnt || null,
            isPagination: result.data.IsPagination || null,
            chartData: result.data.ChartData || null,
            chartIds: result.data.Chartids || null,
            isFreezeHeader: result.data.IsFreezeHeader || null,
            popupdrawersettings: result.data.Popupdrawersettings || null,
          });
        }

        // Update fields from response
        if (result.data.fields && Array.isArray(result.data.fields)) {
          const nextState = [...updatedPersonalDetails];
          const updatedSaveData = { ...saveData };

          result.data.fields.forEach((responseField: any) => {
            nextState.forEach((tab: any) => {
              tab?.Values?.forEach((fld: any) => {
                if (Number(fld.FieldID) === Number(responseField.FieldID)) {
                  fld.FieldValue = responseField.Value;
                  updatedSaveData[fld.FieldName] = responseField.Value;
                  if (responseField.Visibility !== undefined) {
                    fld.DefaultVisible = responseField.Visibility;
                  }
                }
              });
            });
          });

          setSaveData(updatedSaveData);
          setUpdatedPersonalDetails(nextState);
        }
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.Message || "An error occurred", {
        style: { top: 80 },
      });
    } finally {
      setLoading?.(false);
      setIsButtonLoading?.(false);
    }
  };

  // Handle SUBMIT button click
  const handleSubmitButtonClick = async () => {
    setIsButtonLoading?.(true);
    try {
      // Validate mandatory fields
      const mandatoryFields = fields.filter(
        (field: any) =>
          field.IsMandatory &&
          field.DefaultVisible &&
          ["BOX", "DROPDOWN", "DATE", "TEXTEDITOR"].includes(field.FieldType),
      );

      const hasEmptyMandatoryField = mandatoryFields.some((field: any) => {
        const fieldValue = saveData[field.FieldName];
        return (
          fieldValue === undefined || fieldValue === null || fieldValue === ""
        );
      });

      if (hasEmptyMandatoryField) {
        toast.error("Please fill all the mandatory fields", {
          style: { top: 80 },
        });
        return;
      }

      // Collect field data
      let fieldData: any[] = [];
      const isUpdateTabWise = information?.Data?.[0]?.IsUpdateTabWise;

      if (isUpdateTabWise) {
        // Collect only current tab's fields
        fields.forEach((fld: any) => {
          if (!["BUTTON", "UPLOAD", "TABLE"].includes(fld.FieldType)) {
            const fieldValue = saveData[fld.FieldName] ?? fld?.FieldValue ?? "";
            fieldData.push({
              FieldName: fld.FieldName,
              FieldID: fld.FieldID,
              FieldValue: fieldValue,
              Colname: fld.Colname || "",
              IsAddMore: false,
              AddMoreGroup: "",
              addmorevalues: [],
            });
          }
        });
      } else {
        // Collect ALL fields from ALL tabs
        updatedPersonalDetails.forEach((tab: any) => {
          tab?.Values?.forEach((fld: any) => {
            if (
              !["BUTTON", "UPLOAD", "TABLE"].includes(fld.FieldType) &&
              !fld.IsAddMore
            ) {
              const fieldValue =
                saveData[fld.FieldName] ?? fld?.FieldValue ?? "";
              const baseField = {
                FieldName: fld.FieldName,
                FieldID: fld.FieldID,
                FieldValue: fieldValue,
                Colname: fld.Colname || "",
                IsAddMore: false,
                AddMoreGroup: "",
                addmorevalues: [],
              };
              if (fld.IsMainCol) {
                fieldData.push({ ...baseField, IsMain: fld.IsMainCol });
              } else {
                fieldData.push(baseField);
              }
            }
          });
        });
      }

      const submitData = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuIDQuery || menuID ? Number(menuIDQuery || menuID) : 0,
        Operation: isOpen ? "UPDATE" : currentRecordID ? "INSERT" : "UPDATE",
        fieldsDatanew: fieldData,
      };

      const res = await axios.post(
        `https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsValuesNew`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      const responseData = res.data;
      const isSuccess =
        responseData?.Resp &&
        responseData.Resp.toLowerCase() === "success" &&
        (res.status === 200 || res.status === 201);

      if (isSuccess) {
        toast.success("Data submitted successfully!", {
          position: "top-right",
          autoClose: 2000,
          style: { top: "50px" },
        });

        const mainColValue = fieldData.find((res: any) => res.IsMain);
        setHideSubmit?.(true, mainColValue?.FieldValue || "");

        if (handleProfileInformation && mainColValue?.FieldValue) {
          handleProfileInformation(
            mainColValue.FieldValue,
            menuID,
            false,
            "SUBMIT",
            mainColValue.FieldValue,
          );
        }
      } else {
        toast.error(responseData?.Resp || "Submission failed", {
          position: "top-right",
          autoClose: 2000,
          style: { top: "50px" },
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.Message || "An error occurred", {
        position: "top-right",
        autoClose: 2000,
        style: { top: "50px" },
      });
    } finally {
      setIsButtonLoading?.(false);
    }
  };

  // Handle NEXT button click
  const handleNextButtonClick = () => {
    // Validate mandatory fields before moving
    const mandatoryFields = fields.filter(
      (field: any) =>
        field.IsMandatory &&
        field.DefaultVisible &&
        ["BOX", "DROPDOWN", "DATE", "TEXTEDITOR"].includes(field.FieldType),
    );

    const hasEmptyMandatoryField = mandatoryFields.some((field: any) => {
      const fieldValue = saveData[field.FieldName];
      return (
        fieldValue === undefined || fieldValue === null || fieldValue === ""
      );
    });

    if (hasEmptyMandatoryField) {
      toast.error("Please fill all the mandatory fields before proceeding", {
        style: { top: 80 },
      });
      return;
    }

    // Find the next tab
    let nextTabIndex = -1;
    for (let i = value + 1; i < updatedPersonalDetails.length; i++) {
      if (updatedPersonalDetails[i]?.DefaultVisible !== false) {
        nextTabIndex = i;
        break;
      }
    }

    if (nextTabIndex !== -1) {
      // Use onTabChange callback if available, otherwise fall back to setValue
      if (onTabChange) {
        onTabChange(nextTabIndex);
      } else if (setValue) {
        setValue(nextTabIndex);
      }
    } else {
      toast.info("No more tabs available", { style: { top: 80 } });
    }
  };

  const renderField = (field: any, index: number) => {
    const fieldValue = getFieldValue(field);
    const width = `${Number(field?.Width?.toString().split("px")[0] || 100)}px`;
    const height = `${Number(field?.Height?.toString().split("px")[0] || 38)}px`;

    const position = {
      left: isPDFPreviewOpen ? field.PDFRownum : field.Rownum,
      top: isPDFPreviewOpen ? field.PDFColnum : field.Colnum,
      width: isPDFPreviewOpen ? field.PDFWidth : field.Width,
      height: isPDFPreviewOpen ? field.PDFHeight : field.Height,
    };

    const style: CSSProperties = {
      position: "absolute",
      cursor: isDrag ? "move" : "default",
      border: isDrag ? "1px dashed gray" : "0px",
      backgroundColor: isDrag ? "white" : "transparent",
      paddingLeft: isDrag ? "0.5rem" : "0rem",
      left: `${position.left}px`,
      top: `${position.top}px`,
    };

    const getResponsiveStyles = (field: any, isMobile: boolean) => {
      if (isMobile && field.MWidth) {
        return { width: `${field.MWidth}%` };
      }
      return { width: field.Width ? `${field.Width}%` : "100%" };
    };

    switch (field?.FieldType) {
      case "LABEL":
        return (
          <Resizable
            key={field.FieldID}
            enable={{
              top: isDrag && !isMobile,
              right: isDrag && !isMobile,
              bottom: isDrag && !isMobile,
              left: isDrag && !isMobile,
            }}
            className="resizer"
            style={style}
            size={{
              width:
                isMobile && !isPDFPreviewOpen
                  ? "100%"
                  : `${Number(field?.Width?.toString().split("px")[0] || 100)}px`,
              height: `${Number(field?.Height?.toString().split("px")[0] || 38)}px`,
            }}
            onResizeStop={(e, direction, ref, d) =>
              onResize(e, direction, ref, d, field)
            }
          >
            <BoxComponent
              id={field.FieldID}
              left={position.left}
              top={position.top}
              isDrag={isDrag}
              width={field.Width || "100px"}
              height={field.Height || "38px"}
              newStyle={{
                display: "flex",
                alignItems: "center",
                flexDirection: field.LabelDirection,
                gap: 4,
              }}
            >
              <FormGroup
                style={{
                  textAlign: field.Align,
                  flexDirection: field.LabelDirection,
                  ...getResponsiveStyles(field, isMobile),
                }}
              >
                {field.IsFieldNamePrint ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: field.Align,
                      width: "100%",
                      gap: 4,
                    }}
                  >
                    <Label
                      for={field?.FieldName}
                      className="bold max-w-fit"
                      style={{
                        color: field.fontcolor,
                        backgroundColor: field.Bgcolor,
                        fontWeight: field.IsBold ? 700 : "normal",
                        textDecoration: field.IsUnderline
                          ? "underline"
                          : "none",
                        fontStyle: field.IsItallic ? "italic" : "normal",
                        fontSize: `${field.FontSize}px`,
                        fontFamily: field.Fontname,
                      }}
                    >
                      {field?.FieldName}{" "}
                      {field.IsMandatory ? (
                        <span style={{ color: "red" }}>*</span>
                      ) : null}
                    </Label>
                    {field.ToolTip && (
                      <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                        <div
                          style={{
                            display: "flex",
                            gap: 2,
                            alignItems: "center",
                          }}
                        >
                          <AiFillInfoCircle
                            style={{
                              marginBottom: 2,
                              marginLeft: 10,
                              cursor: "pointer",
                            }}
                          />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                ) : null}
                <p
                  style={{
                    backgroundColor: field.Fieldbgcolor,
                    fontSize: `${field.TextFontSize}px`,
                    color: field.TextFontColor,
                    margin: 0,
                    fontWeight: field.IsTextBold ? 700 : "normal",
                    textDecoration: field.IsTextUnderLine
                      ? "underline"
                      : "none",
                    fontStyle: field.IsTextItalic ? "italic" : "normal",
                    padding: 5,
                    minHeight: "20px",
                    width: "100%",
                    borderRadius:
                      field?.Shape === "ROUNDED"
                        ? "8px"
                        : field?.Shape === "CIRCLE"
                          ? "50%"
                          : field?.Shape === "PILL"
                            ? "9999px"
                            : "0",
                  }}
                >
                  {fieldValue}
                </p>
              </FormGroup>
            </BoxComponent>
          </Resizable>
        );

      case "BOX":
        return (
          <Resizable
            key={field.FieldID}
            enable={{
              top: isDrag && !isMobile,
              right: isDrag && !isMobile,
              bottom: isDrag && !isMobile,
              left: isDrag && !isMobile,
            }}
            className="resizer"
            style={style}
            size={{
              width:
                isMobile && !isPDFPreviewOpen
                  ? "100%"
                  : `${Number(field?.Width?.toString().split("px")[0] || 100)}px`,
              height: `${Number(field?.Height?.toString().split("px")[0] || 38)}px`,
            }}
            onResizeStop={(e, direction, ref, d) =>
              onResize(e, direction, ref, d, field)
            }
          >
            <BoxComponent
              id={field.FieldID}
              left={position.left}
              top={position.top}
              isDrag={isDrag}
              width={field.Width || "100px"}
              height={field.Height || "38px"}
              newStyle={{
                display: "flex",
                alignItems: "center",
                flexDirection: field.LabelDirection,
                gap: 4,
              }}
            >
              <FormGroup
                style={{
                  fontSize: `${field.TextFontSize}px`,
                  alignItems: "center",
                  ...getResponsiveStyles(field, isMobile),
                }}
              >
                <div
                  style={{
                    alignItems: "center",
                    width: "100%",
                    justifyContent: field.Align,
                  }}
                >
                  <Label
                    for={field?.FieldName}
                    className="bold max-w-fit"
                    style={{
                      color: field.fontcolor,
                      backgroundColor: field.Bgcolor,
                      fontWeight: field.IsBold ? 700 : "normal",
                      textDecoration: field.IsUnderline ? "underline" : "none",
                      fontStyle: field.IsItallic ? "italic" : "normal",
                      fontSize: `${field.FontSize}px`,
                      fontFamily: field.Fontname,
                    }}
                  >
                    {field?.FieldName}{" "}
                    {field.IsMandatory ? (
                      <span style={{ color: "red" }}>*</span>
                    ) : null}
                  </Label>
                </div>
                <Input
                  value={fieldValue}
                  placeholder={field?.FieldName}
                  style={{
                    textAlign: field.TextAlignment,
                    height: `${Number(field?.Height?.toString().split("px")[0] || 100)}px`,
                    backgroundColor: !isModify ? "#e9ecef" : field.Fieldbgcolor,
                    color: field.TextFontColor,
                    fontSize: `${field.TextFontSize}px`,
                    fontWeight: field.IsTextBold ? 700 : "normal",
                    textDecoration: field.IsTextUnderLine
                      ? "underline"
                      : "none",
                    fontStyle: field.IsTextItalic ? "italic" : "normal",
                    borderRadius:
                      field?.Shape === "ROUNDED"
                        ? "8px"
                        : field?.Shape === "CIRCLE"
                          ? "50%"
                          : field?.Shape === "PILL"
                            ? "9999px"
                            : "0",
                  }}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  disabled={isDrag || !isModify}
                  readOnly={field.IsFormulaApply}
                />
              </FormGroup>
            </BoxComponent>
          </Resizable>
        );

      case "DROPDOWN":
        return (
          <Resizable
            key={field.FieldID}
            enable={{
              top: isDrag && !isMobile,
              right: isDrag && !isMobile,
              bottom: isDrag && !isMobile,
              left: isDrag && !isMobile,
            }}
            className="resizer"
            style={style}
            size={{
              width:
                isMobile && !isPDFPreviewOpen
                  ? "100%"
                  : `${Number(field?.Width?.toString().split("px")[0] || 100)}px`,
              height: `${Number(field?.Height?.toString().split("px")[0] || 38)}px`,
            }}
            onResizeStop={(e, direction, ref, d) =>
              onResize(e, direction, ref, d, field)
            }
          >
            <BoxComponent
              id={field.FieldID}
              left={position.left}
              top={position.top}
              isDrag={isDrag}
              width={field.Width || "100px"}
              height={field.Height || "38px"}
              newStyle={{
                display: "flex",
                alignItems: "center",
                flexDirection: field.LabelDirection,
                gap: 4,
              }}
            >
              <div
                style={{
                  alignItems: "center",
                  flexDirection: field.LabelDirection,
                  justifyContent: field.Align,
                  width: "100%",
                }}
              >
                <Label
                  for={field?.FieldName}
                  className="bold max-w-fit"
                  style={{
                    color: field.fontcolor,
                    backgroundColor: field.Bgcolor,
                    fontWeight: field.IsBold ? 700 : "normal",
                    textDecoration: field.IsUnderline ? "underline" : "none",
                    fontStyle: field.IsItallic ? "italic" : "normal",
                    fontSize: `${field.FontSize}px`,
                    fontFamily: field.Fontname,
                  }}
                >
                  {field?.FieldName}{" "}
                  {field.IsMandatory ? (
                    <span style={{ color: "red" }}>*</span>
                  ) : null}
                </Label>
              </div>
              <AsyncSelect
                loadOptions={(inputValue) =>
                  promiseOptions(inputValue, 0, false)
                }
                menuPortalTarget={
                  isOpen
                    ? (document.querySelector(".MuiDialog-root") as HTMLElement)
                    : document.body
                }
                menuPosition="fixed"
                isDisabled={isDrag || !isModify}
                menuPlacement="top"
                defaultOptions={field.DropdownArray}
                onChange={(e: any) => handleFieldChange(field, e?.value || "")}
                value={{ label: fieldValue, value: fieldValue }}
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    textAlign: field.TextAlignment,
                    backgroundColor: !isModify ? "#e9ecef" : field.TextBgcolor,
                    ...getResponsiveStyles(field, isMobile),
                  }),
                  menuPortal: (baseStyles) => ({
                    ...baseStyles,
                    backgroundColor: "white",
                    zIndex: "9999",
                  }),
                }}
                onInputChange={(val) => onInputChange(field?.FieldID)}
                noOptionsMessage={() => "No Suggestions"}
                onFocus={() => setColumnSelect(field?.FieldID)}
                className="w-full"
              />
            </BoxComponent>
          </Resizable>
        );

      case "DATE":
        // Safely parse the date value - handle null, undefined, and invalid dates
        let dateValue = null;
        const fieldDateValue = getFieldValue(field);

        if (fieldDateValue && fieldDateValue !== "") {
          const parsedDate = moment(fieldDateValue);
          if (parsedDate.isValid()) {
            dateValue = parsedDate.toDate();
          }
        }

        return (
          <Resizable
            key={field.FieldID}
            enable={{
              top: isDrag && !isMobile,
              right: isDrag && !isMobile,
              bottom: isDrag && !isMobile,
              left: isDrag && !isMobile,
            }}
            className="resizer"
            style={style}
            size={{
              width:
                isMobile && !isPDFPreviewOpen
                  ? "100%"
                  : `${Number(field?.Width?.toString().split("px")[0] || 100)}px`,
              height: `${Number(field?.Height?.toString().split("px")[0] || 38)}px`,
            }}
            onResizeStop={(e, direction, ref, d) =>
              onResize(e, direction, ref, d, field)
            }
          >
            <BoxComponent
              id={field.FieldID}
              left={position.left}
              top={position.top}
              isDrag={isDrag}
              width={field.Width || "100px"}
              height={field.Height || "38px"}
              newStyle={{
                display: "flex",
                alignItems: "center",
                flexDirection: field.LabelDirection,
                gap: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: field.Align,
                  marginTop: "-25px",
                }}
              >
                <Label
                  for={field?.FieldName}
                  className="bold max-w-fit"
                  style={{
                    fontWeight: field.IsBold ? 700 : "normal",
                    textDecoration: field.IsUnderline ? "underline" : "none",
                    fontStyle: field.IsItallic ? "italic" : "normal",
                    fontSize: `${field.FontSize}px`,
                    fontFamily: field.Fontname,
                  }}
                >
                  {field?.FieldName}{" "}
                </Label>
                {field.ToolTip && (
                  <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                    <div
                      style={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                      }}
                    >
                      <AiFillInfoCircle
                        style={{
                          marginBottom: 2,
                          marginLeft: 10,
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </Tooltip>
                )}
                {isDrag && (
                  <AiFillEdit
                    onClick={() => {
                      setModalData({
                        app_id: field.FieldID,
                        ModuleID: information.Data[0]?.StrucureModuleID,
                        IsPopUpOpen: field.IsPopUpOpen,
                        SideDrawerPos: field.SideDrawerPos,
                        SideDrawerWidth: field.SideDrawerWidth,
                      });
                      setIsModalOpen(true);
                    }}
                    style={{
                      marginBottom: 2,
                      marginLeft: 10,
                      cursor: "pointer",
                    }}
                  />
                )}
              </div>
              <InputGroup>
                <div className="input-group-text">
                  <FontAwesomeIcon icon={faCalendarAlt as any} />
                </div>
                <ReactDatePicker
                  className={`custom-date-input h-${height} w-${width} form-control`}
                  dateFormat="yyyy-MM-dd"
                  disabled={isDrag || !isModify}
                  withPortal
                  selected={dateValue}
                  onChange={(e: Date | null) => {
                    if (e && moment(e).isValid()) {
                      handleFieldChange(field, moment(e).format("YYYY-MM-DD"));
                    } else {
                      handleFieldChange(field, "");
                    }
                  }}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  placeholderText={field?.FieldName || "Select Date"}
                  isClearable
                />
              </InputGroup>
            </BoxComponent>
          </Resizable>
        );
      case "BUTTON":
        if (field.ValueType === "SUBMIT") {
          return (
            <Resizable
              key={field.FieldID}
              enable={{
                top: isDrag && !isMobile,
                right: isDrag && !isMobile,
                bottom: isDrag && !isMobile,
                left: isDrag && !isMobile,
              }}
              className="resizer"
              style={style}
              size={{
                width:
                  isMobile && !isPDFPreviewOpen
                    ? "100%"
                    : `${Number(field?.Width?.toString().split("px")[0] || 100)}px`,
                height: `${Number(field?.Height?.toString().split("px")[0] || 38)}px`,
              }}
              onResizeStop={(e, direction, ref, d) =>
                onResize(e, direction, ref, d, field)
              }
            >
              <BoxComponent
                id={field.FieldID}
                left={position.left}
                top={position.top}
                isDrag={isDrag}
                width={field.Width || "100px"}
                height={field.Height || "38px"}
                newStyle={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: field.LabelDirection,
                  gap: 4,
                }}
              >
                <Button
                  className={`h-10 w-full ${field?.ClsIcon}`}
                  style={getButtonStyles(field)}
                  disabled={isDrag || !isModify}
                  onClick={handleSubmitButtonClick}
                >
                  {field?.FieldName}
                </Button>
              </BoxComponent>
            </Resizable>
          );
        } else if (field.ValueType === "NEXT") {
          return (
            <Resizable
              key={field.FieldID}
              enable={{
                top: isDrag && !isMobile,
                right: isDrag && !isMobile,
                bottom: isDrag && !isMobile,
                left: isDrag && !isMobile,
              }}
              className="resizer"
              style={style}
              size={{
                width:
                  isMobile && !isPDFPreviewOpen
                    ? "100%"
                    : `${Number(field?.Width?.toString().split("px")[0] || 100)}px`,
                height: `${Number(field?.Height?.toString().split("px")[0] || 38)}px`,
              }}
              onResizeStop={(e, direction, ref, d) =>
                onResize(e, direction, ref, d, field)
              }
            >
              <BoxComponent
                id={field.FieldID}
                left={position.left}
                top={position.top}
                isDrag={isDrag}
                width={field.Width || "100px"}
                height={field.Height || "38px"}
                newStyle={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: field.LabelDirection,
                  gap: 4,
                }}
              >
                <Button
                  className={`h-10 w-full ${field?.ClsIcon}`}
                  style={getButtonStyles(field)}
                  disabled={isDrag || !isModify}
                  onClick={handleNextButtonClick}
                >
                  {field?.FieldName}
                </Button>
              </BoxComponent>
            </Resizable>
          );
        }
        return (
          <Resizable
            key={field.FieldID}
            enable={{
              top: isDrag && !isMobile,
              right: isDrag && !isMobile,
              bottom: isDrag && !isMobile,
              left: isDrag && !isMobile,
            }}
            className="resizer"
            style={style}
            size={{
              width:
                isMobile && !isPDFPreviewOpen
                  ? "100%"
                  : `${Number(field?.Width?.toString().split("px")[0] || 100)}px`,
              height: `${Number(field?.Height?.toString().split("px")[0] || 38)}px`,
            }}
            onResizeStop={(e, direction, ref, d) =>
              onResize(e, direction, ref, d, field)
            }
          >
            <BoxComponent
              id={field.FieldID}
              left={position.left}
              top={position.top}
              isDrag={isDrag}
              width={field.Width || "100px"}
              height={field.Height || "38px"}
              newStyle={{
                display: "flex",
                alignItems: "center",
                flexDirection: field.LabelDirection,
                gap: 4,
              }}
            >
              <Button
                className={`h-10 w-full ${field?.ClsIcon}`}
                style={getButtonStyles(field)}
                disabled={isDrag || !isModify}
                onClick={() => handleButtonClick(field)}
              >
                {field?.FieldName}
              </Button>
            </BoxComponent>
          </Resizable>
        );

      default:
        return null;
    }
  };

  return <>{fields.map((field, index) => renderField(field, index))}</>;
};
