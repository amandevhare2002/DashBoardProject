import { useEffect, useRef, useState } from "react";
import LeftTraining from "./_components/left-training";
import axios from "axios";
import { toast,ToastContainer } from "react-toastify";
import RightTraining from "./_components/right-training";
import { useRouter } from "next/router";
import Image from "next/image";
import "@/styles/pos-module/pos.css"
import 'react-toastify/dist/ReactToastify.css';
// import 'react-responsive-modal/styles.css';
import Modal from '@mui/material/Modal';
import SubmitForm from "./_components/submit-form";
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import { useMediaQuery } from 'react-responsive'
import { FaListUl } from "react-icons/fa6";
 

const TrainingPOS = () => {
    let subtitle:any;
    const router = useRouter()
    const {moduleID} = router.query
    const [training,setTraining] = useState<any>()
    const [isOpen, setIsOpen] = useState(false)
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [mins,setMins] = useState("")
    const [sec,setSec] = useState('')
    const [mount,setMount] = useState(false)
    const videoRef =  useRef<HTMLVideoElement | null>(null);;
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  

    const isDesktopOrLaptop = useMediaQuery({
        query: '(min-width: 1224px)'
    })
    const handleGetTrainingModule=async () => {
         
        const Username = localStorage.getItem("username");
        const TrainingToken= localStorage.getItem("trainingToken");
        if(!moduleID || !Username || !TrainingToken){
            return;
        }
        let data = {
            "Userid": Username,
            "ModuleID":moduleID ,
            "TrainingToken": TrainingToken
        }
        
        const response = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/Starttraining",data,{
            headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} 
        })
         
        if(response.status === 201){
            setTraining(response.data);
            toast.success("Training Module")
        }
    }
    useEffect(()=>{
        handleGetTrainingModule();
    },[])
    
    const handleButton =async (val:string) => {
        const Username = localStorage.getItem("username");
        const TrainingToken= localStorage.getItem("trainingToken");
        if(!training?.SlideNumber || !moduleID || !Username || !TrainingToken){
            return;
        }
        let data = {
            "Userid": Username,
            "ModuleID": moduleID,
            "TrainingToken": TrainingToken,
            "InputType":"NEXT", //NEXT OR PREV
            "SlideNumber":training?.SlideNumber,
            "Min":mins,
            "Seconds":sec
        }

        // console.log("data",data)
        const response = await axios.post("https://logpanel.insurancepolicy4u.com/api/Login/BindSlides",data,{
            headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} 
        })

        if(response.status === 201){
            toast.success("success")
            console.log(response)
            setTraining(response.data)
        }
    }  
    const [isTabActive, setIsTabActive] = useState(true);

    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setIsTabActive(false);
        } else {
          setIsTabActive(true);
        }
      };
  
      const handleFocus = () => {
        setIsTabActive(true);
      };
  
      const handleBlur = () => {
        setIsTabActive(false);
      };
  
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
  
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
      };
    },[]);

    

    const toggleDrawer = () => {
        setIsOpen((prevState) => !prevState)
    }

    const handlePlay = () => {
        console.log('Video started');
        setIsVideoPlaying(true);
      };
    
      const handlePause = () => {
        console.log('Video paused');
        setIsVideoPlaying(false);
      };

      useEffect(() => {
        if (!isTabActive) {
          if (videoRef.current) {
            if (isVideoPlaying) {
              videoRef.current.pause();
            }
    
            setIsVideoPlaying(false);
          }
        }
      }, [isTabActive, isVideoPlaying]);

         
        useEffect(()=> {
            setMount(true)
        },[])


        if(!mount){
            return null
        }
     
    
    return (
        <>
            <div style={{display:"flex",gap:"1px",width:"100%",position:"relative"}}>
                <div className="leftDiv" style={{display:"flex",justifyContent:"space-between"}}>
                {   
                    !isDesktopOrLaptop ? (
                        isOpen ?  
                        (<Drawer
                        open={isOpen}
                        onClose={toggleDrawer}
                        direction='right'
                        className='bla bla bla'
                        style={{top:"61px",borderRadius:"10px",right:"-10px"}}
                        >
                            <LeftTraining
                                training={training}
                                toggleDrawer={toggleDrawer}
                            />
                        </Drawer>)
                        :
                        (
                        <button 
                            onClick={toggleDrawer}
                            style={{width:"auto",position:"absolute",right:"-20px",top:"0px",zIndex:"10px",backgroundColor:"#FF7A29",color:"#fff",padding:"5px",borderRadius:"5px 0px 0px 5px "}}
                        >
                            <FaListUl
                                style={{fontSize:"25px",padding:"0px",margin:"0px"}}
                            />
                        </button>
                        )   
                       
                ): (
                    <LeftTraining
                        setTraining={setTraining}
                        training={training}
                        toggleDrawer={toggleDrawer}
                        mins={mins}
                        sec={sec}
                    />
                )}
               
                </div>
                <div className="rightDiv" style={{flex:"3",display:"flex",flexDirection:"column",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{width:"100%"}}>
                    <div style={{width:"100%"}}>
                        <RightTraining
                            setIsTabActive={setIsTabActive}
                            isTabActive={isTabActive}
                            training={training}
                            setSec={setSec}
                            setMins={setMins}
                            isVideoPlaying={isVideoPlaying}
                            setIsVideoPlaying={setIsVideoPlaying}
                        />
                    </div>
                    
                    <div style={{padding:"10px"}}>
                        {
                            !!training?.IsVideo ?(
                                <div style={{width:"100%",height:"100%"}}>

                                    <video
                                    ref={videoRef}
                                    controls
                                    onPlay={handlePlay}
                                    onPause={handlePause}
                                    style={{objectFit:"contain",marginTop:"1px",width:"100%",height:"100vh",backgroundColor:"#000"}}
                                    className="video-div" 
                                    src={training?.Video_Path} 
                                    title="video tutorial of this course"
                                    
                                    >
                                    <source src={training?.Video_Path} type="video/mp4" />
                                    Your browser does not support the video tag.
                                    </video>
                                    
                                </div>
                            ):(
                                <div style={{width:"100%",height:"100%",}}>
                                    <img
                                    src={`data:image/png;base64,${training && training?.Slide_Base64string}`}
                                    alt=""
                                     
                                    style={{objectFit:"contain",marginTop:"1px",width:"100%",height:"100vh",backgroundColor:"#000"}}
                                    />
                                </div>
                            )
                        }
                    </div>
                    </div>

                     <div className="btn-div" style={{backgroundColor:"#323132",width:"100%",height:"80px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"10px",padding:"0px 10px"}}>
                        <button className='btn1'style={{width:"20%",backgroundColor:"#c1121f"}} onClick={() => handleButton("PREV")}>
                            Previous
                        </button>
                        <div className="btn-div" style={{display:"flex",justifyContent:"space-between",gap:"10px"}}>
                        <button className='btn2'style={{width:"50%",backgroundColor:"#FF7A29"}} onClick={() => handleButton("NEXT")}>
                            Next
                        </button>
                         {
                            training && training.TrainingStatus === "PENDING" && ( 
                            <button className='btn3'style={{width:"50%"}} onClick={() => setModalIsOpen(true)}>
                                Finish
                            </button> 
                            )
                        } 
                        
                        <Modal
                            open={modalIsOpen}
                            onClose={() => setModalIsOpen(false)}
                            style={{width:"100%",height:"fit-content",display:"flex",justifyContent:"center",alignItems:"center",alignSelf:"center",alignContent:"center"}}
                            >
                            <div style={{borderRadius:'10px',backgroundColor:"#fff",padding:"10px"}}>
                            <SubmitForm
                                training={training}                         
                            />
                            </div>
                        </Modal>
                        </div>
                    </div>
                </div>
                
            </div>
            
            <ToastContainer
            position="bottom-right"
            />
        </>
    );
}
 
export default TrainingPOS;