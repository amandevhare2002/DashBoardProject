
import { AiFillInfoCircle, AiFillEdit } from "react-icons/ai";
import { FormGroup, Label } from "reactstrap";
import Tooltip from "rc-tooltip";

interface CardLabelProps {
  field: {
    FieldName: string;
    Align: string;
    LabelDirection: string;
    IsFieldNamePrint: boolean;
    fontcolor: string;
    Bgcolor: string;
    IsBold: boolean;
    IsUnderline: boolean;
    IsItallic: boolean;
    FontSize: number;
    Fontname: string;
    IsMandatory: boolean;
    TextBgcolor: string;
    TextFontSize: number;
    TextFontColor: string;
    IsTextBold: boolean;
    IsTextUnderLine: boolean;
    IsTextItalic: boolean;
    Height: string;
    FieldValue: string;
    ToolTip: string;
    FieldID: string;
    IsEdit: boolean;
    IsPopUpOpen: boolean;
    SideDrawerPos: string;
    SideDrawerWidth: string;
    StrucureModuleID: string;
  };
  isDrag: boolean;
  setModalData: (data: any) => void;
  setIsModalOpen: (isOpen: boolean) => void;
}

export const CardLabel = ({
  field,
  isDrag,
  setModalData,
  setIsModalOpen
}: CardLabelProps) => {
  return (
    <div key={field?.FieldName} className="">
      <FormGroup
        key={field?.FieldName}
        style={{
          textAlign: field.Align as any,
          display: "flex",
          flexDirection: field.LabelDirection as any,
        }}
      >
        {field.IsFieldNamePrint ? (
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
                textDecoration: field.IsUnderline ? "underline" : "none",
                fontStyle: field.IsItallic ? "italic" : "normal",
                fontSize: `${field.FontSize}px`,
                fontFamily: field.Fontname,
              }}
            >
              {field?.FieldName}{' '}
              {field.IsMandatory ? (
                <span style={{ color: "red" }}>*</span>
              ) : null}
            </Label>
            <p
              style={{
                backgroundColor: field.TextBgcolor,
                fontSize: `${field.TextFontSize}px`,
                color: field.TextFontColor,
                margin: 0,
                fontWeight: field.IsTextBold ? 700 : "normal",
                textDecoration: field.IsTextUnderLine ? "underline" : "none",
                fontStyle: field.IsTextItalic ? "italic" : "normal",
                height: `${Number(field?.Height?.toString().split("px")[0] || 100)}`,
              }}
            >
              {field.FieldValue}
            </p>
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
                          ModuleID: field.StrucureModuleID,
                          IsPopUpOpen: field.IsPopUpOpen,
                          SideDrawerPos: field.SideDrawerPos,
                          SideDrawerWidth: field.SideDrawerWidth
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
};
