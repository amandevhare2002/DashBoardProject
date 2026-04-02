import type { CSSProperties, FC } from "react";
import { useCallback, useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import update from "immutability-helper";
import { DraggableBox } from "./DraggableBox";
import { ItemTypes } from "./ItemTypes";
import { Label } from "./Label";
import { TextBox } from "./TextBox";
import { Resizable } from "re-resizable";
import { Button } from "./Button";
import { DropDown } from "./DropDown";
import { FileUpload } from "./FileUpload";
import { Uiitem } from "../../DynamicUI/interface";
const styles: CSSProperties = {
  width: "100%",
  height: '100%',
  minHeight: 300,
  position: "relative",
};

 const Container: FC<Props> = ({workflow, setWorkflow, onClickField, onDeleteField,selectedSection}: Props) => {
  console.log("workFlow",workflow)
  const moveBox = useCallback(
    (
      fields: Uiitem
    ) => {
      const newBoxes: any = [...workflow];
      const item = newBoxes.find((res: Uiitem) => res.id === fields.id);
      if (item && fields.dropType !== "new") {
        newBoxes.map((res: Uiitem) => {
          if (res.id === item.id) {
          const currentSection = res?.sectionsLists?.find(res => res.SectionID === Number(selectedSection.value));
            res.id = item.id;
            res.FieldID = item.FieldID;
            res.ColIDX =  fields.ColIDX;
            res.RowIDX = fields.RowIDX;
            res.default_ColIDX = currentSection ? res.default_ColIDX : fields.ColIDX,
            res.default_RowIDX = currentSection ? res.default_RowIDX : fields.RowIDX,
            res.FieldName = item.FieldName;
            res.dropType = "move";
            res.FieldHeight = Number(item.FieldHeight);
            res.FieldWidth = Number( item.FieldWidth);
            res.sectionsLists = res.sectionsLists?.map(response => {
              if(response.SectionID === currentSection?.SectionID){
                response.Sec_ColIDX = item.ColIDX,
                response.Sec_RowIDX = item.RowIDX
              }else{
                response.Sec_ColIDX =  response.Sec_ColIDX;
                response.Sec_RowIDX = response.Sec_RowIDX
              }
              return response
            })
            res.updated = false;
          }
        });
        setWorkflow(newBoxes);
      } else {
        setWorkflow(
          update(newBoxes, {
            $push: [
              {
                ...fields,
                FieldID: 0,
                id: `${fields.ColIDX}${fields.RowIDX}${0}`,
                ColIDX: 100,
                RowIDX: 100,
                FieldName: fields.FieldName,
                dropType: 'move',
                FieldHeight: 70,
                FieldWidth: 230,
                updated: false,
                sectionsLists: [{ Sec_ColIDX: 100,
                  Sec_RowIDX: 100,
                  SectionID: Number(selectedSection.value),
                  SectionName: selectedSection.label}]
              }
            ]
          })
        );
      }
    },
    [workflow]
  );


  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.BOX,
      drop(item: Uiitem, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset() as {
          x: number;
          y: number;
        };

        let left = Math.round(item.RowIDX + delta.x);
        let top = Math.round(item.ColIDX + delta.y);
        const object = {
          ...item,
          RowIDX: left,
          ColIDX: top,
          dropType:  item.dropType
        }
        moveBox(object);
        return undefined;
      }
    }),
    [moveBox]
  );

  const onUpdateWidth = (d: any, index: number) => {
    const newBoxes = [...workflow];
    newBoxes[index].FieldHeight = Number(newBoxes[index].FieldHeight) + d.height;
    newBoxes[index].FieldWidth = Number(newBoxes[index].FieldWidth) + d.width;
    newBoxes[index].updated = false;
    console.log("newBoxes",newBoxes)
    setWorkflow(newBoxes);
  };

  return (
    <>
    <Resizable
      style={{ ...styles, border: '1px solid #e9e9e9' }}
    >
    <div ref={drop} style={{...styles, overflow: 'auto'}} data-testid="container">
        {workflow?.map((res: Uiitem, index: number) =>{
          const currentSection = res?.sectionsLists?.find(res => res.SectionID === Number(selectedSection.value))
          if(currentSection?.SectionID === Number(selectedSection.value) ){
            return(
              <DraggableBox
              {...res}
              inputType={res?.inputtype}
              key={res?.id}
              RowIDX={res.RowIDX}
              ColIDX={res.ColIDX}
              FieldID={res?.FieldID}
              onUpdateWidth={onUpdateWidth}
              index={index}
              onDeleteField={(props: any)=> {onDeleteField(props, index)}}
              onClickField={onClickField}
            />
            )
          }
        })}
      </div>
     
    </Resizable>
    <div style={{ marginTop: 20 }}>
        {" "}
        <Label />
        <TextBox />{" "}
        <Button />
        <DropDown />
        <FileUpload />
      </div>
    </>
  );
};


interface Props {
  workflow: Array<Uiitem>;
  setWorkflow: any;
  onClickField: any;
  onDeleteField: any;
  selectedSection: any;
}

export default Container;