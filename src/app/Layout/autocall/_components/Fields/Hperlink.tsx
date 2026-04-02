import { Resizable } from "re-resizable";
import React, { useState } from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label, Input } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
import Link from "next/link";

export function HyperlinkField({
  style,
  field,
  onResize,
  i,
  isDrag,
  setModalData,
  setIsModalOpen,
  handleInputChange,
  isModify,
  information,
  isMobile = false,
  isPDFPreviewOpen = false,
  saveData,
  setSaveData,
}: any) {
  const [isVisible, setIsVisible] = useState(false);
  const hasError =
    (!saveData[field.FieldName] && field.IsMandatory) || field.hasError;
  const showBorder = field.IsBorderApply !== false;
  const borderColor = hasError ? "#dc3545" : field.bordercolor;
  const getDisplayDimensions = () => {
    if (isMobile && !isPDFPreviewOpen) {
      return {
        width: `${field.MWidth}%`,
        height: field.Height, // Default height for mobile
      };
    } else {
      return {
        width: field.Width,
        height: field.Height,
      };
    }
  };

  const displayDimensions = getDisplayDimensions();

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
        left: isMobile && !isPDFPreviewOpen ? style.left : field.Rownum,
        top: isMobile && !isPDFPreviewOpen ? style.top : field.Colnum,
      }}
      size={{
        width: displayDimensions.width,
        height: displayDimensions.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <div key={i} className="">
        <FormGroup
          key={field?.FieldName}
          style={{
            textAlign: field.Align,
            fontSize: `${field.TextFontSize}px`,
            width: isMobile && !isPDFPreviewOpen ? "100%" : "auto",
          }}
        >
          <BoxComponent
            key={field.FieldID}
            id={field.FieldID}
            left={field.Rownum}
            top={field.Colnum}
            width={displayDimensions.width}
            height={displayDimensions.height}
            isDrag={isDrag}
            newStyle={{
              display: "flex",
              alignItems: "center",
              flexDirection: field.LabelDirection,
              gap: 4,
              width: isMobile && !isPDFPreviewOpen ? "100%" : "auto",
            }}
          >
            {field.IsFieldNamePrint ? (
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
                  {field.IsMandatory ? (
                    <span style={{ color: hasError ? "#dc3545" : "red" }}>
                      *
                    </span>
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
            <Link
              href={field.Link || "#"}
              target="_blank"
              style={{
                backgroundColor: hasError ? "#fff5f5" : field.Fieldbgcolor,
                border: showBorder ? `1px solid ${borderColor}` : "none",
                fontSize: `${field.TextFontSize}px`,
                color: hasError ? "#dc3545" : field.TextFontColor,
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
            >
              {field.FieldValue || field.Link}
            </Link>
          </BoxComponent>
        </FormGroup>
      </div>
    </Resizable>
  );
}
