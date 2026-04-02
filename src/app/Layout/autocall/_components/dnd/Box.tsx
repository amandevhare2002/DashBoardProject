import type { CSSProperties, FC, ReactNode } from 'react';
import { useDrag } from 'react-dnd';

export interface BoxProps {
  id: any;
  left: number;
  top: number;
  hideSourceOnDrag?: boolean;
  children?: ReactNode;
  styleData?: any;
  isDrag: boolean;
  width: string;
  height: string;
  newStyle?: CSSProperties;
  cardFieldId?: string;
}

export const BoxComponent: FC<BoxProps> = ({
  id,
  left,
  top,
  hideSourceOnDrag,
  children,
  styleData,
  isDrag,
  width,
  height,
  newStyle,
  cardFieldId,
}) => {
  // In BoxComponent, update the useDrag hook
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: cardFieldId ? "cardBox" : "box",
      item: {
        id,
        left: left || 0,
        top: top || 0,
        cardFieldId,
        // Store original position for delta calculation
        originalLeft: left || 0,
        originalTop: top || 0
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top, cardFieldId]
  );
  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />;
  }

  return (
    <div
      className="box"
      ref={isDrag ? drag : null}
      style={{ ...styleData, ...newStyle }} // Merge styles; newStyle can override if needed
      data-testid={id}
    >
      {children}
    </div>
  );
};