import { Resizable } from "re-resizable";
import React from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label, Input } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
export function CheckBoxField({
  style,
  field,
  onResize,
  isModify,
  isDrag,
  setModalData,
  setIsModalOpen,
  information,
  isMobile,
}: any) {
  const hasError = field.hasError || false;
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
          <Input
            type="checkbox"
            name={field?.FieldName}
            id={field?.FieldName}
            value={field?.FieldName}
            disabled={isDrag || !isModify}
            className={`${field?.ClsIcon}`}
            style={{
              border: showBorder ? `1px solid ${borderColor}` : "none",
              backgroundColor: hasError ? "#fff5f5" : field.Fieldbgcolor,
            }}
          />
        </BoxComponent>
      </FormGroup>
    </Resizable>
  );
}
