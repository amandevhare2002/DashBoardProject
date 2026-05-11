import axios from "axios";
import { Resizable } from "re-resizable";
import { toast } from "react-toastify";
import {
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from "reactstrap";
import { BoxComponent } from "../dnd/Box";
import { useState } from "react";
import { Module } from "module";
import { table } from "console";
import { downloadBase64File } from "@/utils/download";
import { Editor } from "@tinymce/tinymce-react";
import { Drawer, Box } from "@mui/material";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";

interface Field {
  FieldID: string | number;
  FieldName: string;
  FieldValue?: string;
  DefaultVisible?: boolean;
  IsMandatory?: boolean;
  FieldType?: string;
  ValueType?: string;
  Linkcol?: string;
  LinkOpenType?: string;
  SideDrawerPos?: string;
  SideDrawerWidth?: string;
  Width?: string;
  Height?: string;
  [key: string]: any;
}

interface TabData {
  Values?: Field[];
  [key: string]: any;
}
export const ButtonField = ({
  field,
  isDrag,
  onResize,
  style,
  isModify,
  saveData,
  setSaveData,
  setModalData,
  setIsModalOpen,
  setValue,
  value,
  mainColField,
  menuID,
  menuIDQuery,
  currentRecordID,
  updatedPersonalDetails,
  setUpdatedPersonalDetails,
  setHideSubmit,
  handleProfileInformation,
  isOpen,
  setLoading,
  setSavePersonalData,
  savePersonalData,
  handleSubmit,
  handleExcelFileUpload,
  getCalculatorData,
  confirm,
  buttonID,
  setTableMetadata,
  selectedRowsByTable,
  isPDFPreviewOpen,
  information,
  isMobile,
  onClick,
}: any) => {
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isEditorDrawerOpen, setIsEditorDrawerOpen] = useState(false);
  const [editorFieldData, setEditorFieldData] = useState<any>(null);
  const showBorder = field.IsBorderApply !== false;
  const borderColor = field.bordercolor;
  const handleButtonClick = async (clickHandler: () => Promise<void>) => {
    if (isButtonLoading) return;

    setIsButtonLoading(true);
    try {
      await clickHandler();
    } catch (error) {
      console.error("Button click error:", error);
    } finally {
      setIsButtonLoading(false);
    }
  };
  // In ButtonField.tsx - Update collectSelectedTableData

  // In ButtonField.tsx - Update collectSelectedTableData to use selected state

  const collectSelectedTableData = () => {
    const allTableData: any[] = [];
    const processedTableIDs = new Set();

    // IMPORTANT: Use the most current state
    const currentPersonalDetails = updatedPersonalDetails;

    // Iterate through all tabs to find tables
    currentPersonalDetails.forEach((tab: any) => {
      if (tab?.Values) {
        tab.Values.forEach((field: any) => {
          if (
            field.FieldType === "TABLE" &&
            !processedTableIDs.has(field.FieldID)
          ) {
            const tableFieldID = field.FieldID;

            // Get the table data
            let currentTableData =
              field.buttonFields || field.TableData || field.ds || [];

            // Get selected rows from selectedRowsByTable (if available)
            let selectedRows = selectedRowsByTable[tableFieldID] || [];

            // If selectedRowsByTable is empty but we need to check the selected state,
            // we need to get the selected rows from the table component itself
            // This information is passed via the selectedRows prop to the TableField component

            // For now, we'll use selectedRows as is, but we need to ensure the parent component
            // (NewTablePage) is passing the correct selected rows through selectedRowsByTable

            if (selectedRows.length > 0) {
              // Map selected rows to the format expected by the API
              const rowsToSubmit = selectedRows.map((selectedRow: any) => {
                // Create a clean copy without internal properties
                const cleanRow: any = {};
                Object.keys(selectedRow).forEach((key) => {
                  if (
                    !key.startsWith("__") &&
                    key !== "select" &&
                    key !== "actions"
                  ) {
                    cleanRow[key] = selectedRow[key];
                  }
                });
                return cleanRow;
              });

              if (rowsToSubmit.length > 0) {
                const firstRow = rowsToSubmit[0];
                const columnNames = Object.keys(firstRow).filter(
                  (colName) =>
                    ![
                      "select",
                      "id",
                      "actions",
                      "__isNew",
                      "__modified",
                      "__originalData",
                      "__originalId",
                      "__originalIndex",
                      "__addedTimestamp",
                      "__persistent",
                    ].includes(colName) && !colName.startsWith("_"),
                );

                if (columnNames.length > 0) {
                  const tableData = {
                    FieldID: tableFieldID,
                    TableName: field.FieldName,
                    Cols: columnNames.map((colName) => ({
                      Colname: colName,
                      Values: rowsToSubmit.map((row: any) => ({
                        Values:
                          row[colName] !== undefined && row[colName] !== null
                            ? String(row[colName])
                            : "",
                      })),
                    })),
                  };
                  allTableData.push(tableData);
                }
              }
            }

            processedTableIDs.add(tableFieldID);
          }
        });
      }
    });

    return allTableData;
  };
  const handleSubmitDirectly = async (additionalTableData: any[] = []) => {
    // Collect selected table data
    const selectedTableData = collectSelectedTableData();

    // ONLY use the collected table data - DO NOT add fallback rows
    // If no rows are selected, finalTableData will be empty and that's correct
    let finalTableData = selectedTableData;

    // Remove duplicates based on FieldID
    const uniqueTableData = finalTableData.filter(
      (table, index, self) =>
        index === self.findIndex((t) => t.FieldID === table.FieldID),
    );
    try {
      setLoading(true);
      let fieldData: any[] = [];

      // Get the current tab data (based on value)
      const currentTab = updatedPersonalDetails[value];
      // Get the isUpdateTabWise flag from information prop
      const isUpdateTabWise = information?.Data?.[0]?.IsUpdateTabWise;

      if (isUpdateTabWise) {
        // Collect only current tab's fields
        if (currentTab?.Values) {
          currentTab.Values.forEach((fld: any) => {
            // Skip BUTTON, UPLOAD, TABLE fields for regular field data
            if (!["BUTTON", "UPLOAD", "TABLE"].includes(fld.FieldType)) {
              const fieldValue =
                saveData[fld.FieldName] ?? fld?.FieldValue ?? "";

              const baseField = {
                FieldName: fld.FieldName,
                FieldID: fld.FieldID,
                FieldValue: fieldValue,
                Colname: fld.Colname || "",
                IsAddMore: fld.IsAddMore || false,
                AddMoreGroup: fld.AddMoreGroup || "",
                addmorevalues:
                  fld?.addmorevalues?.map((res: any) => ({
                    ValIndex: res.ValIndex,
                    Value: res.FieldValue || "",
                  })) || [],
              };

              if (fld.IsMainCol) {
                fieldData.push({ ...baseField, IsMain: fld.IsMainCol });
              } else {
                fieldData.push(baseField);
              }
            }
          });
        }
      } else {
        // Collect ALL fields from ALL tabs (original logic)
        updatedPersonalDetails.forEach((tab: any) => {
          tab?.Values?.forEach((fld: any) => {
            // Skip BUTTON, UPLOAD, TABLE fields for regular field data
            if (!["BUTTON", "UPLOAD", "TABLE"].includes(fld.FieldType)) {
              const fieldValue =
                saveData[fld.FieldName] ?? fld?.FieldValue ?? "";

              const baseField = {
                FieldName: fld.FieldName,
                FieldID: fld.FieldID,
                FieldValue: fieldValue,
                Colname: fld.Colname || "",
                IsAddMore: fld.IsAddMore || false,
                AddMoreGroup: fld.AddMoreGroup || "",
                addmorevalues:
                  fld?.addmorevalues?.map((res: any) => ({
                    ValIndex: res.ValIndex,
                    Value: res.FieldValue || "",
                  })) || [],
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

      // ✅ Prepare payload
      let submitData: any = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuIDQuery || menuID ? Number(menuIDQuery || menuID) : 0,
        Operation: isOpen ? "UPDATE" : currentRecordID ? "INSERT" : "UPDATE",
        fieldsDatanew: fieldData,
      };

      // ✅ Add table data if exists
      if (uniqueTableData && uniqueTableData.length > 0) {
        submitData.tabledata = uniqueTableData;
      } else {
        console.log("📭 No table data to include in payload");
      }

      // ✅ Format numeric values for table data if needed
      if (submitData.tabledata) {
        submitData.tabledata = submitData.tabledata.map((table: any) => ({
          FieldID: table.FieldID,
          Cols: table.Cols.map((col: any) => ({
            Colname: col.Colname,
            Values: col.Values.map((val: any) => ({
              Values: isNumericField(col.Colname)
                ? (Number(val.Values) || 0).toString()
                : val.Values,
            })),
          })),
        }));
      }

      function isNumericField(colName: string): boolean {
        const numericFields = [
          "Amount",
          "Quantity",
          "Price",
          "Total",
          "Amounts",
          "Quantities",
          "Prices",
          "Totals",
        ];
        return numericFields.some((field) =>
          colName.toLowerCase().includes(field.toLowerCase()),
        );
      }
      // ✅ Make API call
      let res = await axios.post(
        `https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsValuesNew`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      // ✅ Check success
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
          className: "toast-mobile",
        });

        // ✅ Move to next tab if available
        if (updatedPersonalDetails?.length - 1 !== value) {
          let count = value;
          count++;
          setValue(count);
        }

        const mainColValue = fieldData.find((res: any) => res.IsMain);
        setHideSubmit?.(true, mainColValue?.FieldValue || "");
      } else {
        const errorMessage = responseData?.Resp || "Submission failed";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 2000,
          style: { top: "50px" },
        });
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.Message ||
        error?.message ||
        "An error occurred during submission";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 2000,
        style: { top: "50px" },
      });

      if (error.response?.status === 401) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };
  // In PersonalDetails component, modify the handleNextButton function
  const handleNextButton = () => {
    const mandatoryFields = updatedPersonalDetails[value]?.Values.filter(
      (field: any) =>
        field.IsMandatory &&
        field.DefaultVisible &&
        ["BOX", "DROPDOWN", "DATE", "TEXTEDITOR"].includes(field.FieldType),
    );

    // Reset error flags
    const nextState = [...updatedPersonalDetails];
    nextState[value].Values = nextState[value].Values.map((f: any) => ({
      ...f,
      error: false,
    }));

    const hasEmptyMandatoryField = mandatoryFields.some((field: any) => {
      const fieldValue = saveData[field.FieldName];
      const isEmpty =
        fieldValue === undefined || fieldValue === null || fieldValue === "";
      if (isEmpty) {
        nextState[value].Values = nextState[value].Values.map((f: any) => {
          if (f.FieldName === field.FieldName) {
            return { ...f, error: true };
          }
          return f;
        });
      }
      return isEmpty;
    });

    setUpdatedPersonalDetails(nextState);

    if (hasEmptyMandatoryField) {
      toast.error("Please fill all the mandatory fields", {
        style: { top: 80 },
      });
      return;
    }

    // Find the next visible tab starting from current index + 1
    let nextVisibleTabIndex = -1;

    for (let i = value + 1; i < updatedPersonalDetails.length; i++) {
      if (updatedPersonalDetails[i].DefaultVisible !== false) {
        nextVisibleTabIndex = i;
        break;
      }
    }

    // If we found a visible tab, navigate to it
    if (nextVisibleTabIndex !== -1) {
      setValue(nextVisibleTabIndex);
    } else {
      // No more visible tabs - either show a message or handle end of tabs
      toast.info("No more tabs available", { style: { top: 80 } });
    }
  };

  const postToMultipleAPIs = async (apiUrl: string, data: any) => {
    // Split comma-separated URLs & clean whitespace
    const apiUrls = apiUrl
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    let lastResponse: any = null;

    for (const url of apiUrls) {
      lastResponse = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    }

    return lastResponse; // return last API response (important for existing logic)
  };

  const validateMandatoryFieldsEnhanced = () => {
    const newArray: any = [];
    const mandatoryFields = field.buttonFields || [];
    const fieldErrors: Array<{ name: string; displayName: string }> = [];

    // Collect field data and check mandatory fields
    updatedPersonalDetails.forEach((resData: any) => {
      resData?.Values.forEach((res: any) => {
        mandatoryFields.forEach((buttonField: any) => {
          if (Number(res.FieldID) === buttonField.FieldID) {
            // Check if this is a mandatory field
            const isMandatory = buttonField.IsMandatory || res.IsMandatory;

            // Get the field value
            const fieldValue = saveData[res.FieldName];

            // Add to payload array
            newArray.push({
              FieldID: res.FieldID,
              FieldName: res.FieldName,
              FieldValue: fieldValue || "",
            });

            // Check if mandatory field is empty
            if (isMandatory) {
              let isEmpty = false;

              if (fieldValue === undefined || fieldValue === null) {
                isEmpty = true;
              } else if (typeof fieldValue === "string") {
                isEmpty = fieldValue.trim() === "";
              } else if (typeof fieldValue === "number") {
                isEmpty = false; // Numbers are valid even if 0
              } else if (Array.isArray(fieldValue)) {
                isEmpty = fieldValue.length === 0;
              }

              if (isEmpty) {
                fieldErrors.push({
                  name: res.FieldName,
                  displayName:
                    res.FieldName || buttonField.DisplayName || res.FieldName,
                });
              }
            }
          }
        });
      });
    });

    return {
      isValid: fieldErrors.length === 0,
      fieldErrors,
      payload: newArray,
    };
  };

  const rowNum = isPDFPreviewOpen
    ? field.PDFRownum || field.Rownum || 0
    : field.Rownum || 0;
  const colNum = isPDFPreviewOpen
    ? field.PDFColnum || field.Colnum || 0
    : field.Colnum || 0;
  const fieldWidth = isPDFPreviewOpen
    ? field.PDFWidth || field.Width || "100px"
    : field.Width || "100px";
  const fieldHeight = isPDFPreviewOpen
    ? field.PDFHeight || field.Height || "20px"
    : field.Height || "20px";

  // Ensure we have valid numeric values for positioning
  const safeRowNum = Math.max(0, parseInt(rowNum) || 0);
  const safeColNum = Math.max(0, parseInt(colNum) || 0);
  const safeWidth = parseInt(fieldWidth.toString().replace("px", "")) || 100;
  const safeHeight = parseInt(fieldHeight.toString().replace("px", "")) || 20;

  const getFieldDimensions = () => {
    if (isMobile && !isPDFPreviewOpen) {
      // Mobile: Use MWidth or fallback to full width
      return {
        width: field.MWidth || "100%",
        height: field.MHeight || field.Height || "auto",
        rowNum: safeRowNum,
        colNum: safeColNum,
      };
    } else {
      // Desktop/PDF: Use original dimensions and positioning
      return {
        width: fieldWidth,
        height: fieldHeight,
        rowNum: safeRowNum,
        colNum: safeColNum,
      };
    }
  };

  const dimensions = getFieldDimensions();
  const getButtonStyles = () => {
    const baseStyles = {
      height: displaySize.height,
      width: displaySize.width,
      backgroundColor: field.Bgcolor || field.Fieldbgcolor || "",
      color: field.fontcolor || field.TextFontColor || "",
      fontSize: field.FontSize || field.TextFontSize || "14px",
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
      border: showBorder ? `1px solid ${borderColor}` : "none",
      fontWeight: field.IsBold || field.IsTextBold ? "bold" : "normal",
      fontStyle: field.IsItallic || field.IsTextItalic ? "italic" : "normal",
      textDecoration:
        field.IsUnderline || field.IsTextUnderLine ? "underline" : "none",
    };

    // Apply background color for text if specified
    if (field.TextBgcolor && field.TextBgcolor !== "#FFFFFF") {
      baseStyles.backgroundColor = field.TextBgcolor;
    }

    return baseStyles;
  };
  // Calculate the actual pixel values for rendering - this updates immediately
  const getDisplaySize = () => {
    if (isMobile && !isPDFPreviewOpen) {
      return {
        width: "100%",
        height: `${safeHeight}px`,
        numericWidth: safeWidth,
        numericHeight: safeHeight,
      };
    } else {
      return {
        width: `${safeWidth}px`,
        height: `${safeHeight}px`,
        numericWidth: safeWidth,
        numericHeight: safeHeight,
      };
    }
  };
  // Find the linked editor field by its FieldID
  const findLinkedEditorField = (linkedFieldId: string): Field | null => {
    let foundField: Field | null = null;

    if (updatedPersonalDetails && Array.isArray(updatedPersonalDetails)) {
      updatedPersonalDetails.forEach((tab: TabData) => {
        if (tab?.Values && Array.isArray(tab.Values)) {
          tab.Values.forEach((f: Field) => {
            if (Number(f.FieldID) === Number(linkedFieldId)) {
              foundField = f;
            }
          });
        }
      });
    }

    return foundField;
  };
  const handleEditorButtonClick = () => {
    if (!field.Linkcol) {
      toast.error("No linked editor field configured for this button", {
        style: { top: 80 },
      });
      return;
    }

    // Find the linked editor field
    const linkedEditorField = findLinkedEditorField(field.Linkcol);

    if (!linkedEditorField) {
      toast.error("Linked editor field not found", {
        style: { top: 80 },
      });
      return;
    }

    // Get the current value from saveData
    const editorValue = saveData[linkedEditorField.FieldName] || "";

    // Create a copy of the field with current value
    const fieldWithValue = {
      ...linkedEditorField,
      FieldValue: editorValue,
    };

    setEditorFieldData(fieldWithValue);

    // Open based on LinkOpenType
    if (field.LinkOpenType === "POPUP") {
      setIsEditorModalOpen(true);
    } else if (field.LinkOpenType === "DRAWER") {
      // For drawer, you might want to use a different approach
      // You can either use a separate drawer state or reuse the existing modal as drawer
      setIsEditorDrawerOpen(true); // or implement drawer logic
    }
  };
  const handleEditorContentChange = (content: string) => {
    if (editorFieldData) {
      // Update saveData with the new editor content
      const updatedSaveData = {
        ...saveData,
        [editorFieldData.FieldName]: content,
      };
      setSaveData(updatedSaveData);

      // Also update the field in updatedPersonalDetails if needed
      const nextState = [...updatedPersonalDetails];
      nextState.forEach((tab: any) => {
        tab?.Values?.forEach((f: any) => {
          if (Number(f.FieldID) === Number(editorFieldData.FieldID)) {
            f.FieldValue = content;
          }
        });
      });
      setUpdatedPersonalDetails(nextState);
    }
  };
  const displaySize = getDisplaySize();

  const resizableStyle = {
    ...style,
    marginLeft: "-10px",
    position: "absolute" as const,
    left: isMobile && !isPDFPreviewOpen ? style?.left : `${safeRowNum}px`,
    top: isMobile && !isPDFPreviewOpen ? style?.top : `${safeColNum}px`,
  };

  const renderLabel = () => {
    if (!field.IsFieldNamePrint) return null;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: field.Align,
          width: "100%",
          marginTop: "-25px",
        }}
      >
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
    );
  };
  return field.ValueType === "EDITOR" && field?.DefaultVisible ? (
    <Resizable
      enable={{
        top: isDrag && !isMobile,
        right: isDrag && !isMobile,
        bottom: isDrag && !isMobile,
        left: isDrag && !isMobile,
      }}
      className="resizer"
      style={resizableStyle}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <div
        className="flex w-full items-center"
        style={{
          textAlign: field.Align,
          display: "flex",
          flexDirection: field.LabelDirection,
        }}
      >
        <BoxComponent
          key={field.FieldID}
          id={field.FieldID}
          left={safeRowNum}
          top={safeColNum}
          isDrag={isDrag}
          width={displaySize.width}
          height={displaySize.height}
          newStyle={{
            display: "flex",
            alignItems: "center",
            flexDirection: field.LabelDirection,
            gap: 4,
          }}
        >
          {renderLabel()}
          <Button
            className={`h-10 w-full ${field?.ClsIcon}`}
            style={getButtonStyles()}
            disabled={isDrag || !isModify}
            onClick={async () => {
              handleButtonClick(async () => {
                handleEditorButtonClick();
              });
            }}
          >
            {field?.FieldName}
          </Button>
        </BoxComponent>
      </div>

      {/* Editor Modal */}
      {isEditorModalOpen && editorFieldData && (
        <Modal
          isOpen={isEditorModalOpen}
          toggle={() => setIsEditorModalOpen(!isEditorModalOpen)}
          size="lg"
          centered
          style={{
            width: `${editorFieldData.Width}`,
            height: `${editorFieldData.Height}`,
            boxShadow: "none",
          }}
        >
          <ModalHeader toggle={() => setIsEditorModalOpen(!isEditorModalOpen)}>
            {editorFieldData.FieldName || "Editor"}
          </ModalHeader>
          <ModalBody style={{ height: editorFieldData.Height || "500px" }}>
            <Editor
              apiKey="8s3fkrr9r5ylsjtqbesp0wk79pn46g4do9p1dg9249yn8tx5"
              initialValue={editorFieldData.FieldValue || ""}
              onEditorChange={handleEditorContentChange}
              init={{
                height: "100%",
                menubar: true,
                plugins: [
                  "advlist autolink lists link image charmap print preview anchor",
                  "searchreplace visualblocks code fullscreen",
                  "insertdatetime media paste code help wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic backcolor | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | removeformat | help",
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={() => setIsEditorModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
      {/* Editor Drawer for DRAWER type */}
      {isEditorDrawerOpen &&
        editorFieldData &&
        field.LinkOpenType === "DRAWER" && (
          <Drawer
            anchor={field.SideDrawerPos?.toLowerCase() || "right"}
            open={isEditorDrawerOpen}
            onClose={() => setIsEditorDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: `${field.SideDrawerWidth}%`,
                maxWidth: "1000px",
              },
            }}
          >
            <Box sx={{ p: 3, height: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3>{editorFieldData.FieldName || "Editor"}</h3>
                <Button
                  color="danger"
                  onClick={() => setIsEditorDrawerOpen(false)}
                >
                  Close
                </Button>
              </div>
              <div style={{ height: "calc(100% - 60px)" }}>
                <Editor
                  apiKey="8s3fkrr9r5ylsjtqbesp0wk79pn46g4do9p1dg9249yn8tx5"
                  initialValue={editorFieldData.FieldValue || ""}
                  onEditorChange={handleEditorContentChange}
                  init={{
                    height: "100%",
                    menubar: true,
                    plugins: [
                      "advlist autolink lists link image charmap print preview anchor",
                      "searchreplace visualblocks code fullscreen",
                      "insertdatetime media paste code help wordcount",
                    ],
                    toolbar:
                      "undo redo | formatselect | bold italic backcolor | \
              alignleft aligncenter alignright alignjustify | \
              bullist numlist outdent indent | removeformat | help",
                  }}
                />
              </div>
            </Box>
          </Drawer>
        )}
    </Resizable>
  ) : field.ValueType === "CHECK" &&
    // !field.APIURL &&
    field?.DefaultVisible ? (
    <Resizable
      enable={{
        top: isDrag && !isMobile,
        right: isDrag && !isMobile,
        bottom: isDrag && !isMobile,
        left: isDrag && !isMobile,
      }}
      className="resizer"
      style={resizableStyle}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <div
        className="flex w-full items-center"
        style={{
          textAlign: field.Align,
          display: "flex",
          flexDirection: field.LabelDirection,
        }}
      >
        <BoxComponent
          key={field.FieldID}
          id={field.FieldID}
          left={safeRowNum}
          top={safeColNum}
          isDrag={isDrag}
          width={displaySize.width}
          height={displaySize.height}
          newStyle={{
            display: "flex",
            alignItems: "center",
            flexDirection: field.LabelDirection,
            gap: 4,
            width: isMobile && !isPDFPreviewOpen ? "100%" : "auto",
          }}
        >
          {" "}
          {renderLabel()}
          <Button
            className={`h-10 w-full ${field?.ClsIcon}`}
            disabled={isDrag || !isModify}
            style={getButtonStyles()}
            onClick={async () => {
              handleButtonClick(async () => {
                const { confirmed, reason } = await confirm({
                  title: "Are you sure ?",
                });

                // if (confirmed) {
                //   const newArray: any = [];
                //   updatedPersonalDetails.map((resData: any) => {
                //     resData?.Values.map((res: any) => {
                //       field.buttonFields.map((response: any) => {
                //         if (Number(res.FieldID) === response.FieldID) {
                //           newArray.push({
                //             FieldID: res.FieldID,
                //             FieldName: res.FieldName,
                //             FieldValue: saveData[res.FieldName],
                //           });
                //         }
                //       });
                //     });
                //   });
                //   updatedPersonalDetails.map((resData: any) => {
                //     resData?.Values.map((res: any) => {
                //       if (Number(newArray[0].FieldID) === Number(res.FieldID)) {
                //         setModalData({
                //           app_id: res.FieldValue,
                //           ModuleID: res.Linkmoduleid,
                //           IsPopUpOpen: res.IsPopUpOpen,
                //           SideDrawerPos: res.SideDrawerPos,
                //           SideDrawerWidth: res.SideDrawerWidth,
                //         });
                //         setIsModalOpen(true);
                //       }
                //     });
                //   });
                // }
                if (confirmed) {
                  // Step 1: Build newArray from buttonFields and updatedPersonalDetails
                  const newArray: any = [];
                  updatedPersonalDetails.forEach((resData: any) => {
                    resData?.Values.forEach((res: any) => {
                      field.buttonFields.forEach((response: any) => {
                        if (
                          Number(res.FieldID) === response.FieldID &&
                          saveData[res.FieldName]
                        ) {
                          newArray.push({
                            FieldID: res.FieldID,
                            FieldName: res.FieldName,
                            FieldValue: saveData[res.FieldName],
                          });
                        }
                      });
                    });
                  });

                  // Step 2: Validate newArray
                  if (newArray.length === 0) {
                    toast.error("No valid field data found for this button!", {
                      style: { top: 80 },
                    });
                    return;
                  }

                  // Step 3: Find the target field for the Record ID
                  let targetField = updatedPersonalDetails
                    .flatMap((resData: any) => resData?.Values || [])
                    .find((res: any) =>
                      field.buttonFields.some(
                        (bf: any) => Number(bf.FieldID) === Number(res.FieldID),
                      ),
                    );
                  updatedPersonalDetails.forEach((resData: any) => {
                    resData?.Values.forEach((res: any) => {
                      if (Number(newArray[0].FieldID) === Number(res.FieldID)) {
                        targetField = res;
                      }
                    });
                  });

                  if (!targetField) {
                    toast.error("Target field not found!", {
                      style: { top: 80 },
                    });
                    return;
                  }

                  // Step 4: Set modalData with correct Record ID and field properties
                  setModalData({
                    app_id: targetField.FieldValue,
                    ModuleID: field.Linkmoduleid || targetField.Linkmoduleid,
                    IsPopUpOpen: field.IsPopUpOpen || targetField.IsPopUpOpen,
                    SideDrawerPos:
                      field.SideDrawerPos || targetField.SideDrawerPos,
                    SideDrawerWidth:
                      field.SideDrawerWidth || targetField.SideDrawerWidth,
                  });
                  setIsModalOpen(true);
                }
              });
            }}
          >
            {field?.FieldName}
          </Button>
        </BoxComponent>
      </div>
    </Resizable>
  ) : field.ValueType === "SEARCH" && field?.DefaultVisible ? (
    <Resizable
      enable={{
        top: isDrag && !isMobile,
        right: isDrag && !isMobile,
        bottom: isDrag && !isMobile,
        left: isDrag && !isMobile,
      }}
      className="resizer"
      style={resizableStyle}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <BoxComponent
        key={field.FieldID}
        id={field.FieldID}
        left={safeRowNum}
        top={safeColNum}
        isDrag={isDrag}
        width={displaySize.width}
        height={displaySize.height}
        newStyle={{
          display: "flex",
          alignItems: "center",
          flexDirection: field.LabelDirection,
          gap: 4,
        }}
      >
        {renderLabel()}
        <Button
          className={`h-10 w-full ${field?.ClsIcon}`}
          style={getButtonStyles()}
          disabled={isDrag || !isModify}
          onClick={async () => {
            // Call the search handler passed from parent
            if (field.onClick) {
              await field.onClick();
            }
          }}
        >
          {field?.FieldName}
        </Button>
      </BoxComponent>
    </Resizable>
  ) : field.ValueType !== "NEXT" &&
    field?.DefaultVisible &&
    field.ValueType !== "SUBMIT" &&
    field.ValueType !== "UPLOAD" ? (
    <Resizable
      enable={{
        top: isDrag && !isMobile,
        right: isDrag && !isMobile,
        bottom: isDrag && !isMobile,
        left: isDrag && !isMobile,
      }}
      className="resizer"
      style={resizableStyle}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <div
        className="flex w-full items-center"
        style={{
          textAlign: field.Align,
          display: "flex",
          flexDirection: field.LabelDirection,
        }}
      >
        <BoxComponent
          key={field.FieldID}
          id={field.FieldID}
          left={safeRowNum}
          top={safeColNum}
          isDrag={isDrag}
          width={displaySize.width}
          height={displaySize.height}
          newStyle={{
            display: "flex",
            alignItems: "center",
            flexDirection: field.LabelDirection,
            gap: 4,
          }}
        >
          {" "}
          {renderLabel()}
          <Button
            className={`h-10 w-full ${field?.ClsIcon}`}
            style={getButtonStyles()}
            disabled={isDrag || !isModify}
            onClick={async () => {
              setLoading(true);
              // Check if APIURL is provided or not
              if (!field.APIURL) {
                // If no APIURL, call AutoCall API like in the CHECK case
                const newArray: any = [];
                updatedPersonalDetails.forEach((resData: any) => {
                  resData?.Values.forEach((res: any) => {
                    field.buttonFields.forEach((response: any) => {
                      if (
                        Number(res.FieldID) === response.FieldID &&
                        saveData[res.FieldName]
                      ) {
                        newArray.push({
                          FieldID: res.FieldID,
                          FieldName: res.FieldName,
                          FieldValue: saveData[res.FieldName],
                        });
                      }
                    });
                  });
                });

                if (newArray.length === 0) {
                  toast.error("No valid field data found for this button!", {
                    style: { top: 80 },
                  });
                  return;
                }

                let targetField = updatedPersonalDetails
                  .flatMap((resData: any) => resData?.Values || [])
                  .find((res: any) =>
                    field.buttonFields.some(
                      (bf: any) => Number(bf.FieldID) === Number(res.FieldID),
                    ),
                  );
                updatedPersonalDetails.forEach((resData: any) => {
                  resData?.Values.forEach((res: any) => {
                    if (Number(newArray[0].FieldID) === Number(res.FieldID)) {
                      targetField = res;
                    }
                  });
                });

                if (!targetField) {
                  toast.error("Target field not found!", {
                    style: { top: 80 },
                  });
                  return;
                }

                // Call AutoCall API
                setModalData({
                  app_id: targetField.FieldValue,
                  ModuleID: field.Linkmoduleid || targetField.Linkmoduleid,
                  IsPopUpOpen: field.IsPopUpOpen || targetField.IsPopUpOpen,
                  SideDrawerPos:
                    field.SideDrawerPos || targetField.SideDrawerPos,
                  SideDrawerWidth:
                    field.SideDrawerWidth || targetField.SideDrawerWidth,
                });
                setIsModalOpen(true);
                return;
              }

              // Original logic when APIURL is provided
              if (field.IsConfirmCheck) {
                const { confirmed } = await confirm({
                  title: "Are you sure ?",
                });
                if (!confirmed) {
                  setLoading(false);
                  return;
                }
                if (confirmed) {
                  const newArray: any = [];
                  information.Data.forEach((dataObj: any) => {
                    dataObj?.Fields?.forEach((fieldGroup: any) => {
                      fieldGroup?.Values?.forEach((res: any) => {
                        field.buttonFields.forEach((response: any) => {
                          if (
                            Number(res.FieldID) === response.FieldID &&
                            saveData[res.FieldName]
                          ) {
                            newArray.push({
                              FieldID: res.FieldID,
                              FieldName: res.FieldName,
                              FieldValue: saveData[res.FieldName],
                            });
                          }
                        });
                      });
                    });
                  });

                  try {
                    const data = {
                      Userid: localStorage.getItem("username"),
                      ModuleID: menuIDQuery || menuID,
                      PostedJson: newArray,
                      ButtonID: field.FieldID,
                    };
                    sessionStorage.setItem("buttonID", field.FieldID);

                    const result = await postToMultipleAPIs(field.APIURL, data);

                    // Check if Table is empty or API response indicates error
                    const isTableEmpty =
                      !result.data.Table || result.data.Table.length === 0;
                    const hasError =
                      result.data.Message === "Invalid Request" ||
                      result.data.Resp?.toLowerCase() === "error";

                    if (isTableEmpty || hasError) {
                      // Reset table metadata to empty/initial state
                      setTableMetadata({
                        isDetailPopupOpen: false,
                        moduleID: null,
                        fieldID: null,
                        defaultVisible: null,
                        tablebuttons: null,
                        tableWidth: null,
                        ischeckBoxReq: null,
                        headerData: null,
                        footerData: null,
                        filename: null,
                        logo: null,
                        tableproperty: null,
                        outsideBorder: null,
                        insideBorder: null,
                        orientation: null,
                        tableFormatting: null,
                        headerRows: null,
                        footerRows: null,
                        tableheaderfooterCSS: null,
                        pageitemscnt: null,
                        isPagination: null,
                        chartData: null,
                        chartIds: null,
                        isFreezeHeader: null,
                        popupdrawersettings: null,
                      });

                      // Reset the buttonFields array for the relevant field
                      const newUpdatedDetails = [...updatedPersonalDetails];
                      const fieldID = field.FieldID;

                      // Find and reset buttonFields for the matching field
                      newUpdatedDetails.forEach((tab) => {
                        if (tab?.Values && Array.isArray(tab.Values)) {
                          tab.Values.forEach((fieldItem: any) => {
                            if (fieldItem?.FieldID == fieldID) {
                              // Clear the buttonFields array
                              fieldItem.buttonFields = [];
                              fieldItem.tableColumns = [];
                              fieldItem.tableFooter = [];
                              // Also clear TableData if it exists on the tab
                              if (tab.TableData) {
                                tab.TableData = [];
                              }
                            }
                          });
                        }
                      });

                      // Update state with cleared buttonFields
                      setUpdatedPersonalDetails(
                        JSON.parse(JSON.stringify(newUpdatedDetails)),
                      );

                      // Show appropriate message
                      if (hasError) {
                        toast.error(result.data.Message || "Invalid request", {
                          style: { top: 80 },
                        });
                      } else if (isTableEmpty) {
                        toast.info("No data available", { style: { top: 80 } });
                      }

                      setLoading(false);
                      return; // Exit early if table is empty or error
                    }

                    // Update table metadata only if we have valid table data
                    setTableMetadata({
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
                      popupdrawersettings:
                        result.data.Popupdrawersettings || null,
                    });

                    const saveIsCheckBoxReq = sessionStorage.setItem(
                      "isCheckBoxReq",
                      result.data.IscheckBoxReq,
                    );

                    if (result.data.Message !== "Invalid Request") {
                      const newUpdatedDetails = [...updatedPersonalDetails];
                      const fieldID = result.data.FieldID;
                      const findIndex = newUpdatedDetails.findIndex(
                        (res: any) =>
                          res.TabAliasName?.toLowerCase() ===
                          result.data.NestedTab?.toLowerCase(),
                      );

                      // Handle table columns
                      const tableWidth = result.data.TableWidth || [];
                      // Ensure we have the latest table data - explicitly handle null/undefined
                      const tableData = result.data.Table
                        ? [...result.data.Table]
                        : [];

                      const visibleColumns = tableWidth
                        .filter(
                          (col: any) =>
                            col?.IsDisplay === true &&
                            col?.ButtonID === field?.FieldID,
                        )
                        .map((col: any) => ({
                          name: col?.colname || "",
                          selector: col?.colname || "",
                          IsDisplay: col?.IsDisplay || false,
                        }));

                      // Update TableData and related fields
                      if (findIndex !== -1) {
                        newUpdatedDetails[findIndex].TableData = tableData;
                        newUpdatedDetails[findIndex].TableFooter = tableWidth;
                        newUpdatedDetails[findIndex].TableColumns =
                          visibleColumns;
                      }

                      // Update buttonFields for the matching field
                      newUpdatedDetails.forEach((tab) => {
                        if (tab?.Values && Array.isArray(tab.Values)) {
                          tab.Values.forEach((fieldItem: any) => {
                            if (fieldItem?.FieldID == fieldID) {
                              // Explicitly clear and set the new data
                              fieldItem.buttonFields = tableData;
                              fieldItem.tableColumns = visibleColumns;
                              fieldItem.tableFooter = tableWidth;
                            }
                          });
                        }
                      });

                      // Force state update with new object reference to trigger re-render
                      setUpdatedPersonalDetails(
                        JSON.parse(JSON.stringify(newUpdatedDetails)),
                      );
                      downloadBase64File(
                        result.data.Base64string,
                        result.data.Filename,
                      );

                      // Show success message
                      await confirm({
                        description: result.data.remarks,
                        hideCancelButton: true,
                      });
                      toast.success("Success", { style: { top: 80 } });

                      // Update other fields in saveData
                      const updatedSaveData = { ...saveData };
                      result?.data?.fields?.forEach((field: any) => {
                        if (!field.IsAddMore) {
                          newUpdatedDetails.forEach((responseData: any) => {
                            responseData?.Values.forEach((res: any) => {
                              if (
                                Number(res.FieldID) === Number(field.FieldID)
                              ) {
                                updatedSaveData[res.FieldName] = field.Value;
                                res.Link = field.Value;
                                res.DefaultVisible = field.Visibility;
                                if (res.FieldType === "IMAGE") {
                                  res.ControlImageUrl = field.Value;
                                }
                              }
                            });
                          });
                        } else if (field.IsAddMore) {
                          newUpdatedDetails.forEach((resData: any) => {
                            if (resData.IsAddMore) {
                              resData.Values.forEach((res: any) => {
                                if (
                                  Number(res.FieldID) === Number(field.FieldID)
                                ) {
                                  res.DefaultVisible = field.Visibility;
                                  res.addmorevalues = [...field.addmorevalues];
                                }
                              });
                            }
                          });
                        }
                      });
                      setSaveData(updatedSaveData);
                    }
                    if (result.data.ChartData && result.data.Chartids) {
                      const newUpdatedDetails = [...updatedPersonalDetails];

                      // Update each chart field with the corresponding data
                      result.data.Chartids.forEach(
                        (chartInfo: any, index: number) => {
                          const chartFieldID = chartInfo.FieldID;

                          // Find and update the chart field in all tabs
                          newUpdatedDetails.forEach((tab: any) => {
                            tab?.Values?.forEach((fieldItem: any) => {
                              if (
                                fieldItem.FieldID == chartFieldID &&
                                fieldItem.FieldType === "CHART"
                              ) {
                                // Update the chart with data
                                // ChartData is an array, we need to find the right data for this chart
                                // If there are multiple charts, we might need to match by index or some identifier
                                const chartData = result.data.ChartData;
                                fieldItem.ChartData = chartData; // Or chartData[index] if multiple charts

                                // Also update the ValueType if needed (e.g., from API response)
                                if (result.data.ChartType) {
                                  fieldItem.ValueType = result.data.ChartType; // 'BAR', 'LINE', 'PIE', etc.
                                }
                              }
                            });
                          });
                        },
                      );

                      setUpdatedPersonalDetails(newUpdatedDetails);
                    }
                  } catch (error: any) {
                    // Handle 500 error and other exceptions
                    console.error("API Error:", error);

                    // Reset table metadata to empty on error
                    setTableMetadata({
                      isDetailPopupOpen: false,
                      moduleID: null,
                      fieldID: null,
                      defaultVisible: null,
                      tablebuttons: null,
                      tableWidth: null,
                      ischeckBoxReq: null,
                      headerData: null,
                      footerData: null,
                      filename: null,
                      logo: null,
                      tableproperty: null,
                      outsideBorder: null,
                      insideBorder: null,
                      orientation: null,
                      tableFormatting: null,
                      headerRows: null,
                      footerRows: null,
                      tableheaderfooterCSS: null,
                      pageitemscnt: null,
                      isPagination: null,
                      chartData: null,
                      chartIds: null,
                      isFreezeHeader: null,
                      popupdrawersettings: null,
                    });

                    // Reset the buttonFields array for the relevant field on error
                    const newUpdatedDetails = [...updatedPersonalDetails];
                    const fieldID = field.FieldID;

                    // Find and reset buttonFields for the matching field
                    newUpdatedDetails.forEach((tab) => {
                      if (tab?.Values && Array.isArray(tab.Values)) {
                        tab.Values.forEach((fieldItem: any) => {
                          if (fieldItem?.FieldID == fieldID) {
                            // Clear the buttonFields array
                            fieldItem.buttonFields = [];
                            fieldItem.tableColumns = [];
                            fieldItem.tableFooter = [];
                            // Also clear TableData if it exists on the tab
                            if (tab.TableData) {
                              tab.TableData = [];
                            }
                          }
                        });
                      }
                    });

                    // Update state with cleared buttonFields
                    setUpdatedPersonalDetails(
                      JSON.parse(JSON.stringify(newUpdatedDetails)),
                    );

                    // Show appropriate error message
                    const errorMessage =
                      error?.response?.status === 500
                        ? "Server error occurred. Please try again later."
                        : error?.response?.data?.Message ||
                          error?.message ||
                          "An error occurred";

                    toast.error(errorMessage, {
                      style: { top: 80 },
                    });
                  } finally {
                    setLoading(false);
                  }
                }
              } else {
                // Handle non-confirmation case similarly
                const newArray: any = [];
                updatedPersonalDetails.forEach((resData: any) => {
                  resData?.Values.forEach((res: any) => {
                    field.buttonFields.forEach((response: any) => {
                      if (
                        Number(res.FieldID) === response.FieldID &&
                        saveData[res.FieldName]
                      ) {
                        newArray.push({
                          FieldID: res.FieldID,
                          FieldName: res.FieldName,
                          FieldValue: saveData[res.FieldName],
                        });
                      }
                    });
                  });
                });

                if (newArray.length === 0) {
                  return;
                }

                try {
                  const validation = validateMandatoryFieldsEnhanced();

                  if (!validation.isValid) {
                    const errorMessage = validation.fieldErrors
                      .map((f) => f.displayName)
                      .join(", ");

                    toast.error(
                      `Please fill the following mandatory fields: ${errorMessage}`,
                      {
                        style: { top: 80 },
                        autoClose: 5000, // Show for 5 seconds
                      },
                    );
                    setLoading(false);
                    return;
                  }

                  const data = {
                    Userid: localStorage.getItem("username"),
                    ModuleID: menuIDQuery || menuID,
                    PostedJson: validation.payload,
                    ButtonID: field.FieldID,
                  };

                  const result = await axios.post(field.APIURL, data, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });

                  if (result.data.Message) {
                    const newUpdatedDetails = [...updatedPersonalDetails];
                    const findIndex = newUpdatedDetails.findIndex(
                      (res: any) => res.Nestedtab === result.data.NestedTab,
                    );

                    // Ensure we have the latest table data - explicitly handle null/undefined
                    const tableData = result.data.Table
                      ? [...result.data.Table]
                      : [];

                    // Update TableData for the tab
                    if (findIndex !== -1) {
                      newUpdatedDetails[findIndex].TableData = tableData;
                    }

                    // Update buttonFields for the matching field
                    const fieldID = result.data.FieldID;
                    newUpdatedDetails.forEach((tab) => {
                      if (tab?.Values && Array.isArray(tab.Values)) {
                        tab.Values.forEach((fieldItem: any) => {
                          if (fieldItem?.FieldID == fieldID) {
                            // Explicitly clear and set the new data
                            fieldItem.buttonFields = tableData;
                          }
                        });
                      }
                    });

                    // Force state update with new object reference to trigger re-render
                    setUpdatedPersonalDetails(
                      JSON.parse(JSON.stringify(newUpdatedDetails)),
                    );
                    toast.success("Success", { style: { top: 80 } });

                    // Update other fields
                    newUpdatedDetails.forEach((response: any) => {
                      response.Values.forEach((res: any) => {
                        result.data.fields.forEach((field: any) => {
                          if (
                            Number(field.FieldID) === Number(res.FieldID) &&
                            !field.IsAddMore
                          ) {
                            res.DefaultVisible = field.Visibility;
                            if (res.FieldType === "IMAGE") {
                              res.ControlImageUrl = field.Value;
                            }
                            const nextState = { ...saveData };
                            nextState[res.FieldName] = field.Value;
                            setSaveData(nextState);
                          } else if (
                            Number(field.FieldID) === Number(res.FieldID) &&
                            field.IsAddMore &&
                            res.AddMoreGroup === field.AddMoreGroup
                          ) {
                            console.log(res);
                          }
                        });
                      });
                    });
                  }
                } catch (error: any) {
                  toast.error(error?.response?.data?.Message, {
                    style: { top: 80 },
                  });
                  console.error("Error:", error);
                }
              }
            }}
          >
            {field?.FieldName}
          </Button>
        </BoxComponent>
      </div>
    </Resizable>
  ) : field.ValueType === "NEXT" && field?.DefaultVisible ? (
    <Resizable
      enable={{
        top: isDrag && !isMobile,
        right: isDrag && !isMobile,
        bottom: isDrag && !isMobile,
        left: isDrag && !isMobile,
      }}
      className="resizer"
      style={resizableStyle}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      {" "}
      {renderLabel()}
      <BoxComponent
        key={field.FieldID}
        id={field.FieldID}
        left={safeRowNum}
        top={safeColNum}
        isDrag={isDrag}
        width={displaySize.width}
        height={displaySize.height}
        newStyle={{
          display: "flex",
          alignItems: "center",
          flexDirection: field.LabelDirection,
          gap: 4,
        }}
      >
        <Button
          className="h-10 w-full"
          style={getButtonStyles()}
          disabled={isDrag || !isModify}
          onClick={handleNextButton} // the new function for next
        >
          {updatedPersonalDetails?.length - 1 === value
            ? "SUBMIT"
            : field.FieldName}
        </Button>
      </BoxComponent>
    </Resizable>
  ) : field.ValueType === "SUBMIT" && field?.DefaultVisible ? (
    <Resizable
      enable={{
        top: isDrag && !isMobile,
        right: isDrag && !isMobile,
        bottom: isDrag && !isMobile,
        left: isDrag && !isMobile,
      }}
      className="resizer"
      style={resizableStyle}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <BoxComponent
        key={field.FieldID}
        id={field.FieldID}
        left={safeRowNum}
        top={safeColNum}
        isDrag={isDrag}
        width={displaySize.width}
        height={displaySize.height}
        newStyle={{
          display: "flex",
          alignItems: "center",
          flexDirection: field.LabelDirection,
          gap: 4,
        }}
      >
        {" "}
        {renderLabel()}
        <Button
          className="h-10 w-full"
          style={getButtonStyles()}
          disabled={isDrag || !isModify || isButtonLoading}
          onClick={async () => {
            handleButtonClick(async () => {
              // Validation logic
              const mandatoryFields = updatedPersonalDetails[
                value
              ]?.Values.filter(
                (field: any) =>
                  field.IsMandatory &&
                  field.DefaultVisible &&
                  ["BOX", "DROPDOWN", "DATE", "TEXTEDITOR"].includes(
                    field.FieldType,
                  ),
              );

              // Reset error flags
              const nextState = [...updatedPersonalDetails];
              nextState[value].Values = nextState[value].Values.map(
                (f: any) => ({
                  ...f,
                  error: false,
                }),
              );

              const hasEmptyMandatoryField = mandatoryFields.some(
                (field: any) => {
                  const fieldValue = saveData[field.FieldName];
                  const isEmpty =
                    fieldValue === undefined ||
                    fieldValue === null ||
                    fieldValue === "";
                  if (isEmpty) {
                    nextState[value].Values = nextState[value].Values.map(
                      (f: any) => {
                        if (f.FieldName === field.FieldName) {
                          return { ...f, error: true };
                        }
                        return f;
                      },
                    );
                  }
                  return isEmpty;
                },
              );

              setUpdatedPersonalDetails(nextState);

              if (hasEmptyMandatoryField) {
                toast.error("Please fill all the mandatory fields", {
                  style: { top: 80 },
                });
                return;
              }

              // Collect table data from selected rows
              const tableData = updatedPersonalDetails[value]?.Values.filter(
                (tableField: any) =>
                  tableField.FieldType === "TABLE" && tableField.buttonFields,
              )
                .map((tableField: any) => {
                  const selectedRows =
                    selectedRowsByTable[tableField.FieldID] || [];
                  if (selectedRows.length === 0) {
                    return null;
                  }
                  const tableRows = tableField.buttonFields.filter((row: any) =>
                    selectedRows.some(
                      (selectedRow: any) =>
                        JSON.stringify(selectedRow) === JSON.stringify(row),
                    ),
                  );
                  return {
                    FieldID: tableField.FieldID,
                    Cols: Object.keys(tableRows[0] || {})
                      .filter((colName) => colName !== "select")
                      .map((colName) => ({
                        Colname: colName,
                        Values: tableRows.map((row: any) => ({
                          Values: row[colName] || "",
                        })),
                      })),
                  };
                })
                .filter((table: any) => table !== null);

              // Check mandatory tables
              const mandatoryTablesWithDataButNoSelection =
                updatedPersonalDetails[value]?.Values.filter(
                  (tableField: any) =>
                    tableField.FieldType === "TABLE" &&
                    tableField.buttonFields &&
                    tableField.buttonFields.length > 0 &&
                    tableField.IsMandatory,
                ).some((tableField: any) => {
                  const selectedRows =
                    selectedRowsByTable[tableField.FieldID] || [];
                  return selectedRows.length === 0;
                });

              if (mandatoryTablesWithDataButNoSelection) {
                toast.error(
                  "Please select at least one row from the mandatory table to submit!",
                  {
                    style: { top: 80 },
                  },
                );
                return;
              }

              // CALL THE NEW SUBMIT FUNCTION
              await handleSubmitDirectly(tableData);
            });
          }}
        >
          {isButtonLoading ? "Submitting..." : "SUBMIT"}
        </Button>
      </BoxComponent>
    </Resizable>
  ) : field.ValueType === "SELECT" && field?.DefaultVisible ? (
    <Resizable
      enable={{
        top: isDrag && !isMobile,
        right: isDrag && !isMobile,
        bottom: isDrag && !isMobile,
        left: isDrag && !isMobile,
      }}
      className="resizer"
      style={resizableStyle}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <BoxComponent
        key={field.FieldID}
        id={field.FieldID}
        left={safeRowNum}
        top={safeColNum}
        isDrag={isDrag}
        width={displaySize.width}
        height={displaySize.height}
        newStyle={{
          display: "flex",
          alignItems: "center",
          flexDirection: field.LabelDirection,
          gap: 4,
        }}
      >
        {" "}
        {renderLabel()}
        <Button
          className="h-10 w-full"
          style={getButtonStyles()}
          disabled={isDrag || !isModify}
        >
          {field.FieldName}
        </Button>
      </BoxComponent>
    </Resizable>
  ) : field.DefaultVisible && field.ValueType == "UPLOAD" ? (
    <Resizable
      enable={{
        top: isDrag && !isMobile,
        right: isDrag && !isMobile,
        bottom: isDrag && !isMobile,
        left: isDrag && !isMobile,
      }}
      className="resizer"
      style={resizableStyle}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <BoxComponent
        key={field.FieldID}
        id={field.FieldID}
        left={safeRowNum}
        top={safeColNum}
        isDrag={isDrag}
        width={displaySize.width}
        height={displaySize.height}
        newStyle={{
          display: "flex",
          alignItems: "center",
          flexDirection: field.LabelDirection,
          gap: 4,
        }}
      >
        {" "}
        {renderLabel()}
        <Button
          className="h-10 w-full "
          style={getButtonStyles()}
          disabled={isDrag || !isModify}
          onClick={() => {
            handleExcelFileUpload(field);
          }}
        >
          {field?.FieldName}
        </Button>
      </BoxComponent>
    </Resizable>
  ) : (
    field.field?.DefaultVisible && (
      <Resizable
        enable={{
          top: isDrag && !isMobile,
          right: isDrag && !isMobile,
          bottom: isDrag && !isMobile,
          left: isDrag && !isMobile,
        }}
        className="resizer"
        style={resizableStyle}
        size={{
          width: displaySize.width,
          height: displaySize.height,
        }}
        onResizeStop={(e, direction, ref, d) =>
          onResize(e, direction, ref, d, field)
        }
      >
        <div
          className="flex w-full items-center"
          style={{
            textAlign: field.Align,
            display: "flex",
            flexDirection: field.LabelDirection,
          }}
        >
          <BoxComponent
            key={field.FieldID}
            id={field.FieldID}
            left={safeRowNum}
            top={safeColNum}
            isDrag={isDrag}
            width={displaySize.width}
            height={displaySize.height}
            newStyle={{
              display: "flex",
              alignItems: "center",
              flexDirection: field.LabelDirection,
              gap: 4,
            }}
          >
            {" "}
            {renderLabel()}
            <Button
              className="h-10 w-[200px]"
              style={getButtonStyles()}
              disabled={isDrag || !isModify}
              onClick={() => {
                handleExcelFileUpload(field);
              }}
            >
              {field?.FieldName}
            </Button>
          </BoxComponent>
        </div>
      </Resizable>
    )
  );
};
