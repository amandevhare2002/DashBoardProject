import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "reactstrap";
import "@/styles/pos-module/exam.css"

const DownExam = ({question,setQuestion}:any) => {
    const router = useRouter()
    const {examrefcode,examcode} = router.query
    const [loading,setLoading] = useState(false)
    const handleNextPrevQuestion = async(button:string) => {
        try {
            setLoading(true)
            console.log("button",button)
            const Username = localStorage.getItem("username");
            const examToken = localStorage.getItem("examtoken") 
            console.log(examToken)  
            console.log(Username," ",examrefcode," ",question.QuestionNumber," ",question.Examtoken)    
            if(!Username || !examrefcode || !question.QuestionNumber){
                return
            }
                            
            let data = {
                "Userid":Username,
                "ExamRefCode":examrefcode,
                "ModuleCode":examcode,
                "QuestionNumber":question.QuestionNumber,
                "ExamToken":question?.Examtoken || examToken,
                "InputType":button,//NEXT or PREV
                "selectedanswer":selectedOption,
            }
            
            console.log(data)
            const resp = await axios.post(`https://logpanel.insurancepolicy4u.com/api/Login/BindQuestion`,data,{
                        headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} 
                        })
            console.log(resp)
            setSelectedOption(null)
            setLoading(false)
            if(resp){
                setQuestion(resp.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleFinalSubmit = async() => {
        try {
            const Username = localStorage.getItem("username");
            const examToken = localStorage.getItem("examtoken") 
            
            if(!Username || !examrefcode || !question.QuestionNumber || !examToken){
                return
            }
            let data = {
                "Userid":Username,
                "ExamRefCode":examrefcode,
                "ModuleCode":examcode,
                "ExamToken":examToken,
                "selectedanswer":selectedOption,
            }
            
            console.log(data)
            const resp = await axios.post(`https://logpanel.insurancepolicy4u.com/api/Login/FinishExam`,data,{
                        headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} 
                        })
            console.log(resp)
            setSelectedOption(null)
            if(resp && resp.data){
                const userresult = resp && resp.data
                // console.log(userresult)
                if(typeof window !== "undefined"){
                    localStorage.setItem("userResult",JSON.stringify(userresult))
                }
                router.push("/posmodule/examination/success")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const [selectedOption, setSelectedOption] = useState(null);
    const handleOptionChange = (event:any) => {
      setSelectedOption(event.target.value);
    };
    return (
        <>
        {
            loading ? (<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"400px"}}><div className="spinner"></div></div>) : (
            <div style={{backgroundColor:"#fff",padding:"20px",marginTop:"30px"}}>
                <div style={{width:"95%"}}>
                    <div className="text-sm" style={{display:"flex",fontSize:"25px",gap:"10px",fontWeight:"600"}}>
                        <span className="text-sm-q" >{question.QuestionNumber})</span>
                        <div className="text-sm-q" >{question.QuestionText}</div>
                    </div>

                    <div style={{display:"flex",flexDirection:"column",fontSize:"18px",gap:"15px",marginTop:"10px",fontWeight:"500"}}>
                        <div style={{display:"flex",gap:"10px"}}>
                        <input type="radio" name="question" id="option 1" value={"A"} checked={selectedOption === 'A'} onChange={handleOptionChange}/>
                        <label htmlFor="option 1" className="text-sm" >{question?.OptionA}</label>
                        </div>

                        <div style={{display:"flex",gap:"10px"}}>
                        <input type="radio" name="question" id="option 2" value={"B"} checked={selectedOption === 'B'} onChange={handleOptionChange}/>
                        <label htmlFor="option 2" className="text-sm" >{question?.OptionB}</label>
                        </div>

                        <div style={{display:"flex",gap:"10px"}}>
                        <input type="radio" name="question" id="option 3" value={"C"} checked={selectedOption === 'C'} onChange={handleOptionChange}/>
                        <label htmlFor="option 3" className="text-sm" >{question?.OptionC}</label>
                        </div>
                        <div style={{display:"flex",gap:"10px"}}>
                        <input type="radio" name="question" id="option 4" value={"D"} checked={selectedOption === 'D'} onChange={handleOptionChange}/>
                        <label htmlFor="option 4" className="text-sm" >{question.OptionD}</label>
                        </div>
                    </div>

                    <div className="btn-div" style={{display:"flex",gap:"12px",height:"40px",marginTop:"10px",textAlign:"center"}}>
                        <Button className="btn text-sm" style={{width:"100%",backgroundColor:"#f48c06",textAlign:"center",justifyContent:"center",alignItems:"center",display:question.QuestionNumber === "1"? "none":"flex"}} onClick={() => handleNextPrevQuestion("PREV")}>PREVIOUS</Button>
                        <Button className="btn text-sm" style={{width:"100%",backgroundColor:"#d00000",textAlign:"center",justifyContent:"center",alignItems:"center",display:'flex'}} onClick={handleFinalSubmit}>FINAL SUBMIT</Button>
                        <Button className="btn text-sm" style={{width:"100%",backgroundColor:"#8ac926",textAlign:"center",justifyContent:"center",alignItems:"center",display:question.QuestionNumber === "50"? "none":"flex"}} onClick={() => handleNextPrevQuestion("NEXT")}>NEXT</Button>
                    </div>
                </div>
            </div>
        )
    }
        </>
    );
}
 
export default DownExam;