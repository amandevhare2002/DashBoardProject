// import { Autocomplete, Input, TextField } from '@mui/material'
import { Autocomplete, TextField } from '@mui/material';
import axios from 'axios'
import React, { useEffect, useMemo, useState } from 'react'
import { FormGroup, Input } from 'reactstrap'

function RecordInput({ inputName, row, setRecordData, recordData, fieldArray, dropDownArray,type=""}: any) {

    const onChangeInput = (e: any) => {
        let updateRecord = []
        updateRecord = recordData && recordData.map((record: any) => {
            if (record.app_id === row.app_id) {
                // Update the specific field in the row
                return {
                    ...record,
                    [e.target.name]: e.target.value
                };
            }
            return record;
        });
        setRecordData(updateRecord)

    };



    const selectedField = useMemo(() => {
        const res = fieldArray &&
            fieldArray.length > 0 &&
            fieldArray.find((fld: any) => fld.FieldName === inputName)
        return res
    }, [inputName, fieldArray])

    return (
        <div>
            {selectedField && (
                selectedField.FieldType === "LABEL" || selectedField.FieldType === "TEXTBOX" ? (
                    <Input
                        placeholder={inputName}
                        name={`${selectedField.FieldName}`}
                        id={selectedField?.FieldName}
                        label={selectedField?.FieldName}
                        sx={{ width: `100%`, height: `100px` }}
                        value={row[selectedField?.FieldName]}
                        onChange={onChangeInput}
                    />
                ) : (selectedField.FieldType === "DROPDOWN" ? (
                    <FormGroup className='flex flex-1 !w-full  border'>
                        <Autocomplete
                            // className={`!w-[${field.Width}]`}
                            sx={{ minWidth:"150px",width: "100%",padding:"0px!important",margin:"0px!important",paddingRight:"0px!important",}}
                            value={row[inputName]}
                            options={
                                dropDownArray
                                    .find((item: any) => item.Colname.toLowerCase() === selectedField?.Colname.toLowerCase())
                                    ?.colvalues.map((colvalue: any) => colvalue.Colvalue) || []
                            }
                            renderInput={(params) => <TextField {...params}  sx={{ width: `100%` }} />}
                            onChange={(e, newValue) => onChangeInput({ target: { name: selectedField?.FieldName, value: newValue } })}
                            disabled={selectedField?.IsMainCol ? true : false}
                            freeSolo
                        
                        />
                        {/* <Input
                            id={selectedField?.FieldName}
                            name={`${selectedField.FieldName}`}
                            type="select"
                            value={row[inputName]}
                        onChange={onChangeInput}

                        >
                            {dropDownArray && dropDownArray.length>0 && dropDownArray?.find((item: any) => item.Colname.toLowerCase() === selectedField?.Colname.toLowerCase())
                                ?.colvalues.map((colvalue: any) => (
                                    <option>
                                        {colvalue.Colvalue}
                                    </option>
                                )) || []}
                        </Input> */}
                    </FormGroup>
                ) : (
                    selectedField.FieldType === "MULTILINE" && (
                        <FormGroup>
                            <Input
                                id={selectedField?.FieldName}
                                name={`${selectedField.FieldName}`}
                                type="textarea"
                                value={row[inputName]}
                                placeholder={inputName}
                                onChange={onChangeInput}
                            />
                        </FormGroup>
                    )
                ))
            )}
        </div>

    )
}

export default RecordInput
