import { CSSProperties, FC, useState } from "react";
import { memo, useEffect } from "react";
import type { DragSourceMonitor } from "react-dnd";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import Tooltip from "rc-tooltip";
import { Box } from "./Box";
import { ItemTypes } from "./ItemTypes";

function getStyles(
  RowIDX: number,
  ColIDX: number,
  isDragging: boolean,
  FieldHeight: number,
  FieldWidth: number,
  updated: boolean
): CSSProperties {
  const transform = `translate3d(${RowIDX}px, ${ColIDX}px, 0)`;
  return {
    position: "absolute",
    transform,
    WebkitTransform: transform,
    // IE fallback: hide the real node using CSS when dragging
    // because IE will ignore our custom "empty image" drag preview.
    opacity: isDragging ? 0 : 1,
    height: FieldHeight,
    width: FieldWidth,
    backgroundColor: updated
    ? "#F3FFEB"
    : "#FDEDEE"
  };
}

export interface DraggableBoxProps {
  FieldID: number;
  FieldName: string;
  RowIDX: number;
  ColIDX: number;
  onUpdateWidth: any;
  index: number;
  FieldHeight: number;
  FieldWidth: number;
  inputType: string;
  onClickField?: any;
  onDeleteField?: any;
  id?: string;
  updated?: boolean
}

export const DraggableBox: FC<DraggableBoxProps> = memo(function DraggableBox(
  props
) {
  const {
    FieldID,
    FieldName,
    RowIDX,
    ColIDX,
    onUpdateWidth,
    index,
    FieldHeight,
    FieldWidth,
    inputType,
    id,
    updated,
    ...rest
  } = props;
  const [disableDrag, setDisableDrag] = useState(false);
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ItemTypes.BOX,
      item: {
        id,
        FieldID,
        RowIDX,
        ColIDX,
        FieldName,
        FieldHeight,
        FieldWidth,
        ...rest,
      },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, FieldID, RowIDX, ColIDX, FieldName, FieldHeight, FieldWidth, rest,updated]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  const onResize = () => {
    setDisableDrag(true);
  };

  const onResizeStop = (e: any, direction: any, ref: any, d: any) => {
    setDisableDrag(false);
    onUpdateWidth(d, index);
  };
  
  return (

      <div
        ref={disableDrag ? null : drag}
        style={getStyles(RowIDX, ColIDX, isDragging, FieldHeight, FieldWidth, (updated ||false))}
        role="DraggableBox"
        className="draggable-box"
        id={`${id}`}
        onClick={() => {
          const data: any = document.getElementsByClassName("draggable-box");
          for (let i = 0; i < data.length; i++) {
            if (id === data[i].id) {
              data[i].children[0].classList.add("drag-box");
            } else {
              data[i].children[0].classList.remove("drag-box");
            }
          }
        }}
      >
        <Box
          {...rest}
          FieldID={FieldID}
          FieldName={FieldName}
          inputType={inputType}
          onResizeStart={onResize}
          FieldHeight={FieldHeight}
          FieldWidth={FieldWidth}
          onResizeStop={onResizeStop}
          activeBox={isDragging}
          onClickField={() => {props.onClickField(props)}}
          onDeleteField={() => {props.onDeleteField(props)}}
        />
      </div>
  );
});
