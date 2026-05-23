import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { Resizable } from "re-resizable";
import React, { useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { Label, InputGroup } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
import { toast } from "react-toastify";

export function DateField({
  style,
  field,
  onResize,
  isDrag,
  setModalData,
  setIsModalOpen,
  faCalendarAlt,
  isModify,
  saveData,
  setSaveData,
  information,
  isSearch = false,
  onChange,
  searchValues,
  setSearchValues,
  isPDFPreviewOpen,
  isMobile,
}: any) {
  const hasError = field.hasError || false;
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;
  const [inputValue, setInputValue] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");

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

  // Determine dimensions based on device
  const getFieldDimensions = () => {
    if (isMobile && !isPDFPreviewOpen) {
      return {
        width: `${field.MWidth}%` || "100%",
        height: `${safeHeight}px`,
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

  // For single date (regular usage)
  const getSelectedDate = () => {
    if (!saveData || !field?.FieldName) return null;
    const dateValue = saveData[field.FieldName];
    if (!dateValue) return null;

    try {
      const momentDate = moment(dateValue, "YYYY-MM-DD", true);
      if (momentDate.isValid()) return momentDate.toDate();

      const jsDate = new Date(dateValue);
      return isNaN(jsDate.getTime()) ? null : jsDate;
    } catch {
      return null;
    }
  };

  // Initialize input value from saveData
  useEffect(() => {
    if (saveData && field?.FieldName) {
      const currentValue = saveData[field.FieldName] || "";
      setInputValue(currentValue.toString());
    }
  }, [saveData, field?.FieldName]);

  // Initialize date range from searchValues if in search mode
  useEffect(() => {
    if (isSearch && field?.IsDateRange && searchValues[field.FieldName]) {
      const values = searchValues[field.FieldName];
      if (Array.isArray(values) && values.length >= 2) {
        setDateRange([
          values[0]?.Value ? new Date(values[0].Value) : null,
          values[1]?.Value ? new Date(values[1].Value) : null,
        ]);
      }
    }
  }, [isSearch, field, searchValues]);

  // Validate date against regex
  const validateDate = (dateString: string) => {
    // ❌ If no regex → do nothing
    if (!field.Regex) {
      setValidationError("");
      return true;
    }

    // ✅ If empty → clear error
    if (!dateString || dateString.trim() === "") {
      setValidationError("");
      return true;
    }

    try {
      const regex = new RegExp(field.Regex);
      const isValid = regex.test(dateString);

      if (!isValid) {
        const errorMessage = field.RegexMessage || "Invalid format"; // ✅ fallback msg
        setValidationError(errorMessage);
        return false;
      }

      setValidationError("");
      return true;
    } catch (error) {
      setValidationError("Invalid regex pattern");
      return false;
    }
  };
  const handleManualInput = (value: string) => {
    setInputValue(value || "");

    // Validate as user types
    if (value && value.trim() !== "") {
      validateDate(value);
    } else {
      setValidationError("");
    }
  };

  const handleManualInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e?.target?.value || "";

    if (value && value.trim() !== "") {
      const isValid = validateDate(value);

      if (isValid) {
        // Try to parse the date
        const momentDate = moment(
          value,
          ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"],
          true,
        );
        if (momentDate.isValid()) {
          const formattedDate = momentDate.format("YYYY-MM-DD");
          setSaveData((prev: any) => ({
            ...prev,
            [field.FieldName]: formattedDate,
          }));
          setValidationError("");
        } else {
          // ✅ Only show error if regex exists
          if (field.Regex) {
            const errorMessage = field.RegexMessage || "Invalid format";
            setValidationError(errorMessage);
          }
        }
      }
    } else {
      // Clear the field if empty
      setSaveData((prev: any) => ({
        ...prev,
        [field.FieldName]: null,
      }));
      setValidationError("");
    }
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    setDateRange(dates);

    if (isSearch && field?.FieldName) {
      const formattedDates = dates.map((date) => {
        if (date) {
          const formattedDate = moment(date).format("YYYY-MM-DD");

          // Validate each date against regex
          if (field.Regex) {
            const regex = new RegExp(field.Regex);
            if (!regex.test(formattedDate)) {
              const errorMessage = field.RegexMessage;
              toast.error(errorMessage, { style: { top: 80 } });
              return { Value: "", ErrorMessage: errorMessage };
            }
          }

          return { Value: formattedDate };
        } else {
          return { Value: "" };
        }
      });

      setSearchValues((prev: any) => ({
        ...prev,
        [field.FieldName]: formattedDates,
      }));
    }
  };

  const handleSingleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      setInputValue(formattedDate);

      // Validate against regex
      if (field.Regex) {
        const regex = new RegExp(field.Regex);
        if (!regex.test(formattedDate)) {
          const errorMessage = field.RegexMessage;
          setValidationError(errorMessage);
          return;
        }
      }

      setSaveData((prev: any) => ({
        ...prev,
        [field.FieldName]: formattedDate,
      }));
      setValidationError("");
    } else {
      // Clear the field
      setInputValue("");
      setSaveData((prev: any) => ({
        ...prev,
        [field.FieldName]: null,
      }));
      setValidationError("");
    }
  };

  // Determine which picker to show
  const showRangePicker = isSearch;

  // For manual input styling
  const getInputStyle = () => {
    const baseStyle: React.CSSProperties = {
      height: displaySize.height,
      width: displaySize.width,
      backgroundColor: field.Fieldbgcolor || "#fff",
      color: field.TextFontColor || "#000",
      fontSize: `${field.TextFontSize || 14}px`,
      fontFamily: field.Fontname || "inherit",
      border:
        hasError || validationError
          ? "2px solid #dc3545"
          : `1px solid ${field.bordercolor}`,
      borderRadius:
        field?.Shape === "ROUNDED"
          ? "8px"
          : field?.Shape === "CIRCLE"
            ? "50%"
            : field?.Shape === "PILL"
              ? "9999px"
              : "0",
      padding: "0.375rem 0.75rem",
      boxSizing: "border-box",
    };

    if (hasError || validationError) {
      baseStyle.backgroundColor = "#fff5f5";
    }

    return baseStyle;
  };

  const getDatePickerStyle = () => {
    return {
      height: displaySize.height,
      width: displaySize.width,
      borderRadius:
        field?.Shape === "ROUNDED"
          ? "8px"
          : field?.Shape === "CIRCLE"
            ? "50%"
            : field?.Shape === "PILL"
              ? "9999px"
              : "0",
      padding: "0.375rem 0.75rem",
      fontSize: `${field.TextFontSize}px`,
      fontFamily: field.Fontname || "inherit",
      color: field.TextFontColor || "#000",
      backgroundColor: field.Fieldbgcolor || "#fff",
    };
  };

  return (
    <>
      {/* <style>
        {`
.custom-date-input {
  background-color: ${field.Bgcolor} !important;
}
`}
      </style> */}
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
          left: isMobile && !isPDFPreviewOpen ? style.left : `${safeRowNum}px`,
          top: isMobile && !isPDFPreviewOpen ? style.top : `${safeColNum}px`,
          zIndex: isDrag ? 1000 : "",
          paddingLeft: 0,
          // marginLeft: "-10px",
          border:
            hasError || validationError ? "2px solid #dc3545" : style.border,
          backgroundColor:
            hasError || validationError ? "#fff5f5" : style.backgroundColor,
        }}
        size={{
          width: displaySize.width,
          height: displaySize.height,
        }}
        onResizeStop={(e, direction, ref, d) =>
          onResize(e, direction, ref, d, field)
        }
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
            height: "100%",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: field.LabelDirection,
              gap: 4,
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: field.Align,
                marginTop: "-25px",
              }}
            >
              <Label
                for={field?.FieldName}
                className="bold max-w-fit"
                style={{
                  color:
                    hasError || validationError ? "#dc3545" : field.fontcolor,
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
                      color: hasError || validationError ? "#dc3545" : "red",
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
            <InputGroup style={{ width: "100%" }}>
              <div className="input-group-text">
                <FontAwesomeIcon icon={faCalendarAlt as any} />
              </div>

              {showRangePicker ? (
                <ReactDatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleDateRangeChange}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date range"
                  isClearable
                  disabled={isDrag || !isModify}
                  className={`custom-date-input h-${displaySize.height} w-${displaySize.width} form-control ${hasError || validationError ? "error-datepicker" : ""}`}
                  withPortal
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  style={getDatePickerStyle()}
                />
              ) : (
                <ReactDatePicker
                  selected={getSelectedDate()}
                  onChange={handleSingleDateChange}
                  dateFormat="yyyy-MM-dd"
                  placeholderText={field?.FieldName}
                  isClearable
                  disabled={isDrag || !isModify}
                  className={`custom-date-input  h-${displaySize.height} w-${displaySize.width} form-control ${hasError || validationError ? "error-datepicker" : ""}`}
                  withPortal
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  openToDate={
                    field.EndDate ? new Date(field.EndDate) : undefined
                  }
                  minDate={field.EnableFutureDate ? new Date() : undefined}
                  maxDate={
                    field.EnableFutureDate
                      ? field.EndDate
                        ? new Date(field.EndDate)
                        : undefined
                      : field.EndDate
                        ? new Date(field.EndDate)
                        : new Date()
                  }
                  // Enable manual text input
                  onChangeRaw={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e && e.target) {
                      const value = e.target.value || "";
                      handleManualInput(value);
                    }
                  }}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                    handleManualInputBlur(e);
                  }}
                  value={inputValue || ""}
                  customInput={
                    <input
                      type="text"
                      style={getInputStyle()}
                      onChange={(e) => handleManualInput(e.target.value)}
                      onBlur={handleManualInputBlur}
                      value={inputValue}
                    />
                  }
                  style={getDatePickerStyle()}
                />
              )}
            </InputGroup>
          </div>
        </BoxComponent>

        {(hasError || validationError) && (
          <div
            style={{
              color: "#dc3545",
              fontSize: "12px",
              marginTop: "4px",
              position: "absolute",
              bottom: "-22px",
              left: "0",
              width: "100%",
            }}
          >
            {validationError || "This field is required"}
          </div>
        )}
      </Resizable>
    </>
  );
}
