import { Resizable } from "re-resizable";
import React, { useState } from "react";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label } from "reactstrap";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
import ComposeProMain from "@/utils/editorComp";

export function TextEditorField({
  style,
  field,
  onResize,
  isModify,
  isDrag,
  setModalData,
  setIsModalOpen,
  information,
  saveData,
  setSaveData,
  editorRef,
  mobileLayout,
}: any) {
  const showBorder = field.IsBorderApply !== false;
  const borderColor = field.bordercolor;

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
        padding: 0,
      }}
      size={{
        width: mobileLayout
          ? "100%"
          : Number(field?.Width?.toString().split("px")[0] || 100),
        height: Number(field?.Height?.toString().split("px")[0] || 100),
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <FormGroup
        key={field?.FieldName}
        style={{
          textAlign: field.Align,
          display: "flex",
          flexDirection: field.LabelDirection,
          height: "100%",
        }}
      >
        <BoxComponent
          key={field.FieldID}
          id={field.FieldID}
          left={field.Rownum}
          top={field.Colnum}
          isDrag={isDrag}
          width={mobileLayout ? "100%" : `${field.Width}px`}
          height={`${field.Height}px`}
          newStyle={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "-25px",
            }}
          >
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
          <div
            style={{
              flex: 1,
              overflow: "auto",
              border: showBorder ? `1px solid ${borderColor}` : "none",
            }}
          >
            <ComposeProMain
              editorRef={editorRef}
              onEditorChange={(content: any) => {
                let state = {
                  ...saveData,
                  [field.FieldName]: content,
                };
                setSaveData(state);
              }}
              value={saveData[field.FieldName] ?? ""}
              init={{
                body: saveData[field.FieldName] ?? "",

                draftKey: `texteditor-${field.FieldID}-${Date.now()}`,
              }}
              showHeaderFields={false}
              showSendButton={false}
              showDiscardButton={false}
              showReminderButton={false}
              containerStyle={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
        </BoxComponent>
      </FormGroup>
    </Resizable>
  );
}
