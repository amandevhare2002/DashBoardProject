import dynamic from "next/dynamic";
const DynamicComponent = dynamic(() => import("@/app/Layout/Mailbox/MainDashboard/NewMainDashboard"),  {
  loading: () => <p>Loading...</p>,
});

const Home = ({props}: any) => {
  console.log("props ",props)
  return <DynamicComponent />;
};

export async function getStaticProps() {

  return {
    props: {},
  };
}


export default Home;
