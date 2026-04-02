import Loading from "@/app/loading";
import { setAuthToken, setIframeURL, setPageBackground } from "@/reducers/Auth";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Col, Row, Button, Form, FormGroup, Label, Input, Modal, ListGroup, ListGroupItem, ModalHeader, ModalBody } from "reactstrap";
import { encryptText } from "../Mailbox/utils";
import pako from "pako";
import { useBackground } from "../Mailbox/utils/pagebackground";
// Layout


const LoginComponent = ({ match }: any) => {
  const router = useRouter();
  const [Userid, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [sessionArray, setSessionArray] = useState([]);
  const [sessionModal, setSessionModal] = useState(false);
  const [pgBgColor, setPgBgColor] = useState();
  const [pgBgImg, setPgBgImg] = useState();
  const dispatch = useDispatch();

  const keyStr = "PKGRPHOTEL#@2023";
  const key = new TextEncoder().encode(keyStr);
  const iv = new Uint8Array(16);
  const { setBackground } = useBackground();

  const onSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      // prepare the payload object
      const payload = {
        userid: Userid,
        password: password
      };

      // stringify and gzip
      const jsonString = JSON.stringify(payload); // Note: Changed from { params }
      const gzipped = pako.gzip(jsonString);

      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["encrypt"]
      );

      // encrypt
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        gzipped
      );

      // convert to base64
      const encryptedBytes = new Uint8Array(encryptedBuffer);
      const buffer = Buffer.from(encryptedBytes);
      const base64string = buffer.toString('base64');

      // send request
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/Login",
        { EncryptedData: base64string },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      if (res.data?.EncryptedData) {
        try {
          // decryption setup
          const encryptedData = Uint8Array.from(
            window.atob(res.data?.EncryptedData),
            c => c.charCodeAt(0)
          ).buffer;

          const decryptionKey = await crypto.subtle.importKey(
            "raw",
            key,
            { name: "AES-CBC" },
            false,
            ["decrypt"]
          );

          // decrypt
          const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-CBC", iv },
            decryptionKey,
            encryptedData
          );

          // process decrypted data
          let finalData;
          try {
            const unzipped = pako.ungzip(new Uint8Array(decryptedData));
            finalData = JSON.parse(new TextDecoder().decode(unzipped));
          } catch (e) {
            // Fallback if not gzipped
            finalData = JSON.parse(new TextDecoder().decode(new Uint8Array(decryptedData)));
          }

          console.log("Decrypted response:", finalData);

          // Handle response
          if (finalData.ErrorCode === 0 && finalData.access_token) {
            // Success
            localStorage.setItem("token", finalData.access_token);
            const pageBackgroundData = {
              color: finalData.PageBackground || '',
              image: finalData.PageBackgroundURL || ''
            };
            dispatch(setAuthToken(finalData.access_token));
            dispatch(setPageBackground(pageBackgroundData));
            setBackground(finalData.PageBackground, finalData.PageBackgroundURL);
            sessionStorage.setItem("IFRAME", finalData?.IframeURL);
            localStorage.setItem("pageBackground", JSON.stringify(pageBackgroundData));
            sessionStorage.setItem("pageBackground", JSON.stringify(pageBackgroundData));
            localStorage.setItem("username", Userid);
            router.push("/");
          } else {
            // Error
            setMessage(finalData.error_description || "Authentication failed");
            setPgBgColor(finalData.PageBackground);
            setPgBgImg(finalData.PageBackgroundURL);
            if (finalData.loginsessiondetails) {
              setSessionArray(finalData.loginsessiondetails);
              setSessionModal(true);
            }
          }
        } catch (decryptError) {
          console.error("Decryption error:", decryptError);
          setMessage("Failed to process server response");
        }
      } else {
        setMessage("Invalid server response");
      }
    } catch (error: any) {
      console.error("Request failed:", error);
      if (error.response.status === 401) {
        router.push("/login");
      } else {
        setMessage(error.response?.data?.error_description || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };
  const sessionLogOut = async (sessionID: any) => {
    setLoading(true);
    try {
      // prepare payload
      const sessionPayload = {
        userid: Userid,
        password: password,
        sessionid: sessionID,
      };

      // stringify and gzip
      const jsonString = JSON.stringify(sessionPayload);
      const sessionGzipped = pako.gzip(jsonString);


      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-CBC" },
        false,
        ["encrypt"]
      );

      // encrypt
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        sessionGzipped
      );

      // 5. Convert to base64
      const encryptedBytes = new Uint8Array(encryptedBuffer);
      const buffer = Buffer.from(encryptedBytes);
      const sessionBasestring = buffer.toString("base64");

      // send encrypted request
      const res = await axios.post(
        "https://logpanel.insurancepolicy4u.com/disablesessionv2",
        { EncryptedData: sessionBasestring },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // handle response (decrypt if needed)
      if (res.data?.EncryptedData) {
        // decrypt response
        const encryptedData = Uint8Array.from(
          window.atob(res.data?.EncryptedData),
          (c) => c.charCodeAt(0)
        ).buffer;

        const decryptionKey = await crypto.subtle.importKey(
          "raw",
          key,
          { name: "AES-CBC" },
          false,
          ["decrypt"]
        );

        const decryptedData = await crypto.subtle.decrypt(
          { name: "AES-CBC", iv },
          decryptionKey,
          encryptedData
        );

        let finalData;
        try {
          const unzipped = pako.ungzip(new Uint8Array(decryptedData));
          finalData = JSON.parse(new TextDecoder().decode(unzipped));
        } catch (e) {
          finalData = JSON.parse(new TextDecoder().decode(new Uint8Array(decryptedData)));
        }

        console.log("Session logout response:", finalData);

        // If ErrorCode is 1 or password is wrong, redirect to login
        if (finalData.ErrorCode === 1 || finalData.error_description?.includes("Username or password is incorrect")) {
          setMessage("Session expired or credentials invalid. Please log in again.");

          // Clear stored tokens and redirect
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          dispatch(setAuthToken(null)); // Clear Redux state

          // Redirect to login page
          router.push("/login"); // Adjust the route as needed
          return;
        }

        // If successful, proceed
        if (finalData.access_token) {
          localStorage.setItem("token", finalData.access_token);
          dispatch(setAuthToken(finalData.access_token));
          localStorage.setItem("username", Userid);
          router.push("/");
        } else {
          setMessage(finalData.error_description || "Session logout failed");
        }
      } else {
        setMessage("Invalid server response");
      }
    } catch (error: any) {
      console.error("Session logout failed:", error);
      setMessage(error.response?.data?.error_description || "Session logout failed");

      // If credentials are wrong, clear storage and redirect
      if (error.res?.data?.error_description?.includes("Username or password is incorrect")) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        dispatch(setAuthToken(null));
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Fragment>
      <Modal title="Active Sessions" toggle={() => {
        setSessionModal(!sessionModal)
      }} centered isOpen={sessionModal}>
        <ModalHeader>Active Sessions</ModalHeader>
        <ModalBody>
          <ListGroup>
            {sessionArray?.map((item: any) => (
              <ListGroupItem
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>IP Address:  {item?.IPAddress}</span>
                    <span>Login Time:  {item?.LoginTime}</span>
                    <span>Browser:   {item?.Browser}</span>
                    <span>Is Mobile:  {item?.IsMobile ? 'true' : 'false'}</span>
                    <span>User Agent : {item?.UserAgent}</span>
                  </div>
                  <Button onClick={() => {
                    sessionLogOut(item.SessionID)
                  }}>Logout</Button>
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        </ModalBody>
      </Modal>
      {loading ? <Loading /> : (<div className="h-100 bg-plum-plate bg-animation">
        <div className="d-flex h-100 justify-content-center align-items-center">
          <Col md="8" className="mx-auto app-login-box">
            <div className="app-logo-inverse mx-auto mb-3" />
            <div className="modal-dialog w-100 mx-auto">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="h5 modal-title text-center">
                    <h4 className="mt-2">
                      <div>Welcome back,</div>
                      <span>Please sign in to your account below.</span>
                    </h4>
                  </div>
                  <Form>
                    <Row form>
                      <Col md={12}>
                        <FormGroup>
                          <Input
                            value={Userid}
                            placeholder="User Name"
                            onChange={(e) => {
                              setUsername(e.target.value);
                            }}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={12}>
                        <FormGroup>
                          <Input
                            type="password"
                            placeholder="Password here..."
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                            }}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </Form>
                  {
                    !!message && (<div
                      className="text-red-500"
                    >{message}
                    </div>)
                  }
                  {/* <div className="divider" /> */}
                </div>

                <div className="modal-footer clearfix flex justify-between">
                  <div className="float-start text-white">
                    <Button
                      color="warning"
                      size="lg"
                      onClick={() => {
                        router.push("https://aadhaar-pi.vercel.app")
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                  <div className="float-end ">
                    <Button
                      color="primary"
                      size="lg"
                      onClick={() => {
                        onSubmit();
                      }}

                    >
                      Login to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </div>
      </div>)}
    </Fragment>
  );
};

export default LoginComponent;