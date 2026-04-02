import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import DataTable from "react-data-table-component";
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
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
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
const Commissions = ({ commissionDetails }: any) => {
    console.log("commission Details",commissionDetails)
    const [value, setValue] = useState<any>(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const columnsCommission: any =
    commissionDetails && commissionDetails[0]?.commissionValues.length>0  ?
    Object.keys(commissionDetails && commissionDetails[0]?.commissionValues[0]).map((column:any) =>  {
        return {
          name: column,
          selector: column,
          sortable: true,
          wrap:false,
        }
        
    }): []
    return (
        <div>
            <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
                textColor="primary"
                indicatorColor="primary"
                sx={{ display: "flex", gap: "10px", justifyContent: "space-between", alignItems: "center",width:"100%" }}
            >
                {
                    commissionDetails  && commissionDetails.length > 0 && commissionDetails.map((commissionTab: any, i: number) => (

                        <Tab
                            className=''
                            label={
                                    <div style={{ width: "100%", height: "30px", padding: "10px" }} className=''>
                                        {commissionTab?.Productname}
                                    </div>
                                    }
                            {...a11yProps(i)}
                            sx={{ minWidth: "140px", marginLeft: "0px", borderRadius: "2px 2px 0px 0px" }}
                        />
                    ))
                }

            </Tabs>
            <CustomTabPanel value={value} index={value}>
                  {
                  commissionDetails && commissionDetails.length>0 &&(
                  <div style={{position:"relative"}}>
                  <DataTable
                    title={commissionDetails[value]?.Productname}
                    columns={columnsCommission}
                    data={commissionDetails[value]?.commissionValues}
                    fixedHeader={true}
                    fixedHeaderScrollHeight={"55vh"}
                    pagination
                  />
                  {/* <ButtonDropdown 
              isOpen={onOpen} 
              toggle={() => setOnOpen(!onOpen)}
              style={{position:"absolute",bottom:"0px",left:"0px"}}
              >
              <DropdownToggle caret>
                Export
              </DropdownToggle>
              <DropdownMenu style={{minWidth:"100%"}}>
                <DropdownItem onClick={convertToPDF}>as PDF</DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={convertToExcel}>as Excel</DropdownItem>
                
              </DropdownMenu>
                  </ButtonDropdown> */}
                  </div>
                  )
                  } 
            </CustomTabPanel>
        </div>
    );
}

export default Commissions;