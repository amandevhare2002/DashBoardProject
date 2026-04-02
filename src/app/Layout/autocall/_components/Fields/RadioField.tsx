import { RadioGroup, Radio } from "@mui/material";
import { Resizable } from "re-resizable";
import React from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
export function RadioField({
  style,
  field,
  onResize,
  isModify,
  isDrag,
  setModalData,
  setIsModalOpen,
  saveData,
  handleCalculateData,
  setSaveData,
  calculateFormula,
  information,
  updatedPersonalDetails,
  isMobile,
}: any) {
  const hasError =
    field.hasError ||
    (!saveData[field.FieldName] && field.IsMandatory) ||
    field.hasError;
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
        width: isMobile
          ? "100%"
          : `${Number(field?.Width?.toString().split("px")[0] || 100)}`,
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
                {field.IsMandatory ? (
                  <span
                    style={{
                      color: "red",
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
          )}

          <RadioGroup
            aria-label={field.FieldName}
            name={field.FieldName}
            value={saveData[field.FieldName] || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              let state = {
                ...saveData,
                [field.FieldName]: newValue,
              }; // Handle any calculations if needed

              if (field.IscalcapiCall) {
                handleCalculateData(field, 0, newValue);
              }

              setSaveData(state); // Update formula fields if needed

              const calculatedData = {
                ...state,
              };
              updatedPersonalDetails.map((response: any) => {
                response.Values.map((res: any) => {
                  if (res.IsFormulaApply && !res.IsAddMore) {
                    const calculatedValue = calculateFormula(
                      res.Formula,
                      calculatedData,
                    );

                    if (res.Colname) {
                      calculatedData[res.FieldName] =
                        Number(Math.round(calculatedValue)) || 0;
                    }
                  }
                });
              });
              setSaveData(calculatedData);
            }}
            row
          >
            {field.DropdownArray?.map((option: any) => (
              <div
                key={option.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Radio
                  value={option.value}
                  disabled={!isModify || field?.IsReadonly}
                  className={`${field?.ClsIcon}`}
                />
                <Label
                  style={{
                    marginLeft: "8px",
                  }}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
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
    </Resizable>
  );
}
