import DownExam from "@/app/Layout/pos-module/examination/_components/down-exam";
import UpperExam from "@/app/Layout/pos-module/examination/_components/uper-exam";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ExamStart = () => {
    const [question,setQuestion] = useState<any>({})
    const router = useRouter()
    const {examrefcode,examcode} = router.query
   
    const handleExamStart = async() => {
        try{
        const Username = localStorage.getItem("username");
        if(!Username || !examrefcode || !examcode){
            return
        }
        let data = {
            "Userid":Username,
            "ExamRefCode":examrefcode,
            "ModuleCode":examcode
        }
        
        console.log(data)
        const result = await axios.post(`https://logpanel.insurancepolicy4u.com/api/Login/StartExam`,data,{
                    headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} 
                    })

        console.log(result)

        if(result){
            console.log(result && result.data && result?.data?.Examtoken)
            localStorage.setItem("examtoken",result && result.data && result?.data?.Examtoken)
            setQuestion(result?.data)
        }
    }catch(error){
        console.log(error)
    }
        
    }

    console.log(question)
    useEffect(()=>{
        handleExamStart()
    },[])
    return (
        <div>
            <UpperExam
                question={question}
            />
            <DownExam
                question={question}
                setQuestion={setQuestion}
            />
        </div>
    );
}
 
export default ExamStart;