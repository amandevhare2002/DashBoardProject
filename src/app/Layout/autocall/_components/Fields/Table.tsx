import { Resizable } from "re-resizable";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AiFillEdit, AiFillInfoCircle } from "react-icons/ai";
import { Button, Col, FormGroup, Label } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
import MainTable from "@/utils/table";
import axios from "axios";
import { toast } from "react-toastify";
import NewTablePage from "@/utils/newTable";
import { useTableWebSocket } from "@/utils/useWebsocket";

export function TableField({
  style,
  field,
  onResize,
  isModify,
  isDrag,
  information,
  saveData,
  updatedPersonalDetails,
  value,
  handleTableLinkClick,
  menuID,
  currentRecordID,
  uploadedFiles,
  setUploadedFiles,
  menuIDQuery,
  moduleID = null,
  fieldID = null,
  isDetailPopupOpen = false,
  defaultVisible,
  tablebuttons,
  tableWidth,
  mainColField,
  handleSubmit,
  savePersonalData,
  setSavePersonalData,
  setLoading,
  isOpen,
  onSelectionChanged,
  ischeckBoxReq,
  headerData,
  footerData,
  logo,
  tableproperty,
  insideBorder,
  outsideBorder,
  setEdit,
  edit,
  reportData,
  onChangeInput,
  promiseOptions,
  dropDownArray,
  onInputChange,
  loadingDropdown,
  filename,
  tableFormatting,
  orientation,
  headerRows,
  footerRows,
  tableheaderfooterCSS,
  isPDFPreviewOpen,
  handleSaveData,
  isMobile,
  onTableDataUpdate,
  tableBtnInfo,
  isPagination,
  pageitemscnt,
  isFreezeHeader,
  popupdrawersettings,
  autopopupdrawer,
  setUpdatedPersonalDetails,
  setTableMetadata,
  setSaveData,
  setIsModalOpen,
  setModalData,
}: any) {
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const wsUrl = field?.Link || "";
  const wsParam = field?.ValueType || "";

  const { wsData, wsStatus, sendMessage, reconnect } = useTableWebSocket({
    url: wsUrl,
    sendParam: wsParam,
    enabled: !!wsUrl,
  });
  console.log("WebSocket Data for TableField:", wsData);
  // Your important positioning calculations - KEEP THESE
  const rowNum = isPDFPreviewOpen
    ? field.PDFRownum || field.Rownum || 0
    : field.Rownum || 0;
  const colNum = isPDFPreviewOpen
    ? field.PDFColnum || field.Colnum || 0
    : field.Colnum || 0;
  const fieldWidth = isPDFPreviewOpen
    ? field.PDFWidth || field.Width || "400px"
    : field.Width || "400px";
  const fieldHeight = isPDFPreviewOpen
    ? field.PDFHeight || field.Height || "300px"
    : field.Height || "300px";

  // Ensure we have valid numeric values for positioning - KEEP THESE
  const safeRowNum = Math.max(0, parseInt(rowNum.toString()) || 0);
  const safeColNum = Math.max(0, parseInt(colNum.toString()) || 0);
  const safeWidth = parseInt(fieldWidth.toString().replace("px", "")) || 400;
  const safeHeight = parseInt(fieldHeight.toString().replace("px", "")) || 300;

  // Determine dimensions based on device
  const getFieldDimensions = () => {
    if (isMobile && !isPDFPreviewOpen) {
      return {
        width: field.MWidth || "100%",
        height: field.MHeight || field.Height || "auto",
        rowNum: safeRowNum,
        colNum: safeColNum,
      };
    } else {
      return {
        width: fieldWidth,
        height: fieldHeight,
        rowNum: safeRowNum,
        colNum: safeColNum,
      };
    }
  };

  const dimensions = getFieldDimensions();

  // Calculate the actual pixel values for rendering
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

  const displaySize = getDisplaySize();

  const handleSelectionChanged = (selectedRows: any[]) => {
    console.log(`Table ${field.FieldID} selected rows:`, selectedRows);
    setSelectedRows(selectedRows);

    // Save to localStorage
    try {
      const tableKey = `table_${menuID}_${field.FieldID}`;
      const storageKey = `${tableKey}_selectedRows`;
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          rows: selectedRows,
          _timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Error saving selection:", error);
    }

    // ALWAYS notify parent, even if empty
    if (onSelectionChanged) {
      onSelectionChanged(selectedRows);
    }
  };

  // Check if this is the uploaded files table
  const isUploadedFilesTable = field.FieldName === "Uploaded Files";

  // Merge live WebSocket data with any static buttonFields already on the field.
  // wsData takes priority when available so the table always shows fresh data.
  const resolvedTableData = useMemo(() => {
    if (wsData && wsData.length > 0) return wsData;
    return isUploadedFilesTable ? uploadedFiles : field.buttonFields || [];
  }, [wsData, field.buttonFields, uploadedFiles, isUploadedFilesTable]);
  // ── end WebSocket integration ──────────────────────────────────────────

  // Load reportData from sessionStorage if not provided via props
  const [localReportData, setLocalReportData] = useState(reportData);

  useEffect(() => {
    if (!localReportData) {
      const storedReportData = sessionStorage.getItem("reportData");
      if (storedReportData) {
        setLocalReportData(JSON.parse(storedReportData));
      }
    }
  }, [localReportData]);

  // In TableField component - update the handleTableSaveData function
  const handleTableSaveData = (modifiedData: any[]) => {
    if (handleSaveData && typeof handleSaveData === "function") {
      handleSaveData(modifiedData);
    } else {
      if (typeof toast !== "undefined") {
        toast.error("Save functionality not available");
      }
    }
  };

  // Columns for uploaded files table
  const uploadedFilesColumns = useMemo(() => {
    if (!uploadedFiles || uploadedFiles.length === 0) return [];

    const keys = Object.keys(uploadedFiles[0]).filter(
      (key) => key !== "FileLink" && key !== "fileTypes",
    );

    return keys.map((key) => ({
      name: key,
      selector: (row: any) => row[key],
      sortable: true,
      wrap: true,
      reorder: true,
      isEditable:
        !isUploadedFilesTable &&
        key !== "Filename" &&
        key !== "Dellink" &&
        key !== "Approvelink",
      cell: (row: any) => {
        if (key === "Filename") {
          return (
            <a
              href={row.FileLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {row[key]}
            </a>
          );
        } // In TableField component - update the uploadedFilesColumns logic for Dellink
        else if (key === "Dellink") {
          // Check if Dellink exists and is a valid URL
          const hasDellink =
            row[key] && typeof row[key] === "string" && row[key].trim() !== "";

          // Only check if row is selected if hasDellink is true
          const isRowSelected = selectedRows.some(
            (selectedRow) =>
              JSON.stringify(selectedRow) === JSON.stringify(row),
          );

          // Show delete button as active if Dellink exists, regardless of selection
          return (
            <Button
              color="danger"
              size="sm"
              style={{
                minWidth: "80px",
                padding: "5px 10px",
                margin: "2px",
                backgroundColor: hasDellink ? "#dc3545" : "#cccccc",
                borderColor: hasDellink ? "#dc3545" : "#cccccc",
                color: "white",
                cursor: hasDellink ? "pointer" : "not-allowed",
              }}
              disabled={!hasDellink}
              onClick={async (e) => {
                e.stopPropagation();

                if (!hasDellink) {
                  toast.info(
                    "Delete functionality is not available for this file",
                    {
                      position: "top-right",
                      autoClose: 3000,
                    },
                  );
                  return;
                }

                const data = {
                  Userid: localStorage.getItem("username"),
                  RecordID: currentRecordID || 0,
                  ModuleID: menuIDQuery || menuID,
                };
                try {
                  const response = await axios.post(row[key], data, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });
                  setUploadedFiles(response.data.files);
                  toast.success("File deleted successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { top: 50 },
                  });
                } catch (error) {
                  console.error("Error deleting file:", error);
                  toast.error("Failed to delete file!", {
                    position: "top-right",
                    autoClose: 3000,
                  });
                }
              }}
            >
              {hasDellink ? "Delete" : "N/A"}
            </Button>
          );
        } else if (key === "Approvelink") {
          // Check if Approvelink exists and is a valid URL
          const hasApprovelink =
            row[key] && typeof row[key] === "string" && row[key].trim() !== "";

          // For Approvelink, we DO want selection requirement
          const isRowSelected = selectedRows.some(
            (selectedRow) =>
              JSON.stringify(selectedRow) === JSON.stringify(row),
          );

          return (
            <Button
              color="primary"
              size="sm"
              style={{
                minWidth: "80px",
                padding: "5px 10px",
                margin: "2px",
                // Only active when BOTH link exists AND row is selected
                backgroundColor:
                  hasApprovelink && isRowSelected ? "#28a745" : "#cccccc",
                borderColor:
                  hasApprovelink && isRowSelected ? "#28a745" : "#cccccc",
                color: "white",
                cursor:
                  hasApprovelink && isRowSelected ? "pointer" : "not-allowed",
              }}
              // Disabled if either condition is not met
              disabled={!hasApprovelink || !isRowSelected}
              onClick={async (e) => {
                e.stopPropagation();

                if (!hasApprovelink) {
                  toast.info(
                    "Approve functionality is not available for this file",
                    {
                      position: "top-right",
                      autoClose: 3000,
                      style: { top: "50px" },
                    },
                  );
                  return;
                }

                if (!isRowSelected) {
                  toast.error("Please select this row to approve", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { top: "50px" },
                  });
                  return;
                }

                const data = {
                  Userid: localStorage.getItem("username"),
                  RecordID: currentRecordID || 0,
                  ModuleID: menuIDQuery || menuID,
                };
                try {
                  const response = await axios.post(row[key], data, {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  });
                  setUploadedFiles(response.data.files);
                  toast.success("File approved successfully", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { top: "50px" },
                  });
                } catch (error) {
                  console.error("Error Approving file:", error);
                  toast.error("Failed to Approve file!", {
                    position: "top-right",
                    autoClose: 3000,
                    style: { top: "50px" },
                  });
                }
              }}
            >
              {hasApprovelink ? "Approve" : "N/A"}
            </Button>
          );
        }
        return row[key] ?? "-";
      },
    }));
  }, [uploadedFiles, currentRecordID, menuIDQuery, menuID, selectedRows]);
  // Columns for regular tables
  const regularColumns = field.buttonFields
    ? Object.keys(field.buttonFields[0] || {}).map((key) => ({
        name: key,
        selector: (row: any) => row[key],
        sortable: true,
        wrap: true,
        reorder: true,
      }))
    : [];

  // Create Actions column with all tablebuttons
  const actionsColumn = useMemo(() => {
    if (!tablebuttons || tablebuttons.length === 0) return [];

    return [
      {
        name: "Actions",
        selector: () => "",
        sortable: false,
        filter: false,
        wrap: true,
        reorder: true,
        alwaysVisible: true,
        cell: (row: any) => (
          <div style={{ display: "flex", gap: "5px" }}>
            {tablebuttons.map((button: any) => {
              const isRowSelected = selectedRows.some(
                (selectedRow) =>
                  JSON.stringify(selectedRow) === JSON.stringify(row),
              );

              return (
                <Button
                  key={button.ButtonName}
                  color="primary"
                  size="sm"
                  style={{
                    minWidth: "80px",
                    padding: "5px 10px",
                    margin: "2px",
                    backgroundColor: isRowSelected ? "#007bff" : "#cccccc",
                    borderColor: isRowSelected ? "#007bff" : "#cccccc",
                    color: "white",
                  }}
                  disabled={!isRowSelected}
                  onClick={async (e) => {
                    e.stopPropagation();

                    if (selectedRows.length === 0) {
                      toast.error(
                        "Please select at least one row to perform this action!",
                        {
                          position: "top-right",
                          autoClose: 3000,
                        },
                      );
                      return;
                    }

                    const buttonFieldsData = button.columnnames.map(
                      (col: any) => {
                        let fieldInDetails: any = null;
                        let value =
                          row[col.Colname] ?? row[`VC_${col.Colname}`] ?? "";

                        if (!value && updatedPersonalDetails) {
                          for (const tab of updatedPersonalDetails) {
                            fieldInDetails = tab.Values.find(
                              (res: any) =>
                                res.FieldName === col.Colname ||
                                res.FieldName === `VC_${col.Colname}`,
                            );
                            if (fieldInDetails) {
                              value = fieldInDetails.IsAddMore
                                ? fieldInDetails.addmorevalues?.[0]
                                    ?.FieldValue || ""
                                : fieldInDetails.FieldValue || "";
                              break;
                            }
                          }
                        }

                        if (fieldInDetails) {
                          value = fieldInDetails.IsAddMore
                            ? fieldInDetails.addmorevalues?.[0]?.FieldValue ||
                              ""
                            : fieldInDetails.FieldValue || "";
                        } else {
                          value =
                            row[col.Colname] ?? row[`VC_${col.Colname}`] ?? "";
                        }

                        return {
                          FieldName: col.Colname,
                          FieldValue: value,
                        };
                      },
                    );

                    const payload = [...buttonFieldsData];

                    try {
                      const data = {
                        Userid: localStorage.getItem("username"),
                        ModuleID: menuIDQuery || menuID,
                        PostedJson: payload,
                        ButtonID: fieldID || 0,
                      };

                      const result = await axios.post(button.APIURL, data, {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token",
                          )}`,
                        },
                      });

                      if (result?.data) {
                        toast.success(
                          result?.data?.Message ||
                            "Action completed successfully",
                          {
                            style: { top: 80 },
                          },
                        );
                      }
                    } catch (error: any) {
                      toast.error(
                        error?.response?.data?.Message || "An error occurred",
                        {
                          style: { top: 80 },
                        },
                      );
                      console.error("Error:", error);
                    }
                  }}
                >
                  {button.ButtonName}
                </Button>
              );
            })}
          </div>
        ),
      },
    ];
  }, [
    tablebuttons,
    menuIDQuery,
    menuID,
    fieldID,
    updatedPersonalDetails,
    selectedRows,
  ]);

  // In TableField component - update the processedColumns logic
  const processedColumns = useMemo(() => {
    if (isUploadedFilesTable) return uploadedFilesColumns;

    // ── KEY CHANGE ──────────────────────────────────────────────────────────
    // Use resolvedTableData (which may be wsData) instead of field.buttonFields
    // so column IDs always match the actual row keys.
    const tableData = resolvedTableData;
    // ────────────────────────────────────────────────────────────────────────

    const actualColumnNames =
      tableData && tableData.length > 0 ? Object.keys(tableData[0]) : [];

    const regularCols = actualColumnNames.map((columnName: string) => {
      let columnData = localReportData?.columnsArray?.find(
        (data: any) => data?.columnName === columnName,
      );
      if (!columnData) {
        columnData = localReportData?.columnsArray?.find(
          (data: any) =>
            data?.columnName?.toLowerCase() === columnName.toLowerCase(),
        );
      }
      if (!columnData && columnName.startsWith("VC_")) {
        const cleanName = columnName.replace("VC_", "");
        columnData = localReportData?.columnsArray?.find(
          (data: any) => data?.columnName === cleanName,
        );
      }
      if (!columnData && !columnName.startsWith("VC_")) {
        const vcName = `VC_${columnName}`;
        columnData = localReportData?.columnsArray?.find(
          (data: any) => data?.columnName === vcName,
        );
      }

      const inputType = columnData?.Inputtype || "TEXTBOX";
      const isDisabled = columnData?.IsMaincol || false;

      return {
        name: columnName,
        selector: (row: any) => row[columnName],
        sortable: true,
        wrap: true,
        reorder: true,
        inputType,
        isDisabled,
      };
    });

    return [...regularCols, ...actionsColumn];
  }, [
    isUploadedFilesTable,
    resolvedTableData,
    uploadedFilesColumns,
    actionsColumn,
    localReportData,
  ]);

  const prevWsDataLengthRef = useRef<number>(0);

  useEffect(() => {
    if (!wsData || wsData.length === 0) return;

    const prevLen = prevWsDataLengthRef.current;
    const newLen = wsData.length;

    if (prevLen > 0 && newLen !== prevLen) {
      // Row count changed — surface a toast so the user knows
      toast.info(
        `Live data updated: ${newLen} row${newLen !== 1 ? "s" : ""} received`,
        {
          position: "top-right",
          autoClose: 3000,
          style: { top: "50px" },
          toastId: `ws_update_${field?.FieldID}`,
        },
      );
    }

    prevWsDataLengthRef.current = newLen;
  }, [wsData]);

  return (
    <Resizable
      enable={{
        top: isDrag && !isMobile,
        right: isDrag && !isMobile,
        bottom: isDrag && !isMobile,
        left: isDrag && !isMobile,
      }}
      className="resizer"
      style={{
        ...style,
        paddingLeft: 0,
        // Use safe positioning calculations for desktop, RenderFields style for mobile
        left: isMobile && !isPDFPreviewOpen ? style.left : `${safeRowNum}px`,
        top: isMobile && !isPDFPreviewOpen ? style.top : `${safeColNum}px`,
      }}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) => {
        const newWidth = ref.style.width;
        const newHeight = ref.style.height;

        const pdfWidth = isPDFPreviewOpen
          ? `${Math.round(parseInt(newWidth) * 0.75)}px`
          : newWidth;
        const pdfHeight = isPDFPreviewOpen
          ? `${Math.round(parseInt(newHeight) * 0.75)}px`
          : newHeight;

        onResize(
          e,
          direction,
          ref,
          d,
          {
            ...field,
            Width: newWidth,
            Height: newHeight,
            PDFWidth: pdfWidth,
            PDFHeight: pdfHeight,
          },
          isPDFPreviewOpen,
        );
      }}
    >
      <FormGroup
        key={field?.FieldName}
        disabled={!isModify}
        style={{
          textAlign: field.Align,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          width: isMobile && !isPDFPreviewOpen ? `100%` : "auto",
        }}
      >
        <BoxComponent
          key={field.FieldID}
          id={field.FieldID}
          left={safeRowNum} // Use safe positioning
          top={safeColNum} // Use safe positioning
          isDrag={isDrag}
          width={displaySize.width}
          height={displaySize.height}
          newStyle={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            height: "100%",
            width: isMobile && !isPDFPreviewOpen ? "100%" : "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: field.Align,
              width: "100%",
              gap: 4,
              marginTop: "-25px",
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
                fontSize: field.FontSize,
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
          <div
            style={{
              flex: 1,
              height: displaySize.height,
              width: displaySize.width,
              overflow: "auto",
              minHeight: 0,
            }}
          >
            {/* WS status indicator */}
            {wsUrl && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                  fontSize: 11,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    display: "inline-block",
                    backgroundColor:
                      wsStatus === "connected"
                        ? "#28a745"
                        : wsStatus === "connecting"
                          ? "#ffc107"
                          : wsStatus === "error"
                            ? "#dc3545"
                            : "#6c757d",
                  }}
                />
                <span style={{ color: "#6c757d" }}>WS: {wsStatus}</span>
                {(wsStatus === "disconnected" || wsStatus === "error") && (
                  <button
                    onClick={reconnect}
                    style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      cursor: "pointer",
                      border: "1px solid #6c757d",
                      borderRadius: 3,
                      background: "transparent",
                    }}
                  >
                    Reconnect
                  </button>
                )}
              </div>
            )}

            <NewTablePage
              title={"Record Table"}
              key={`table_${field}-${menuID}`}
              TableArray={resolvedTableData}
              columns={processedColumns}
              moduleID={moduleID || menuID}
              buttonID={fieldID}
              tableFooter={tableWidth}
              handleTableLinkClick={handleTableLinkClick}
              height="100%"
              IsDetailPopupOpen={isDetailPopupOpen}
              ischeckBoxReq={ischeckBoxReq}
              defaultVisible={defaultVisible}
              onSelectionChanged={handleSelectionChanged}
              selectedRows={selectedRows}
              logo={logo}
              tableproperty={tableproperty}
              outsideBorder={outsideBorder}
              insideBorder={insideBorder}
              setEditBtn={setEdit}
              editBtn={edit}
              filename={filename}
              orientation={orientation}
              tableFormatting={tableFormatting}
              headerRows={headerRows}
              footerRows={footerRows}
              tableheaderfooterCSS={tableheaderfooterCSS}
              reportData={reportData}
              onChangeInput={onChangeInput}
              promiseOptions={promiseOptions}
              dropDownArray={dropDownArray}
              onInputChange={onInputChange}
              loadingDropdown={loadingDropdown}
              handleSaveData={handleTableSaveData}
              field={field}
              tablebuttons={tablebuttons}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              currentRecordID={currentRecordID}
              fieldID={fieldID}
              onTableDataUpdate={onTableDataUpdate}
              tableBtnInfo={tableBtnInfo}
              isPagination={isPagination}
              pageitemscnt={pageitemscnt}
              isFreezeHeader={isFreezeHeader}
              saveData={saveData}
              information={information}
              updatedPersonalDetails={updatedPersonalDetails}
              popupdrawersettings={popupdrawersettings}
              autopopupdrawer={autopopupdrawer}
              setTableMetadata={setTableMetadata}
              setSaveData={setSaveData}
            />
          </div>
        </BoxComponent>
      </FormGroup>
    </Resizable>
  );
}
