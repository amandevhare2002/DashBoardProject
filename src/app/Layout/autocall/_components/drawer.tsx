import { memo, useEffect, useMemo, useState, useCallback } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Drawer,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import { FormGroup, Input, Label } from "reactstrap";
import AsyncSelect from 'react-select/async';
import axios from "axios";
import { getDynmicModuleData, handleSubmit } from "@/app/Layout/user-profile/_components/hooks";
import { useRouter } from "next/router";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            className="w-full"
        >
            {value === index && (
                <Box sx={{ p: 1, width: "100%" }} >
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const DrawerComponent = memo(({ calculatorData,dynmicData }: any) => {
    const router = useRouter();
    const { mainMenuID, menuID } = router.query;
    const [value, setValue] = useState(0);
    const [nestedVal, setNestedVal] = useState(0);
    const [calcData, setCalcData] = useState<any>([]);
    const [calcValues, setCalcValues] = useState<any>({});
    const [start, setStart] = useState(false);
    const [columnSelect, setColumnSelect] = useState("")
    const [autoFillText,setAutoFillText] = useState("")
    // const { dynmicData, setDynmicData } = getDynmicModuleData({ moduleID: menuID, recordID: mainMenuID })

    const handleChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    }, []);

    const handleNestedChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setNestedVal(newValue);
    }, []);

    useEffect(() => {
        if (calculatorData) {
            const data = calculatorData[value]?.Fields?.[nestedVal]?.Values || [];
            setCalcData(data);

            const newData = data.reduce((acc: any, item: any) => {
                acc[item.FieldName] = item.FieldValue;
                return acc;
            }, {});
            setCalcValues(newData);

        }
    }, [value, nestedVal, calculatorData]);

    // const evaluateExpression = useCallback((expressionArray: any, values: any) => {
    //     try {
    //         const formulaString = expressionArray.map((item: any) => item.label).join(' ');
    //         const formulaFunction = new Function(...Object.keys(values), `return ${formulaString};`);
    //         return formulaFunction(...Object.values(values));
    //     } catch (error) {
    //         console.error('Error evaluating expression:', error);
    //         return null;
    //     }
    // }, []);

    const evaluateExpression = (expressionArray: any, values: any) => {
        try {
            const formulaString = expressionArray.map((item: any) => item.label).join(' ');
            //   console.log("formulaString", formulaString);
            const formulaFunction = new Function(...Object.keys(values), `return ${formulaString};`);
            return formulaFunction(...Object.values(values));
        } catch (error) {
            console.error('Error evaluating expression:', error);
            return null;
        }
    };

    const getCalculate = useCallback(() => {
        if (!calcData || calcData.length === 0) return;
        console.log("getCalculate")
        const newState = { ...calcValues };

        calcData.forEach((field: any) => {
            if (field?.Formula) {
                const result = evaluateExpression(field?.Formula, calcValues);
                newState[field?.FieldName] = result;
            }
        });

        setCalcValues(newState);
    }, [calcData, calcValues, evaluateExpression]);

    useEffect(() => {
        // if (start) {
        //     setStart(false);
        //     }
        getCalculate();
    }, [start]);

    const AddDropDownData = async (text: any) => {
        try {

            // setLoading(true);
            console.log("dynmicData2",dynmicData)
            const columnsData = dynmicData.find(
                (reportCol: any) => reportCol.FieldName.toLowerCase() === columnSelect.toLowerCase()
            );
            console.log(" columnsData", columnsData)
            console.log(" columnsselect",columnSelect)
            if (!columnsData) {
                return [];
            }

            if(autoFillText === text){
                return []
            }else {
                setAutoFillText(text);
            }
            const data = {
                Userid: localStorage.getItem('username'),
                Dbname: columnsData?.ReadDbname,
                Tabname: columnsData?.ReadTablename,
                Colname: columnsData?.Readcolname,
                ServerName: columnsData?.ReadServername,
                SearchText: text,
            };
            const res = await axios.post(
                'https://logpanel.insurancepolicy4u.com/api/Login/GetDistinctValues',
                data,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            if (res?.data?.colvalues) {
                const options = res.data.colvalues.map((value: any) => ({
                    value: value.Colvalue,
                    label: value.Colvalue,
                }));
                return options
            }
            // setLoading("false");
        } catch (error) {
            return []
            console.log('error', error);
        }
    };
    const onInputChange = (FieldName: any) => {
        setColumnSelect(FieldName)
    };

    const promiseOptions = (inputValue: string) => new Promise<any>((resolve) => {
        console.log("inputvalue",inputValue)    
        setTimeout(() => {
                resolve(AddDropDownData(inputValue));
            }, 1000);
        })
    

    const memoizedFields = useMemo(() => (
        calcData.map((field: any) => {
            switch (field?.FieldType) {
                case "TEXTBOX":
                    return (
                        <div key={field.FieldName} style={{ width: `${field.Width}%`, display: "flex",alignItems:'center',gap:'10px' }}>
                            <FormGroup key={field.FieldName} style={{ display: "flex" }}>
                                <Label for={field.FieldName} className="bold !text-wrap">
                                    {field?.IsFieldNamePrint && (field.FieldName.length > 18 ? `${field.FieldName.slice(0, 18)}..` : field.FieldName)}
                                </Label>
                                <Input
                                    id={field.FieldName}
                                    name={field.FieldName}
                                    value={calcValues?.[field.FieldName] || ""}
                                    placeholder={field?.IsWatermarkPrint && field.WatermarkText}
                                    type="number"
                                    onChange={(e) => {
                                        const state = {
                                            ...calcValues,
                                            [e.target.name]: Number(e.target.value)
                                        };
                                        setCalcValues(state);
                                        setStart(!start)
                                    }}
                                />
                            </FormGroup>
                        </div>
                    );
                case "DROPDOWN":
                    return (
                        <div key={field.FieldName} style={{ width: `${field.Width}%`, display: "flex" ,alignItems:'center',gap:'10px'}}>

                            <Label for={field?.FieldName}>
                                {field?.FieldName}
                            </Label>

                            <AsyncSelect
                                loadOptions={promiseOptions}
                                // defaultOptions={dropDownArray}
                                // onChange={(e) => handleInputChange({ "target": { name: field?.FieldName, value: e?.value } })}
                                onChange={(e: any) => {
                                    const state = {
                                        ...calcValues,
                                        [field?.FieldName]: e.value
                                    };
                                    setCalcValues(state);
                                    setStart(!start)
                                }}
                                value={{
                                    "label": calcValues?.[field.FieldName] || "",
                                    "value": calcValues?.[field.FieldName] || ""
                                }}
                                onInputChange={(val:string) => {
                                    onInputChange(field?.FieldName)
                                    // promiseOptions(val)
                                }}

                                // isDisabled={reportData && reportData.length > 0 && reportData.find((data: any) => data.FieldName === column)?.IsMainCol}
                                noOptionsMessage={() => 'No Suggestions'}
                                onFocus={() => {
                                    setColumnSelect(field?.FieldName)
                                    // setDropDownArray([{ value: '', label: '' }])
                                }}
                                className="w-full"
                            />

                        </div>
                    );
                default:
                    return null;
            }

        })
    ), [calcData, calcValues,columnSelect]);



    return (
        <div className="w-1/2 md:w-[800px]">
            <div className="w-full border-2">
                <div className="justify-between items-center flex flex-col">
                    <h4 className="text-center pt-3">Calculator</h4>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="basic tabs example"
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center", width: "100%", minWidth: "55px!important" }}
                    >
                        {calculatorData?.map((tab: any, i: number) => (
                            <Tab
                                key={i}
                                label={
                                    <div style={{ width: "100%", height: "30px", padding: "10px" }}>
                                        {tab?.Tabname}
                                    </div>
                                }
                                {...a11yProps(i)}
                                sx={{ minWidth: "59px", marginLeft: "0px", borderRadius: "2px 2px 0px 0px" }}
                            />
                        ))}
                    </Tabs>
                </div>
                <CustomTabPanel value={value} index={value}>
                    <Tabs
                        value={nestedVal}
                        onChange={handleNestedChange}
                        sx={{ width: "100%", minWidth: "55px!important" }}
                    >
                        {calculatorData?.[value]?.Fields?.map((tab: any, j: number) => (
                            <Tab
                                key={j}
                                label={
                                    <div style={{ width: "100%", height: "30px", padding: "10px" }}>
                                        {tab?.Nestedtab}
                                    </div>
                                }
                                {...a11yProps(j)}
                                sx={{ minWidth: "59px", marginLeft: "0px", borderRadius: "2px 2px 0px 0px" }}
                            />
                        ))}
                    </Tabs>
                </CustomTabPanel>
                <div className="w-full">
                    <CustomTabPanel value={nestedVal} index={nestedVal}>
                        <div className="w-full flex flex-wrap space-x-4 space-y-3">
                            {memoizedFields}
                        </div>
                    </CustomTabPanel>
                </div>
            </div>
        </div>
    );
});

export default DrawerComponent;
