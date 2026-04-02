import dynamic from "next/dynamic";
const DynamicComponent = dynamic(() => import("@/app/Layout/Dashboard"),  {
  loading: () => <p>Loading...</p>,
});
//@ts-ignore
const Main = ({props}: any) => {
  return <DynamicComponent />;
};




export default Main;
