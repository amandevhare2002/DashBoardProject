import dynamic from "next/dynamic";
const DynamicComponent = dynamic(() => import("@/app/Layout/Mailbox/MainDashboard/MainNotification"),  {
  loading: () => <p>Loading...</p>,
});

const Home = ({props}: any) => {
  return <DynamicComponent />;
};

export async function getStaticProps() {

  return {
    props: {},
  };
}


export default Home;
