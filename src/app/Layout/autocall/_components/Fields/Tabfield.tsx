import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CSSProperties, useCallback, useEffect, useState } from "react";
import { Button, Form, Label } from "reactstrap";
import { handleSubmit } from "@/app/Layout/user-profile/_components/hooks";
import { Stepper, Step } from "react-form-stepper";
import { Resizable } from "re-resizable";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
import { RenderFields } from "../renderFields";
import { DropTargetMonitor, useDrop, XYCoord } from "react-dnd";
import update from "immutability-helper";
import axios from "axios";

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
      id={`tabfield-tabpanel-${index}`}
      aria-labelledby={`tabfield-tab-${index}`}
      {...other}
      className="w-full"
    >
      {value === index && (
        <Box sx={{ p: 3, width: "100%" }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
interface CustomDropTargetMonitor<T> extends DropTargetMonitor<T> {
  isDragging: boolean;
}
function a11yProps(index: number) {
  return {
    id: `tabfield-tab-${index}`,
    "aria-controls": `tabfield-tabpanel-${index}`,
  };
}

const Tabfield = ({
  field,
  style,
  className,
  i,
  isDrag,
  setModalData,
  setIsModalOpen,
  saveData,
  information,
  isPDFPreviewOpen,
  isModify,
  promiseOptions,
  handleInputChange,
  onInputChange,
  setColumnSelect,
  handleCalculateData,
  calculateFormula,
  setValue: setParentValue,
  mainColField,
  menuID,
  menuIDQuery,
  currentRecordID,
  setUpdatedPersonalDetails,
  setHideSubmit,
  handleProfileInformation,
  setLoading,
  setSavePersonalData,
  savePersonalData,
  handleSubmit: parentHandleSubmit,
  handleExcelFileUpload,
  getCalculatorData,
  confirm,
  isMobile,
  setSaveData,
  editorRef,
  getCardFields,
  handleTableLinkClick,
  uploadedFiles,
  setUploadedFiles,
  tableMetadata,
  setTableMetadata,
  timelineData,
  vTimelineData,
  edit,
  setEdit,
  reportData,
  onChangeInput,
  dropDownArray,
  loadingDropdown,
  parentValue,
  fieldIndex,
  onResize,
}: any) => {
  const [tabValue, setTabValue] = useState(0);
  const [nestedTabs, setNestedTabs] = useState<any[]>([]);
  const [nestedSaveData, setNestedSaveData] = useState<any>({});
  const [nestedSavePersonalData, setNestedSavePersonalData] = useState<any[]>(
    [],
  );
  const [nestedHideSubmit, setNestedHideSubmit] = useState(false);
  const [nestedLoading, setNestedLoading] = useState(false);
  const hasError = field.hasError || false;
  const showBorder = field.IsBorderApply !== false;
  const borderColor = hasError ? "#dc3545" : field.bordercolor;
  useEffect(() => {
    if (field?.NestedStructure && field.NestedStructure.length > 0) {
      console.log(
        "Tabfield - nestedTabs structure:",
        JSON.stringify(field.NestedStructure, null, 2),
      );
      setNestedTabs(field.NestedStructure);
      setTabValue(0);
    }
  }, [field]);

  const updateFieldData = async (id: string, updatedData: any) => {
    const fieldData = updatedData[tabValue]?.Values?.find(
      (res: any) => res.FieldID === id,
    );

    if (!fieldData) {
      console.error(`Field with ID ${id} not found in tab ${tabValue}`);
      return;
    }

    const fieldsArray = isPDFPreviewOpen
      ? [
          {
            FieldID: fieldData.FieldID,
            PDFRownum: fieldData.PDFRownum,
            PDFColnum: fieldData.PDFColnum,
            PDFHeight: fieldData.PDFHeight,
            PDFWidth: fieldData.PDFWidth,
          },
        ]
      : [
          {
            FieldID: fieldData.FieldID,
            Rownum: fieldData.Rownum,
            Colnum: fieldData.Colnum,
            Width: fieldData.Width,
            Height: fieldData.Height,
          },
        ];

    try {
      await axios.post(
        "https://logpanel.insurancepolicy4u.com/api/Login/Updatefieldproperty",
        {
          Userid: localStorage.getItem("username"),
          ModuleId: menuIDQuery || menuID,
          Type: isPDFPreviewOpen ? "PDF" : "",
          fields: fieldsArray,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      console.log("Nested field position updated successfully");
    } catch (error) {
      console.error("Error updating nested field position:", error);
    }
  };

  const moveBox = useCallback(
    (id: string, left: number, top: number, isTab: boolean) => {
      if (isTab) {
        // Update Tabfield's position in updatedPersonalDetails
        setUpdatedPersonalDetails((prev: any[]) => {
          const newState = [...prev];
          if (
            newState[parentValue] &&
            newState[parentValue].Values[fieldIndex]
          ) {
            newState[parentValue].Values[fieldIndex] = {
              ...newState[parentValue].Values[fieldIndex],
              ...(isPDFPreviewOpen
                ? { PDFRownum: left, PDFColnum: top }
                : { Rownum: left, Colnum: top }),
            };
          }
          return newState;
        });

        // Call API to update Tabfield position
        const fieldsArray = isPDFPreviewOpen
          ? [
              {
                FieldID: id,
                PDFRownum: left,
                PDFColnum: top,
                PDFHeight: field.PDFHeight || field.Height,
                PDFWidth: field.PDFWidth || field.Width,
              },
            ]
          : [
              {
                FieldID: id,
                Rownum: left,
                Colnum: top,
                Height: field.Height,
                Width: field.Width,
              },
            ];

        axios
          .post(
            "https://logpanel.insurancepolicy4u.com/api/Login/Updatefieldproperty",
            {
              Userid: localStorage.getItem("username"),
              ModuleId: menuIDQuery || menuID,
              Type: isPDFPreviewOpen ? "PDF" : "",
              fields: fieldsArray,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          )
          .then(() => console.log("Tabfield position updated successfully"))
          .catch((error) =>
            console.error("Error updating Tabfield position:", error),
          );
      } else {
        // Update nested field's position
        if (!nestedTabs[tabValue]?.Values) {
          console.warn(`No valid Values array for tab ${tabValue}`);
          return;
        }
        const updatedData = nestedTabs.map((detail: any, index: number) =>
          index === tabValue
            ? {
                ...detail,
                Values: detail.Values.map((tab: any) =>
                  tab.FieldID === id
                    ? {
                        ...tab,
                        ...(isPDFPreviewOpen
                          ? { PDFRownum: left, PDFColnum: top }
                          : { Rownum: left, Colnum: top }),
                      }
                    : tab,
                ),
              }
            : detail,
        );
        setNestedTabs(updatedData);
        updateFieldData(id, updatedData);
        setUpdatedPersonalDetails((prev: any[]) => {
          const newState = [...prev];
          if (
            newState[parentValue] &&
            newState[parentValue].Values[fieldIndex]
          ) {
            newState[parentValue].Values[fieldIndex].NestedStructure =
              updatedData;
          }
          return newState;
        });
      }
    },
    [
      nestedTabs,
      tabValue,
      isPDFPreviewOpen,
      setNestedTabs,
      setUpdatedPersonalDetails,
      parentValue,
      fieldIndex,
      menuID,
      menuIDQuery,
      field,
    ],
  );

  const [, drop] = useDrop(
    () => ({
      accept: "box",
      drop(item: any, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset() as {
          x: number;
          y: number;
        } | null;
        if (!delta) {
          console.warn("No valid offset data for drag operation in Tabfield", {
            item,
            monitorState: {
              initialOffset: monitor.getInitialClientOffset(),
              currentOffset: monitor.getClientOffset(),
            },
          });
          return;
        }

        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);

        console.log("Tabfield drop - item:", item);
        console.log(
          "Tabfield drop - nestedTabs[tabValue]:",
          nestedTabs[tabValue],
        );

        // Check if the dragged item is the Tabfield itself
        if (item.id === field.FieldID) {
          moveBox(item.id, left, top, true); // Handle Tabfield drag
        } else {
          // Check if the dragged item is a nested field
          const fieldExists = nestedTabs[tabValue]?.Values?.some(
            (nestedField: any) => nestedField.FieldID === item.id,
          );
          if (fieldExists) {
            moveBox(item.id, left, top, false); // Handle nested field drag
          } else {
            console.warn(
              `Field with ID ${item.id} not found in tab ${tabValue}`,
            );
          }
        }

        return undefined;
      },
      collect: (monitor) => ({}), // Simplified collect, as isDragging is not needed here
    }),
    [moveBox, nestedTabs, tabValue, field.FieldID],
  );

  const onNestedResize = useCallback(
    (e: any, direction: any, ref: any, d: any, nestedField: any) => {
      const newWidth = ref.style.width;
      const newHeight = ref.style.height;

      setNestedTabs((prevNestedTabs: any[]) => {
        const newNestedTabs = [...prevNestedTabs];
        newNestedTabs[tabValue].Values = newNestedTabs[tabValue].Values.map(
          (f: any) =>
            f.FieldID === nestedField.FieldID
              ? {
                  ...f,
                  ...(isPDFPreviewOpen
                    ? { PDFWidth: newWidth, PDFHeight: newHeight }
                    : { Width: newWidth, Height: newHeight }),
                }
              : f,
        );
        return newNestedTabs;
      });

      setUpdatedPersonalDetails((prev: any[]) => {
        const newState = [...prev];
        if (newState[parentValue] && newState[parentValue].Values[fieldIndex]) {
          newState[parentValue].Values[fieldIndex].NestedStructure =
            nestedTabs.map((detail: any, idx: number) =>
              idx === tabValue
                ? {
                    ...detail,
                    Values: detail.Values.map((f: any) =>
                      f.FieldID === nestedField.FieldID
                        ? {
                            ...f,
                            ...(isPDFPreviewOpen
                              ? { PDFWidth: newWidth, PDFHeight: newHeight }
                              : { Width: newWidth, Height: newHeight }),
                          }
                        : f,
                    ),
                  }
                : detail,
            );
        }
        return newState;
      });

      // Call API to update nested field size
      const fieldsArray = isPDFPreviewOpen
        ? [
            {
              FieldID: nestedField.FieldID,
              PDFRownum: nestedField.PDFRownum,
              PDFColnum: nestedField.PDFColnum,
              PDFWidth: newWidth,
              PDFHeight: newHeight,
            },
          ]
        : [
            {
              FieldID: nestedField.FieldID,
              Rownum: nestedField.Rownum,
              Colnum: nestedField.Colnum,
              Width: newWidth,
              Height: newHeight,
            },
          ];

      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/Updatefieldproperty",
          {
            Userid: localStorage.getItem("username"),
            ModuleId: menuIDQuery || menuID,
            Type: isPDFPreviewOpen ? "PDF" : "",
            fields: fieldsArray,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        )
        .then(() => console.log("Nested field size updated successfully"))
        .catch((error) =>
          console.error("Error updating nested field size:", error),
        );
    },
    [
      nestedTabs,
      tabValue,
      isPDFPreviewOpen,
      setNestedTabs,
      setUpdatedPersonalDetails,
      parentValue,
      fieldIndex,
      menuID,
      menuIDQuery,
    ],
  );

  // Handle tab change
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);

    if (nestedTabs.length - 1 !== newValue) {
      handleNestedSubmit({
        Details: nestedTabs[newValue]?.Values,
        saveData: nestedSaveData,
        main: mainColField,
        moduleID: menuIDQuery || menuID,
        setSavePersonalData: setNestedSavePersonalData,
        newValue,
        savePersonalData: nestedSavePersonalData,
        length: nestedTabs?.length,
        currentRecordID,
        setLoading: setNestedLoading,
        isOpen: true,
      });
    }
  };

  // Handle accordion change
  const handleChangeAccordian =
    (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      if (panel === tabValue) {
        setTabValue(-1);
      } else {
        setTabValue(panel);
      }
    };

  // Nested submit handler
  const handleNestedSubmit = async (params: any) => {
    try {
      await parentHandleSubmit(params);
    } catch (error) {
      console.error("Error in nested submit:", error);
    }
  };

  // Group fields for add more functionality
  const groupedFields = nestedTabs[tabValue]?.Values?.reduce(
    (acc: any, field: any) => {
      if (!acc[field?.AddMoreGroup]) {
        acc[field?.AddMoreGroup] = [];
      }
      acc[field?.AddMoreGroup].push(field);
      return acc;
    },
    {},
  );

  if (!nestedTabs || nestedTabs.length === 0) {
    return (
      <div style={style} className={className}>
        <div className="text-center p-4">
          <Typography variant="body2" color="textSecondary">
            No nested tabs configured
          </Typography>
        </div>
      </div>
    );
  }

  const isAccordian = nestedTabs[0]?.IsAccordion || false;

  // Get position and size for drag/drop and resize
  const left = isPDFPreviewOpen ? field.PDFRownum : field.Rownum;
  const top = isPDFPreviewOpen ? field.PDFColnum : field.Colnum;
  const width = isPDFPreviewOpen ? field.PDFWidth : field.Width;
  const height = isPDFPreviewOpen ? field.PDFHeight : field.Height;

  const fieldStyle: CSSProperties = {
    position: "absolute",
    cursor: isDrag ? "move" : "default",
    border: isDrag ? "1px dashed gray" : "0px",
    backgroundColor: isDrag ? "white" : "transparent",
    paddingLeft: isDrag ? "0.5rem" : "0rem",
    left: `${left}px`,
    top: `${top}px`,
  };

  return (
    <Resizable
      enable={{
        top: isDrag,
        right: isDrag,
        bottom: isDrag,
        left: isDrag,
      }}
      className="resizer"
      style={{ ...fieldStyle, backgroundColor: "white" }}
      size={{
        width: isMobile
          ? "100%"
          : `${Number(width?.toString().split("px")[0] || 400)}`,
        height: `${Number(height?.toString().split("px")[0] || 300)}`,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <BoxComponent
        key={field.FieldID}
        id={field.FieldID}
        left={field.Rownum}
        top={field.Colnum}
        width={`${field.Width}px`}
        height={`${field.Height}px`}
        isDrag={isDrag}
        newStyle={{
          display: "flex",
          flexDirection: field.LabelDirection,
          width: "100%",
          height: "100%",
          overflow: "auto",
          border: showBorder ? `1px solid ${borderColor}` : "none",
          borderColor: borderColor,
        }}
      >
        {/* Field Header with Label and Tooltip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px",
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: field.Bgcolor || "#f5f5f5",
          }}
        >
          {field.IsFieldNamePrint && (
            <Label
              for={field?.FieldName}
              className="bold max-w-fit"
              style={{
                color: hasError ? "#dc3545" : field.fontcolor,
                fontWeight: field.IsBold ? 700 : "normal",
                textDecoration: field.IsUnderline ? "underline" : "none",
                fontStyle: field.IsItallic ? "italic" : "normal",
                fontSize: `${field.FontSize}px`,
                fontFamily: field.Fontname,
                margin: 0,
              }}
            >
              {field?.FieldName}
              {field.IsMandatory && (
                <span style={{ color: hasError ? "#dc3545" : "red" }}>*</span>
              )}
            </Label>
          )}

          {field.ToolTip && (
            <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
              <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                <AiFillInfoCircle style={{ cursor: "pointer" }} />
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

        {/* Tab Content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <Form style={{ height: "100%", width: "100%" }}>
            {!!isAccordian ? (
              <div
                className="mt-3"
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {nestedTabs.map((nestedTab: any, index: number) => (
                  <Accordion
                    expanded={tabValue === index}
                    onChange={handleChangeAccordian(index)}
                    key={index}
                    disableGutters
                    square
                    sx={{
                      position: "relative",
                      zIndex: tabValue === index ? 10 : 1,
                      overflow: "visible",
                      "& .MuiAccordionSummary-root": {
                        minHeight: "48px",
                      },
                      "& .MuiAccordionDetails-root": {
                        padding: "8px",
                        overflow: "visible",
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel${index}bh-content`}
                      id={`panel${index}bh-header`}
                    >
                      <Typography variant="body2">
                        {nestedTab?.Nestedtab || nestedTab?.TabAliasName}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ padding: "8px" }}>
                      <div
                        className="w-full"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          position: "relative",
                          height: "auto",
                          minHeight: "200px",
                        }}
                        ref={drop}
                      >
                        <RenderFields
                          updatedPersonalDetails={nestedTabs}
                          value={index}
                          isDrag={isDrag}
                          onResize={onNestedResize}
                          setModalData={setModalData}
                          setIsModalOpen={setIsModalOpen}
                          saveData={nestedSaveData}
                          information={information}
                          isOpen={true}
                          promiseOptions={promiseOptions}
                          handleInputChange={(e: any, isDropdown?: boolean) => {
                            handleInputChange(e, isDropdown);
                            if (!isDropdown) {
                              setNestedSaveData((prev: any) => ({
                                ...prev,
                                [e.target.name]: e.target.value,
                              }));
                            }
                          }}
                          onInputChange={onInputChange}
                          setColumnSelect={setColumnSelect}
                          handleCalculateData={handleCalculateData}
                          calculateFormula={calculateFormula}
                          isModify={isModify}
                          setValue={setTabValue}
                          mainColField={mainColField}
                          menuID={menuID}
                          menuIDQuery={menuIDQuery}
                          currentRecordID={currentRecordID}
                          setUpdatedPersonalDetails={setNestedTabs}
                          setHideSubmit={setNestedHideSubmit}
                          handleProfileInformation={handleProfileInformation}
                          setLoading={setNestedLoading}
                          setSavePersonalData={setNestedSavePersonalData}
                          savePersonalData={nestedSavePersonalData}
                          handleSubmit={handleNestedSubmit}
                          handleExcelFileUpload={handleExcelFileUpload}
                          getCalculatorData={getCalculatorData}
                          confirm={confirm}
                          isMobile={isMobile}
                          setSaveData={setNestedSaveData}
                          editorRef={editorRef}
                          getCardFields={getCardFields}
                          handleTableLinkClick={handleTableLinkClick}
                          tableMetadata={tableMetadata}
                          setTableMetadata={setTableMetadata}
                          uploadedFiles={uploadedFiles}
                          setUploadedFiles={setUploadedFiles}
                          timelineData={timelineData}
                          vTimelineData={vTimelineData}
                          edit={edit}
                          setEdit={setEdit}
                          reportData={reportData}
                          onChangeInput={onChangeInput}
                          dropDownArray={dropDownArray}
                          loadingDropdown={loadingDropdown}
                          drop={drop}
                        />
                      </div>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>
            ) : (
              <>
                {nestedTabs.length > 1 && (
                  <div className="w-full justify-between items-center flex">
                    {information?.Data?.[0]?.IsStepper ? (
                      <Stepper
                        activeStep={tabValue}
                        style={{ width: "100%" }}
                        onClick={(e) => e.preventDefault()}
                      >
                        {nestedTabs.map((nestedTab: any, index: number) => (
                          <Step
                            key={index}
                            label={
                              nestedTab?.TabAliasName || nestedTab?.Nestedtab
                            }
                            onClick={(e) => e.preventDefault()}
                          />
                        ))}
                      </Stepper>
                    ) : (
                      <Tabs
                        value={tabValue}
                        onChange={handleChange}
                        aria-label="nested tabs"
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{
                          display: "flex",
                          gap: "5px",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          minWidth: "55px!important",
                        }}
                      >
                        {nestedTabs.map((nestedTab: any, index: number) => (
                          <Tab
                            key={index}
                            label={
                              <span style={{ fontSize: "12px" }}>
                                {nestedTab?.TabAliasName ||
                                  nestedTab?.Nestedtab}
                              </span>
                            }
                            {...a11yProps(index)}
                            sx={{ minHeight: "40px", padding: "6px 12px" }}
                          />
                        ))}
                      </Tabs>
                    )}
                  </div>
                )}

                <CustomTabPanel value={tabValue} index={tabValue}>
                  {nestedLoading ? (
                    <div
                      className="w-full justify-center items-center flex"
                      style={{ height: "200px" }}
                    >
                      <CircularProgress size={24} />
                    </div>
                  ) : (
                    <div
                      className="w-full"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                        position: "relative",
                        height: "100%",
                        minHeight: "200px",
                        padding: "8px",
                      }}
                    >
                      {/* Render Add More sections if exists */}
                      {nestedTabs[tabValue]?.IsAddMore && groupedFields && (
                        <div className="w-full flex flex-col gap-3">
                          {Object.entries(groupedFields).map(
                            ([groupName, fieldsInGroup]: any) => {
                              return fieldsInGroup?.[0]?.addmorevalues?.length >
                                0 ? (
                                <div key={groupName}>
                                  <h4
                                    style={{
                                      margin: "8px 0",
                                      fontSize: "14px",
                                    }}
                                  >
                                    {groupName}
                                  </h4>
                                  <table
                                    className="table table-responsive"
                                    style={{ fontSize: "12px" }}
                                  >
                                    <tbody>
                                      {fieldsInGroup?.[0]?.addmorevalues?.map(
                                        (_: any, rowIndex: any) => (
                                          <tr key={rowIndex}>
                                            {fieldsInGroup.map(
                                              (nestedField: any) => {
                                                return nestedField.DefaultVisible ? (
                                                  <td
                                                    key={`${nestedField?.FieldID}-${rowIndex}`}
                                                    style={{
                                                      minWidth:
                                                        nestedField?.FieldType ===
                                                        "CHECKBOX"
                                                          ? "20px"
                                                          : "100px",
                                                      padding: "4px",
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        fontSize: "12px",
                                                      }}
                                                    >
                                                      Add more field
                                                      implementation
                                                    </div>
                                                  </td>
                                                ) : (
                                                  ""
                                                );
                                              },
                                            )}
                                          </tr>
                                        ),
                                      )}
                                    </tbody>
                                  </table>
                                  <Button
                                    size="sm"
                                    style={{
                                      backgroundColor:
                                        information?.Data?.[0]?.Fields?.[0]
                                          ?.Bgcolor,
                                      color:
                                        information?.Data?.[0]?.Fields?.[0]
                                          ?.fontcolor,
                                      fontSize: "12px",
                                      padding: "4px 8px",
                                    }}
                                    disabled={!isModify}
                                    onClick={() => {
                                      const nextState = [...nestedTabs];
                                      nextState?.[tabValue]?.Values?.map(
                                        (res: any) => {
                                          if (res.AddMoreGroup === groupName) {
                                            res.addmorevalues.push({
                                              ValIndex:
                                                res.addmorevalues?.length + 1,
                                              FieldValue: res.FieldValue,
                                              FieldID: res.FieldID,
                                              FieldName: res.FieldName,
                                              FieldType: res.FieldType,
                                            });
                                          }
                                        },
                                      );
                                      setNestedTabs(nextState);
                                    }}
                                  >
                                    Add More
                                  </Button>
                                </div>
                              ) : null;
                            },
                          )}
                        </div>
                      )}
                      <div
                        className="w-full MuiAccordion-root-container"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          position: "relative",
                          height: "auto",
                          minHeight: "100vh",
                        }}
                        ref={drop}
                      >
                        <RenderFields
                          updatedPersonalDetails={nestedTabs}
                          value={tabValue}
                          isDrag={isDrag}
                          onResize={onNestedResize}
                          setModalData={setModalData}
                          setIsModalOpen={setIsModalOpen}
                          saveData={nestedSaveData}
                          information={information}
                          isOpen={true}
                          promiseOptions={promiseOptions}
                          handleInputChange={(e: any, isDropdown?: boolean) => {
                            handleInputChange(e, isDropdown);
                            if (!isDropdown) {
                              setNestedSaveData((prev: any) => ({
                                ...prev,
                                [e.target.name]: e.target.value,
                              }));
                            }
                          }}
                          onInputChange={onInputChange}
                          setColumnSelect={setColumnSelect}
                          handleCalculateData={handleCalculateData}
                          calculateFormula={calculateFormula}
                          isModify={isModify}
                          setValue={setTabValue}
                          mainColField={mainColField}
                          menuID={menuID}
                          menuIDQuery={menuIDQuery}
                          currentRecordID={currentRecordID}
                          setUpdatedPersonalDetails={setNestedTabs}
                          setHideSubmit={setNestedHideSubmit}
                          handleProfileInformation={handleProfileInformation}
                          setLoading={setNestedLoading}
                          setSavePersonalData={setNestedSavePersonalData}
                          savePersonalData={nestedSavePersonalData}
                          handleSubmit={handleNestedSubmit}
                          handleExcelFileUpload={handleExcelFileUpload}
                          getCalculatorData={getCalculatorData}
                          confirm={confirm}
                          isMobile={isMobile}
                          setSaveData={setNestedSaveData}
                          editorRef={editorRef}
                          getCardFields={getCardFields}
                          handleTableLinkClick={handleTableLinkClick}
                          tableMetadata={tableMetadata}
                          setTableMetadata={setTableMetadata}
                          uploadedFiles={uploadedFiles}
                          setUploadedFiles={setUploadedFiles}
                          timelineData={timelineData}
                          vTimelineData={vTimelineData}
                          edit={edit}
                          setEdit={setEdit}
                          reportData={reportData}
                          onChangeInput={onChangeInput}
                          dropDownArray={dropDownArray}
                          loadingDropdown={loadingDropdown}
                          drop={drop}
                        />
                      </div>
                    </div>
                  )}

                  {!nestedHideSubmit && nestedTabs[tabValue]?.IsAddMore && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        className="w-full"
                        style={{
                          backgroundColor:
                            information?.Data?.[0]?.Fields?.[0]?.Bgcolor,
                          color: information?.Data?.[0]?.Fields?.[0]?.fontcolor,
                          fontSize: "12px",
                          padding: "6px 12px",
                        }}
                        disabled={!isModify}
                        onClick={() => {
                          const currentMainColVal =
                            nestedSaveData[mainColField?.FieldName];
                          handleNestedSubmit({
                            Details: nestedTabs[tabValue]?.Values,
                            saveData: nestedSaveData,
                            main: mainColField,
                            moduleID: menuIDQuery || menuID,
                            setSavePersonalData: setNestedSavePersonalData,
                            newValue: tabValue,
                            savePersonalData: nestedSavePersonalData,
                            length: nestedTabs?.length,
                            currentRecordID,
                            isOpen: true,
                            setLoading: setNestedLoading,
                            setHideSubmit: (
                              data: boolean,
                              submitMainColValue: string,
                            ) => {
                              setNestedHideSubmit(data);
                              handleProfileInformation(
                                currentRecordID,
                                menuID,
                                false,
                                "SUBMIT",
                                submitMainColValue,
                              );
                            },
                            isSubmit: true,
                            information,
                          });
                        }}
                      >
                        SUBMIT
                      </Button>
                    </div>
                  )}
                </CustomTabPanel>
              </>
            )}
          </Form>
        </div>
      </BoxComponent>
    </Resizable>
  );
};

export default Tabfield;
