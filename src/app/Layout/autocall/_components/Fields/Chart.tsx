import { Resizable } from "re-resizable";
import React from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
import { renderChart } from "@/utils/allChart";

export function ChartField({
  style,
  field,
  onResize,
  isDrag,
  isMobile,
  setModalData,
  setIsModalOpen,
  information,
  isPDFPreviewOpen,
}: any) {
  const hasError = field.hasError || false;

  /** ✅ SAME AS BOX FIELD */
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

  /** ✅ SAFE VALUES */
  const safeRowNum = Math.max(0, parseInt(rowNum.toString()) || 0);
  const safeColNum = Math.max(0, parseInt(colNum.toString()) || 0);
  const safeWidth = parseInt(fieldWidth.toString().replace("px", "")) || 100;
  const safeHeight = parseInt(fieldHeight.toString().replace("px", "")) || 100;

  const showBorder = field.IsBorderApply !== false;
  const borderColor = hasError ? "#dc3545" : field.bordercolor;

  /** ✅ MOBILE SUPPORT (same as BoxField) */
  const getFieldDimensions = () => {
    if (isMobile && !isPDFPreviewOpen) {
      return {
        width: field.MWidth || "100%",
        height: field.MHeight || field.Height || "auto",
      };
    } else {
      return {
        width: fieldWidth,
        height: fieldHeight,
      };
    }
  };

  const dimensions = getFieldDimensions();

  /** ✅ DISPLAY SIZE */
  const getDisplaySize = () => {
    if (isMobile && !isPDFPreviewOpen) {
      return {
        width: "100%",
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
        left: isMobile && !isPDFPreviewOpen ? style.left : `${safeRowNum}px`,
        top: isMobile && !isPDFPreviewOpen ? style.top : `${safeColNum}px`,
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
        key={field.FieldID}
        style={{ position: "relative", width: "100%", height: "100%" }}
      >
        <FormGroup
          style={{
            textAlign: field.Align,
            fontSize: `${field.TextFontSize}px`,
            width: isMobile && !isPDFPreviewOpen ? "100%" : "auto",
            height: "100%",
          }}
        >
          <BoxComponent
            id={field.FieldID}
            left={safeRowNum}
            top={safeColNum}
            isDrag={isDrag}
            width={displaySize.width}
            height={displaySize.height}
            newStyle={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              width: isMobile && !isPDFPreviewOpen ? "100%" : "auto",
              height: "100%",
            }}
          >
            {/* ✅ LABEL (FIXED like BoxField) */}
            {field.IsFieldNamePrint && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: field.Align,
                  width: "100%",
                }}
              >
                <Label
                  for={field?.FieldName}
                  className="bold max-w-fit"
                  style={{
                    color: hasError ? "#dc3545" : field.fontcolor,
                    backgroundColor: field.Bgcolor,
                    fontWeight: field.IsBold ? 700 : "normal",
                    textDecoration: field.IsUnderline ? "underline" : "none",
                    fontStyle: field.IsItallic ? "italic" : "normal",
                    fontSize: `${field.FontSize}px`,
                    fontFamily: field.Fontname,
                  }}
                >
                  {field?.FieldName}{" "}
                  {field.IsMandatory && (
                    <span
                      style={{
                        color: hasError ? "#dc3545" : "red",
                      }}
                    >
                      *
                    </span>
                  )}
                </Label>

                {field.ToolTip && (
                  <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                    <AiFillInfoCircle
                      style={{
                        marginLeft: 10,
                        cursor: "pointer",
                      }}
                    />
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
                      marginLeft: 10,
                      cursor: "pointer",
                    }}
                  />
                )}
              </div>
            )}

            {/* ✅ CHART AREA */}
            <div
              style={{
                flex: 1,
                width: "100%",
                border: showBorder ? `1px solid ${borderColor}` : "none",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {field.ChartData &&
              (Array.isArray(field.ChartData)
                ? field.ChartData.length > 0
                : true) ? (
                renderChart(field)
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#999",
                    fontStyle: "italic",
                  }}
                >
                  No chart data available
                </div>
              )}
            </div>
          </BoxComponent>
        </FormGroup>
      </div>
    </Resizable>
  );
}
