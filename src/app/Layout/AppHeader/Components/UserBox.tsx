import axios from "axios";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import {
  Button,
  Card,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";

export const UserBox = () => {
  const router = useRouter();
  const token = useSelector((state: any) => state.authReducer.token);
  // const [userDetails, setUserDetails] = useState<any>(null);

  // useEffect(() => {
  //   if (token) {
  //     const Param = {
  //       UserID: localStorage.getItem("username"),
  //     };
  //     axios
  //       .post(
  //         "https://logpanel.insurancepolicy4u.com/api/Login/GetUserDetails",
  //         Param,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       )
  //       .then((response) => {
  //         setUserDetails(response.data);
  //       })
  //       .catch((error) => {});
  //   }
  // }, [token]);

  const onLogout = () => {
   if (token) {
      const Param = {
        Userid: localStorage.getItem("username"),
      };
      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Logout",
          Param,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
        })
        .catch((error) => {});
    }
  }

  return (
    <Fragment>
      <div className="header-btn-lg pe-0">
        <div className="widget-content p-0">
          <div className="widget-content-wrapper">
            <div className="widget-content-left">
              <UncontrolledButtonDropdown>
                <DropdownToggle color="link" className="p-0">
                  <img
                    width={42}
                    height={42}
                    className="rounded-circle"
                    src={"/images/avatars/1.jpg"}
                    alt=""
                  />
                </DropdownToggle>
                <DropdownMenu end className="rm-pointers dropdown-menu-lg">
                  <div className="dropdown-menu-header">
                    <div className="dropdown-menu-header-inner bg-info">
                      <div
                        className="menu-header-image opacity-2"
                        style={{
                          backgroundImage:
                            "url(" + "/images/dropdown-header/city3.jpg" + ")",
                        }}
                      />
                      <div className="menu-header-content text-start">
                        <div className="widget-content p-0">
                          <div className="widget-content-wrapper">
                            <div className="widget-content-left me-3">
                              <img
                                width={32}
                                className="rounded-circle"
                                src={"/images/avatars/1.jpg"}
                                alt=""
                              />
                            </div>
                            <div className="widget-content-left">
                              <div className="widget-heading">
                                {/* {userDetails?.Name} */}
                              </div>
                              <div className="widget-subheading opacity-8">
                                {/* {localStorage.getItem("username")} */}
                              </div>
                            </div>
                            <div className="widget-content-right me-2">
                              <Button
                                className="btn-pill btn-shadow btn-shine"
                                color="focus"
                                onClick={() => {
                                  onLogout();
                                  localStorage.removeItem("username");
                                  localStorage.removeItem("mailUserId");
                                  localStorage.removeItem("token");
                                  sessionStorage.removeItem("appsideData")
                                  sessionStorage.removeItem("headerList")
                                  sessionStorage.removeItem("panelList")
                                  localStorage.removeItem("iframeURL")
                                  localStorage.clear();
                                  sessionStorage.clear();
                                  router.push("/login");
                                }}
                              >
                                Logout
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Card className="mt-0">
                        <Button
                          className="text-start rounded-tl-none rounded-tr-none"
                          color="primary"
                          outline
                          onClick={() => router.push("/user-profile")}
                        ><AccountCircleIcon/>View User Profile</Button>
                    </Card>
                  </div>
                </DropdownMenu>
              </UncontrolledButtonDropdown>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
