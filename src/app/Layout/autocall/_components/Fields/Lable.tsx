import { Resizable } from "re-resizable";
import React from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";

export function LableField({
  style,
  field,
  onResize,
  i,
  isDrag,
  setModalData,
  setIsModalOpen,
  saveData,
  information,
  isPDFPreviewOpen = false,
  isdisable,
  isMobile = false,
  isSearch,
}: any) {
  const hasError =
    (!saveData[field.FieldName] && field.IsMandatory) || field.hasError;
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
  const safeRowNum = Math.max(0, parseInt(rowNum.toString()) || 0);
  const safeColNum = Math.max(0, parseInt(colNum.toString()) || 0);
  const safeWidth = parseInt(fieldWidth.toString().replace("px", "")) || 100;
  const safeHeight = parseInt(fieldHeight.toString().replace("px", "")) || 20;

  // Calculate display size
  const getDisplaySize = () => {
    if (isMobile && !isPDFPreviewOpen) {
      return {
        width: `${field.MWidth}%` || "100%",
        height: `${safeHeight}px`,
      };
    } else {
      return {
        width: `${safeWidth}px`,
        height: `${safeHeight}px`,
      };
    }
  };

  const displaySize = getDisplaySize();
  const showBorder = field.IsBorderApply !== false;
  const borderColor = hasError ? "#dc3545" : field.bordercolor;
  return (
    <Resizable
      enable={{
        top: isDrag,
        right: isDrag,
        bottom: isDrag,
        left: isDrag,
      }}
      className="resizer"
      style={{
        ...style,
        position: "absolute",
        left: isMobile && !isPDFPreviewOpen ? "" : `${safeRowNum}px`,
        top: isMobile && !isPDFPreviewOpen ? style.top : `${safeColNum}px`,
        zIndex: isDrag ? 1000 : 1,
      }}
      size={{
        width: displaySize.width,
        height: displaySize.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <div
        key={i}
        className=""
        data-field-id={field.FieldID}
        style={{ position: "relative" }}
      >
        <FormGroup
          key={field?.FieldName}
          style={{
            textAlign: field.Align,
            display: "flex",
            flexDirection: field.LabelDirection,
            height: "100%",
            width: "100%",
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
            {field.IsFieldNamePrint ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: field.Align,
                  width: "100%",
                  gap: 4,
                  marginTop: "-30px",
                }}
              >
                <Label
                  for={field?.FieldName}
                  className="bold max-w-fit"
                  style={{
                    color: field.fontcolor,
                    backgroundColor: field.Bgcolor,
                    fontWeight: field.IsBold ? "bold" : "normal",
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
            ) : null}
            <p
              style={{
                height: field.Height,
                width: displaySize.width,
                backgroundColor: hasError ? "#fff5f5" : field.Fieldbgcolor,
                border: showBorder ? `1px solid ${borderColor}` : "none",
                fontSize: `${field.TextFontSize}px`,
                color: field.TextFontColor,
                margin: 0,
                fontWeight: field.IsTextBold ? "bold" : "normal",
                textDecoration: field.IsTextUnderLine ? "underline" : "none",
                fontStyle: field.IsTextItalic ? "italic" : "normal",
                padding: "5px",
                flexDirection: field.LabelDirection,
                borderRadius:
                  field?.Shape === "ROUNDED"
                    ? "8px"
                    : field?.Shape === "CIRCLE"
                      ? "50%"
                      : field?.Shape === "PILL"
                        ? "9999px"
                        : "0",
                opacity: isDrag,
                fontFamily: field.TextFontname,
              }}
              className={`${field?.ClsIcon}`}
            >
              {saveData[field.FieldName]}
            </p>
          </BoxComponent>
        </FormGroup>
      </div>
    </Resizable>
  );
}
