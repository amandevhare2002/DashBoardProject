import React, { useEffect, useRef, useState } from 'react'
import { IoMdTime } from "react-icons/io";
import "@/styles/pos-module/pos.css"
import { useStopwatch } from 'react-timer-hook';



const RightTraining = ({ training ,isTabActive,setIsTabActive,setMins,setSec,isVideoPlaying,setIsVideoPlaying}: any) => {
  
  const [isMounted,setIsMounted] = useState(false)    
      const {
        totalSeconds,
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        reset,
      } = useStopwatch({ autoStart: true });

      useEffect(()=> {
        setSec(seconds)
        setMins(minutes)
      },[minutes,seconds])

      useEffect(()=>{
         
        if(training){
        if(isVideoPlaying && isTabActive && training?.IsVideo){
          start()
        }else if(!isVideoPlaying && isTabActive && training?.IsVideo){
          pause()
        }else if(isVideoPlaying && !isTabActive && training?.IsVideo){
          pause()
        }else if(!isVideoPlaying && !isTabActive && training?.IsVideo){
          pause()
        }else if(!training?.IsVideo && isTabActive){
          start()
        }else if(!training?.IsVideo && !isTabActive){
          pause()
        }
        }

        
      },[isTabActive,isVideoPlaying,training])


      useEffect(()=>{
        setIsMounted(true)
      },[])

      if(!isMounted){
        return null
      }
    return (
        <div className='right-div-training'
        style={{ display: "flex", justifyContent: "center",alignItems:"center",fontSize:"18px",width:"100%"}}>
                <div 
                className='right-div-training-2'
                style={{ width: "30%", height: "80px", color:"#8DC63F", backgroundColor: "#fff", padding: "10px", display: "flex", gap: "40px", alignItems: "center", borderLeft: `3px solid #8DC63F`, borderRadius: "10px", boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}>
                    <div>
                        <p>
                            {training?.CompletedTime}
                            <br />
                            Completed
                        </p>
                    </div>
                     <div>
                        <p style={{ fontSize: "30px" }}>
                          {/* <IoMdTime/> */}
                        </p>
                    </div> 
                </div>
                <div 
                className='right-div-training-2'
                style={{ width: "32%", height: "80px", color: "#FF7A29", backgroundColor: "#fff", padding: "10px", display: "flex", gap: "40px", alignItems: "center", borderLeft: `3px solid #FF7A29`, borderRadius: "10px", boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}>
                    <div>
                        <p>
                        {training?.PendingTime} <br/>
                        Pending
                        </p>
                    </div>
                    <div>
                        <p style={{ fontSize: "30px" }}>
                           
                        </p>

                    </div>
                </div>
                <div 
                className='right-div-training-2'
                style={{ width: "32%", height: "80px", color: "#3B8AFF", backgroundColor: "#fff", padding: "10px", display: "flex", gap: "40px", alignItems: "center", borderLeft: `3px solid #3B8AFF`, borderRadius: "10px", boxShadow: " rgba(100, 100, 111, 0.2) 0px 7px 29px 0px" }}>
                    <div>
                        <p>
                            {hours && (<span>{hours}:</span>)}
                          <span>{minutes}</span>:<span>{seconds > 10 ? seconds : `0`+ `${seconds}`}</span>
                            
                            <br/>
                            Duration
                        </p>
                    </div>
                    <div>
                        <p className='icon-right-training'  style={{ fontSize: "30px" }}>
                        <IoMdTime />
                        </p>

                    </div>
                </div>
        </div>
    )
}

export default RightTraining
