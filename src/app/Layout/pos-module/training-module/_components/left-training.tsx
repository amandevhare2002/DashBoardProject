import { GrNotes } from "react-icons/gr";
import "@/styles/pos-module/pos.css"
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast,ToastContainer } from "react-toastify";
const LeftTraining = ({training,toggleDrawer,setTraining,mins,sec}:any) => {
    const router = useRouter()
    const {moduleID} = router.query
    const [isMounted,setIsMounted] = useState(false)

  const handleSliderChange = async (SlideNumber:any) => {
    try {
       
    const Username = localStorage.getItem("username");
    const TrainingToken= localStorage.getItem("trainingToken");
    if( !moduleID || !Username || !TrainingToken){
        return;
    }
    let data = {
        "Userid": Username,
        "ModuleID": moduleID,
        "TrainingToken": TrainingToken,
        "InputType":"NEXT", //NEXT OR PREV
        "SlideNumber":SlideNumber.toString(),
        "Min":mins.toString(),
        "Seconds":sec.toString()
    }
    console.log("data",data)
    // console.log("data",data)
    const response = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/BindSlides",data,{
        headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} 
    })
    console.log("response",response)
    if(response.status === 201){
        toast.success("success")
        console.log(response)
        setTraining(response.data)
    }
 
    } catch (error) {
        
    }
  }



  useEffect(()=>{
    setIsMounted(true)
  },[])

  if(!isMounted){
    return null
  }    

    return (
        <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{backgroundColor:"#FFF",display:"flex",flexDirection:"column",color:"#000",padding:"2px 3px",borderRadius:"6px 8px 0px 0px"}}>
                <div className="left-training-div-head font"
                style={{fontSize:"18px",display:"flex",justifyContent:"space-between"}}>
                    <div>
                    {training?.ModuleName}
                    </div>
                    <div style={{cursor:"pointer"}}
                        onClick={toggleDrawer}
                    >
                    x
                    </div>
                </div>
                <div className="font" style={{marginTop:"1px",fontSize:"12px"}}> Total Duration : {training?.TotalDuration}</div>
            </div>
            <div style={{height:"100vh",overflowY:"scroll",scrollBehavior:"smooth", scrollbarWidth: "none"}}>
                {training &&  training.TopicsDone &&training?.TopicsDone.length>0 && training.TopicsDone?.map((item:any,i:number)=>(
                        <div key={item} className="topic-left-div" 
                        onClick={() => handleSliderChange(i)}
                         style={{backgroundColor:"#43488e",display:"flex",color:"#fff",padding:"3px",justifyContent:"space-between",gap:"3px",borderBottom:"1px solid #000",cursor:"pointer"}}>
                            <div>
                                <h1 className="font left-topic lt-name " style={{fontSize:"14px",top:"0cl"}}> <GrNotes/> {item?.Topicname} : </h1>
                                <h4 className="font left-topic">{item.content}</h4>
                            </div>
                            
                            { item.Hours>0 && item.Mins>0 && (<div className="time-left">
                                <div className="font left-topic">Hrs:{item.Hours}</div>
                                <div  className="font left-topic"> Min:{item.Mins} </div>
                            </div>)}
                        </div>
                    
                ))}
                { training && training.TopicsPending &&training.TopicsPending.length>0 &&training?.TopicsPending?.map((item2:any,i:number)=>(
                        
                        <div key={item2} 
                            onClick={() => handleSliderChange(i)}
                            className="topic-left-div" 
                            style={{backgroundColor:"#fff",display:"flex",color:"#000",padding:"3px",justifyContent:"space-between",gap:"3px",borderBottom:"1px solid #000",cursor:"pointer"}}>
                            <div>
                                <h1 className="left-topic font lt-name" style={{fontSize:"14px"}}> <GrNotes/> {item2?.Topicname} : </h1>
                                <h4 className="left-topic font">{item2.content}</h4>
                            </div>
                            { item2.Hours>0 && item2.Mins>0 && (<div className="time-left">
                                <div className="font left-topic">Hrs:{item2.Hours}</div>
                                <div  className="font left-topic"> Min:{item2.Mins} </div>
                            </div>)}
                        </div>
                        
                ))}
            </div>
        </div>
    );
}
 
export default LeftTraining;