import { Autocomplete, ButtonBase, TextField } from '@mui/material';
import type { CSSProperties, FC } from "react";
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Button, Card, CardBody } from 'reactstrap';
import { useRouter } from 'next/router';
import { FaEdit } from 'react-icons/fa';
const styles: CSSProperties = {
    width: "100%",
    height: '100%',
    minHeight: 300,
    position: "relative",
};

export interface ContainerProps {
    hideSourceOnDrag: boolean;
}
function DefaultEventForm({setIsUpdate}:any) {

    const [boxes, setBoxes] = useState<{
        [key: string]: {
            top: number
            left: number
            title: string
        }
    }>({
        a: { top: 20, left: 80, title: 'Drag me around' },
        b: { top: 180, left: 20, title: 'Drag me too' },
    })
    const [fieldArray, setFieldArray] = useState<any>()
    const [dropDownArray, setDropDownArray] = useState<any>([])
    const [operation, setOperation] = useState<boolean>(false)
    const [fieldValUpdate, setFieldValUpdate] = useState<any>([])

    const router = useRouter();
    const { menuId, recordId } = router.query;

    const onChangeInput = (e: any) => {
        // console.log("e.target",e)
        const state = {
            ...fieldValUpdate,
            [e.target.name]: e.target.value,
        };
        setFieldValUpdate(state);
    };

    const handleGetDynamicFieldsModuleWise = async () => {
        try {
            const localStorageItem = localStorage.getItem("FieldArrayByLocalstorage");
            const localStorgeData = localStorageItem ? JSON.parse(localStorageItem) : null;


            if (!menuId) {
                return
            }
            let data = {
                "Userid": localStorage.getItem("username"),
                "ModuleID": menuId,
                "RecordID": recordId ? recordId : ""
            }
            if (recordId === '' && localStorgeData && localStorgeData?.length > 0) {
                setFieldArray((localStorgeData))
                return;
            }

            const res = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/GetDynamicFieldsModuleWise", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            if (res) {
                if (recordId === "") {
                    localStorage.setItem("FieldArrayByLocalstorage", JSON.stringify(res?.data?.Fields))
                }
                setFieldArray(res?.data?.Fields)
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
                    .map(({ Dbname, TabName, Colname }: any) => ({ Dbname, TabName, Colname }))
            }


            const res = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValuesBulk", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            if (res) {

                setDropDownArray(res?.data?.valueResps)
            }
        } catch (error) {
            console.log("error in calender-event", error)
        }
    }
    useEffect(() => {
        handleGetDynamicFieldsModuleWise()
    }, [menuId])

    useEffect(() => {
        if (fieldArray && fieldArray.length > 0) {
            AddDropDownData()
        }
    }, [fieldArray])


    const handleSubmitDynamicFieldsModuleWise = async () => {
        try {
            let fieldDataNewUpdateVal: any = [];
            fieldArray && fieldArray.map((field: any) => {
                fieldValUpdate && Object.keys(fieldValUpdate).map((fieldVal) => {
                    console.log("fieldValUpdate[field.FieldName]", fieldVal, "sdfghj", field?.FieldName)
                    if (fieldVal === field?.FieldName) {
                        fieldDataNewUpdateVal.push({
                            "Fieldname": field?.FieldName,
                            "FieldValue": fieldValUpdate[fieldVal],
                            "IsMain": field?.IsMainCol
                        })
                    }

                })
            })
            let data = {
                "Userid": localStorage.getItem("username"),
                "ModuleID": 1,
                "Operation": operation ? "INSERT" : "UPDATE", //INSERT or UPDATE
                "fieldsDatanew": fieldDataNewUpdateVal
            }
            const res = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/UpdateDynamicFieldsValuesNew", data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
            if (res) {
                setFieldArray(res?.data?.Fields)
                if (res?.data?.Data && res?.data?.Data.length > 0) {
                    setFieldValUpdate(res?.data?.Data[0])
                }
            }
        } catch (error) {
            console.log("error in calender-event", error)
        }
    }

    return (
        <>
            <Card className='min-h-screen'>
                <div className='flex justify-between items-center mt-5 px-5'>
                <h2 className='text-gray-600'>Calender Add Event Form</h2>
                    <div 
                        onClick={() => setIsUpdate(true)}
                        className='w-[100px] cursor-pointer text-center flex justify-center items-center py-2 px-3 bg-red-600 hover:bg-red-500 rounded-lg text-white gap-2'>
                        <div><FaEdit/></div>
                        <div>Edit</div>
                    </div>
                </div>
                <CardBody>
                    <div
                        className='w-full flex flex-wrap gap-2 pt-3 ml-3'>
                        {
                            fieldArray && fieldArray.map((field: any) => (
                                <>
                                    {
                                        field?.FieldType === 'TEXTBOX' && (

                                            <TextField
                                                name={`${field.FieldName}`}
                                                id={field.FieldName}
                                                label={field?.FieldName}
                                                sx={{ width: `${field.Width}` }}
                                                value={fieldValUpdate[field.FieldName]}
                                                onChange={onChangeInput}
                                                disabled={field?.IsMainCol ? true : false}
                                            />

                                        )
                                    }
                                    {
                                        field?.FieldType === 'CALENDER' && (

                                            <LocalizationProvider dateAdapter={AdapterDayjs} >
                                                <DateTimePicker
                                                    name={field?.FieldName}
                                                    views={['year', 'day']}
                                                    sx={{ width: `${field.Width}` }}
                                                    defaultValue={dayjs(fieldValUpdate[field.FieldName])}
                                                    onChange={(val) => onChangeInput(val)}
                                                    disabled={field?.IsMainCol ? true : false}
                                                />
                                            </LocalizationProvider>

                                        )
                                    }
                                    {
                                        field?.FieldType === 'DROPDOWN' && (
                                            <Autocomplete
                                                // className={`!w-[${field.Width}]`}
                                                sx={{ width: `${field.Width}` }}
                                                value={fieldValUpdate[field.FieldName]}
                                                options={
                                                    dropDownArray
                                                        .find((item: any) => item.Colname.toLowerCase() === field?.Colname.toLowerCase())
                                                        ?.colvalues.map((colvalue: any) => colvalue.Colvalue) || []
                                                }
                                                renderInput={(params) => <TextField {...params} label={field?.FieldName} sx={{ width: `100%` }} />}
                                                onChange={(e, newValue) => onChangeInput({ target: { name: field?.FieldName, value: newValue } })}
                                                disabled={field?.IsMainCol ? true : false}
                                            />
                                        )
                                    }
                                </>
                            ))
                        }
                    </div>

                    <div className=' pt-2 ml-2 mt-3'>
                        <Button color="primary" type='submit' className='px-5 py-2' onClick={handleSubmitDynamicFieldsModuleWise}>Submit</Button>
                    </div>
                </CardBody>
            </Card>

        </>
    )
}

export default DefaultEventForm
