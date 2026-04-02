import { decryptText } from "@/utils";
import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { Button, Card, CardBody, CardHeader, Col, Collapse, Row ,DropdownItem, DropdownMenu, DropdownToggle,ButtonDropdown} from "reactstrap";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MainTable from "@/utils/table";
import MultiTabs from "./MultiTabs";
import { Router, useRouter } from "next/router";
import { setLoading } from "@/reducers/Auth";
import Loading from '@/app/loading';


export const NewDashboard = () => {

  const isNamePresentInArray = (nameToFind:string, array:any) => {
    const matchingItem = array.find((item:any) => item.name.toLowerCase() === nameToFind.toLowerCase());
    return matchingItem ? matchingItem.id : null;
  };
  const token = useSelector((state: any) => state.authReducer.token);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [tabs, setTabs] = useState<any>([]);
  const [dashArray, setDashArray] = useState<any>([]);
  console.log("dashArray",dashArray)
  const [dashList,setDashList] = useState<any>([])
  const router = useRouter();
  const [dashBoardListPlayload,setDashBoardListPlayload] = useState<any>()

  useEffect(() => {
    if (token) {
      getdashArray();
    }
  }, [token]);


  useEffect(() => {
    if (tabs.length === 0 &&  dashArray.length > 0) {
      setTabs((): any => {
        const _tabs = [
          {
            id: 0,
            name: "Dashboard",
            content: () => renderDashboard(),
            isShowTxn: false,
          },
        ];
        // setSelectedTab(0)
        return _tabs;
      });
    }
  }, [dashArray]);

  const getDashList =async (query:any) => {
    try{
      console.log("query",query)
    setDashBoardListPlayload(query)
    const dynamicQuery = query &&  query?.Keyword

   const res = await axios
      .post(
        `https://logpanel.insurancepolicy4u.com/api/Login/GetDashBoardDataListENC?QueryType=${dynamicQuery}&Userid=${localStorage.getItem("username")}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      if(res){
        console.log("GetDashBoardDataListENC",decryptText(res.data))
        const data = decryptText(res.data);
        setDashList(data[dynamicQuery]);
      }
    }catch(error){
        setDashList([]);
      }
  }

  useEffect(()=>{
    if(dashList && dashArray.length>0){
      const present = isNamePresentInArray(`${dashBoardListPlayload?.Decription} | ${dashBoardListPlayload?.Cnt}` ,tabs)

      if(present){
        handleTabChange(present)
        return;
      }else{
        handleTabCreation(dashBoardListPlayload?.Decription,dashBoardListPlayload,dashList)
      }
    }
  },[dashList])

  const renderDashboard = () => {
    const [expanded, setExpanded] = useState<string | false>(false);

    const toggleAccordion = (outerIndex: number) => {
      setDashArray((prev: any) => {
        const _prev = [...prev]
        _prev[outerIndex].isAccordionExpanded = !_prev[outerIndex].isAccordionExpanded
        return _prev
      })
    }

    const handleChange =(panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
    return (
      <>
         <div className="dashboard">
          {expanded}
           <Row className="p-2">
             {dashArray?.map((category: any, outerIndex: any,i:number) => (
              <>
                <Accordion 
                  key={i} 
                  onChange={handleChange(category?.categoryName)}
                  expanded={expanded === category?.categoryName}
                >
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                sx={{width:"100%"}}
                >
                <div className="flex justify-between w-[96%]">
                  <Typography>
                  {category.categoryName}
                  </Typography>

                  <Button color="primary">
                    count:{category?.categoryCnt}
                  </Button>
                </div>
                </AccordionSummary>
                <AccordionDetails>
                <div >
                <Row>
                          {category.categoryITEMS.length > 0 ? category.categoryITEMS.map((categoryItem: any, itemIndex: any) => (
                            <Col sm="12" lg="6" xl="4" key={itemIndex}>
                              <div key={itemIndex} className="category-item">
                                <Card
                                  className="mb-2 px-2 py-4"

                                  style={{
                                    cursor: 'pointer',
                                    borderBottom: `3px solid ${(itemIndex + 1) % 6 === 0 ? "#C70039" : (itemIndex + 1) % 4 === 0 ? "#08A045" : (itemIndex + 1) % 3 === 0 ? "#0E3386" : (itemIndex + 1) % 2 === 0 ? "#F400A1" : "#FFB000"}`,
                                  }}
                                >
                                  <div className="row">
                                    {
                                      categoryItem?.categorybox?.map((ele: any) => {
                                        return (
                                          <div className="col-6" 
                                          onClick={() => {
                                            getDashList(ele)
                                          }}
                                          // onClick={() => getDashList(ele?.Decription)}
                                          >
                                            <h2 ><strong>{ele?.Cnt}</strong></h2>
                                            <h6 >{ele?.Decription}</h6>
                                          </div>
                                        )
                                      })
                                    }
                                  </div>
                                </Card>
                              </div>
                            </Col>
                          )) : <p>No data found</p>}
                </Row>
                </div>
                </AccordionDetails>
                </Accordion>
              </>
            ))}
          </Row>
        </div>
    </>
    );
  };

const [isLoading, setIsLoading] = useState<any>([]);
  const getdashArray = () => {
    setIsLoading(true);
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetDashBoardENC",
        {
          Userid: localStorage.getItem("username"),
          IpAddress: "122.176.54.19",
          Lat: "23.44",
          Lng: "12.33",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setDashArray(decryptText(res.data).category.map((ele: any) => ({
          ...ele,
          isAccordionExpanded: false
        })));
      })
      .catch((error:any) => {
        if(error.message === "Authorization has been denied for this request."){
          router.push('/login')
        }
        setDashArray([]);
      })
      .finally(() => {
        setIsLoading(false);
      })
  };

  const renderableTabAssetDetails = (companyname: string, tabs: any, assetGroups: any,dashList:any) => {
    // const [dashList,setDashList] = useState<any>()
    console.log("companyName",companyname,dashList)
    const setTabsFieldData = (fieldName: string, data: any) => {
      setTabs((prev: any) => {
        const _prev = [...prev];
        _prev[_prev.length - 1][fieldName] = data;
        return _prev;
      });
    };

    const getTabsFieldData = (fieldName: string) => {
      return tabs[tabs.length - 1][fieldName] ?? [];
    };

    const setInnerTab = (innerTab: number) => {
      setTabs((prev: any) => {
        const _prev = [...prev];
        _prev[_prev.length - 1].innerTab = innerTab;
        return _prev;
      });

    };
    // console.log("tab information",tabs)
    const getInnerTab = () => {
      return tabs[tabs.length - 1].innerTab ?? 0;
    };




    return getInnerTab() === 0 ? (
      <>
           <h3
            style={{
              margin: "20px 0px",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
          {companyname}
          </h3>
          <Card>
            <CardBody style={{position:"relative"}}>
              <MainTable
              TableArray={dashList}
              columns={
                dashList?.length > 0 ?
                  (Object.keys(dashList?.[0]).map((column) => {
                    return {
                      name: column,
                      selector: column,
                      sortable: true,
                      wrap:true,
                      reorder: true,
                    };
                  }) as any)
                  : []
              }
              />
            </CardBody>
          </Card>
        </>
    ):<></>
  };


  const handleTabCreation = (companyName:string, selectedItem: any,dashList:any) => {
    setTabs((prev: any): any => {
      const _tabs = [...prev];
      const tab_name = `${companyName} | ${selectedItem?.Cnt}`
      const present = isNamePresentInArray(tab_name, _tabs)

      if(present){
        handleTabChange(present)
        return _tabs;
      }
      _tabs.push({
        id: _tabs.length,
        name: tab_name,
        content: () => renderableTabAssetDetails(companyName, _tabs,selectedItem,dashList),
        isShowTxn: false,
      });
      setSelectedTab(_tabs.length - 1);
      return _tabs;
    });
  };

  const closeTab = (tabToDeleteId: number) => {
    if (tabToDeleteId === 0) return;
    setTabs(tabs.filter((tab: any) => tab.id !== tabToDeleteId));
    setTabs((prev: any) => prev.map((tab: any, index: number) => ({ ...tab, id: index })));
    setSelectedTab(tabToDeleteId > 0 ? tabToDeleteId - 1 : 0);
  };

  const handleTabChange = (id: number) => {
    setSelectedTab(id);
  };

  return (
    <div>
      {isLoading && <Loading />}
      <MultiTabs tabs={tabs} closeTab={closeTab} selectedTab={selectedTab} setSelectedTab={setSelectedTab} handleTabChange={handleTabChange} />
    </div>
  );
};
	