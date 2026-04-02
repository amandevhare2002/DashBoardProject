import { Label } from "reactstrap";

interface CardDropdownProps {
  field: {
    FieldName: string;
    fontcolor: string;
    Bgcolor: string;
    Width: string;
    IsBold: boolean;
    IsUnderline: boolean;
    IsItallic: boolean;
    FontSize: number;
    Fontname: string;
  };
  saveData: any;
}

export const CardDropdown = ({ field, saveData }: CardDropdownProps) => {
  return (
    <Label
      for={field?.FieldName}
      className="bold max-w-fit"
      style={{
        color: field.fontcolor,
        backgroundColor: field.Bgcolor,
        width: field.Width,
        fontWeight: field.IsBold ? 700 : "normal",
        textDecoration: field.IsUnderline ? "underline" : "none",
        fontStyle: field.IsItallic ? "italic" : "normal",
        fontSize: `${field.FontSize}px`,
        fontFamily: field.Fontname,
      }}
    >
      {saveData[field.FieldName]}
    </Label>
  );
};
