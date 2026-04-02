import { Label } from "reactstrap";

interface CardBoxProps {
  field: {
    FieldName: string;
    TextBgcolor: string;
    TextFontSize: number;
    TextFontColor: string;
    IsTextBold: boolean;
    IsTextUnderLine: boolean;
    IsTextItalic: boolean;
    Fontname: string;
  };
  saveData: any;
}

export const CardBox = ({ field, saveData }: CardBoxProps) => {
  return (
    <Label
      for={field?.FieldName}
      className="bold max-w-fit"
      style={{
        backgroundColor: field.TextBgcolor,
        fontSize: `${field.TextFontSize}px`,
        color: field.TextFontColor,
        margin: 0,
        fontWeight: field.IsTextBold ? 700 : "normal",
        textDecoration: field.IsTextUnderLine ? "underline" : "none",
        fontStyle: field.IsTextItalic ? "italic" : "normal",
        fontFamily: field.Fontname,
      }}
    >
      {saveData[field.FieldName]}
    </Label>
  );
};
