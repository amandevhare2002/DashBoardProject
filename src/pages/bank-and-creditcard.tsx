import dynamic from "next/dynamic";
const DynamicComponent = dynamic(() => import("@/app/Layout/Mailbox/MainDashboard/MainDashboard"),  {
  loading: () => <p>Loading...</p>,
});


const BankAndCreditCard = ({props}: any) => {
    return <>
      <DynamicComponent />;
    </>
  };
  
  export async function getStaticProps() {
  
    return {
      props: {},
    };
  }

  export default BankAndCreditCard;