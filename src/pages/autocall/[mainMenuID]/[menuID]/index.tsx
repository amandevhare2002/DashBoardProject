import dynamic from "next/dynamic";
const DynamicComponent = dynamic(() => import("@/app/Layout/autocall"));

const ReportComponent = () => {
  return <DynamicComponent />;
};



export default ReportComponent;