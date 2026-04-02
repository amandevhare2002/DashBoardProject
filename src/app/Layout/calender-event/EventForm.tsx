import { Autocomplete, Backdrop, CircularProgress, Modal, TextField } from '@mui/material';
import type { CSSProperties, FC } from "react";
import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { Box } from './Box';
import update from 'immutability-helper'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useDrop } from 'react-dnd'
import type { XYCoord } from 'react-dnd'
import { useRouter } from 'next/router';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import DefaultEventForm from './main-code';
import { Button } from 'reactstrap';
import { FaEdit } from 'react-icons/fa';
import dayjs, { Dayjs } from 'dayjs';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ItemTypes = {
    BOX: 'box',
}
export interface DragItem {
    type: string
    id: string
    top: number
    left: number
}
const styles: CSSProperties = {
    width: "100%",
    minHeight: "100vh",
    height: '100%',
    // border: '1px solid black',
    position: 'relative',
}
export interface ContainerProps {
    hideSourceOnDrag: boolean;
}
export interface ContainerState {
    boxes: { [key: string]: { top: number; left: number; title: string } }
}
const style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // border: "solid 1px #ddd",
    background: "#f0f0f0"
} as const;
function EventForm({ hideSourceOnDrag }: ContainerProps) {
    const [fieldArray, setFieldArray] = useState<any>()
    const [isUpdate, setIsUpdate] = useState<boolean>(false)
    const [dropDownArray, setDropDownArray] = useState<any>([])
    const [operation, setOperation] = useState<boolean>(false)
    const [fieldValUpdate, setFieldValUpdate] = useState<any>([])
    const [delFieldID, setDelFieldID] = useState<number[]>([]);
    const router = useRouter();
    const [checkPos, setCheckPos] = useState(false) // function is used for check pos may change happen or not
    const { menuId, recordId, heading } = router.query;
    const [loading, setLoading] = useState(false)
    const [positionArray, setPositionArray] = useState<any>([])
    const [newField, setNewField] = useState<any>([])
    const [boxes, setBoxes] = useState<{
        [key: string]: {
            LeftPos: number
            TopPos: number
            ModuleID: number
            RecordID?: string
            CreatedBy: string
            Createdon: string
            Dbname: string
            FieldID: number
            FieldName: string
            FieldType: string
            IsActive: boolean
            IsMainCol: boolean
            ModuleName: string
            Seqno: number
            ServerName: string
            TabName: string
            Width: string
            height: number
            IsDependent: boolean
            ParentID: string,
            DefaultVisible: boolean
            Items: any
        }
    }>({})

    // ctrl + z calling function
    useEffect(() => {
        const handleKeyPress = (event: any) => {
            if (event.ctrlKey && event.key === 'z') {

                console.log("position", positionArray)
                if (positionArray.length === 0) return;

                const pos = positionArray[positionArray.length - 1];
                console.log("pos", pos);
                if (pos) {
                    setBoxes(
                        update(boxes, {
                            [pos?.id]: {
                                $merge: { LeftPos: pos.LeftPos, TopPos: pos.TopPos },
                            },
                        }),
                    )
                }
                // Remove the element at positionArray[size]
                setPositionArray((prevPositionArray: any) => {
                    const newArray = [...prevPositionArray];
                    newArray.pop();
                    return newArray;
                })

                // Custom action when Ctrl+Z is pressed
                console.log('Ctrl+Z pressed. Custom action performed.')
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [positionArray, setBoxes, setPositionArray]);

    const onChangeInput = (e: any) => {
        console.log("e.target", e.target);
        const state = {
            ...fieldValUpdate,
            [e.target.name]: e.target.value,
        };

        const localStorageItem = localStorage.getItem("FieldArrayByLocalstorage");
        const localStorgeDataArray = localStorageItem ? JSON.parse(localStorageItem) : null;
        const matchingBox = localStorgeDataArray && localStorgeDataArray.find((box: any) => box?.FieldName === e.target.name);

        if (matchingBox && matchingBox?.Items && matchingBox?.Items?.parentValues) {
            let matchingParentValue =
                e.target.value
                    ? matchingBox?.Items?.parentValues.find((parent: any) => parent.parentvalue.toLowerCase() === e.target.value.toLowerCase())
                    :
                    (matchingBox && matchingBox.Items && matchingBox.Items.parentValues)
                        ? {
                            childfields: matchingBox.Items.parentValues.reduce((accumulator: any, currentValue: any) => {
                                return accumulator.concat(currentValue.childfields);
                            }, [])
                        }
                        : { childFields: [] };
            // console.log("matchingParentValue", matchingParentValue?.childfields)

            let againfield = false
            if (!matchingParentValue) {
                againfield = true
                matchingParentValue = {
                    childfields: matchingBox.Items.parentValues.reduce((accumulator: any, currentValue: any) => {
                        return accumulator.concat(currentValue.childfields);
                    }, [])
                }
            }
            let newFieldArray = !e.target.value ? [] : matchingParentValue?.childfields
            console.log("newFieldArray", newFieldArray)
            setNewField(newFieldArray)
            console.log("matchingParentValue", matchingParentValue)


            const updatedBoxes = Object.values(boxes).reduce((acc: any, box) => {
                const matchingChild = matchingParentValue?.childfields.find((child: any) => {
                    return Number(child.ChildFieldID) === box.FieldID;
                });


                let newDefaultVisible = box.DefaultVisible;
                if (matchingChild) {
                    if (e.target.value) {
                        if (againfield) {
                            newDefaultVisible = false;
                        } else {
                            newDefaultVisible = matchingChild.IsVisible;
                        }
                    } else {
                        newDefaultVisible = false;
                    }
                }

                acc[box.FieldID] = {
                    ...box,
                    DefaultVisible: newDefaultVisible,
                    // TopPos: match ? newTop : box.TopPos
                };
                // console.log("acc[box.FieldID]", acc[box.FieldID]);
                return acc;
            }, {});

            console.log("updatedBoxes", updatedBoxes);
            setBoxes(updatedBoxes);


        }
        setFieldValUpdate(state)
        setCheckPos(!checkPos)
    };


    useEffect(() => {
        const visibleBoxes = Object.values(boxes).filter(box => box.DefaultVisible);

        let leftOffset = 20;
        let leftIncrement = 320;
        let topOffset = 0;
        let topIncrement = 100;

        let cnt = 0;
        let newtopOffset = 0;
        let newleftOffset = 20;
        let updateCond = false;
        let callingIfCond = false;
        const updatedBoxes = { ...boxes };
        console.log("newField", newField);
        const localStorageItem = localStorage.getItem("FieldArrayByLocalstorage");
        const localStorgeDataArray = localStorageItem ? JSON.parse(localStorageItem) : null;
        console.log("localStorgeDataArray", localStorgeDataArray);
        let Count = 0
        for (const key in visibleBoxes) {
            const box = visibleBoxes[key];
            console.log("box", box);
            let callingIfCondCnt = false;
            let childID = newField && newField.length > 0 && newField[cnt]?.ChildFieldID;

            if (box?.FieldID === Number(childID)) {
                newtopOffset = cnt === 0 ? topOffset + 100 : newtopOffset;
                box.LeftPos = newleftOffset;
                box.TopPos = newtopOffset;
                newleftOffset += 320;

                if ((cnt + 1) % 3 === 0) {
                    newleftOffset = 20;
                    newtopOffset += 100;
                }
                updateCond = true;
                cnt++;
                console.log("newBox", box);
                console.log("if case", leftOffset, topOffset);
            } else if (newField.length === 0) {
                localStorgeDataArray && localStorgeDataArray.forEach((data: any) => {
                    if (box?.FieldName === data?.FieldName) {
                        box.LeftPos = data?.LeftPos;
                        box.TopPos = data?.TopPos;
                    }
                });
            } else {
                let leftOffsetChange = false;
                console.log("else case", leftOffset, topOffset);
                if (updateCond && !callingIfCond) {
                    topOffset = newtopOffset + (((Count + 1) % 3 === 0) ? ((newField.length % 3) * 100) : ((newField.length % 3) + 1) * 100);
                    leftOffset += leftIncrement;
                    callingIfCond = true;
                    callingIfCondCnt = true;
                    console.log("topOffset", topOffset);
                }
                console.log("else case", leftOffset, topOffset);
                if ((Number(Count) + 1) % 3 === 0 && leftOffset > 660) {
                    leftOffset = 20;
                    topOffset += topIncrement;
                    leftOffsetChange = true;
                }
                console.log("else case", leftOffset, topOffset);
                box.LeftPos = box.LeftPos ? box.LeftPos : leftOffset;
                box.TopPos = updateCond ? topOffset : (box.TopPos ? box.TopPos : topOffset);
                console.log("else case", leftOffset, topOffset);
                if (!leftOffsetChange && !callingIfCondCnt) {
                    if (!(leftOffset > 660)) {
                        leftOffset += leftIncrement;
                    }
                    if ((Number(Count) + 1) % 3 === 0) {
                        leftOffset = 20;
                        topOffset += topIncrement;
                    }
                } else {
                    callingIfCondCnt = false;
                }
                console.log("else case", leftOffset, topOffset);
                Count++
            }

            console.log(leftOffset, topOffset);

            box.Width = box.Width === "300%" ? "300%" : box?.Width;
        }

        updateCond = false;
        setBoxes(updatedBoxes);
    }, [checkPos]);

    // GET ALl Dyanmic fields
    const handleGetDynamicFieldsModuleWise = async () => {
        try {
            const localStorageItem = localStorage.getItem("FieldArrayByLocalstorage");
            const localStorgeData = localStorageItem ? JSON.parse(localStorageItem) : null;
            if (!menuId) {
                return
            }

            let data = {
                "Userid": localStorage.getItem("username"),
                "ModuleID": (menuId),
                "RecordID": recordId
            }
            if (!recordId && localStorgeData && localStorgeData.length > 0 && localStorgeData[0]?.ModuleID === Number(menuId)) {
                console.log("localStroredata")
                setBoxes(localStorgeData);
                setFieldArray((localStorgeData))
                return;
            }

            const res = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/GetDynamicFieldsModuleWise", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            if (res) {
                if (recordId === "0") {
                    localStorage.setItem("FieldArrayByLocalstorage", JSON.stringify(res?.data?.Fields))
                }
                setBoxes(res?.data?.Fields);
                setFieldArray((res?.data?.Fields))
                if (res?.data?.Data && res?.data?.Data.length > 0) {
                    setFieldValUpdate(res?.data?.Data[0])
                    setOperation(false)
                }

                if (res?.data?.Data && res?.data?.Data.length === 0) {
                    setOperation(true)
                }
            }
        } catch (error) {
            console.log("error in calender-event", error)
        }
    }
    const AddDropDownData = async () => {
        try {
            let data = {
                "Userid": localStorage.getItem("username"),
                "valueReqs": fieldArray && fieldArray.length > 0 && fieldArray.filter((field: any) => field.FieldType === "DROPDOWN")
                    .map(({ Dbname, TabName, Colname, ServerName }: any) => ({ Dbname, TabName, Colname, ServerName }))
            }
            // console.log("hii 1")

            const res = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValuesBulk", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            console.log("hii 2")
            if (res?.data?.valueResps) {
                console.log("hii 4")
                setDropDownArray(res?.data?.valueResps)
            }
        } catch (error) {
            console.log("error in calender-event", error)
        }
    }


    useEffect(() => {
        if (fieldArray && fieldArray.length > 0) {
            AddDropDownData()
        }
    }, [fieldArray])
    useEffect(() => {
        if (menuId && recordId) {
            handleGetDynamicFieldsModuleWise();
        }
    }, [menuId, recordId, update, isUpdate]) // menuId

    const handleUpdateDyanmicField = async () => {
        try {
            setLoading(true)
            if (fieldArray && fieldArray[0] && fieldArray[0].LeftPos === 0 && fieldArray && fieldArray[0] && fieldArray[0].TopPos === 0) {
                // console.log("handleUpdateDyanmicField222222222222");
                let filteredArray = fieldArray.filter((fld: any) => fld?.DefaultVisible === true);

                let leftOffset = 20;
                let leftIncrement = 320;
                let topOffset = 0;
                let topIncrement = 100;
                let i = 0;

                while (i < filteredArray.length) {
                    let obj = filteredArray[i];
                    obj.LeftPos = leftOffset;
                    obj.TopPos = topOffset;
                    obj.Width = "300%";

                    if ((i + 1) % 3 === 0) {
                        leftOffset = 20;
                        topOffset += topIncrement;
                    } else {
                        leftOffset += leftIncrement;
                    }
                    i++;
                }
            }

            const updatedfieldData = delFieldID && delFieldID.length > 0 ? Object.values(boxes).map((upfld) => {
                if (delFieldID.includes(upfld.FieldID)) {
                    return { ...upfld, IsActive: false };
                } else {
                    return upfld;
                }
            }) : Object.values(boxes)


            let data = {
                "Userid": localStorage.getItem("username"),
                "Fields": fieldArray && fieldArray[0] && fieldArray[0].LeftPos === 0 && fieldArray && fieldArray[0] && fieldArray[0].TopPos === 0 ? fieldArray : updatedfieldData,
                "Data": [
                    {
                        "Sno": "",
                        "Month": "",
                        "Date": "",
                        "Year": "",
                        "Timing": "",
                        "Description": "",
                        "Type": "",
                        "Regulatation": "",
                        "Company_Name": "",
                        "Remarks": "",
                        "colname": "",
                        "EventDate": "",
                        "CalenderType": "",
                        "Mins": ""
                    }
                ],
                "Table2": [
                    {
                        "ControlName": "TEXTBOX",
                        "DefaultWidth": "25%"
                    },
                    {
                        "ControlName": "RADIO",
                        "DefaultWidth": "30%"
                    },
                    {
                        "ControlName": "CHECKBOX",
                        "DefaultWidth": "40%"
                    },
                    {
                        "ControlName": "DROPDOWN",
                        "DefaultWidth": "30%"
                    },
                    {
                        "ControlName": "CALENDER",
                        "DefaultWidth": "25%"
                    }
                ]
            }


            const result = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsModuleWise", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })

            if (result) {
                // toast.success("Updated successfullly!!");
                localStorage.removeItem("FieldArrayByLocalstorage");
                setDelFieldID([]);
                setFieldArray([])
                setBoxes({})
                // if ((fieldArray && fieldArray[0] && fieldArray[0].LeftPos !== 0 && fieldArray && fieldArray[0] && fieldArray[0].TopPos !== 0)) {
                //     handleGetDynamicFieldsModuleWise()
                // }

                setIsUpdate(false)
                router.reload();

            }
        } catch (error) {
            console.log("error", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (fieldArray && fieldArray[0] && fieldArray[0].LeftPos === 0 && fieldArray && fieldArray[0] && fieldArray[0].TopPos === 0) {
            handleUpdateDyanmicField()
        }
    }, [fieldArray])
    // function for get and storing the location
    const moveBox = useCallback(
        (id: string, LeftPos: number, TopPos: number) => {

            setPositionArray((_prev: any) => {
                const prevArray = [..._prev]

                let newPos = {
                    "id": id,
                    "LeftPos": LeftPos,
                    "TopPos": TopPos
                }

                prevArray.push(newPos)
                return prevArray
            })
            setBoxes(
                update(boxes, {
                    [id]: {
                        $merge: { LeftPos, TopPos },
                    },
                }),
            )
        },
        [boxes, setBoxes],
    )

    const handleResize = (e: any, { size }: any, key: number) => {
        setBoxes((box) => ({
            ...box,
            [key - 1]: {
                ...box[key - 1],
                Width: `${size?.width}`,
            },
        }));
    };

    const [, drop] = useDrop(
        () => ({
            accept: ItemTypes.BOX,
            drop(item: DragItem, monitor) {
                const delta = monitor.getDifferenceFromInitialOffset() as XYCoord
                console.log("item", item)
                setPositionArray((_prev: any) => {
                    const prevArray = [..._prev]
                    let present = prevArray && prevArray.find((pre) => pre?.id === item?.id)
                    if (present) {
                        return prevArray
                    } else {
                        let newPos = {
                            "id": item?.id,
                            "LeftPos": item?.left,
                            "TopPos": item?.top
                        }

                        prevArray.push(newPos)
                        return prevArray
                    }
                })


                const left = Math.round(item.left + delta.x)
                const top = Math.round(item.top + delta.y)
                moveBox(item.id, left, top)
                return undefined
            },
        }),
        [moveBox],
    )

    const handleSubmitDynamicFieldsModuleWise = async () => {
        try {
            console.log("fieldArray", fieldArray);
            setLoading(true);
            let fieldDataNewUpdateVal: any = [];

            fieldArray && fieldArray.forEach((field: any) => {
                if (fieldValUpdate) {
                    // Check if the field is mandatory
                    if (field?.IsMandatory && !field?.IsMainCol) {
                        if (!fieldValUpdate.hasOwnProperty(field?.FieldName)) {
                            toast.error(`${field?.FieldName} is required`, { style: { top: 80 } });
                            setLoading(false);
                            throw new Error("Missing required fields");
                        }
                    }

                    // Push field data
                    fieldDataNewUpdateVal.push({
                        Fieldname: field?.FieldName,
                        FieldValue: fieldValUpdate[field?.FieldName],
                        IsMain: field?.IsMainCol,
                        Colname: field?.Colname
                    });
                }
            });

            console.log("fieldArrayData", fieldDataNewUpdateVal);
            console.log("operation", fieldValUpdate, fieldArray);

            if (fieldDataNewUpdateVal.length === 0) {
                toast.error(`Please fill fields`, { style: { top: 80 } });
                setLoading(false);
                return;
            }

            let data = {
                Userid: localStorage.getItem("username"),
                ModuleID: menuId,
                Operation: operation || (recordId === "0") ? "INSERT" : "UPDATE", // INSERT or UPDATE
                fieldsDatanew: fieldDataNewUpdateVal
            };
            setLoading(true);
            const res: any = await axios.post(
                "https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsValuesNew",
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            console.log('res', res)
            setLoading(false);
            if (res?.data?.Resp === "Fail") {
                toast.error(`${res?.data?.ErrorMessage}`, { style: { top: 80 } });
                setLoading(false);
                return
            }
            if (res && res?.data?.Resp === 'Success') {
                toast.success("Data Submitted Successfully!", { style: { top: 80 } });
                setFieldValUpdate(res?.data?.Data[0]);
                setLoading(false);
            }
        } catch (error: any) {
            // toast.error(`${error?.message}`, { style: { top: 80 } });
            console.error("error", error);
            setLoading(false);
        }
    };


    const fieldIdArray = fieldArray && fieldArray.length > 0 && fieldArray.map((fld: any) => fld?.FieldID)
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover={false}
                theme="light"
            />

            {
                loading ? (
                    <>
                        <Backdrop
                            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                            open={loading}
                        // onClick={handleClose}
                        >
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    </>
                ) :
                    (
                        <><div className='flex justify-between items-center text-center px-5'>
                            <h2 className='text-gray-600'>{heading ? heading : "Calender Add Event Form"}</h2>
                            {!isUpdate ? (
                                <div className='flex gap-4'>
                                    <Button className='px-5 py-2' onClick={() => {
                                        router.back();
                                    }}>Back</Button>
                                    <Button color="primary" type='submit' className='px-5 py-2' onClick={handleSubmitDynamicFieldsModuleWise}>Submit</Button>

                                    <div
                                        onClick={() => setIsUpdate(true)}
                                        className='w-[100px] cursor-pointer text-center flex justify-center items-center py-2 px-5 bg-red-600 hover:bg-red-500 rounded-lg text-white gap-2'>
                                        <div><FaEdit /></div>
                                        <div>Edit</div>
                                    </div>
                                </div>
                            ) : (

                                <div
                                    onClick={() => {
                                        setIsUpdate(false)
                                        handleUpdateDyanmicField()
                                    }}
                                    className='w-[100px] cursor-pointer text-center flex justify-center items-center py-2 px-3 bg-blue-600 hover:bg-blue-400 rounded-lg text-white gap-2'>

                                    <div>Save</div>
                                </div>
                            )}
                        </div>
                            <div className='w-full'>
                                <div className=' pt-2 ml-2 mt-3 !bottom-1'>

                                </div>
                                <div ref={drop} style={styles} className='w-full'>
                                    {Object.keys(boxes).map((key, i) => {
                                        const field = boxes[key] as {
                                            LeftPos: number
                                            TopPos: number
                                            ModuleID: number
                                            RecordID?: string
                                            CreatedBy: string
                                            Createdon: string
                                            Dbname: string
                                            FieldID: number
                                            FieldName: string
                                            FieldType: string
                                            IsActive: boolean
                                            IsMainCol: boolean
                                            ModuleName: string
                                            Seqno: number
                                            ServerName: string
                                            TabName: string
                                            Width: string
                                            height: number
                                            Colname: string
                                            IsDependent: boolean
                                            ParentID: string,
                                            DefaultVisible: boolean
                                            Items: any
                                        }
                                        return (
                                            <>
                                                loading ? (
                                                <div className="w-full justify-center items-center flex">
                                                    <CircularProgress />
                                                </div>
                                                ) :
                                                {
                                                    field?.DefaultVisible &&
                                                    <Box
                                                        key={key}
                                                        fieldNum={field?.FieldID}
                                                        id={key}
                                                        left={field?.LeftPos}
                                                        top={field?.TopPos}
                                                        hideSourceOnDrag={hideSourceOnDrag}
                                                        dragStatus={isUpdate}
                                                        width={parseInt(field?.Width)}
                                                        height={80}
                                                        handleResize={handleResize}
                                                        handleUpdateDyanmicField={handleUpdateDyanmicField}
                                                        setDelFieldID={setDelFieldID}
                                                        delFieldID={delFieldID}
                                                        field={field}
                                                        fieldIdArray={fieldIdArray}
                                                        setFieldArray={setFieldArray}
                                                    >
                                                        {
                                                            !!field?.DefaultVisible && field?.FieldType === 'LABEL' && !!field?.IsActive && (

                                                                <TextField
                                                                    name={`${field.FieldName}`}
                                                                    id={field.FieldName}
                                                                    label={field?.FieldName}
                                                                    sx={{ width: `100%`, height: `100px` }}
                                                                    value={fieldValUpdate[field.FieldName]}
                                                                    onChange={onChangeInput}
                                                                    disabled={field?.IsMainCol || isUpdate ? true : false}
                                                                />


                                                            )
                                                        }
                                                        {
                                                            !!field?.DefaultVisible && field?.FieldType === 'MULTILINE' && !!field?.IsActive && (

                                                                <TextField
                                                                    name={`${field.FieldName}`}
                                                                    id={field.FieldName}
                                                                    label={field?.FieldName}
                                                                    multiline
                                                                    sx={{ width: `100%`, height: `100px` }}
                                                                    value={(fieldValUpdate[field.FieldName])}
                                                                    onChange={onChangeInput}
                                                                    disabled={field?.IsMainCol || isUpdate ? true : false}
                                                                />

                                                            )
                                                        }
                                                        {
                                                            !!field?.DefaultVisible && field?.FieldType === 'TEXTBOX' && !!field?.IsActive && (

                                                                <TextField
                                                                    name={`${field.FieldName}`}
                                                                    id={field.FieldName}
                                                                    label={field?.FieldName}
                                                                    sx={{ width: `100%`, height: `100px` }}
                                                                    value={(fieldValUpdate[field.FieldName])}
                                                                    onChange={onChangeInput}
                                                                    disabled={field?.IsMainCol || isUpdate ? true : false}
                                                                />


                                                            )
                                                        }
                                                        {
                                                            !!field?.DefaultVisible && field?.FieldType === 'DATE' && !!field?.IsActive && (
                                                                <>

                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                        <DatePicker
                                                                            name={`${field.FieldName}`}
                                                                            label={`${field.FieldName}`}
                                                                            sx={{ width: `100%`, height: `100px` }}
                                                                            // defaultValue={new Date()}
                                                                            value={fieldValUpdate[field.FieldName] && dayjs(fieldValUpdate[field.FieldName])}
                                                                            onChange={(val) => onChangeInput({
                                                                                target: {
                                                                                    name: `${field.FieldName}`,
                                                                                    value: val ? val.format('YYYY-MM-DD') : '',
                                                                                }
                                                                            })}
                                                                            disabled={field?.IsMainCol || isUpdate ? true : false}
                                                                        // onChange={(val) => console.log('val',val)}                                                                            disabled={field?.IsMainCol || isUpdate ? true : false}
                                                                        />

                                                                    </LocalizationProvider>

                                                                </>
                                                            )
                                                        }
                                                        {
                                                            !!field?.DefaultVisible && field?.FieldType === 'CALENDER' && !!field?.IsActive && (
                                                                <>

                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>

                                                                        <DatePicker
                                                                            name={`${field.FieldName}`}
                                                                            label={`${field.FieldName} `}
                                                                            sx={{ width: `100%`, height: `100px` }}
                                                                            // defaultValue={new Date()}
                                                                            value={dayjs(fieldValUpdate[field.FieldName])}
                                                                            onChange={(val) => onChangeInput({
                                                                                target: {
                                                                                    name: `${field.FieldName}`,
                                                                                    value: val ? val.format('YYYY-MM-DD') : '',
                                                                                }
                                                                            })}
                                                                            disabled={field?.IsMainCol || isUpdate ? true : false}
                                                                        />

                                                                    </LocalizationProvider>

                                                                </>
                                                            )
                                                        }
                                                        {
                                                            !!field?.DefaultVisible && field?.FieldType === 'DROPDOWN' && !!field?.IsActive && (
                                                                <Autocomplete
                                                                    // className={`!w-[${field.Width}]`}
                                                                    sx={{ width: `100%` }}
                                                                    value={fieldValUpdate[field.FieldName]}
                                                                    options={
                                                                        dropDownArray
                                                                            .find((item: any) => item.Colname.toLowerCase() === field?.Colname.toLowerCase())
                                                                            ?.colvalues.map((colvalue: any) => colvalue.Colvalue) || []
                                                                    }
                                                                    renderInput={(params) => <TextField {...params} label={field?.FieldName} sx={{ width: `100%` }} />}
                                                                    onInputChange={(e, newValue) => onChangeInput({ target: { name: field?.FieldName, value: newValue } })}
                                                                    disabled={field?.IsMainCol || isUpdate ? true : false}
                                                                    freeSolo
                                                                />
                                                            )
                                                        }
                                                    </Box>
                                                }
                                            </>
                                        )
                                    })}
                                </div>

                            </div>
                        </>
                    )}
        </>
    )
}

export default EventForm
