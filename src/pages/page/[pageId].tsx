import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Button, Input, Modal, Table, InputGroup } from "reactstrap";
import Select from "react-select";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";

const API_URL = "https://logpanel.insurancepolicy4u.com/api/Login";
// const APP_URLS = {
//   hotel: "https://pinki-tour-travel-7ahh.vercel.app",
//   "car-insurance": "https://luminous-unicorn-ddd2c3.netlify.app",
//   busbooking: "https://ephemeral-rugelach-950ea0.netlify.app",
//   recharge: "https://pinki-recharge-32sp.vercel.app",
//   flight: "https://flight-app-bice.vercel.app",
//   flight_1: "https://flight-work.vercel.app/",
//   flight_2: "https://pooja-flight-work.vercel.app/"
// };

const DynamicPage = () => {
  const token = useSelector((state: any) => state.authReducer.token);
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [random, setRandom] = useState(0);
  const [emailUserList, setEmailUserList] = useState([]);
  const [selectedEmailUser, setSelectedEmailUser] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [enquiryList, setEnquiryList] = useState([]);
  const [flightList, setFlightList] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState("");
  const [selectedFlight, setSelectedFlight] = useState("");
  const [newFlightList, setNewFlightList] = useState([]);
  const [selectedAddIn, setSelectedAddIn] = useState("");
  const [selectedCalc, setSelectedCalc] = useState("");
  const [fareValue, setFareValue] = useState("");
  const [enterOtp, setEnterOtp] = useState("");
  const [isOtp, setIsOtp] = useState(false);
  const [emulateUserId, setEmulateUserId] = useState("");
  const [permissions, setPermissions] = useState<any>({});
  const [permissionModal, setPermissionModal] = useState(false);
  const [recordId, setRecordId] = useState<string>("");
  const [menuItems, setMenuItems] = useState<any>([]);
  const [selectedPannelId, setSelectedPannelId] = useState("1");

  const resetFrame = useCallback(() => {
    setRandom((prevRandom) => prevRandom + 1);
  }, []);

  useEffect(() => {
    if (token) {
      const storedUserName = localStorage.getItem("username") || "";
      setUserName(storedUserName);
      getEmailUserList();
      getMenuItems()
    }
  }, [token, router.query.pageId]);

  const getMenuItems = async () => {
    try {

      if (!sessionStorage.getItem('appsideData')) {
        const response = await axios(
          `https://logpanel.insurancepolicy4u.com/api/Login/GetMenuItems2?ProjectType=${selectedPannelId}&Userid=${localStorage.getItem(
            "username"
          )}&device=1&ipaddress=122.76.54.19`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (response) {
          sessionStorage.setItem('appsideData', JSON.stringify(response?.data))
          // appsideData = response?.data
        }
      }

      const appsideData = sessionStorage.getItem('appsideData')
      let mainData = appsideData && JSON.parse(appsideData)
      const newArray = mainData.menuitems?.map(
        (res: any, index: number) => {
          const Object = {
            icon: res.IconClassName,
            pannelName: res.PanelName,
            label: res.MainMenuName,
            IconClassName: res.IconClassName,
            IconHeight: res.IconHeight,
            IconPathUrl: res.IconPathUrl,
            IconWidth: res.IconWidth,
            IsSubmenu: res.IsSubmenu,
            mainMenuId: res.MainMenuID,
            MainMenuName: res.MainMenuName,
            MenuHeaderName: res.MenuHeaderName,
            PanelName: res.PanelName,
            HeaderID: res.MenuHeaderID,
            HeaderName: res.MenuHeaderName,
            ServerName: res.DefaultServername,
            DefaultDbname: res.DefaultDbname,
            DefaultTableName: res.DefaultTablename,
            color: res.FontColor,
            subMenu: res.submenuitems?.map((response: any) => {
              const object = {
                label: response.SubmenuName,
                mainMenuId: res.MainMenuID,
                menuId: response.MenuID,
                ModuleID: response.ModuleID,
                // to: getRoute(response, res),
                SubMenuIconClsName: response.SubMenuIconClsName,
                SubmenuName: response.SubmenuName,
                SubMenuSequenceNo: response.SubMenuSequenceNo,
                SubmenuIconPathUrl: response.SubmenuIconPathUrl,
                IsSubmenuActive: response.IsSubmenuActive,
                DefaultDbname: response.DefaultDbname,
                DefaultTabname: response.DefaultTablename,
                PathUrl: response.PathUrl,
                HeaderID: res.MenuHeaderID,
                HeaderName: res.MenuHeaderName,
                LinkURL: response?.LinkURL,
                color: response?.FontColor
              };
              return object;
            }),
            content: res.submenuitems?.map((response: any) => {
              if (response.IsSubmenuActive) {
                const object = {
                  label: response.SubmenuName,
                  mainMenuId: res.MainMenuID,
                  menuId: response.MenuID,
                  ModuleID: response.ModuleID,
                  // to: getRoute(response, res),
                  SubMenuIconClsName: response.SubMenuIconClsName,
                  SubmenuName: response.SubmenuName,
                  SubMenuSequenceNo: response.SubMenuSequenceNo,
                  SubmenuIconPathUrl: response.SubmenuIconPathUrl,
                  IsSubmenuActive: response.IsSubmenuActive,
                  DefaultDbname: response.DefaultDbname,
                  DefaultTabname: response.DefaultTablename,
                  PathUrl: response.PathUrl,
                  HeaderID: res.MenuHeaderID,
                  HeaderName: res.MenuHeaderName,
                  ServerName: response.ServerName,
                  LinkURL: response?.LinkURL,
                  FontColor: response?.FontColor
                };
                return object;
              }
            }),
          };
          return Object;
        }
      );

      console.log("newArray", newArray)
      setMenuItems(newArray);

    } catch (error) {
      console.log("error", error)
    }
  };

  const APP_URLS = useMemo(() => {
    let appUrls: any = {};

    menuItems.forEach((menu: any) => {
      const filteredContents = menu.content.filter((sub: any) => !!sub.LinkURL && sub.LinkURL !== "");
      console.log("filteredContents", filteredContents);
      filteredContents.forEach((content: any) => {
        let path = content.PathUrl.split("/");
        if (path[0] === "page") {
          appUrls[path[path.length - 1]] = content.LinkURL;
        } else {
          appUrls[content.PathUrl] = content.LinkURL;
        }
      });
    });
    return appUrls;
  }, [menuItems]);

  console.log("APP_URLS", APP_URLS)


  const getEmailUserList = useCallback(() => {
    const Params = {
      Userid: localStorage.getItem("username"),
      InputType: "TRANSFER",
    };
    const fetchEmailUserList = async () => {
      try {
        const response = await axios.post(`${API_URL}/GetEmailIDList`, Params, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmailUserList(response?.data?.EmailList || []);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchEmailUserList();
  }, [token]);

  const getEnquiryList = useCallback(() => {
    const Params = {
      Userid: localStorage.getItem("username"),
      InputType: "FLIGHT",
    };
    const fetchEnquiryList = async () => {
      try {
        const response = await axios.post(`${API_URL}/GetEnquiryList`, Params, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEnquiryList(response?.data?.Table || []);
        setFlightList(response?.data?.Table1 || []);
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchEnquiryList();
  }, [token]);

  const generateOtp = useCallback(
    (userId: string) => {
      const Params = {
        Userid: localStorage.getItem("username"),
        EmulateUserId: userId,
        Product: "FLIGHT",
      };
      const fetchOtp = async () => {
        try {
          const response = await axios.post(`${API_URL}/GenerateOTP`, Params, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setEmulateUserId(userId);
          setIsOtp(true);
        } catch (error) {
          console.log("error", error);
        }
      };
      fetchOtp();
    },
    [token]
  );

  const handleOtpSubmit = useCallback(() => {
    const Params = {
      Userid: localStorage.getItem("username"),
      EmulateID: emulateUserId,
      Product: "FLIGHT",
      OTP: enterOtp,
    };
    const verifyOtp = async () => {
      try {
        const response = await axios.post(`${API_URL}/VerifyOTP`, Params, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPermissions(response.data);
        setIsOtp(false);
        setPermissionModal(true);
        setSelectedEmailUser(emulateUserId);
      } catch (error) {
        console.log("error", error);
      }
    };
    verifyOtp();
  }, [token, emulateUserId, enterOtp]);

  const handleEnquiryChange = useCallback(
    (e: any) => {
      setSelectedEnquiry(e?.value || "");
      const newFlightList = flightList.filter((res: any) => {
        if (e?.value === res.EnquiryNo) {
          return { value: res.AirlineCode, label: res.AirlineCode };
        }
      });
      setNewFlightList(newFlightList);
    },
    [flightList]
  );

  const handleFareSubmit = useCallback(() => {
    const Params = {
      Userid: localStorage.getItem("username"),
      Enquiryno: selectedEnquiry,
      Value: fareValue,
      InputType: "FLIGHT",
      AddIn: selectedAddIn,
      CalcType: selectedCalc,
      AirCode: selectedFlight,
    };
    const updateDynamicFare = async () => {
      try {
        await axios.post(`${API_URL}/UpdateDynamicFare`, Params, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsOpen(false);
      } catch (error) {
        console.log("error", error);
      }
    };
    updateDynamicFare();
  }, [
    token,
    selectedEnquiry,
    fareValue,
    selectedAddIn,
    selectedCalc,
    selectedFlight,
  ]);

  console.log("permissions", permissions);

  return (
    <div>
      <Modal
        toggle={() => {
          setPermissionModal(false);
        }}
        isOpen={permissionModal}
        style={{ marginTop: 200, width: "80%", maxWidth: "80%" }}
      >
        <div style={{ padding: 30 }}>
          <ul>
            {
              //@ts-ignore
              permissions?.["Booking Limits"]?.map((res: any) => (
                <li>
                  {" "}
                  {res.Product} - {res.BookLimit}
                </li>
              ))
            }
          </ul>
          <Table responsive bordered>
            <tr>
              <th> USERID</th>
              <th> Available Limit</th>
              <th> Credit Limit</th>
              <th> Is Display Coupon Code</th>
              <th> Is Gift Card Apply</th>
              <th> Is Process Air Refund</th>
              <th> Air booking Hold</th>
              <th> Bus Booking Hold</th>
              <th> Hotel Booking Hold</th>
              <th> Is MultiID Fare Display</th>
              <th> Is Corporate Code Apply</th>
              <th> Is Logo Print</th>
              <th> Hotel Multi Rate View</th>
            </tr>
            <tbody>
              {permissions?.Permissions?.map((row: any, rowIndex: number) => (
                <tr key={rowIndex}>
                  <td>{row.USERID}</td>
                  <td>{row.availablelimit}</td>
                  <td>{row.creditlimit}</td>
                  <td>{row.IsDisplayCouponCode ? "true" : "false"}</td>
                  <td>{row.IsGiftCardApply ? "true" : "false"}</td>
                  <td>{row.IsProcessAirRefund ? "true" : "false"}</td>
                  <td>{row.AirbookingHold ? "true" : "false"}</td>
                  <td>{row.BusBookingHold ? "true" : "false"}</td>
                  <td>{row.HotelBookingHold ? "true" : "false"}</td>
                  <td>{row.IsMultiIDFareDisplay ? "true" : "false"}</td>
                  <td>{row.IsCorporateCodeApply ? "true" : "false"}</td>
                  <td>{row.IsLogoPrint ? "true" : "false"}</td>
                  <td>{row.HotelMultiRateView ? "true" : "false"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal>
      <Modal
        toggle={() => {
          setIsOtp(false);
        }}
        isOpen={isOtp}
        style={{ marginTop: 200 }}
      >
        <div style={{ padding: 20 }}>
          <Input
            placeholder="Enter OTP"
            type="number"
            value={enterOtp}
            onChange={(e: any) => {
              setEnterOtp(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 20, width: 200 }}
            color="primary"
            onClick={handleOtpSubmit}
          >
            Submit
          </Button>
        </div>
      </Modal>
      <Drawer
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        direction="right"
        className="bla bla bla"
      >
        <div style={{ marginTop: 100, padding: 20 }}>
          <Select
            options={enquiryList.map((res: any) => ({
              value: res.EnquiryNo,
              label: res.EnquiryNo,
            }))}
            isClearable
            placeholder="Select Enquiry"
            value={
              selectedEnquiry
                ? {
                  value: selectedEnquiry,
                  label: selectedEnquiry,
                }
                : null
            }
            onChange={handleEnquiryChange}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                width: 200,
              }),
            }}
          />

          <Select
            options={newFlightList?.map((res: any) => ({
              value: res.AirlineCode,
              label: res.AirlineCode,
            }))}
            isClearable
            placeholder="Select Airline"
            value={
              selectedFlight
                ? {
                  value: selectedFlight,
                  label: selectedFlight,
                }
                : null
            }
            onChange={(e: any) => {
              setSelectedFlight(e?.value || "");
            }}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                width: 200,
                marginTop: 20,
              }),
            }}
          />

          <Select
            options={[
              { value: "BASIC ", label: "BASIC " },
              { value: "TAXES", label: "TAXES" },
            ]}
            isClearable
            placeholder="Select Add In"
            value={
              selectedAddIn
                ? {
                  value: selectedAddIn,
                  label: selectedAddIn,
                }
                : null
            }
            onChange={(e: any) => {
              setSelectedAddIn(e?.value || "");
            }}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                width: 200,
                marginTop: 20,
              }),
            }}
          />
          <Select
            options={[
              { value: "FIXED ", label: "FIXED " },
              { value: "PER", label: "PER" },
            ]}
            isClearable
            placeholder="Select Calac Type"
            value={
              selectedCalc
                ? {
                  value: selectedCalc,
                  label: selectedCalc,
                }
                : null
            }
            onChange={(e: any) => {
              setSelectedCalc(e?.value || "");
            }}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                width: 200,
                marginTop: 20,
              }),
            }}
          />

          <Input
            style={{ marginTop: 20 }}
            placeholder="Enter Value"
            type="number"
            value={fareValue}
            onChange={(e: any) => {
              setFareValue(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 20, width: 200 }}
            color="primary"
            onClick={handleFareSubmit}
          >
            Submit
          </Button>
        </div>
      </Drawer>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginRight: 20,
          marginBottom: 20,
        }}
      >
        <Button onClick={resetFrame}>Refresh Frame</Button>
        <InputGroup style={{ width: 200 }}>
          <Input

            placeholder="Enter Record ID"
            value={recordId}
            onChange={(e: any) => {
              setRecordId(e.target.value);
            }}
          />
          <Button
            onClick={() => {
              resetFrame();
            }}
          >
            Submit
          </Button>
        </InputGroup>
        <Button
          onClick={() => {
            getEnquiryList();
            setIsOpen(true);
          }}
        >
          Change Fare
        </Button>
        <Select
          options={emailUserList.map((res: any) => ({
            value: res.Userid,
            label: res.Userid,
          }))}
          isClearable
          placeholder="Select User"
          value={{
            value: selectedEmailUser,
            label: selectedEmailUser,
          }}
          onChange={(e: any) => {
            if (e?.value) {
              generateOtp(e?.value);
            } else {
              setSelectedEmailUser(e?.value || "");
            }
          }}
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              width: 300,
            }),
          }}
        />
      </div>
      <div id="micro-frontend-container"></div>
      {userName && (
        <iframe
          key={random}
          id="myIFrame"
          style={{ height: "70vh", width: "100%", display: "block" }}
          allow="camera; microphone"
          src={
            selectedEmailUser
              ? recordId ? `${
                //@ts-ignore
                APP_URLS[router.query.pageId]
                }/?userId=${localStorage.getItem(
                  "username"
                )}&emulateId=${selectedEmailUser}&token=${token}` : `${
              //@ts-ignore
              APP_URLS[router.query.pageId]
              }/?userId=${localStorage.getItem(
                "username"
              )}&emulateId=${selectedEmailUser}&token=${token}&recordId=${recordId}`
              : recordId ? `${
                //@ts-ignore
                APP_URLS[router.query.pageId]
                }/?userId=${localStorage.getItem("username")}&token=${token}&recordId=${recordId}` : `${
              //@ts-ignore
              APP_URLS[router.query.pageId]
              }/?userId=${localStorage.getItem("username")}&token=${token}`
          }
        ></iframe>
      )}
    </div>
  );
};

export default DynamicPage;
