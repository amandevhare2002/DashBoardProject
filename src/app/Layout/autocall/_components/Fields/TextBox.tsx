import { Resizable } from "re-resizable";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label, Input } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
import { debounce } from "lodash";

export function TextBoxField({
  style,
  Number,
  field,
  onResize,
  i,
  isModify,
  isDrag,
  setModalData,
  setIsModalOpen,
  handleInputChange,
  saveData,
  information,
  isMobile,
}: any) {
  const [regexError, setRegexError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState(saveData[field.FieldName] || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const isNumeric = field.ValueType === "NUMERIC";
  const hasError =
    (!saveData[field.FieldName] && field.IsMandatory) ||
    field.hasError ||
    !!regexError;
  const showBorder = field.IsBorderApply !== false;
  const borderColor = hasError ? "#dc3545" : field.bordercolor;
  const validateRegex = (value: string) => {
    if (!field?.Regex) return true;

    try {
      const regex = new RegExp(field.Regex);
      return regex.test(value);
    } catch (err) {
      console.error("Invalid regex:", field.Regex);
      return true; // fail-safe
    }
  }; // Sync with parent state
  useEffect(() => {
    setLocalValue(saveData[field?.FieldName] || "");
  }, [saveData[field?.FieldName]]);

  // Create a debounced version of handleInputChange for non-numeric fields
  const debouncedHandleInputChange = useCallback(
    debounce((e: any, isDropdown: boolean) => {
      handleInputChange(e, isDropdown);
    }, 500),
    [handleInputChange],
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedHandleInputChange.cancel();
    };
  }, [debouncedHandleInputChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    // 🔹 Regex validation
    if (field.Regex) {
      const isValid = validateRegex(value);
      if (!isValid) {
        setRegexError(field.RegexMessage || "Invalid format");
      } else {
        setRegexError(null);
      }
    }

    // 🔹 Debounced update
    debouncedHandleInputChange(
      {
        target: {
          name: field?.FieldName,
          value: value,
        },
      },
      false,
    );
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    handleInputChange(
      {
        target: {
          name: field.FieldName,
          value: value,
        },
      },
      false,
    );
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
      style={{ ...style }}
      size={{
        width: isMobile
          ? "100%"
          : `${window.Number(field?.Width?.toString().split("px")[0] || 100)}`,
        height: `${window.Number(field?.Height?.toString().split("px")[0] || 100)}`,
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
          disabled={!isModify}
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
            left={field.Rownum}
            top={field.Colnum}
            width={`${field.Width}px`}
            height={`${field.Height}px`}
            isDrag={isDrag}
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
                }}
              >
                <Label
                  for={field?.FieldName}
                  className="bold max-w-fit"
                  style={{
                    color: hasError ? "#dc3545" : field.fontcolor,
                    backgroundColor: field.Bgcolor,
                    fontWeight: field.IsBold ? "bold" : "normal",
                    textDecoration: field.IsUnderline ? "underline" : "none",
                    fontStyle: field.IsItallic ? "italic" : "normal",
                    fontSize: `${field.FontSize}px`,
                    fontFamily: field.Fontname,
                  }}
                >
                  {field?.FieldName}{" "}
                  <span style={{ color: hasError ? "#dc3545" : "red" }}>*</span>
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

            <Input
              innerRef={inputRef}
              id={field?.FieldName}
              name={field?.FieldName}
              value={localValue}
              onChange={isNumeric ? handleNumericChange : handleChange}
              onKeyDown={
                isNumeric
                  ? (e) => {
                      // Allow only numbers and specific keys
                      if (
                        !/[0-9]|Backspace|ArrowLeft|ArrowRight|Delete|Tab/.test(
                          e.key,
                        )
                      ) {
                        e.preventDefault();
                      }
                    }
                  : undefined
              }
              placeholder={field.IsWatermarkPrint ? field.WatermarkText : ""}
              type={
                field.FieldName === "DateofBirth"
                  ? "date"
                  : isNumeric
                    ? "number"
                    : "text"
              }
              step={isNumeric ? "1" : undefined}
              style={{
                textAlign: field.TextAlignment,
                height: `${window.Number(
                  field?.Height?.toString().split("px")[0] || 100,
                )}`,
                width: field.Width,
                backgroundColor: hasError ? "#fff5f5" : field.Fieldbgcolor,
                color: field.TextFontColor,
                border: showBorder ? `1px solid ${borderColor}` : "none",
                borderColor: borderColor,
                fontSize: field.TextFontSize,
                fontWeight: field.IsTextBold ? "bold" : "normal",
                textDecoration: field.IsTextUnderLine ? "underline" : "none",
                fontFamily: field.TextFontname,
                fontStyle: field.IsTextItalic ? "italic" : "normal",
                MozAppearance: isNumeric ? "textfield" : undefined,
                borderRadius:
                  field?.Shape === "ROUNDED"
                    ? "8px"
                    : field?.Shape === "CIRCLE"
                      ? "50%"
                      : field?.Shape === "PILL"
                        ? "9999px"
                        : "0",
              }}
              onWheel={isNumeric ? (e) => e.currentTarget.blur() : undefined}
              disabled={isDrag || field?.IsReadonly || !isModify}
            />
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
                This field is required
              </div>
            )}
          </BoxComponent>
        </FormGroup>
      </div>
    </Resizable>
  );
}
