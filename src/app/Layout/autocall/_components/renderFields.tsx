import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { Editor } from "@tinymce/tinymce-react";
import Tooltip from "rc-tooltip";
import { Resizable } from "re-resizable";
import { CSSProperties, useEffect, useMemo, useState } from "react";
import { AiFillEdit, AiFillInfoCircle } from "react-icons/ai";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  FormGroup,
  Label,
} from "reactstrap";
import { BoxField } from "./Fields/Box";
import { ButtonField } from "./Fields/ButtonField";
import { CheckBoxField } from "./Fields/CheckBoxField";
import { DateField } from "./Fields/DateField";
import { DropDownField } from "./Fields/DropDown";
import { LableField } from "./Fields/Lable";
import { RadioField } from "./Fields/RadioField";
import { TextAreaField } from "./Fields/TextAreaField";
import { TextBoxField } from "./Fields/TextBox";
import { UploadField } from "./Fields/UploadField";
import { BoxComponent } from "./dnd/Box";
import { ChartField } from "./Fields/Chart";
import { TableField } from "./Fields/Table";
import { IframeField } from "./Fields/Iframe";
import { TimelineField } from "./Fields/TimelineField";
import { VTimelineField } from "./Fields/VTimeline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Tabfield from "./Fields/Tabfield";
import Accordionfield from "./Fields/AccordionField";
import { HyperlinkField } from "./Fields/Hperlink";

export const RenderFields = ({
  updatedPersonalDetails,
  value,
  isDrag,
  onResize,
  setModalData,
  setIsModalOpen,
  saveData,
  information,
  isOpen,
  promiseOptions,
  handleInputChange,
  onInputChange,
  setColumnSelect,
  handleCalculateData,
  calculateFormula,
  isModify,
  setValue,
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
  handleSubmit,
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
  tableheaderfooterCSS,
  selectedPdfSettings,
  isPDFPreviewOpen = false,
  drop,
  handleSaveData,
  isdisable,
  handleDirectSave,
  parentTabVisible = true,
  onTableDataUpdate,
  tableBtnInfo,
  mandatoryFieldErrors,
  currentTabWithErrors,
  autopopupdrawer,
  cardDrop,
  // ✅ CRITICAL FIX: Accept selectedRowsByTable and callback from parent
  selectedRowsByTable,
  onTableSelectionChanged,
}: any) => {
  const [mobileLayout, setMobileLayout] = useState(isMobile);
  // Restore selected rows from localStorage on mount and when value (tab) changes
  useEffect(() => {
    const restoredState: { [key: string]: any[] } = {};

    try {
      const allLsKeys = Object.keys(localStorage || {}).filter((k) =>
        k.includes("_selectedRows"),
      );

      allLsKeys.forEach((key) => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          const parsed = JSON.parse(raw || "{}");
          const rows = parsed.rows || parsed.selected || [];

          if (Array.isArray(rows) && rows.length > 0) {
            // Extract fieldID from key format: table_MODULE_FIELDID_selectedRows
            const fieldIDMatch = key.match(/_(\d+)_selectedRows/);
            if (fieldIDMatch) {
              const fieldID = fieldIDMatch[1];
              restoredState[fieldID] = rows;
            }
          }
        } catch (err) {
          console.error("Error parsing localStorage key", key, err);
        }
      });
    } catch (error) {
      console.error("Error restoring from localStorage:", error);
    }
  }, [value]); // Re-run when tab changes

  // Update mobileLayout when isMobile prop changes
  useEffect(() => {
    setMobileLayout(isMobile);
  }, [isMobile]);

  // Calculate mobile positions based on index
  const getMobilePosition = (index: number, field: any) => {
    if (!mobileLayout || isPDFPreviewOpen) {
      // Return original positions for desktop or PDF preview
      return {
        left: isPDFPreviewOpen ? field.PDFRownum : field.Rownum,
        top: isPDFPreviewOpen ? field.PDFColnum : field.Colnum,
        width: isPDFPreviewOpen ? field.PDFWidth : field.Width,
        height: isPDFPreviewOpen ? field.PDFHeight : field.Height,
      };
    }

    // Mobile layout: use pre-calculated cumulative positions
    return mobilePositionsMap.get(index);
  };

  // ✅ CRITICAL FIX: Use parent's callback instead of local state
  // This ensures selections persist across tab navigations
  const handleTableSelectionChanged = (
    fieldID: string,
    selectedRows: any[],
  ) => {
    if (onTableSelectionChanged) {
      onTableSelectionChanged(fieldID, selectedRows);
      // Also sync with localStorage for backup
      try {
        const tableKey = `table_${menuID}_${fieldID}_selectedRows`;
        if (selectedRows.length === 0) {
          localStorage.removeItem(tableKey);
        } else {
          const dataToSave = {
            rows: selectedRows,
            _timestamp: Date.now(),
          };
          localStorage.setItem(tableKey, JSON.stringify(dataToSave));
        }
      } catch (error) {
        console.error("Error syncing selection to localStorage:", error);
      }
    }
  };

  const visibleFields =
    updatedPersonalDetails &&
    updatedPersonalDetails[value] &&
    updatedPersonalDetails[value]?.Values
      ? updatedPersonalDetails[value].Values.filter(
          (field: any) =>
            parentTabVisible &&
            field.DefaultVisible !== false &&
            !(field.FieldType === "BUTTON" && field.ValueType === "SEARCH"),
        )
      : [];

  // Calculate cumulative mobile positions
  let mobileCurrentTop = 0;
  const mobilePositionsMap = new Map();
  visibleFields.forEach((field: any, index: number) => {
    if (mobileLayout && !isPDFPreviewOpen) {
      const mobileWidth = `${field.MWidth}%` || "100%";
      const mobileHeight = field.MHeight || field.Height || "auto";
      const heightValue =
        mobileHeight === "auto" ? 80 : parseInt(mobileHeight) || 80;
      mobilePositionsMap.set(index, {
        left: 10,
        top: mobileCurrentTop,
        width: mobileWidth,
        height: mobileHeight,
      });
      mobileCurrentTop += heightValue + 40; // add 40px gap
    }
  });

  // Add early return if parent tab is not visible
  if (!parentTabVisible) {
    return <div ref={drop} style={{ display: "none" }} />;
  }
  return (
    <div ref={drop}>
      {visibleFields.map((field: any, i: number) => {
        const hasError = mandatoryFieldErrors?.[field.FieldID] || false;
        const isTabWithError =
          currentTabWithErrors === updatedPersonalDetails[value]?.TabAliasName;

        const position = getMobilePosition(i, field);
        const left = position.left;
        const top = position.top;
        const width = position.width;
        const height = position.height;

        const style: CSSProperties = {
          position: "absolute",
          cursor: isDrag ? "move" : "default",
          border: isDrag ? "1px dashed gray" : "0px",
          backgroundColor: isDrag ? "white" : "transparent",
          paddingLeft: isDrag ? "0.5rem" : "0rem",
          left: `${left}px`,
          top: `${top}px`,
          width: mobileLayout ? "calc(100% - 20px)" : "auto", // Full width on mobile with padding
        };
        const className = field.ClsIcon;
        const fieldProps = {
          ...field,
          hasError: hasError && isTabWithError,
          "data-field-id": field.FieldID, // For scrolling to error
        };
        const showBorder = field.IsBorderApply !== false;
        const borderColor = hasError ? "#dc3545" : field.bordercolor;
        switch (field?.FieldType) {
          case "LABEL":
            return (
              <LableField
                style={style}
                field={fieldProps}
                onResize={onResize}
                className={className}
                i={i}
                isDrag={isDrag}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                saveData={saveData}
                information={information}
                isPDFPreviewOpen={isPDFPreviewOpen}
                isdisable={isdisable}
                isMobile={mobileLayout}
              />
            );

          case "BOX":
            return (
              <BoxField
                style={style}
                field={fieldProps}
                onResize={onResize}
                i={i}
                isDrag={isDrag}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                handleInputChange={handleInputChange}
                isModify={isModify}
                information={information}
                saveData={saveData}
                setSaveData={setSaveData}
                isPDFPreviewOpen={isPDFPreviewOpen}
                isdisable={isdisable}
                isMobile={mobileLayout}
              />
            );

          case "TEXTBOX":
            return (
              <TextBoxField
                style={style}
                field={fieldProps}
                onResize={onResize}
                i={i}
                isModify={isModify}
                isDrag={isDrag}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                handleInputChange={handleInputChange}
                saveData={saveData}
                information={information}
                isMobile={mobileLayout}
              />
            );

          case "DROPDOWN":
            return (
              <DropDownField
                style={style}
                field={fieldProps}
                onResize={onResize}
                menuID={menuID}
                isModify={isModify}
                isDrag={isDrag}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                isOpen={isOpen}
                promiseOptions={promiseOptions}
                i={i}
                handleInputChange={handleInputChange}
                onInputChange={onInputChange}
                setColumnSelect={setColumnSelect}
                saveData={saveData}
                information={information}
                calculateFormula={calculateFormula}
                updatedPersonalDetails={updatedPersonalDetails}
                setUpdatedPersonalDetails={setUpdatedPersonalDetails}
                setSaveData={setSaveData}
                isdisable={isdisable}
                isMobile={mobileLayout}
              />
            );

          case "RADIO":
            return (
              <RadioField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isModify={isModify}
                isDrag={isDrag}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                saveData={saveData}
                handleCalculateData={handleCalculateData}
                setSaveData={setSaveData}
                calculateFormula={calculateFormula}
                information={information}
                updatedPersonalDetails={updatedPersonalDetails}
                isMobile={mobileLayout}
              />
            );

          case "CHECKBOX":
            return (
              <CheckBoxField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isModify={isModify}
                isDrag={isDrag}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                information={information}
                isMobile={mobileLayout}
              />
            );

          case "TEXTAREA":
            return (
              <TextAreaField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isModify={isModify}
                isDrag={isDrag}
                i={i}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                handleInputChange={handleInputChange}
                saveData={saveData}
                isMobile={mobileLayout}
              />
            );

          case "DATE":
            return (
              <DateField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isDrag={isDrag}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                faCalendarAlt={faCalendarAlt}
                isModify={isModify}
                saveData={saveData}
                setSaveData={setSaveData}
                information={information}
                className={className}
                isMobile={mobileLayout}
              />
            );

          case "UPLOAD":
            return (
              <UploadField
                field={fieldProps}
                isDrag={isDrag}
                onResize={onResize}
                style={style}
                isModify={isModify}
                saveData={saveData}
                setSaveData={setSaveData}
                information={information}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                handleExcelFileUpload={handleExcelFileUpload}
                className={className}
                isMobile={mobileLayout}
              />
            );

          case "BUTTON":
            return (
              <ButtonField
                field={fieldProps}
                isDrag={isDrag}
                onResize={onResize}
                style={style}
                isModify={isModify}
                saveData={saveData}
                setSaveData={setSaveData}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                setValue={setValue}
                value={value}
                mainColField={mainColField}
                menuID={menuID}
                menuIDQuery={menuIDQuery}
                currentRecordID={currentRecordID}
                updatedPersonalDetails={updatedPersonalDetails}
                setUpdatedPersonalDetails={setUpdatedPersonalDetails}
                setHideSubmit={setHideSubmit}
                handleProfileInformation={handleProfileInformation}
                isOpen={isOpen}
                setLoading={setLoading}
                setSavePersonalData={setSavePersonalData}
                savePersonalData={savePersonalData}
                handleSubmit={handleSubmit}
                handleExcelFileUpload={handleExcelFileUpload}
                getCalculatorData={getCalculatorData}
                confirm={confirm}
                className={className}
                setTableMetadata={setTableMetadata}
                selectedRowsByTable={selectedRowsByTable}
                information={information}
                isMobile={mobileLayout}
                isPdfPreviewOpen={isPDFPreviewOpen}
              />
            );

          case "CHART":
            return field.DefaultVisible ? (
              <ChartField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isModify={isModify}
                isDrag={isDrag}
                className={className}
                isMobile={mobileLayout}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                information={information}
                isPDFPreviewOpen={isPDFPreviewOpen}
                i={i}
              />
            ) : null;

          case "TABLE":
            return field.DefaultVisible ? (
              <TableField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isModify={isModify}
                isDrag={isDrag}
                i={i}
                saveData={saveData}
                updatedPersonalDetails={updatedPersonalDetails}
                className={className}
                handleTableLinkClick={handleTableLinkClick}
                menuID={menuID}
                currentRecordID={currentRecordID}
                isDetailPopupOpen={tableMetadata.isDetailPopupOpen}
                moduleID={tableMetadata.moduleID}
                fieldID={tableMetadata.fieldID}
                defaultVisible={tableMetadata.defaultVisible}
                tablebuttons={tableMetadata.tablebuttons}
                tableWidth={tableMetadata.tableWidth}
                ischeckBoxReq={tableMetadata.ischeckBoxReq}
                headerData={tableMetadata.headerData}
                footerData={tableMetadata.footerData}
                logo={tableMetadata.logo}
                tableproperty={tableMetadata.tableproperty}
                outsideBorder={tableMetadata.outsideBorder}
                insideBorder={tableMetadata.insideBorder}
                filename={tableMetadata.filename}
                tableFormatting={tableMetadata.tableFormatting}
                orientation={tableMetadata.orientation}
                headerRows={tableMetadata.headerRows}
                footerRows={tableMetadata.footerRows}
                tableheaderfooterCSS={tableMetadata.tableheaderfooterCSS}
                isPagination={tableMetadata.isPagination}
                pageitemscnt={tableMetadata.pageitemscnt}
                isFreezeHeader={tableMetadata.isFreezeHeader}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                handleSubmit={handleSubmit}
                mainColField={mainColField}
                savePersonalData={savePersonalData}
                setSavePersonalData={setSavePersonalData}
                setLoading={setLoading}
                isOpen={isOpen}
                onSelectionChanged={(selectedRows: any[]) =>
                  handleTableSelectionChanged(field.FieldID, selectedRows)
                }
                setEdit={setEdit}
                edit={edit}
                reportData={reportData}
                onChangeInput={onChangeInput}
                promiseOptions={promiseOptions}
                dropDownArray={dropDownArray}
                onInputChange={onInputChange}
                loadingDropdown={loadingDropdown}
                handleProfileInformation={handleProfileInformation}
                tableMetadata={tableMetadata}
                isPDFPreviewOpen={isPDFPreviewOpen}
                handleSaveData={handleSaveData}
                isMobile={mobileLayout}
                onTableDataUpdate={onTableDataUpdate}
                tableBtnInfo={tableBtnInfo}
                information={information}
                popupdrawersettings={tableMetadata.popupdrawersettings}
                autopopupdrawer={autopopupdrawer}
                setUpdatedPersonalDetails={setUpdatedPersonalDetails}
                setTableMetadata={setTableMetadata}
                setSaveData={setSaveData}
                setIsModalOpen={setIsModalOpen}
                setModalData={setModalData}
              />
            ) : null;

          case "IFRAME":
            return field.DefaultVisible ? (
              <IframeField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isModify={isModify}
                isDrag={isDrag}
                i={i}
                saveData={saveData}
                updatedPersonalDetails={updatedPersonalDetails}
                className={className}
                handleTableLinkClick={handleTableLinkClick}
                menuID={menuID}
                currentRecordID={currentRecordID}
                isDetailPopupOpen={tableMetadata.isDetailPopupOpen}
                moduleID={tableMetadata.moduleID}
                fieldID={tableMetadata.fieldID}
                defaultVisible={tableMetadata.defaultVisible}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                isMobile={mobileLayout}
              />
            ) : null;

          case "TIMELINE":
            return field.DefaultVisible ? (
              <TimelineField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isModify={isModify}
                isDrag={isDrag}
                i={i}
                saveData={saveData}
                updatedPersonalDetails={updatedPersonalDetails}
                className={className}
                handleTableLinkClick={handleTableLinkClick}
                menuID={menuID}
                currentRecordID={currentRecordID}
                isDetailPopupOpen={tableMetadata.isDetailPopupOpen}
                moduleID={tableMetadata.moduleID}
                fieldID={tableMetadata.fieldID}
                defaultVisible={tableMetadata.defaultVisible}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                timelineData={timelineData}
                isMobile={mobileLayout}
                isPDFPreviewOpen={isPDFPreviewOpen}
              />
            ) : null;

          case "TIMELINEV":
            return field.DefaultVisible ? (
              <VTimelineField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isModify={isModify}
                isDrag={isDrag}
                i={i}
                saveData={saveData}
                updatedPersonalDetails={updatedPersonalDetails}
                className={className}
                handleTableLinkClick={handleTableLinkClick}
                menuID={menuID}
                currentRecordID={currentRecordID}
                isDetailPopupOpen={tableMetadata.isDetailPopupOpen}
                moduleID={tableMetadata.moduleID}
                fieldID={tableMetadata.fieldID}
                defaultVisible={tableMetadata.defaultVisible}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                vTimelineData={vTimelineData}
                isMobile={mobileLayout}
                information={information}
              />
            ) : null;

          case "TAB":
            return field.DefaultVisible ? (
              <Tabfield
                style={style}
                field={fieldProps}
                onResize={onResize}
                className={className}
                i={i}
                isDrag={isDrag}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                saveData={saveData}
                information={information}
                isPDFPreviewOpen={isPDFPreviewOpen}
                isModify={isModify}
                promiseOptions={promiseOptions}
                handleInputChange={handleInputChange}
                onInputChange={onInputChange}
                setColumnSelect={setColumnSelect}
                handleCalculateData={handleCalculateData}
                calculateFormula={calculateFormula}
                setValue={setValue}
                mainColField={mainColField}
                menuID={menuID}
                menuIDQuery={menuIDQuery}
                currentRecordID={currentRecordID}
                setUpdatedPersonalDetails={setUpdatedPersonalDetails}
                setHideSubmit={setHideSubmit}
                handleProfileInformation={handleProfileInformation}
                setLoading={setLoading}
                setSavePersonalData={setSavePersonalData}
                savePersonalData={savePersonalData}
                handleSubmit={handleSubmit}
                handleExcelFileUpload={handleExcelFileUpload}
                getCalculatorData={getCalculatorData}
                confirm={confirm}
                isMobile={mobileLayout}
                setSaveData={setSaveData}
                editorRef={editorRef}
                getCardFields={getCardFields}
                handleTableLinkClick={handleTableLinkClick}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                tableMetadata={tableMetadata}
                setTableMetadata={setTableMetadata}
                timelineData={timelineData}
                vTimelineData={vTimelineData}
                edit={edit}
                setEdit={setEdit}
                reportData={reportData}
                onChangeInput={onChangeInput}
                dropDownArray={dropDownArray}
                loadingDropdown={loadingDropdown}
                fieldIndex={i}
                parentValue={value}
              />
            ) : null;
          case "ACCORDION":
            return field.DefaultVisible ? (
              <Accordionfield
                style={style}
                field={fieldProps}
                onResize={onResize}
                className={className}
                i={i}
                isDrag={isDrag}
                setModalData={setModalData}
                setIsModalOpen={setIsModalOpen}
                saveData={saveData}
                information={information}
                isPDFPreviewOpen={isPDFPreviewOpen}
                isModify={isModify}
                promiseOptions={promiseOptions}
                handleInputChange={handleInputChange}
                onInputChange={onInputChange}
                setColumnSelect={setColumnSelect}
                handleCalculateData={handleCalculateData}
                calculateFormula={calculateFormula}
                setValue={setValue}
                mainColField={mainColField}
                menuID={menuID}
                menuIDQuery={menuIDQuery}
                currentRecordID={currentRecordID}
                setUpdatedPersonalDetails={setUpdatedPersonalDetails}
                setHideSubmit={setHideSubmit}
                handleProfileInformation={handleProfileInformation}
                setLoading={setLoading}
                setSavePersonalData={setSavePersonalData}
                savePersonalData={savePersonalData}
                handleSubmit={handleSubmit}
                handleExcelFileUpload={handleExcelFileUpload}
                getCalculatorData={getCalculatorData}
                confirm={confirm}
                isMobile={mobileLayout}
                setSaveData={setSaveData}
                editorRef={editorRef}
                getCardFields={getCardFields}
                handleTableLinkClick={handleTableLinkClick}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                tableMetadata={tableMetadata}
                setTableMetadata={setTableMetadata}
                timelineData={timelineData}
                vTimelineData={vTimelineData}
                edit={edit}
                setEdit={setEdit}
                reportData={reportData}
                onChangeInput={onChangeInput}
                dropDownArray={dropDownArray}
                loadingDropdown={loadingDropdown}
                fieldIndex={i}
                parentValue={value}
              />
            ) : null;

          case "HYPERLINK":
            return field.DefaultVisible ? (
              <HyperlinkField
                style={style}
                field={fieldProps}
                onResize={onResize}
                isModify={isModify}
                isDrag={isDrag}
                i={i}
                className={className}
              />
            ) : null;

          case "TEXTEDITOR":
            return (
              <Resizable
                enable={{
                  top: isDrag,
                  right: isDrag,
                  bottom: isDrag,
                  left: isDrag,
                }}
                className="resizer"
                style={{ ...style, padding: 0 }}
                size={{
                  width: mobileLayout
                    ? "100%"
                    : `${Number(
                        field?.Width?.toString().split("px")[0] || 100,
                      )}px`,
                  height: `${Number(
                    field?.Height?.toString().split("px")[0] || 100,
                  )}px`,
                }}
              >
                <FormGroup
                  key={field?.FieldName}
                  style={{
                    textAlign: field.Align,
                    display: "flex",
                    flexDirection: field.LabelDirection,
                  }}
                  className={className}
                >
                  <BoxComponent
                    key={field.FieldID}
                    id={field.FieldID}
                    left={field.Rownum}
                    top={field.Colnum}
                    isDrag={isDrag}
                    width={mobileLayout ? "100%" : `${field.Width}px`}
                    height={`${field.Height}px`}
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
                        alignItems: "center",
                        marginTop: "-25px",
                      }}
                    >
                      <Label
                        for={field?.FieldName}
                        className="bold max-w-fit"
                        style={{
                          color: field.fontcolor,
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
                      {isDrag && field.IsEdit && (
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
                    <Editor
                      onInit={(evt: any, editor: any) =>
                        (editorRef.current = editor)
                      }
                      apiKey="8s3fkrr9r5ylsjtqbesp0wk79pn46g4do9p1dg9249yn8tx5"
                      onEditorChange={(content: any) => {
                        let state = {
                          ...saveData,
                          [field.FieldName]: content,
                        };
                        setSaveData(state);
                      }}
                      value={saveData[field.FieldName] ?? ""}
                      init={{
                        height: `${field.Height}px`,
                        width: `${mobileLayout ? field.MWidth : field.Width}px`,
                        border: showBorder
                          ? `1px solid ${borderColor}`
                          : "none",
                        menubar: true,
                        plugins: [
                          "advlist autolink lists link image charmap print preview anchor ",
                          "searchreplace visualblocks code fullscreen",
                          "insertdatetime media  paste code help wordcount",
                        ],
                        content_style: `body {font - family:Helvetica,Arial,sans-serif; font-size:14px; height: ${
                          field.Height
                        }px; width: ${mobileLayout ? "100%" : field.Width}px;}`,
                      }}
                    />
                  </BoxComponent>
                </FormGroup>
              </Resizable>
            );
          case "IMAGE":
            return (
              <Resizable
                enable={{
                  top: isDrag,
                  right: isDrag,
                  bottom: isDrag,
                  left: isDrag,
                }}
                className="resizer"
                style={{ ...style }}
                size={{
                  width: `${
                    isMobile
                      ? "100%"
                      : `${Number(field?.Width?.toString().split("px")[0] || 100)}px`
                  }`,
                  height: `${Number(
                    field?.Height?.toString().split("px")[0] || 100,
                  )}`,
                }}
                key={field.FieldID}
                onResizeStop={(e, direction, ref, d) =>
                  onResize(e, direction, ref, d, field)
                }
              >
                <BoxComponent
                  key={field.FieldID}
                  id={field.FieldID}
                  left={field.Rownum}
                  top={field.Colnum}
                  isDrag={isDrag}
                  width={`${field.Width}px`}
                  height={`${field.Height}px`}
                  newStyle={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: field.LabelDirection,
                    gap: 4,
                  }}
                >
                  <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                    <img
                      src={
                        field.ControlImageUrl ||
                        `data:image/jpeg;base64,${field.FieldValue}`
                      }
                      style={{
                        height: field.Height,
                        width: field.Width,
                        border: showBorder
                          ? `1px solid ${borderColor}`
                          : "none",
                        borderRadius:
                          field?.Shape === "ROUNDED"
                            ? "8px"
                            : field?.Shape === "CIRCLE"
                              ? "50%"
                              : field?.Shape === "PILL"
                                ? "9999px"
                                : "0",
                      }}
                    />
                  </Tooltip>
                </BoxComponent>
              </Resizable>
            );
          case "CARD":
            return (
              <Resizable
                enable={{
                  top: isDrag,
                  right: isDrag,
                  bottom: isDrag,
                  left: isDrag,
                }}
                className="resizer"
                style={{ ...style }}
                size={{
                  width: `${
                    isMobile
                      ? "100%"
                      : `${Number(field?.Width?.toString().split("px")[0] || 100)}px`
                  }`,
                  height: `${Number(
                    field?.Height?.toString().split("px")[0] || 100,
                  )}`,
                }}
                key={field.FieldID}
                onResizeStop={(e, direction, ref, d) =>
                  onResize(e, direction, ref, d, field)
                }
              >
                <BoxComponent
                  key={field.FieldID}
                  id={field.FieldID}
                  left={field.Rownum}
                  top={field.Colnum}
                  isDrag={isDrag}
                  width={`${field.Width}px`}
                  height={`${field.Height}px`}
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
                      alignItems: "center",
                      marginTop: "-25px",
                    }}
                  >
                    <Label
                      for={field?.FieldName}
                      className="bold max-w-fit"
                      style={{
                        color: field.fontcolor,
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
                    {isDrag && field.IsEdit && (
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
                  <Card
                    style={{
                      height: field.Height,
                      width: field.Width,
                    }}
                  >
                    <CardHeader>
                      <CardTitle>{field.FieldName}</CardTitle>
                    </CardHeader>
                    <div
                      ref={cardDrop} // Add the drop ref here
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "calc(100% - 60px)", // Adjust based on header height
                        border: showBorder
                          ? `1px solid ${borderColor}`
                          : "none",
                        backgroundColor: "white",
                        borderRadius:
                          field?.Shape === "ROUNDED"
                            ? "8px"
                            : field?.Shape === "CIRCLE"
                              ? "50%"
                              : field?.Shape === "PILL"
                                ? "9999px"
                                : "0",
                        fontSize: `${field.TextFontSize}px`,
                        color: field.TextFontColor,
                        margin: 0,
                        fontWeight: field.IsTextBold ? "bold" : "normal",
                        textDecoration: field.IsTextUnderLine
                          ? "underline"
                          : "none",
                        fontStyle: field.IsTextItalic ? "italic" : "normal",
                        padding: "5px",
                        flexDirection: field.LabelDirection,
                        opacity: isDrag,
                        fontFamily: field.TextFontname,
                      }}
                      className={`${field?.ClsIcon}`}
                    >
                      {field.CardFields &&
                        field.CardFields.map((res: any) => {
                          // Ensure we're using CardRownum and CardColnum, with fallbacks
                          const cardLeft =
                            res.CardRownum !== undefined
                              ? res.CardRownum
                              : res.Rownum || 0;
                          const cardTop =
                            res.CardColnum !== undefined
                              ? res.CardColnum
                              : res.Colnum || 0;

                          return (
                            <BoxComponent
                              key={res.FieldID}
                              id={res.FieldID}
                              left={cardLeft}
                              top={cardTop}
                              isDrag={isDrag}
                              width={res.Width || "100px"}
                              height={res.Height || "30px"}
                              cardFieldId={field.FieldID}
                              newStyle={{
                                position: "absolute",
                                cursor: isDrag ? "move" : "default",
                                left: `${cardLeft}px`,
                                top: `${cardTop}px`,
                              }}
                            >
                              {getCardFields(res, field)}
                            </BoxComponent>
                          );
                        })}
                    </div>
                  </Card>
                </BoxComponent>
              </Resizable>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
