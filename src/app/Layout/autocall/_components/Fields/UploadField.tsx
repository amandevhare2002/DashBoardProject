import { Resizable } from "re-resizable";
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label, Input } from "reactstrap";
import style from "styled-jsx/style";
import Tooltip from "rc-tooltip";
import { BoxComponent } from "../dnd/Box";
import { useState } from "react";

export const UploadField = ({
  field,
  isDrag,
  onResize,
  style,
  isModify,
  saveData,
  setSaveData,
  information,
  setModalData,
  setIsModalOpen,
  isMobile = false,
  isPDFPreviewOpen = false,
}: any) => {
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

  // Simple dimension handling for mobile
  const getDisplayDimensions = () => {
    if (isMobile && !isPDFPreviewOpen) {
      // For mobile, use responsive dimensions
      return {
        width: "100%",
        height: field.MHeight || field.Height || "auto",
      };
    } else {
      // For desktop/PDF, use original dimensions
      return {
        width: field.Width,
        height: field.Height,
      };
    }
  };

  const displayDimensions = getDisplayDimensions();
  const showBorder = field.IsBorderApply !== false;
  const borderColor = hasError ? "#dc3545" : field.bordercolor;
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
        marginLeft: "-10px",
      }}
      size={{
        width: displayDimensions.width,
        height: displayDimensions.height,
      }}
      onResizeStop={(e, direction, ref, d) =>
        onResize(e, direction, ref, d, field)
      }
    >
      <FormGroup
        style={{
          textAlign: field.Align,
          display: "flex",
          flexDirection: field.LabelDirection,
          width: isMobile && !isPDFPreviewOpen ? "100%" : "auto",
        }}
        disabled={!isModify}
      >
        <BoxComponent
          key={field.FieldID}
          id={field.FieldID}
          left={field.Rownum}
          top={field.Colnum}
          isDrag={isDrag}
          width={displayDimensions.width}
          height={displayDimensions.height}
          newStyle={{
            display: "flex",
            alignItems: "center",
            flexDirection: field.LabelDirection,
            gap: 4,
            width: isMobile && !isPDFPreviewOpen ? "100%" : "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Label
              for={field?.FieldName}
              className="bold max-w-fit"
              style={{
                color: hasError ? "#dc3545" : field.fontcolor,
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
            id="file"
            name="file"
            type="file"
            className={`${field?.ClsIcon}`}
            onChange={async (event: any) => {
              const { files: tempFiles } = event.target;
              const files = [...tempFiles];

              if (files?.length) {
                for await (const file of files) {
                  // 🔹 REGEX VALIDATION (file name)
                  if (field.Regex) {
                    const isValid = validateRegex(file.name);

                    if (!isValid) {
                      setRegexError(
                        field.RegexMessage || "Invalid file format",
                      );
                      return; // ⛔ stop upload
                    } else {
                      setRegexError(null);
                    }
                  }

                  function getFile() {
                    return new Promise((resolve, reject) => {
                      const reader = new FileReader();
                      reader.readAsDataURL(file);
                      reader.onload = function () {
                        const result = {
                          Filename: file.name,
                          ContentType: file.type,
                          base64string: reader.result,
                        };
                        resolve(result);
                      };
                      reader.onerror = function (error) {
                        reject(error);
                      };
                    });
                  }

                  const base64File: any = await getFile();

                  setSaveData({
                    ...saveData,
                    [field?.FieldName]: base64File,
                  });
                }
              }
            }}
            style={{
              height: displayDimensions.height,
              fontFamily: field.TextFontname,
              width: displayDimensions.width,
              border: showBorder ? `1px solid ${borderColor}` : "none",
              backgroundColor: hasError ? "#fff5f5" : field.Fieldbgcolor,
              borderRadius:
                field?.Shape === "ROUNDED"
                  ? "8px"
                  : field?.Shape === "CIRCLE"
                    ? "50%"
                    : field?.Shape === "PILL"
                      ? "9999px"
                      : "0",
              fontSize: `${field.TextFontSize}px`,
              color: field.TextFontColor,
              margin: 0,
              fontWeight: field.IsTextBold ? "bold" : "normal",
              textDecoration: field.IsTextUnderLine ? "underline" : "none",
              fontStyle: field.IsTextItalic ? "italic" : "normal",
              padding: "5px",
              flexDirection: field.LabelDirection,
              opacity: isDrag,
            }}
            disabled={isDrag || !isModify}
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
              {field.hasError ? "This field is required" : regexError}
            </div>
          )}
        </BoxComponent>
      </FormGroup>
    </Resizable>
  );
};
