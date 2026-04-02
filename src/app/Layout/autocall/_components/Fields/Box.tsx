import { Resizable } from "re-resizable";
import React, { useEffect } from "react";
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
  const [regexError, setRegexError] = React.useState<string | null>(null);
  const hasError =
    (!saveData[field.FieldName] && field.IsMandatory) || field.hasError;
  const validateRegex = (value: string) => {
    if (!field?.Regex) return true;

    try {
      const regex = new RegExp(field.Regex);
      return regex.test(value);
    } catch (error) {
      console.error("Invalid Regex:", field.Regex);
      return true; // fail-safe: don't block input
    }
  };

  useEffect(() => {
    if (field.IsFormulaApply && field.Formula && calculateFormula) {
      const calculatedValue = calculateFormula(field.Formula, saveData);
      if (calculatedValue !== null && calculatedValue !== undefined) {
        // Update the field value if it's different from current
        if (saveData[field.FieldName] !== calculatedValue) {
          handleInputChange(
            {
              target: {
                name: field.FieldName,
                value: calculatedValue,
              },
            },
            false,
          );
        }
      }
    }
  }, [saveData, field.IsFormulaApply, field.Formula]);

  const handleChange = (e: any) => {
    setSaveData((prev: any) => ({
      ...prev,
      [field.FieldName]: e.target.value,
    }));
  };

  // Your important positioning calculations
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
  const showBorder = field.IsBorderApply !== false;
  const borderColor = hasError ? "#dc3545" : field.bordercolor;

  // Determine dimensions based on device - this will update immediately when isMobile changes
  const getFieldDimensions = () => {
    if (isMobile && !isPDFPreviewOpen) {
      console.log("Using mobile dimensions for", field.FieldName);
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

  // Calculate the actual pixel values for rendering
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
                    color: hasError ? "#dc3545" : field.fontcolor, // Fixed: Added error color
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
                    <span
                      style={{
                        color: hasError ? "#dc3545" : "red", // Fixed: Added error color
                      }}
                    >
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

            <Input
              id={field?.FieldName}
              invalid={field.error || hasError || !!regexError}
              name={field?.FieldName}
              value={saveData[field.FieldName]}
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
              onChange={(e) => {
                const value = e.target.value;

                // Regex validation
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
            {hasError ? "This field is required" : regexError}
          </div>
        )}
      </div>
    </Resizable>
  );
}
