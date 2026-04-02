"use client"
import { useEffect, useState } from "react";
import "@/styles/pos-module/result.css"
import useDownloader from 'react-use-downloader';
import Link from "next/link";
const Success = () => {
    const [userResult,setUserResult]  = useState<any>()
    useEffect(()=> {
        const  result:any = localStorage.getItem('userResult') ? localStorage.getItem('userResult') : ""
        setUserResult(JSON.parse(result))
    },[])

    const { size, elapsed, percentage, download, cancel, error, isInProgress } =
    useDownloader( {mode: 'no-cors',
    credentials: 'include',});
    const fileUrl ="https://logpanel.insurancepolicy4u.com/Files/"  

    const filename = "exam.jpg"
     
    return (
    <div className="success-container">
      <h1>Congratulations! You have Successfully Qualified the Exam</h1>
      
      <h4>Result: {userResult && userResult.Result}</h4>
      <h4>Obtained Marks: {userResult && userResult.Marksobtained}</h4>

      <div className="certificates-section">
        <h2>Download Certificates:</h2>
        <p>
          <button 
        //   href={userResult && userResult?.TrainingCertifcateURL} 
        onClick={() => download(fileUrl, 'exam.jpg')}
        //   target="_blank" download="TrainingCertificate.jpg"
          >Download Training Certificate</button>
        </p>
        <p>
          <a href={userResult?.ExamPassCertifcateURL} target="_blank" 
        onClick={() => download(fileUrl, 'exam.jpg')}>Download Exam Pass Certificate</a>
        </p>
      </div>
    </div>
    );
}
 
export default Success;