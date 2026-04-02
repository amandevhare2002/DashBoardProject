import { Autocomplete, Box, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import { getDropDownData, handleSubmit } from "./_components/hooks";
import { previousDay } from "date-fns";
import axios from "axios";
import { MainContext } from "@/pages/user-profile";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "@/app/loading";
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
        <Box sx={{ p: 3, width: "100%" }} >
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

const PersonalDetails = ({ personalDetails, dropDownArray, mainColField }: any) => {
  console.log("personalDetails",personalDetails)
  console.log("dropDownArray",dropDownArray)
  const [value, setValue] = useState<any>(0);
  const [edit, setEdit] = useState(false)
  const [saveData, setSaveData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleInputChange = (e: any) => {
    let state = {
      ...saveData,
      [e.target.name]: e.target.value
    }
    setSaveData(state);
  };



  useEffect(() => {
    if (personalDetails && personalDetails[value] && personalDetails[value]?.Values) {
      const newData: any = {};
      personalDetails[value]?.Values.forEach((item: any) => {
        newData[item.FieldName] = item.FieldValue;
      });
      setSaveData(newData);
    }
  }, [value])

  console.log("saveData", saveData)
  return (
    <Form>
      <ToastContainer />
      {
        loading ? <Loading/> :
      (
      <>
      <div className="w-full justify-between items-center flex">
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          textColor="primary"
          indicatorColor="primary"
          sx={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center", width: "100%" }}
        >
          {
            personalDetails && personalDetails.length > 0 && personalDetails.map((commissionTab: any, i: number) => (

              <Tab
                className=''
                label={
                  <div style={{ width: "100%", height: "30px", padding: "10px" }} className=''>
                    {commissionTab?.Nestedtab}
                  </div>
                }
                {...a11yProps(i)}
                sx={{ minWidth: "140px", marginLeft: "0px", borderRadius: "2px 2px 0px 0px" }}
              />
            ))
          }
        </Tabs>
      </div>
      <CustomTabPanel value={value} index={value}>
        <div className="w-full grid grid-cols-3 gap-x-5">
          {
            personalDetails &&
            personalDetails[value] &&
            personalDetails[value]?.Values &&
            personalDetails[value]?.Values.map((field: any, i: number) => (

              <div className="">
                {
                  field?.FieldType === "BOX" ? (
                    <FormGroup key={field.FieldName}>
                      <Label for={field.FieldName} className="bold max-w-fit">
                        {field.FieldName}
                      </Label>
                      <Input
                        id={field.FieldName}
                        name={field.FieldName}
                        value={saveData[field.FieldName]}
                        placeholder={field.FieldName}
                        disabled={field?.IsMainCol}
                        type={field.FieldName === "DateofBirth" ? "date" : "text"}
                        onChange={(e) => handleInputChange(e)}
                      />
                    </FormGroup>) : (
                    field?.FieldType === "DROPDOWN" && (
                      <>
                        <div>
                          <Label for={field?.FieldName}>
                            {field?.FieldName}
                          </Label>
                          <Autocomplete
                            id={field?.FieldName}
                            defaultValue={saveData[field?.FieldName] || ""}
                            options={
                              dropDownArray
                                  .find((item: any) => item.Colname.toLowerCase() === field?.Colname.toLowerCase())
                                  ?.colvalues.map((colvalue: any) => colvalue.Colvalue) || []
                            }
                            // getOptionLabel={(option) => option.Colvalue}
                            value={saveData && saveData[field?.FieldName] || ""}
                            onChange={(e, newValue) => {
                              const newValueColvalue = newValue ? newValue.Colvalue : "";
                              handleInputChange({ target: { name: field.FieldName, value: newValueColvalue } });
                            }}
                            renderInput={(params) => <TextField {...params} />}
                            sx={{backgroundColor:"#fff"}}
                            freeSolo
                          />
                        </div>
                      </>
                    )
                  )
                }
              </div>
            ))
          }
        </div>
      </CustomTabPanel>
      <div className="mt-2 pl-3">
        <Button
          color="primary"
          onClick={() => handleSubmit({ Details: personalDetails[value]?.Values, saveData: saveData, main: mainColField,setLoading: setLoading })}
        >UPDATE</Button>
      </div>
      </>)}
    </Form>
  );
}

export default PersonalDetails;