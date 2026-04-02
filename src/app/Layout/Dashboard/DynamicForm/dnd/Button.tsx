import type { CSSProperties, FC } from "react";
import { useDrag } from "react-dnd";

import { ItemTypes } from "./ItemTypes";
import { DEFAULT_STATE } from "../../DynamicUI/constant";

const style: CSSProperties = {
  border: "1px dashed gray",
  backgroundColor: "white",
  padding: "0.5rem 1rem",
  marginRight: "1.5rem",
  marginBottom: "1.5rem",
  cursor: "move",
  float: "left",
  width: 230,
  height: 70
};

export interface BoxProps {
  [key: string]: { top: number; left: number; title: string; dropType: string };
}

interface DropResult {
  [key: string]: { top: number; left: number; title: string; dropType: string };
}

export const Button: FC<BoxProps> = function Box() {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.BOX,
    item: {...DEFAULT_STATE, FieldName: "BUTTON", dropType: "new", inputtype: 'BUTTON' },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<DropResult>();
      if (item && dropResult) {
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId()
    })
  }));

  const opacity = isDragging ? 0.4 : 1;
  return (
    <div ref={drag} style={{ ...style, opacity }} data-testid={`box`}>
      Button
    </div>
  );
};
