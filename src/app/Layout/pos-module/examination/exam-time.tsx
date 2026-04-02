import React from 'react'
import "@/styles/pos-module/exam.css"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
function ExamTime({examList}:any) {
  const router = useRouter()
  
  return (
    <div style={{width:"100%"}}>
      <div className="onlineExamination font" style={{width:"100%",backgroundColor:"#f8f9fa",padding:"34px 20px",color:"black"}}>
        <h1 className='heading-exam font'>Online Examination</h1>
        <div className="forWhitCOlor" style={{backgroundColor:"adb5bd",padding:"10px",boxShadow:"0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"}}>
          <div className="forbox" style={{backgroundColor:"#fff",padding:"10px"}}>
            <div className="box table-container" style={{border:"1px solid #adb5bd"}}>
            <table className='font'>
                <thead>
                <tr>
                  <th>RefCode</th>
                  <th>Code</th>
                  <th>Module</th>
                  <th>Date </th>
                  <th>Time</th>
                  <th>Duration (in Hrs)</th>
                  <th>Total Questions</th>
                  <th>Status</th>
                  <th>Action</th>
                  <th>Result</th>
                  <th>Marks</th>
                </tr>
                </thead>
                <tbody>
                <tr >
                  <td>{examList?.ExamRefCode}</td>
                  <td>{examList?.ModuleCode}</td>
                  <td>{examList?.ModuleName}</td>
                  <td>{examList?.ExamDate.slice(0,10)}</td>
                  <td>{examList?.ExamTime}</td>
                  <td>{examList?.Duration}</td>
                  <td>{examList?.TotalQuestions}</td>
                  <td>{examList?.Examstatus}</td>
                  <td>
                  <Link
                  href={{
                    pathname:"/posmodule/examination/examstart",
                    query:{examrefcode:examList?.ExamRefCode,examcode:examList?.ModuleCode}
                  }}
                  >Start Exam</Link></td>
                  <td>{examList?.Result}</td>
                  <td>{examList?.MarksObtained}</td>
                </tr>
                </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamTime