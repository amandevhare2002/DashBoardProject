import dynamic from "next/dynamic";
const DynamicComponent = dynamic(() => import("@/app/Layout/Mailbox/MainDashboard/Calendar"),  {
  loading: () => <p>Loading...</p>,
});

const Home = () => {
  return <>
    <DynamicComponent />;
  </>
};

export async function getStaticProps() {

  return {
    props: {},
  };
}


export default Home;
