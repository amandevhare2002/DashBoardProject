
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const DynamicPage = () => {
  const token = useSelector((state: any) => state.authReducer.token);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    console.log("username", localStorage.getItem("username"))

    if (token) {
      const storedUserName = localStorage.getItem("username");
      setUserName(storedUserName || ''); // Set the username even if it's null or undefined

      axios
        .post(
          "https://logpanel.insurancepolicy4u.com/api/Login/AuthenticateParty",
          {
            Userid: storedUserName || '', // Use stored username here
            Value: "akjsdhkjasdhkajshdkjasdh",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => { });
    }
  }, [token]);

  return (
    <div>
      <div id="micro-frontend-container"></div>
      {userName && <iframe
        id={"myIFrame"}
        style={{ height: "70vh", width: "100%", display: "block" }}
        src={`https://luminous-unicorn-ddd2c3.netlify.app/?userId=${localStorage.getItem("username")}`}
        // sandbox="allow-scripts allow-same-origin allow-popups"
        allow="camera; microphone"
      ></iframe>}
    </div>
  );
};

export default DynamicPage;

