import { Resizable } from "re-resizable";
import React, { useState } from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label, Input } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
export function TextAreaField({
  style,
  field,
  onResize,
  isModify,
  isDrag,
  i,
  setModalData,
  setIsModalOpen,
  handleInputChange,
  information,
  saveData,
}: any) {
  const [regexError, setRegexError] = useState<string | null>(null);
  const hasError =
    (!saveData[field.FieldName] && field.IsMandatory) ||
    field.hasError ||
    !!regexError;
  const validateRegex = (value: string) => {
    if (!field?.Regex) return true;

    try {
      const regex = new RegExp(field.Regex);
      return regex.test(value);
    } catch (err) {
      console.error("Invalid regex for textarea:", field.Regex);
      return true;
    }
  };
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
      }}
      size={{
        width: `${Number(field?.Width?.toString().split("px")[0] || 100)}`,
        height: `${Number(field?.Height?.toString().split("px")[0] || 100)}`,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <FormGroup
        key={field?.FieldName}
        disabled={!isModify}
        style={{
          textAlign: field.Align,
          display: "flex",
          flexDirection: field.LabelDirection,
        }}
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
              justifyContent: field.Align,
              width: "100%",
              marginTop: "-20px",
            }}
          >
            <Label
              for={field?.FieldName}
              className="bold max-w-fit"
              style={{
                marginTop: "-5px",
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
                <span style={{ color: hasError ? "#dc3545" : "red" }}>*</span>
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
          <Input
            id={field?.FieldName}
            name={field?.FieldName}
            value={saveData[field.FieldName]}
            placeholder={field?.FieldName}
            type="textarea"
            onChange={(e) => {
              const value = e.target.value;

              // 🔹 Regex validation
              if (!value) {
                // Clear error when input is empty
                setRegexError(null);
              } else {
                const isValid = validateRegex(value);

                if (!isValid) {
                  setRegexError(field.RegexMessage || "Invalid format");
                } else {
                  setRegexError(null);
                }
              }

              handleInputChange(e, false);
            }}
            className={`${field?.ClsIcon}`}
            disabled={isDrag || field?.IsReadonly}
            style={{
              width: field.Width,
              height: field.Height,
              padding: 0,
              margin: 0,
              backgroundColor: hasError ? "#fff5f5" : field.Fieldbgcolor,
              border: showBorder ? `1px solid ${borderColor}` : "none",
              fontSize: `${field.TextFontSize}px`,
              color: field.TextFontColor,
              fontWeight: field.IsTextBold ? "bold" : "normal",
              textDecoration: field.IsTextUnderLine ? "underline" : "none",
              fontStyle: field.IsTextItalic ? "italic" : "normal",
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
          />
        </BoxComponent>
      </FormGroup>
      {hasError && (
        <div
          style={{
            color: "#dc3545",
            fontSize: "12px",
            marginTop: "4px",
            position: "absolute",
            bottom: "-18px",
            left: "0",
            width: "100%",
          }}
        >
          {field.hasError ? "This field is required" : regexError}
        </div>
      )}
    </Resizable>
  );
}
