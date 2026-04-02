import type { CSSProperties, FC } from "react";
import { memo } from "react";
import { Resizable } from "re-resizable";
import { Button, Input, Label } from "reactstrap";
import Tooltip from "rc-tooltip";

const styles: CSSProperties = {
  cursor: "move",
  padding: 4
};

export interface BoxProps {
  FieldName: string;
  yellow?: boolean;
  preview?: boolean;
  onResizeStart?: any;
  onResizeStop?: any;
  FieldHeight: number;
  FieldWidth: number;
  inputType: string;
  activeBox?: boolean;
  onClickField?: any;
  onDeleteField?: any;
  FieldID?: number
}

export const Box: FC<BoxProps> = memo(function Box({
  FieldName,
  yellow,
  preview,
  onResizeStart,
  onResizeStop,
  FieldWidth,
  FieldHeight,
  inputType,
  activeBox,
  onClickField,
  onDeleteField,
  FieldID
}) {
  return (
    <Resizable
      style={{
        ...styles,
        border: activeBox ? "1px dashed blue" : "1px dashed gray",
      }}
      size={{ width: FieldWidth, height: FieldHeight }}
      onResizeStart={() => {
        onResizeStart();
      }}
      onResizeStop={onResizeStop}
    >
      {inputType === "LABEL" && (
        <Tooltip
          placement="top"
          trigger={["click"]}
          overlay={
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
             {FieldID !== 0 && <i
                className="pe-7s-pen"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onClickField?.()}}
              />}{" "}
              <i
                className="pe-7s-trash"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onDeleteField?.()}}
              />
            </div>
          }
        >
          <div style={{display: 'flex', flexDirection: 'column'}}>
          <Label
            style={{
              width: "100%",
              fontWeight: "Bold",
            }}
          >
            {FieldName}
          </Label>
          <Label
            style={{
              width: "100%",
            }}
          >
            LABEL
          </Label>
          </div>
        </Tooltip>
      )}
      {inputType === "TEXTBOX" && (
        <Tooltip
          placement="top"
          trigger={["click"]}
          overlay={
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {FieldID !== 0 && <i
                className="pe-7s-pen"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onClickField?.()}}
              />}{" "}
              <i
                className="pe-7s-trash"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onDeleteField?.()}}
              />
            </div>
          }
        >
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <Label
            style={{
              width: "100%",
              fontWeight: "Bold",
            }}
          >
            {FieldName}
          </Label>
          
         <Input
            type="text"
            placeholder="text area"
            value={'TEXTBOX'}
            style={{
              width: "100%",
              pointerEvents: 'auto'
            }}
            disabled
          />
         </div>
        </Tooltip>
      )}
      {inputType === "DROPDOWN" && (
        <Tooltip
          placement="top"
          trigger={["click"]}
          overlay={
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {FieldID !== 0 && <i
                className="pe-7s-pen"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onClickField?.()}}
              />}{" "}
              <i
                className="pe-7s-trash"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onDeleteField?.()}}
              />
            </div>
          }
        >
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <Label
            style={{
              width: "100%",
              fontWeight: "Bold",
            }}
          >
            {FieldName}
          </Label>
        <Input
            type="select"
            disabled
            placeholder={"DROPDOWN"}
            style={{
              width: "100%",
              pointerEvents: 'auto'
            }}
            onChange={(e) => {}}
          >
            <option value={'DROPDOWN'}>{'DROPDOWN'}</option>
          </Input>
        </div>
        </Tooltip>
      )}
      {inputType === "BUTTON" && (
        <Tooltip
          placement="top"
          trigger={["click"]}
          overlay={
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
             {FieldID !== 0 && <i
                className="pe-7s-pen"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onClickField?.()}}
              />}{" "}
              <i
                className="pe-7s-trash"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onDeleteField?.()}}
              />
            </div>
          }
        >
          
          <Button
            className="mb-2 me-2"
            color="primary"
            style={{
              width: "100%",
            }}
          >
            {FieldName}
          </Button>
        </Tooltip>
      )}
      {inputType === "FILEUPLOAD" && (
        <Tooltip
          placement="top"
          trigger={["click"]}
          overlay={
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {FieldID !== 0 && <i
                className="pe-7s-pen"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onClickField?.()}}
              />}{" "}
              <i
                className="pe-7s-trash"
                style={{ fontSize: 20, color: "#00000", cursor: "pointer" }}
                onClick={() => {onDeleteField?.()}}
              />
            </div>
          }
        >
            <div style={{display: 'flex', flexDirection: 'column'}}>
          <Label
            style={{
              width: "100%",
              fontWeight: "Bold",
            }}
          >
            {FieldName}
          </Label>
          <Button
            className="mb-2 me-2"
            color="primary"
            style={{
              width: "100%",
            }}
          >
            FILE UPLOAD
          </Button>
          </div>
        </Tooltip>
      )}
    </Resizable>
  );
});
