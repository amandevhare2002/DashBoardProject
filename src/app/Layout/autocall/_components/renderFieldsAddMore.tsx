import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox, RadioGroup, Radio } from "@mui/material";
import moment from "moment";
import ReactDatePicker from "react-datepicker";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import AsyncSelect from "react-select/async";
import { Button, FormGroup, Input, InputGroup, Label } from "reactstrap";
import Tooltip from "rc-tooltip";
import { useMemo } from "react";
import { debounce } from "@/utils/ddebounce";
import axios from "axios";
import { toast } from "react-toastify";

export const RenderFieldsAddMore = ({
  field,
  i,
  updatedPersonalDetails,
  value,
  isDrag,
  setModalData,
  setIsModalOpen,
  saveData,
  information,
  isOpen,
  promiseOptions,
  onInputChange,
  setColumnSelect,
  handleCalculateData,
  calculateFormula,
  isModify,
  setUpdatedPersonalDetails,
  setSaveData,
  evaluateFormula,
  groupName,
  AddMoreEvaluateFormula,
  handleSelectChangeAddMore,
  confirm,
  menuID,
  menuIDQuery,
  addMoreSaveData,
  setAddMoreSaveData,
  isMobile,
  applyAllFormulas,
}: any) => {
  console.log("ADdMOreFIELD", field.FieldName);

  // Add this field name mapping at the top of your component
  const fieldNameMapping: { [key: string]: string } = {
    CustMargin: "CustomerMargin",
    // Add other mappings as needed
  };

  const calculateAddMoreFormula = (
    field: any,
    currentIndex: number,
    updatedData: any,
  ) => {
    if (!field.IsFormulaApply || !field.Formula) return updatedData;

    try {
      // Create a comprehensive data object with ALL field values
      const currentValues: any = {};

      // Collect values from ALL fields - map by BOTH Colname AND FieldName
      updatedData.forEach((dataTab: any, tabIndex: number) => {
        dataTab.Values.forEach((tabField: any) => {
          if (tabField.IsAddMore && tabField.AddMoreGroup === groupName) {
            const fieldValue = tabField.addmorevalues[currentIndex]?.FieldValue;
            const numericValue = isNaN(Number(fieldValue))
              ? 0
              : Number(fieldValue);

            // Store by FieldName
            currentValues[tabField.FieldName] = numericValue;
            // ALSO store by Colname for formula lookup
            currentValues[tabField.Colname] = numericValue;
            currentValues[tabField.ReadColname] = numericValue;
          } else if (!tabField.IsAddMore) {
            const fieldValue =
              tabField.FieldValue || saveData[tabField.FieldName];
            const numericValue = isNaN(Number(fieldValue))
              ? 0
              : Number(fieldValue);

            currentValues[tabField.FieldName] = numericValue;
            currentValues[tabField.Colname] = numericValue;
            currentValues[tabField.ReadColname] = numericValue;
          }
        });
      });

      // Build the expression from formula parts
      const expressionParts = field.Formula.map((part: any) => {
        if (typeof part === "object" && part.label !== undefined) {
          // Skip empty labels
          if (
            part.label === "" ||
            part.label === null ||
            part.label === undefined
          ) {
            return "";
          }

          // Check if it's a numeric value
          if (!isNaN(part.label)) {
            return part.label;
          }

          // Check if it's an operator or special character
          const operators = ["+", "-", "*", "/", "(", ")", "[", "]", "{", "}"];
          if (operators.includes(part.label.trim())) {
            return part.label;
          }

          // Try to find value by Colname first, then by FieldName
          let fieldValue;

          // First try Colname (current formula format)
          fieldValue = currentValues[part.label];

          // If not found by Colname, try to find matching FieldName
          if (fieldValue === undefined) {
            // Search for field with this Colname to get its FieldName
            let matchingFieldName = null;
            updatedData.forEach((dataTab: any) => {
              dataTab.Values.forEach((tabField: any) => {
                if (
                  tabField.Colname === part.label ||
                  tabField.ReadColname === part.label
                ) {
                  matchingFieldName = tabField.FieldName;
                }
              });
            });

            if (matchingFieldName) {
              fieldValue = currentValues[matchingFieldName];
            }
          }

          if (fieldValue !== undefined) {
            console.log(`✓ Using "${part.label}" with value: ${fieldValue}`);
            return fieldValue;
          } else {
            console.warn(`✗ Field "${part.label}" not found in values!`);
            return "0";
          }
        } else {
          return part.label || part || "";
        }
      });

      // Join and clean up the expression
      let expression = expressionParts.join(" ").replace(/\s+/g, " ").trim();

      // Remove any double spaces and ensure proper formatting
      expression = expression.replace(/\s*([+\-*/()])\s*/g, " $1 ");

      // Remove empty parentheses and fix expression syntax
      expression = expression.replace(/\(\s*\)/g, "").trim();

      if (!expression || expression === "" || expression === "()") {
        return updatedData;
      }

      try {
        // Use safer evaluation
        const result = new Function("return " + expression)();
        const finalResult = isNaN(result) ? 0 : Number(result);
        const formattedResult = finalResult.toFixed(2);

        // Manual verification
        const conversionAmount = currentValues.ConversionAmount || 0;
        const customerMargin = currentValues.CustomerMargin || 0; // Using correct field name
        const forexAmount = currentValues.ForexAmount || 0;
        const manualCalc = (conversionAmount + customerMargin) * forexAmount;
        console.log(
          `🧪 MANUAL VERIFICATION: (${conversionAmount} + ${customerMargin}) * ${forexAmount} = ${manualCalc}`,
        );

        // Update the field with calculated result
        updatedData[value].Values = updatedData[value].Values.map(
          (res: any) => {
            if (
              res.FieldID === field.FieldID &&
              res.AddMoreGroup === groupName
            ) {
              const updatedAddMoreValues = res.addmorevalues.map(
                (addMore: any, idx: number) => {
                  if (idx === currentIndex) {
                    return {
                      ...addMore,
                      FieldValue: formattedResult.toString(),
                    };
                  }
                  return addMore;
                },
              );
              return {
                ...res,
                addmorevalues: updatedAddMoreValues,
              };
            }
            return res;
          },
        );
      } catch (error) {
        console.error(
          `❌ Error evaluating formula for ${field.FieldName}:`,
          error,
        );
        console.error("Failed expression:", expression);
      }
    } catch (error) {
      console.error(
        `💥 Error in calculateAddMoreFormula for ${field.FieldName}:`,
        error,
      );
    }

    return updatedData;
  };

  const handleAddMoreInputChange = (e: any, fieldType: string = "BOX") => {
    // Extract the value from the event
    const targetValue = e?.target?.value !== undefined ? e.target.value : e;

    const nextState: any = JSON.parse(JSON.stringify(updatedPersonalDetails));

    // Update the current add-more field
    nextState[value].Values = nextState[value].Values.map((res: any) => {
      if (res.AddMoreGroup === groupName && field.FieldName === res.FieldName) {
        const updatedValue = res.addmorevalues.map(
          (response: any, index: number) => {
            if (index === i) {
              return {
                ...response,
                FieldValue: targetValue,
              };
            }
            return response;
          },
        );

        return {
          ...res,
          addmorevalues: updatedValue,
        };
      }
      return res;
    });

    // Handle calculation API calls
    if (field.IscalcapiCall) {
      handleCalculateData(field, i, targetValue);
    }

    // Update saveData for add-more values
    const updatedSaveData = { ...saveData };

    // Collect all add-more values for the current row
    nextState[value].Values.forEach((res: any) => {
      if (
        res.IsAddMore &&
        res.AddMoreGroup === groupName &&
        res.addmorevalues[i]
      ) {
        updatedSaveData[res.FieldName] = res.addmorevalues[i].FieldValue;
      }
    });

    // Apply formulas for regular fields that depend on add-more fields
    // Pass the current add-more index to calculate formulas for regular fields
    const calculatedSaveData = applyAllFormulas(updatedSaveData, nextState, i);

    setUpdatedPersonalDetails(nextState);
    setSaveData(calculatedSaveData);

    let state = {
      ...addMoreSaveData,
      [`${field.FieldName}_${i}`]: targetValue,
    };
    setAddMoreSaveData(state);
  };
  const getFieldsWithStyle = (field: any, isMobile: boolean) => {
    if (isMobile && field.MWidth) {
      return `${field.MWidth}%`;
    }
    return field.Width ? `${field.Width}%` : "100%";
  };

  const getResponsiveStyles = (field: any, isMobile: boolean) => {
    return {
      width: getFieldsWithStyle(field, isMobile),
      minWidth: isMobile && field.MWidth ? `${field.MWidth}px` : "auto",
      maxWidth: "100%", // Ensure it doesn't overflow on mobile
    };
  };

  switch (field?.FieldType) {
    case "LABEL":
      return (
        <div key={i} className="">
          <FormGroup
            key={field?.FieldName}
            style={{
              textAlign: field.Align,
              flexDirection: field.LabelDirection,
              ...getResponsiveStyles(field, isMobile),
            }}
          >
            {field.IsFieldNamePrint ? (
              <div
                style={{
                  alignItems: "center",
                  justifyContent: field.Align,
                  width: "100%",
                  gap: 4,
                }}
              >
                {i === 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: field.Align,
                      width: "100%",
                      gap: 4,
                    }}
                  >
                    <Label
                      for={field?.FieldName}
                      className="bold max-w-fit"
                      style={{
                        color: field.fontcolor,
                        backgroundColor: field.Bgcolor,
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
                          {isDrag && field.IsEdit && (
                            <AiFillEdit
                              onClick={() => {
                                setModalData({
                                  app_id: field.FieldID,
                                  ModuleID:
                                    information.Data[0]?.StrucureModuleID,
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
                      </Tooltip>
                    )}
                  </div>
                )}

                {/* Show the actual label value for all rows */}
                <p
                  style={{
                    backgroundColor: field.Fieldbgcolor,
                    fontSize: `${field.TextFontSize}px`,
                    color: field.TextFontColor,
                    margin: 0,
                    fontWeight: field.IsTextBold ? 700 : "normal",
                    textDecoration: field.IsTextUnderLine
                      ? "underline"
                      : "none",
                    fontStyle: field.IsTextItalic ? "italic" : "normal",
                    padding: 5,
                    minHeight: "20px", // Ensure consistent height
                    width: "100%",
                    borderRadius:
                      field?.Shape === "ROUNDED"
                        ? "8px"
                        : field?.Shape === "CIRCLE"
                          ? "50%"
                          : field?.Shape === "PILL"
                            ? "9999px"
                            : "0",
                  }}
                >
                  {field?.addmorevalues[i]?.FieldValue ||
                    field.FieldValue ||
                    ""}
                </p>
              </div>
            ) : (
              // If IsFieldNamePrint is false, just show the value
              <p
                style={{
                  backgroundColor: field.Fieldbgcolor,
                  fontSize: `${field.TextFontSize}px`,
                  color: field.TextFontColor,
                  margin: 0,
                  fontWeight: field.IsTextBold ? 700 : "normal",
                  textDecoration: field.IsTextUnderLine ? "underline" : "none",
                  fontStyle: field.IsTextItalic ? "italic" : "normal",
                  padding: 5,
                  minHeight: "20px",
                  width: "100%",
                  textAlign: field.Align,
                  borderRadius:
                    field?.Shape === "ROUNDED"
                      ? "8px"
                      : field?.Shape === "CIRCLE"
                        ? "50%"
                        : field?.Shape === "PILL"
                          ? "9999px"
                          : "0",
                }}
              >
                {field?.addmorevalues[i]?.FieldValue || field.FieldValue || ""}
              </p>
            )}
          </FormGroup>
        </div>
      );
    case "CHECKBOX":
      return (
        <div key={i} className="">
          <FormGroup
            key={field?.FieldName}
            disabled={!isModify}
            style={{
              textAlign: field.Align,
              flexDirection: field.LabelDirection,
              ...getResponsiveStyles(field, isMobile),
            }}
          >
            {field.IsFieldNamePrint ? (
              <div
                style={{
                  alignItems: "center",
                  justifyContent: field.Align,
                  width: "100%",
                  gap: 4,
                }}
              >
                <Input
                  type="checkbox"
                  checked={
                    field?.addmorevalues[
                      i
                    ]?.FieldValue?.toString()?.toLowerCase() === "true"
                  }
                  onChange={(e) => {
                    const nextState: any = structuredClone(
                      updatedPersonalDetails,
                    );

                    nextState[value].Values = nextState[value].Values.map(
                      (res: any) => {
                        if (
                          res.AddMoreGroup === groupName &&
                          field.FieldName === res.FieldName
                        ) {
                          const updatedValue = res.addmorevalues.map(
                            (response: any, index: number) => {
                              if (index === i) {
                                return {
                                  ...response,
                                  FieldValue: e.target.checked,
                                };
                              }
                              return response;
                            },
                          );

                          return {
                            ...res,
                            addmorevalues: updatedValue,
                          };
                        }
                        return res;
                      },
                    );

                    if (field.IscalcapiCall) {
                      handleCalculateData(field, i, e.target.checked);
                    }

                    setUpdatedPersonalDetails(nextState);

                    // Update the saveData if needed
                    let state = {
                      ...saveData,
                      [field.FieldName]: e.target.checked,
                    };
                    setSaveData(state);
                  }}
                  disabled={!isModify || field?.IsReadonly}
                />

                <Label
                  for={field?.FieldName}
                  className="bold max-w-fit"
                  style={{
                    color: field.fontcolor,
                    backgroundColor: field.Bgcolor,
                    fontWeight: field.IsBold ? 700 : "normal",
                    textDecoration: field.IsUnderline ? "underline" : "none",
                    fontStyle: field.IsItallic ? "italic" : "normal",
                    fontSize: `${field.FontSize}px`,
                    fontFamily: field.Fontname,
                    borderRadius:
                      field?.Shape === "ROUNDED"
                        ? "8px"
                        : field?.Shape === "CIRCLE"
                          ? "50%"
                          : field?.Shape === "PILL"
                            ? "9999px"
                            : "0",
                  }}
                >
                  {field.IsMandatory ? (
                    <span style={{ color: "red" }}>*</span>
                  ) : null}
                </Label>

                {field.ToolTip && (
                  <Tooltip overlay={<Label>{field.ToolTip}</Label>}>
                    <div
                      style={{ display: "flex", gap: 2, alignItems: "center" }}
                    >
                      <AiFillInfoCircle
                        style={{
                          marginBottom: 2,
                          marginLeft: 10,
                          cursor: "pointer",
                        }}
                      />
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
                  </Tooltip>
                )}
              </div>
            ) : null}
          </FormGroup>
        </div>
      );
    case "BOX":
      return field.DefaultVisible ? (
        <div key={`${field.FieldName}-${i}`} className="">
          <FormGroup
            key={`${field.FieldName}-formgroup-${i}`}
            disabled={!isModify}
            style={{
              fontSize: `${field.TextFontSize}px`,
              alignItems: "center",
              ...getResponsiveStyles(field, isMobile),
            }}
          >
            {i === 0 && (
              <div
                style={{
                  alignItems: "center",
                  width: "100%",
                  justifyContent: field.Align,
                }}
              >
                <Label
                  for={field?.FieldName}
                  className="bold max-w-fit"
                  style={{
                    color: field.fontcolor,
                    backgroundColor: field.Bgcolor,
                    fontWeight: field.IsBold ? 700 : "normal",
                    textDecoration: field.IsUnderline ? "underline" : "none",
                    fontStyle: field.IsItallic ? "italic" : "normal",
                    fontSize: `${field.FontSize}px`,
                    fontFamily: field.Fontname,
                    flexDirection: field.Align,
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
                  </Tooltip>
                )}
              </div>
            )}
            <Input
              id={field?.FieldName}
              name={field?.FieldName}
              value={field?.addmorevalues[i]?.FieldValue}
              placeholder={field?.FieldName}
              style={{
                textAlign: field.TextAlignment,
                height: `${Number(
                  field?.Height?.toString().split("px")[0] || 100,
                )}`,
                backgroundColor: !isModify ? "#e9ecef" : field.Fieldbgcolor,
                color: field.TextFontColor,
                fontSize: `${field.TextFontSize}px`,
                fontWeight: field.IsTextBold ? 700 : "normal",
                textDecoration: field.IsTextUnderLine ? "underline" : "none",
                fontStyle: field.IsTextItalic ? "italic" : "normal",
                borderRadius:
                  field?.Shape === "ROUNDED"
                    ? "8px"
                    : field?.Shape === "CIRCLE"
                      ? "50%"
                      : field?.Shape === "PILL"
                        ? "9999px"
                        : "0",
              }}
              type={field.FieldName === "DateofBirth" ? "date" : "text"}
              onChange={(e) => handleAddMoreInputChange(e, "BOX")}
              disabled={field?.IsMainCol || field.IsFormulaApply} // Disable if it's a formula field
              readOnly={field.IsFormulaApply} // Make read-only for formula fields
            />
          </FormGroup>
        </div>
      ) : null;
    case "DROPDOWN":
      return field.DefaultVisible ? (
        <div key={`${field.FieldName}-${i}`} className="">
          <div
            style={{
              alignItems: "center",
              flexDirection: field.LabelDirection,
              justifyContent: field.Align,
              ...getResponsiveStyles(field, isMobile),
            }}
          >
            {i === 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: field.Align,
                }}
              >
                <Label
                  for={field?.FieldName}
                  className="bold max-w-fit"
                  style={{
                    color: field.fontcolor,
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
                  </Tooltip>
                )}
              </div>
            )}

            <AsyncSelect
              loadOptions={(inputValue) => {
                return promiseOptions(inputValue, i, true);
              }}
              menuPortalTarget={
                isOpen
                  ? (document.querySelector(".MuiDialog-root") as HTMLElement)
                  : document.body
              }
              menuPosition="fixed"
              isDisabled={!isModify}
              menuPlacement="top"
              defaultOptions={field.DropdownArray}
              onChange={(e: any) => {
                handleSelectChangeAddMore(
                  e,
                  field,
                  value,
                  updatedPersonalDetails,
                  i,
                );
              }}
              value={{
                label: field?.addmorevalues[i]?.FieldValue,
                value: field?.addmorevalues[i]?.FieldValue,
              }}
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  textAlign: field.TextAlignment,
                  backgroundColor: !isModify ? "#e9ecef" : field.TextBgcolor,
                  color: field.TextFontColor,
                  fontWeight: field.IsBold ? 700 : "normal",
                  textDecoration: field.IsUnderline ? "underline" : "none",
                  fontStyle: field.IsItallic ? "italic" : "normal",
                  fontSize: `${field.FontSize}px`,
                  borderRadius:
                    field?.Shape === "ROUNDED"
                      ? "8px"
                      : field?.Shape === "CIRCLE"
                        ? "50%"
                        : field?.Shape === "PILL"
                          ? "9999px"
                          : "0",
                  ...getResponsiveStyles(field, isMobile),
                }),
                menu: () => ({
                  boxShadow: "inset 0 1px 0 rgba(0, 0, 0, 0.1)",
                }),
                menuPortal: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: "white",
                  zIndex: "9999",
                }),
              }}
              onInputChange={(val) => onInputChange(field?.FieldID)}
              noOptionsMessage={() => "No Suggestions"}
              onFocus={() => {
                setColumnSelect(field?.FieldID);
              }}
              className="w-full"
            />
          </div>
        </div>
      ) : null;
    case "DATE":
      const date = field?.addmorevalues[i]?.FieldValue
        ? moment(field?.addmorevalues[i]?.FieldValue).format("YYYY-MM-DD")
        : null;
      return field.DefaultVisible ? (
        <div
          style={{
            alignItems: "center",
            flexDirection: field.LabelDirection,
            ...getResponsiveStyles(field, isMobile),
          }}
        >
          {i === 0 && (
            <div style={{ alignItems: "center" }}>
              <Label
                for={field?.FieldName}
                className="bold max-w-fit"
                style={{
                  color: field.fontcolor,
                  fontWeight: field.IsBold ? 700 : "normal",
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
                    style={{ display: "flex", gap: 2, alignItems: "center" }}
                  >
                    <AiFillInfoCircle
                      style={{
                        marginBottom: 2,
                        marginLeft: 10,
                        cursor: "pointer",
                      }}
                    />
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
                </Tooltip>
              )}
            </div>
          )}
          <InputGroup>
            <div className="input-group-text ">
              <FontAwesomeIcon icon={faCalendarAlt as any} />
            </div>
            <ReactDatePicker
              className="form-control"
              dateFormat="yyyy-MM-dd"
              disabled={!isModify}
              withPortal
              selected={date ? new Date(date) : null}
              onChange={(e: any) => {
                const nextState: any = structuredClone(updatedPersonalDetails);
                nextState[value].Values = nextState?.[value]?.Values.map(
                  (res: any) => {
                    if (
                      res.AddMoreGroup === groupName &&
                      field.FieldName === res.FieldName
                    ) {
                      const updatedValue = res.addmorevalues.map(
                        (response: any, index: number) => {
                          if (index === i) {
                            return {
                              ...response,
                              FieldValue: moment(e).format("YYYY-MM-DD"),
                            };
                          }
                          return response;
                        },
                      );

                      return {
                        ...res,
                        addmorevalues: updatedValue,
                      };
                    }
                    return res;
                  },
                );
                setUpdatedPersonalDetails(nextState);
              }}
              name={field?.FieldName}
              showMonthDropdown
              showYearDropdown
              value={field?.addmorevalues[i]?.FieldValue}
              dropdownMode="select"
              placeholderText={field?.FieldName}
            />
          </InputGroup>
        </div>
      ) : null;
    // First, add this to your switch case in renderFields function
    case "RADIO":
      return field.DefaultVisible ? (
        <div
          style={{
            alignItems: "center",
            flexDirection: field.LabelDirection,
            ...getResponsiveStyles(field, isMobile),
          }}
        >
          {i === 0 && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <Label
                for={field?.FieldName}
                className="bold max-w-fit"
                style={{
                  color: field.fontcolor,
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
                </Tooltip>
              )}
            </div>
          )}

          <RadioGroup
            aria-label={field.FieldName}
            name={`${field.FieldName}_${i}`}
            value={field?.addmorevalues[i]?.FieldValue || ""}
            onChange={(e) => {
              const nextState: any = structuredClone(updatedPersonalDetails);
              nextState[value].Values = nextState[value].Values.map(
                (res: any) => {
                  if (
                    res.AddMoreGroup === groupName &&
                    field.FieldName === res.FieldName
                  ) {
                    const updatedValue = res.addmorevalues.map(
                      (response: any, idx: number) => {
                        if (idx === i) {
                          return {
                            ...response,
                            FieldValue: e.target.value,
                          };
                        }
                        return response;
                      },
                    );
                    return {
                      ...res,
                      addmorevalues: updatedValue,
                    };
                  }
                  return res;
                },
              );

              if (field.IscalcapiCall) {
                handleCalculateData(field, i, e.target.value);
              }

              setUpdatedPersonalDetails(nextState);
            }}
            row
          >
            <div>
              {field.DropdownArray?.map((option: any) => (
                <div key={option.value} className="flex justify-center">
                  <Radio
                    value={option.value}
                    disabled={!isModify || field?.IsReadonly}
                  />
                  <Label style={{ marginLeft: "8px" }}>{option.label}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      ) : null;

    case "BUTTON":
      return field.DefaultVisible && field.ValueType === "SELECT" ? (
        <div>
          <Button
            className={`h-10 w-full ${field?.ClsIcon}`}
            style={{
              backgroundColor: field.Fieldbgcolor,
              color: field.fontcolor,
              fontStyle: field.Fontname,
              fontSize: field.FontSize,
              ...getResponsiveStyles(field, isMobile),
              borderRadius:
                field?.Shape === "ROUNDED"
                  ? "8px"
                  : field?.Shape === "CIRCLE"
                    ? "50%"
                    : field?.Shape === "PILL"
                      ? "9999px"
                      : "0",
            }}
            disabled={!isModify}
            onClick={async () => {
              if (field.IsConfirmCheck) {
                const { confirmed } = await confirm({
                  title: "Are you sure?",
                });

                if (confirmed) {
                  // 1. Get non-empty fields from current row (convert FieldID to number)
                  // const rowData = updatedPersonalDetails[value]?.Values
                  //   .filter((res: any) =>
                  //     res.AddMoreGroup === groupName &&
                  //     res.addmorevalues[i]?.FieldValue !== undefined &&
                  //     res.addmorevalues[i]?.FieldValue !== null &&
                  //     res.addmorevalues[i]?.FieldValue !== ''
                  //   )
                  //   .map((fieldInRow: any) => ({
                  //     FieldID: Number(fieldInRow.FieldID), // Ensure numeric FieldID
                  //     FieldName: fieldInRow.FieldName,
                  //     FieldValue: fieldInRow.addmorevalues[i]?.FieldValue,
                  //   }));

                  // 2. Get button fields with proper field names from all tabs
                  const buttonFieldsData = field.buttonFields.map(
                    (buttonField: any) => {
                      // Search through all tabs for this field
                      let fieldInDetails: any = null;
                      for (const tab of updatedPersonalDetails) {
                        fieldInDetails = tab.Values.find(
                          (res: any) =>
                            Number(res.FieldID) === Number(buttonField.FieldID),
                        );
                        if (fieldInDetails) break;
                      }

                      // Get the value - check if it's an add-more field
                      let value = "";
                      if (fieldInDetails) {
                        value = fieldInDetails.IsAddMore
                          ? fieldInDetails.addmorevalues[i]?.FieldValue
                          : fieldInDetails.FieldValue;
                        value = value || ""; // Ensure we don't send undefined/null
                      }

                      return {
                        FieldID: Number(buttonField.FieldID), // Ensure numeric FieldID
                        FieldName:
                          fieldInDetails?.FieldName || buttonField.FieldName,
                        FieldValue: value,
                      };
                    },
                  );

                  // 3. Filter out empty button fields (except those that are required)
                  const filteredButtonFields = buttonFieldsData.filter(
                    (field: any) =>
                      field.FieldValue !== "" || // Keep fields with values
                      field.IsRequired, // Keep required fields even if empty
                  );

                  // 4. Combine payload (row data + filtered button fields)
                  const payload = [...filteredButtonFields];

                  console.log("Final payload being sent:", payload);

                  try {
                    const data = {
                      Userid: localStorage.getItem("username"),
                      ModuleID: menuIDQuery || menuID,
                      PostedJson: payload,
                      ButtonID: field.FieldID,
                    };

                    const result = await axios.post(field.APIURL, data, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                    });

                    if (result?.data) {
                      toast.success(result?.data?.Message, {
                        style: { top: 80 },
                      });
                    }
                  } catch (error: any) {
                    toast.error(
                      error?.response?.data?.Message || "An error occurred",
                      {
                        style: { top: 80 },
                      },
                    );
                    console.error("Error:", error);
                  }
                }
              } else {
                toast.error("Button not clicked", { style: { top: 80 } });
              }
            }}
          >
            <Label>{field?.FieldName}</Label>
          </Button>
        </div>
      ) : null;
    default:
      return null;
  }
};
