import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/pos-module/form.css'; // Add a separate CSS file for styling
import { DateFormat } from './date-format';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Button } from 'reactstrap';

const SubmitForm = ({training}:any) => {
  const UserName = localStorage.getItem("username")
  const trainingToken = localStorage.getItem("trainingToken")
  const ModuleCode = training && training.ModuleCode
  const router = useRouter();

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Required'),
    moduleCode: Yup.string().required('Required'),
    examDate: Yup.date().required('Required'),
    examHours: Yup.number()
      .required('Required')
      .integer('Must be an integer')
      .min(0, 'Must be at least 0')
      .max(23, 'Must be at most 23'),
    examMinutes: Yup.number()
      .required('Required')
      .integer('Must be an integer')
      .min(0, 'Must be at least 0')
      .max(59, 'Must be at most 59'),
  });

  const initialValues = {
    email:UserName ? UserName :"",
    moduleCode: ModuleCode ? ModuleCode:"",
    examDate: null,
    examHours: '',
    examMinutes: '',
  };

  const onSubmit = async(values:any) => {
    // Handle form submission
    console.log(values);
    const {email,moduleCode,examDate,examHours,examMinutes} = values;

    const date = DateFormat(examDate);

    console.log(date);

    if(!email || !moduleCode || !date || !examHours){
      return
    }else{
      try {
        const data = {
          "Userid":email,
          "ModuleCode":moduleCode,
          "ExamDate":date,
          "ExamHours":examHours,
          "Exammins":examMinutes
        }
      const result = await axios.post(`https://logpanel.insurancepolicy4u.com/api/Login/AssignExam`,data,{
          headers:{Authorization:`Bearer ${localStorage.getItem("token")}`} 
      })

      if(result.data === 'SUCCESS'){
        toast.success("Exam Date created!");
        router.push("/posmodule/examination")
      }else{
        toast.error("something went wrong!")
      }

      } catch (error) {
        console.log(error)
      }
    }

  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });

  return (
    <form className="my-form min-h-fit h-full"  onSubmit={formik.handleSubmit} >
      <h3>Add Your Exam schedule</h3>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="text"
          name="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={UserName ? UserName :formik.values.email}
          disabled = {UserName ? true :false}
        />
        {formik.touched.email && formik.errors.email && (
          <div className="error-message">{formik.errors.email}</div>
        )}
      </div>

      <div className="form-group">
        <label>Module Code:</label>
        <input
          type="text"
          name="moduleCode"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={training?.ModuleCode ? training?.ModuleCode : formik.values.moduleCode}
          disabled={training?.ModuleCode ? true : false}
          placeholder='Enter Module Code'
        />
        {/* {formik.touched.moduleCode && formik.errors.moduleCode && (
          <div className="error-message">{formik.errors.moduleCode}</div>
        )} */}
      </div>
      <div style={{display:"flex",gap:"10px"}}>
      <div className="form-group">
        <label>Exam Date:</label>
        <DatePicker
          selected={formik.values.examDate}
          onChange={(date) => formik.setFieldValue('examDate', date)}
          dateFormat="yyyy-MM-dd"
          placeholderText='Select Date'
          className='!z-[1000] '
        />
        {formik.touched.examDate && formik.errors.examDate && (
          <div className="error-message">{formik.errors.examDate}</div>
        )}
      </div>

      <div className="form-group">
        <label>Exam Time:</label>
        <div style={{display:"flex",gap:"1px"}}>
        <input
          type="number"
          name="examHours"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.examHours}
          placeholder='Enter Hours'
        />
          <span style={{fontSize:"20px"}}>:</span>

            <input
            type="number"
            name="examMinutes"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.examMinutes}
            placeholder='Enter Minutes'
            />
        </div>
        <div style={{display:"flex"}}>
          {formik.touched.examHours && formik.errors.examHours && (
            <div className="error-message">{formik.errors.examHours}</div>
          )}
          {formik.touched.examMinutes && formik.errors.examMinutes && (
            <div className="error-message">{formik.errors.examMinutes}</div>
          )}
        </div>
        </div>
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
};

export default SubmitForm;
