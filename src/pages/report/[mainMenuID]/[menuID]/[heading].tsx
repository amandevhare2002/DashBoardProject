import dynamic from "next/dynamic";
const DynamicComponent = dynamic(() => import("@/app/Layout/Report"));

const ReportComponent = () => {
  return <DynamicComponent />;
};



export default ReportComponent;
