import { Resizable } from "re-resizable";
import React, { useState, useEffect } from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import AsyncSelect from "react-select/async";
import { FormGroup, Label } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
import axios from "axios";
import { toast } from "react-toastify";

export function DropDownField({
  style,
  field,
  onResize,
  isModify,
  isDrag,
  setModalData,
  setIsModalOpen,
  isOpen,
  promiseOptions,
  i,
  handleInputChange,
  onInputChange,
  setColumnSelect = () => {},
  information,
  saveData,
  isSearch = false,
  searchValues,
  setSearchValues,
  isdisable,
  isMobile = false,
  isPDFPreviewOpen = false,
  updatedPersonalDetails,
  setUpdatedPersonalDetails,
  setSaveData,
  setTableMetadata,
  confirm,
  setLoading,
  menuID,
  menuIDQuery,
}: any) {
  const [regexError, setRegexError] = useState<string | null>(null);
  const [localSelectedOption, setLocalSelectedOption] = useState<any>(null);

  // Get the error state
  const hasError = field.hasError || false;

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
      // Mobile: Use MWidth or fallback to full width
      return {
        width: field.MWidth || "100%",
        height: field.MHeight || field.Height || "auto",
        rowNum: safeRowNum,
        colNum: safeColNum,
      };
    } else {
      // Desktop/PDF: Use original dimensions and positioning
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

  const currentValue = isSearch
    ? searchValues[field.FieldName]
    : saveData[field?.FieldName];

  const selectedOption = field.DropdownArray?.find(
    (opt: any) => opt.value === currentValue,
  ) || { label: currentValue || "", value: currentValue || "" };

  // Sync the local selected option with the current value
  useEffect(() => {
    const newSelectedOption = field.DropdownArray?.find(
      (opt: any) => opt.value === currentValue,
    ) || { label: currentValue || "", value: currentValue || "" };

    setLocalSelectedOption(newSelectedOption);
  }, [currentValue, field.DropdownArray]);

  const getCurrentSplitValues = (selectedValue: string, field: any) => {
    const splitValues: Record<string, string> = {};

    if (field?.DropDownSplitData && Array.isArray(field.DropDownSplitData)) {
      const valueParts = selectedValue.split("|");

      field.DropDownSplitData.forEach((splitField: any, index: number) => {
        if (valueParts[index] !== undefined) {
          // Find the target field name
          const targetField = updatedPersonalDetails
            ?.find((tab: any) =>
              tab.Values?.find(
                (f: any) => Number(f.FieldID) === Number(splitField.FieldID),
              ),
            )
            ?.Values?.find(
              (f: any) => Number(f.FieldID) === Number(splitField.FieldID),
            );

          if (targetField) {
            splitValues[targetField.FieldName] = valueParts[index];
          }
        }
      });
    }

    return splitValues;
  };
  const callDropdownAPI = async (payloadData?: any, selectedUIOption?: any) => {
    try {
      setLoading?.(true);

      const newArray: any[] = [];

      field.buttonFields?.forEach((btn: any) => {
        updatedPersonalDetails?.forEach((tab: any) => {
          tab?.Values?.forEach((res: any) => {
            if (Number(res.FieldID) === btn.FieldID) {
              // For the main dropdown field, get the value from payloadData
              // but ensure we only send the first part (before pipe)
              let fieldValue = "";

              if (btn.FieldID === field.FieldID) {
                // This is the main dropdown field - get the value and split it
                const fullValue =
                  payloadData?.[res.FieldName] ??
                  saveData?.[res.FieldName] ??
                  res.FieldValue ??
                  "";
                // Split and take only the first part for API
                const valueParts = String(fullValue).split("|");
                fieldValue = valueParts[0] || fullValue;
              } else {
                // This is a split field - get its specific value
                fieldValue =
                  payloadData?.[res.FieldName] ??
                  saveData?.[res.FieldName] ??
                  res.FieldValue ??
                  "";
              }

              newArray.push({
                FieldID: res.FieldID,
                FieldName: res.FieldName,
                FieldValue: fieldValue,
              });
            }
          });
        });
      });

      const payload = {
        Userid: localStorage.getItem("username"),
        ModuleID: menuIDQuery || menuID,
        PostedJson: newArray,
        ButtonID: field.FieldID,
      };
      const result = await axios.post(field.APIURL2, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (result?.data) {
        const resData = result.data;
        const newUpdatedDetails = [...(updatedPersonalDetails || [])];

        // 🔹 Update table data
        const findIndex = newUpdatedDetails.findIndex(
          (t: any) =>
            t.Nestedtab === resData.NestedTab ||
            t.TabAliasName?.toLowerCase() === resData.NestedTab?.toLowerCase(),
        );

        if (findIndex !== -1) {
          newUpdatedDetails[findIndex].TableData = resData.Table || [];
        }

        // 🔹 Update field buttonFields
        const fieldID = resData.FieldID;
        newUpdatedDetails.forEach((tab: any) => {
          tab?.Values?.forEach((fieldItem: any) => {
            if (fieldItem?.FieldID == fieldID) {
              fieldItem.buttonFields = resData.Table || [];
            }
          });
        });

        // 🔹 Update saveData & visibility
        if (resData.fields) {
          const updatedSaveData = { ...(saveData || {}) };

          resData.fields.forEach((f: any) => {
            newUpdatedDetails.forEach((resp: any) => {
              resp?.Values?.forEach((r: any) => {
                if (Number(r.FieldID) === Number(f.FieldID)) {
                  updatedSaveData[r.FieldName] = f.Value;
                  r.DefaultVisible = f.Visibility;
                  if (r.FieldType === "IMAGE") {
                    r.ControlImageUrl = f.Value;
                  }
                }
              });
            });
          });

          // IMPORTANT: Restore the split field values and selected dropdown value
          if (
            field?.DropDownSplitData &&
            Array.isArray(field.DropDownSplitData)
          ) {
            field.DropDownSplitData.forEach((splitField: any) => {
              updatedPersonalDetails?.forEach((tab: any) => {
                tab.Values?.forEach((f: any) => {
                  if (Number(f.FieldID) === Number(splitField.FieldID)) {
                    // Keep the existing split field value from payloadData
                    const splitValue =
                      payloadData?.[f.FieldName] ?? saveData?.[f.FieldName];
                    if (splitValue !== undefined) {
                      updatedSaveData[f.FieldName] = splitValue;
                    }
                  }
                });
              });
            });
          }

          // CRITICAL: Restore the selected dropdown value
          if (selectedUIOption) {
            updatedSaveData[field.FieldName] = selectedUIOption.value;

            // Also update the local selected option to match
            setLocalSelectedOption({
              value: selectedUIOption.value,
              label: selectedUIOption.label,
            });
          }

          setSaveData &&
            setSaveData((prev: any) => ({
              ...prev,
              ...updatedSaveData,
            }));
        }

        // 🔹 Update table metadata
        if ((resData.TableWidth || resData.FieldID) && setTableMetadata) {
          setTableMetadata({
            isDetailPopupOpen: resData.IsDetailPopupOpen || false,
            moduleID: resData.Table?.[0]?.ModuleID || null,
            fieldID: resData.FieldID || null,
            defaultVisible: resData.DefaultTabSelected || null,
            tablebuttons: resData.tablebuttons || null,
            tableWidth: resData.TableWidth || null,
            ischeckBoxReq: resData.IscheckBoxReq || null,
            headerData: resData.HeaderData || null,
            footerData: resData.FooterData || null,
            filename: resData.Filename || null,
            logo: resData.logo || null,
            tableproperty: resData.tableproperty || null,
            outsideBorder: resData.outsideBorder || null,
            insideBorder: resData.InsideBorder || null,
            orientation: resData.Orientation || null,
            tableFormatting: resData.TableFormatting || null,
            headerRows: resData.HeaderRows || null,
            footerRows: resData.FooterRows || null,
            tableheaderfooterCSS: resData || null,
            pageitemscnt: resData.Pageitemscnt || null,
            isPagination: resData.IsPagination || null,
            chartData: resData.ChartData || null,
            chartIds: resData.Chartids || null,
            chartType: resData.ChartType || "",
          });
        }

        setUpdatedPersonalDetails &&
          setUpdatedPersonalDetails(newUpdatedDetails);

        if (resData.Table && resData.Table.length === 0) {
          toast.info("No data available for this selection", {
            style: { top: 80 },
          });
        } else {
          toast.success("Data updated successfully", { style: { top: 80 } });
        }
      }
    } catch (err: any) {
      console.error("Dropdown API error:", err);
      toast.error(
        err?.response?.data?.Message || "Error loading dropdown data",
        { style: { top: 80 } },
      );
    } finally {
      setLoading && setLoading(false);
    }
  };

  const handleChangeImmediate = async (selectedOption: any) => {
    if (!selectedOption) return;

    // Get the full value which might contain pipe-separated data
    const fullValue = selectedOption.value;

    // Split the value by pipe to get individual parts
    const valueParts = fullValue.split("|");

    // The main field value should be the first part (before first pipe)
    const mainFieldValue = valueParts[0] || fullValue;

    // Update local state immediately for instant UI feedback
    setLocalSelectedOption(selectedOption);

    if (field?.Regex) {
      try {
        const regex = new RegExp(field.Regex);
        if (!regex.test(String(mainFieldValue))) {
          setRegexError(field.RegexMessage || "Invalid selection");
          return;
        } else {
          setRegexError(null);
        }
      } catch (err) {
        console.error("Invalid regex provided for dropdown:", field.Regex);
        setRegexError(null);
      }
    }

    // Update dropdown value
    if (isSearch) {
      setSearchValues({
        ...searchValues,
        [field.FieldName]: mainFieldValue, // Store only the first part
      });
    } else {
      const updatedSaveData = { ...saveData };

      // Set the main field value (first part only)
      updatedSaveData[field.FieldName] = mainFieldValue;

      // Handle split data - update each split field with its corresponding part
      if (
        field?.DropDownSplitData &&
        Array.isArray(field.DropDownSplitData) &&
        valueParts.length > 1
      ) {
        field.DropDownSplitData.forEach((splitField: any) => {
          const splitIndex = splitField.Index; // This should be 1-based index from the configuration
          const partValue = valueParts[splitIndex]; // Use the split index to get the correct part

          if (partValue !== undefined) {
            updatedPersonalDetails?.forEach((tab: any) => {
              tab.Values?.forEach((f: any) => {
                if (Number(f.FieldID) === Number(splitField.FieldID)) {
                  updatedSaveData[f.FieldName] = partValue;
                }
              });
            });
          }
        });
      }

      // Update saveData state
      if (setSaveData) {
        setSaveData(updatedSaveData);
      }

      // Store the selected option for persistence
      const selectedValueForUI = {
        value: mainFieldValue,
        label: selectedOption.label,
        fullValue: fullValue,
      };

      // Set local selected option to maintain UI state
      setLocalSelectedOption({
        value: mainFieldValue,
        label: selectedOption.label,
      });

      // Create event for handleInputChange - pass the full value for dropdown fields
      const event = {
        target: {
          name: field.FieldName,
          value: fullValue, // Send full pipe-separated value to handleInputChange
          dropdownSplitData: field?.DropDownSplitData || [],
          fieldnamechange: selectedOption?.fieldnamechange || [],
          visibilityfields: selectedOption?.visibilityfields || [],
          TabVisibility: selectedOption?.TabVisibility || [],
          OuterTabVisibility: selectedOption?.OuterTabVisibility || [],
          childfields: field?.childfields || [],
        },
      };

      // Call handleInputChange
      handleInputChange(event, true);

      // Call API if needed - pass the UPDATED save data that has ONLY the main field value
      if (field.IsAPICall && field.APIURL2) {
        // Create a clean version of saveData with only the main field value (not the full pipe-separated)
        const cleanSaveData = {
          ...updatedSaveData,
          [field.FieldName]: mainFieldValue, // Ensure main field has only first part
        };

        // Pass the clean save data to API call and wait for it
        await callDropdownAPI(cleanSaveData, selectedValueForUI);
      }
    }
  };
  const loadOptions = (inputValue: string) => {
    // if (field.DropdownArray && field.DropdownArray.length > 0) {
    //   const filteredOptions = field.DropdownArray.filter(
    //     (option: any) =>
    //       option.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
    //       option.value?.toLowerCase().includes(inputValue.toLowerCase())
    //   );
    //   return Promise.resolve(filteredOptions);
    // }
    return promiseOptions(inputValue, i, false);
  };

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
        // Override position for mobile layout (handled by RenderFields)
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
          disabled={!isModify}
          style={{
            textAlign: field.Align,
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
            {field.IsFieldNamePrint && (
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
                      style={{ display: "flex", gap: 2, alignItems: "center" }}
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
            )}
            <AsyncSelect
              placeholder={""}
              menuPortalTarget={
                isOpen
                  ? (document.querySelector(".MuiDialog-root") as HTMLElement)
                  : document.body
              }
              menuPosition="fixed"
              loadOptions={loadOptions}
              defaultOptions={field.DropdownArray || []}
              onChange={handleChangeImmediate}
              value={localSelectedOption || null}
              isClearable={false}
              isSearchable={true}
              styles={{
                control: (baseStyles, state) => {
                  const showBorder = field.IsBorderApply !== false;
                  const borderColor = hasError ? "#dc3545" : field.bordercolor;

                  return {
                    ...baseStyles,
                    textAlign: field.TextAlignment,
                    backgroundColor: hasError ? "#fff5f5" : field.Fieldbgcolor,
                    color: field.TextFontColor,
                    fontFamily: field.TextFontname,
                    fontSize: `${field.TextFontSize}px`,
                    fontWeight: field.IsTextBold ? "bold" : "normal",
                    textDecoration: field.IsTextUnderLine
                      ? "underline"
                      : "none",
                    fontStyle: field.IsTextItalic ? "italic" : "normal",
                    height: displaySize.height,
                    width: displaySize.width,
                    minHeight: 32,
                    marginLeft: "-10px",
                    border: showBorder ? `1px solid ${borderColor}` : "none",
                    borderColor: borderColor,
                    borderRadius:
                      field?.Shape === "ROUNDED"
                        ? "8px"
                        : field?.Shape === "CIRCLE"
                          ? "50%"
                          : field?.Shape === "PILL"
                            ? "9999px"
                            : "0",
                  };
                },
                placeholder: (baseStyles) => ({
                  ...baseStyles,
                  color: hasError ? "#dc3545" : "#6c757d",
                }),

                menuPortal: (baseStyles) => ({
                  ...baseStyles,
                  zIndex: 9999,
                }),
              }}
              isDisabled={isDrag || isdisable || !isModify || field.IsReadOnly}
              onInputChange={(val) =>
                onInputChange && onInputChange(field?.FieldID)
              }
              noOptionsMessage={() => "No Suggestions"}
              onFocus={() => setColumnSelect && setColumnSelect(field?.FieldID)}
              className={`w-full ${field?.ClsIcon} ${hasError ? "is-invalid" : ""}`}
              cacheOptions
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
      </div>
    </Resizable>
  );
}
