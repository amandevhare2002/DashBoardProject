import React from 'react';
import { XYCoord, useDrop } from 'react-dnd';

interface SearchDropAreaProps {
  children: React.ReactNode;
  onDrop: (fieldID: string, left: number, top: number) => void;
  isDrag: boolean;
}

const SearchDropArea: React.FC<SearchDropAreaProps> = ({ 
  children, 
  onDrop, 
  isDrag 
}) => {
  const [, drop] = useDrop(
    () => ({
      accept: "box",
      drop(item: any, monitor) {
        if (!isDrag || !onDrop) return undefined;
        
        const delta = monitor.getDifferenceFromInitialOffset() as XYCoord;
        const left = Math.round(item.left + delta.x);
        const top = Math.round(item.top + delta.y);
        onDrop(item.id, left, top);
        return undefined;
      },
    }),
    [isDrag, onDrop]
  );

  if (!isDrag) {
    return <div>{children}</div>;
  }

  return (
    <div 
      ref={drop}
      style={{
        // position: 'relative',
        minHeight: '100vh',
        width: '100%',
        // border: '1px dashed #ccc',
        // padding: '10px'
      }}
    >
      {children}
    </div>
  );
};

export default SearchDropArea;