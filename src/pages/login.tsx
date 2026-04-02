import dynamic from "next/dynamic";
const DynamicComponent = dynamic(() => import('../app/Layout/Login'));

const Login = ({props}: any) => {
  return <DynamicComponent />;
};

export async function getStaticProps() {

  return {
    props: {},
  };
}


export default Login;
