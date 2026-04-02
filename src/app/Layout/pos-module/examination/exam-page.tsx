import { useEffect, useState } from "react";
import ExamTime from "./exam-time";
import axios from "axios";

const ExamPage = () => {
    const [examList,setExamList] = useState()
    const [mount,setMount] = useState(false)

    useEffect(()=> {
        const handleExamList = async() => {
            try {
                const Username = localStorage.getItem("username");
                let data ={
                    "Userid": Username
                }
                const result = await axios.post(`https://logpanel.insurancepolicy4u.com/api/Login/GetExamList`,data,{
                    headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} 
                })

                if(result?.data){
                    setExamList(result && result.data && result.data.Table && result?.data.Table[0])
                }
                
            } catch (error) {
                console.log(error)
            }

        }

        handleExamList();
    },[])
    console.log(examList)
    useEffect(()=> {
        setMount(true)
    },[])

    if(!mount){
        return null;
    }
    return (
        <div>
            <ExamTime
                examList={examList}
            />
        </div>
    );
}
 
export default ExamPage;