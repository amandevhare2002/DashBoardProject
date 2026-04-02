import dynamic from "next/dynamic";
const DynamicComponent = dynamic(() => import('@/app/Layout/Mailbox'));

const MailBoxComponent = ({props}: any) => {
  return <DynamicComponent />;
};

export async function getStaticProps() {

  return {
    props: {},
  };
}


export default MailBoxComponent;
