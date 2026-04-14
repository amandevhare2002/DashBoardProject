import { Resizable } from "re-resizable";
import React, { useEffect, useRef, useState } from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label, Input } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";

export function BoxField({
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
  saveData,
  setSaveData,
  calculateFormula,
  isPDFPreviewOpen,
  fieldValue,
  isMobile,
}: any) {
  const [regexError, setRegexError] = useState<string | null>(null);
  const [localValue, setLocalValue] = useState<string>("");

  // Refs to track user interaction and prevent loops
  const isUserTypingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgrammaticUpdateRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  const hasError =
    (!saveData[field.FieldName] && field.IsMandatory) || field.hasError;

  // Validate regex function
  const validateRegex = (value: string) => {
    if (!field?.Regex) return true;
    try {
      const regex = new RegExp(field.Regex);
      return regex.test(value);
    } catch (error) {
      console.error("Invalid Regex:", field.Regex);
      return true;
    }
  };

  // Initialize local value from saveData (only once)
  useEffect(() => {
    if (!isInitializedRef.current) {
      const initialValue = saveData[field.FieldName] || "";
      setLocalValue(initialValue);
      isInitializedRef.current = true;
    }
  }, [field.FieldName, saveData]);

  // Update local value when saveData changes (but not during user typing)
  useEffect(() => {
    // Skip if not initialized
    if (!isInitializedRef.current) return;

    // Skip if user is currently typing
    if (isUserTypingRef.current) return;

    // Skip if this is a programmatic update we just made
    const newValue = saveData[field.FieldName] || "";
    if (lastProgrammaticUpdateRef.current === newValue) {
      lastProgrammaticUpdateRef.current = null;
      return;
    }

    // Update local value if different
    if (localValue !== newValue) {
      setLocalValue(newValue);
    }
  }, [saveData[field.FieldName], field.FieldName, localValue]);

  // Handle formula calculations (only when NOT typing)
  useEffect(() => {
    // Only for formula fields
    if (!field.IsFormulaApply || !field.Formula || !calculateFormula) {
      return;
    }

    // Don't apply formula while user is typing
    if (isUserTypingRef.current) {
      return;
    }

    // Calculate formula based on OTHER fields
    const calculatedValue = calculateFormula(field.Formula, saveData);

    if (calculatedValue !== null && calculatedValue !== undefined) {
      const calculatedStr = String(calculatedValue);
      const currentValue = saveData[field.FieldName];

      // Only update if different
      if (currentValue !== calculatedStr) {
        // Mark this as a programmatic update
        lastProgrammaticUpdateRef.current = calculatedStr;

        // Update local value
        setLocalValue(calculatedStr);

        // Update saveData without triggering handleInputChange (to avoid loops)
        setSaveData((prev: any) => ({
          ...prev,
          [field.FieldName]: calculatedStr,
        }));

        // Only call handleInputChange if it's not a user edit
        if (handleInputChange && !isUserTypingRef.current) {
          handleInputChange(
            {
              target: {
                name: field.FieldName,
                value: calculatedStr,
              },
            },
            false,
          );
        }
      }
    }
  }, [
    saveData,
    field.IsFormulaApply,
    field.Formula,
    calculateFormula,
    field.FieldName,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Clear regex error
    if (!newValue) {
      setRegexError(null);
    } else {
      const isValid = validateRegex(newValue);
      if (!isValid) {
        setRegexError(field.RegexMessage || "Invalid format");
      } else {
        setRegexError(null);
      }
    }

    // Mark that user is typing
    isUserTypingRef.current = true;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update local value immediately for responsive UI
    setLocalValue(newValue);

    // Update saveData
    setSaveData((prev: any) => ({
      ...prev,
      [field.FieldName]: newValue,
    }));

    // Call handleInputChange for side effects (validation, etc.)
    if (handleInputChange) {
      handleInputChange(e, false);
    }

    // Reset typing flag after user stops typing
    timeoutRef.current = setTimeout(() => {
      isUserTypingRef.current = false;

      // After user stops typing, if this is a formula field, apply formula one more time
      if (field.IsFormulaApply && field.Formula && calculateFormula) {
        const calculatedValue = calculateFormula(field.Formula, saveData);
        if (calculatedValue !== null && calculatedValue !== undefined) {
          const calculatedStr = String(calculatedValue);
          if (newValue !== calculatedStr) {
            lastProgrammaticUpdateRef.current = calculatedStr;
            setLocalValue(calculatedStr);
            setSaveData((prev: any) => ({
              ...prev,
              [field.FieldName]: calculatedStr,
            }));
          }
        }
      }
    }, 800); // Longer delay to ensure typing is complete
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Positioning calculations (same as before)
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

  const safeRowNum = Math.max(0, parseInt(rowNum.toString()) || 0);
  const safeColNum = Math.max(0, parseInt(colNum.toString()) || 0);
  const safeWidth = parseInt(fieldWidth.toString().replace("px", "")) || 100;
  const safeHeight = parseInt(fieldHeight.toString().replace("px", "")) || 20;
  const showBorder = field.IsBorderApply !== false;
  const borderColor = hasError ? "#dc3545" : field.bordercolor;

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
        key={i}
        className=""
        data-field-id={field.FieldID}
        style={{ position: "relative" }}
      >
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
            {field.IsFieldNamePrint ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: field.Align,
                  width: "100%",
                  marginTop: "-25px",
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
                {isDrag && field.IsEdit && (
                  <AiFillEdit
                    onClick={() => {
                      setModalData({
                        app_id: field.FieldID,
                        ModuleID: information?.Data?.[0]?.StrucureModuleID,
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
              id={field?.FieldName}
              invalid={field.error || hasError || !!regexError}
              name={field?.FieldName}
              value={localValue}
              placeholder={field.IsWatermarkPrint ? field.WatermarkText : ""}
              type={
                field.FieldName === "DateofBirth"
                  ? "date"
                  : field.ValueType === "TEXT"
                    ? "text"
                    : field.ValueType === "NUMERIC"
                      ? "number"
                      : "text"
              }
              onChange={handleChange}
              style={{
                height: displaySize.height,
                width: displaySize.width,
                textAlign: field.TextAlignment,
                backgroundColor: hasError ? "#fff5f5" : field.Fieldbgcolor,
                color: field.TextFontColor,
                fontSize: `${field.TextFontSize}px`,
                fontWeight: field.IsTextBold ? 700 : "normal",
                textDecoration: field.IsTextUnderLine ? "underline" : "none",
                fontStyle: field.IsTextItalic ? "italic" : "normal",
                fontFamily: field.TextFontname,
                marginBottom: 20,
                marginLeft: "-20px",
                border: showBorder ? `1px solid ${borderColor}` : "none",
                borderRadius:
                  field?.Shape === "ROUNDED"
                    ? "8px"
                    : field?.Shape === "CIRCLE"
                      ? "50%"
                      : field?.Shape === "PILL"
                        ? "9999px"
                        : "0",
              }}
              disabled={isDrag || !isModify || field?.IsReadonly}
              className={`${field.ClsIcon} ${hasError ? "is-invalid" : ""}`}
            />
          </BoxComponent>
        </FormGroup>
        {(hasError || regexError) && (
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
            {hasError ? `${field.FieldName} is required` : regexError}
          </div>
        )}
      </div>
    </Resizable>
  );
}
