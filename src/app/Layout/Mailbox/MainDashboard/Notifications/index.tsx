import { decryptText } from "@/utils";
import MainTable from "@/utils/table";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { Row, Col, Card, CardBody } from "reactstrap";
import MultiTabs from "../MultiTabs";
import { setLoading } from "@/reducers/Auth";
import Loading from '@/app/loading';
interface DashListType {
  // Define the properties of your dashList objects here
  [key: string]: string | number | boolean; // Adjust property types as needed
}

export const Notifications = () => {

  const isNamePresentInArray = (nameToFind: string, array: any) => {
    const matchingItem = array.find((item: any) => item.name.toLowerCase() === nameToFind.toLowerCase());
    return matchingItem ? matchingItem.id : null;
  };

  const token = useSelector((state: any) => state.authReducer.token);
  const [notificationsArray, setNotificationsArray] = useState<any>([]);
  const [dashList, setDashList] = useState<any>([]);
  const [isQuerySelected, setIsQuerySelected] = useState<boolean>(false);
  const [tabs, setTabs] = useState<any>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [dashBoardListPlayload, setDashBoardListPlayload] = useState<any>()


  useEffect(() => {
    if (token) {
      setIsLoading(true);
      getdashArray();
    }
  }, [token]);


  useEffect(() => {
    if (tabs.length === 0 && notificationsArray.length > 0) {
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
  }, [notificationsArray]);




  const getDashList = (query: any) => {
    setDashBoardListPlayload(query)
    const data = {
      "Userid": localStorage.getItem("username"),
      "InputType": "NOTIFICATION",
      "Value": query?.NotificationType
    }
    axios
      .post(
        `https://logpanel.insurancepolicy4u.com/api/Login/GetTransactions`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        const decryptdata = decryptText(res.data);
        console.log("data", decryptdata);
        if (decryptdata?.Transactions.length > 0) {
          setDashList(decryptdata?.Transactions);
        } else {
          const data = {
            "Userid": localStorage.getItem("username"),
            "InputType": "NOTIFICATION",
            "Value": query?.NotificationType
          }
          axios
            .post(
              `https://logpanel.insurancepolicy4u.com/api/Login/GetTransactions`,
              data,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ).then((res) => {
              const decryptdata = (res.data);
              console.log("data", decryptdata);
              if (decryptdata?.Transactions.length > 0) {
                setDashList(decryptdata?.Transactions);
                setIsQuerySelected(true);
              } else {
                return
              }

            })
        }
      })
      .catch((error) => {
        setDashList([]);
      });
  };

  useEffect(() => {
    if (dashList && dashList.length > 0) {
      const present = isNamePresentInArray(`${dashBoardListPlayload?.NotificationType} | ${dashBoardListPlayload?.Cnt}`, tabs)
      if (present) {
        handleTabChange(present)
        return;
      } else {
        handleTabCreation(dashBoardListPlayload?.NotificationType, dashBoardListPlayload, dashList)
      }
    }
  }, [dashList])


  const renderDashboard = () => {
    return (
      <>
        <div className="dashboard">
          <Row className="p-2">
            {notificationsArray.length > 0 ? notificationsArray.map((item: any, index: any) => (
              <>
                <Col sm="6" lg="3" key={index}>
                  <div key={index} className="category-item">
                    <Card
                      className="mb-2 px-2 py-4 cursor-pointer"
                      onClick={() => getDashList(item)}
                      style={{

                        borderBottom: `3px solid ${(index + 1) % 6 === 0 ? "#C70039" : (index + 1) % 4 === 0 ? "#08A045" : (index + 1) % 3 === 0 ? "#0E3386" : (index + 1) % 2 === 0 ? "#F400A1" : "#FFB000"}`,
                      }}
                    >
                      <h2 ><strong>{item?.Cnt}</strong></h2>
                      <h6 >{item?.NotificationType}</h6>
                    </Card>
                  </div>
                </Col>
              </>
            )) : <Card className="mb-2 px-2 py-4 h-100 align-items-center justify-content-center"><h5>No data found</h5></Card>
            }
          </Row>
        </div>
      </>
    );
  };
  const [isLoading, setIsLoading] = useState(false);


  const getdashArray = () => {
    setIsLoading(true);
    axios
      .post(
        "https://logpanel.insurancepolicy4u.com/api/Login/GetNotifications",
        {
          Userid: localStorage.getItem("username"),
          // IpAddress: "122.176.54.19",
          // Lat: "23.44",
          // Lng: "12.33",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        // console.log("res in notifications",res?.data)
        setNotificationsArray(res.data?.Notifications);
      })
      .catch((error) => {
        setNotificationsArray([]);
      })
      .finally(() => {
        setIsLoading(false);
      })
  };

  const renderableTabAssetDetails = (companyname: string, tabs: any, assetGroups: any, dashList: any) => {
    const [fullview, setFullView] = useState<any>([])
    // const [dashList,setDashList] = useState<any>()
    console.log("companyName", companyname, dashList)
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


    const columnsNotification = useMemo(() => {
      console.log("fullview", fullview)

      return dashList?.length > 0 && Object.keys(dashList[0]).map((column, i) => ({
        name: column,
        selector: (row: any, index: any) => {


          return (
            <div
              onDoubleClick={() => setFullView((prev: any) => {
                const newValue = `${index}${i}`;
                // if()
                if (prev.includes(newValue)) {
                  return prev.filter((item: any) => item !== newValue);
                } else {
                  return [...prev, newValue];
                }
              })}
            >
              {fullview.includes(`${index}${i}`) ? row[column] : (row[column] && row[column].length > 30 ? row[column].slice(0, 30) + '..' : row[column])}
            </div>
          );
        },
        sortable: true,
        wrap: true,
        reorder: true,
      }));
    }, [dashList, fullview]);

    console.log("fullview", fullview)

    return getInnerTab() === 0 ? (
      <>
        <Card>
          <CardBody>
            <MainTable
              TableArray={dashList}
              columns={columnsNotification}
            />

          </CardBody>
        </Card>
      </>
    ) : <></>
  };


  const handleTabCreation = (companyName: string, selectedItem: any, dashList: any) => {
    setTabs((prev: any): any => {
      const _tabs = [...prev];
      _tabs.push({
        id: _tabs.length,
        name: `${companyName} | ${selectedItem?.Cnt}`,
        content: () => renderableTabAssetDetails(companyName, _tabs, selectedItem, dashList),
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
    <>
      {isLoading && <Loading />}
      <MultiTabs tabs={tabs} closeTab={closeTab} selectedTab={selectedTab} setSelectedTab={setSelectedTab} handleTabChange={handleTabChange} />
    </>
  );
};