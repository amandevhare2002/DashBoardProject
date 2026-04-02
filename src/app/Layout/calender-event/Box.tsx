
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { useRef, type CSSProperties, type FC, type ReactNode, useState } from 'react'
import { useDrag } from 'react-dnd'
import { MdOutlineDelete, MdOutlineEdit } from "react-icons/md";
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import ModalDIV from './modal';

export const ItemTypes = {
  BOX: 'box',
}


export interface BoxProps {
  fieldNum: number,
  id: any
  left: number
  top: number
  hideSourceOnDrag?: boolean
  children?: ReactNode
  dragStatus?: boolean
  width: number;
  height: number;
  handleResize: any
  handleUpdateDyanmicField: any
  setDelFieldID: any
  delFieldID: number[]
  field: any
  fieldIdArray: any
  setFieldArray: any
}

export const Box: FC<BoxProps> = ({
  fieldNum,
  id,
  left,
  top,
  width,
  height,
  hideSourceOnDrag,
  children,
  dragStatus,
  handleResize,
  handleUpdateDyanmicField,
  setDelFieldID,
  delFieldID,
  field,
  fieldIdArray,
  setFieldArray
}) => {
  const [modal, setModal] = useState(false);
 
  
  const style: CSSProperties = {
    position: 'absolute',
    border: dragStatus ? '1px dashed gray' : '',
    backgroundColor: 'white',
    padding: '0.5rem 1rem',
    cursor: 'move',
    overflow: "hidden"
  }

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'box',
      item: { id, left, top },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, left, top],
  )
  const resizableRef = useRef(null);

  const handleClick = (id: number) => {
    setDelFieldID((prevState: any) => {
      const isPresent = prevState.includes(id);

      if (isPresent) {
        return prevState.filter((item: any) => item !== id);
      } else {
        return [...prevState, id];
      }
    });
  };

  if (isDragging && hideSourceOnDrag) {
    return <div ref={drag} />
  }

  const toggle = () => setModal(!modal);
  // console.log("fieldNUm",fieldNum)
  return (
    <div
      className="box"
      ref={dragStatus ? drag : null}
      style={{ ...style, left, top }}
      data-testid="box"

    >
      <MdOutlineDelete
        onClick={() => handleClick(fieldNum)}
        className={`right-2 z-50 text-white shadow-xl -top-[2px] cursor-pointer absolute text-2xl rounded-full bg-red-500 ${dragStatus ? "block" : "hidden"}`}
      />
      <MdOutlineEdit
        onClick={toggle}
        className={`right-10 p-1 z-50 text-white shadow-xl -top-[2px] cursor-pointer absolute text-2xl rounded-full bg-blue-500 ${dragStatus ? "block" : "hidden"}`}
      />
      <ResizableBox
        ref={resizableRef}
        width={width}
        height={height}
        onResize={(e, { size }) => handleResize(e, { size }, fieldNum)}
        draggableOpts={{ disabled: !dragStatus }}
        className={`
    ${!!delFieldID.includes(fieldNum) ? "bg-red-200 border" : ""}
    ${dragStatus ? "border" : "border-none"}
    `}
      >
        {children}

      </ResizableBox>
      <Modal isOpen={modal} toggle={toggle} >
        <ModalHeader toggle={toggle}>Edit the Dynamic Fields</ModalHeader>
        <ModalBody>
          <ModalDIV
            field={field}
            fieldIdArray={fieldIdArray}
            setFieldArray={setFieldArray}
            toggle={toggle}
          />
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </Modal>
    </div>
  )
}
