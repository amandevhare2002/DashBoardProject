import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('@/app/Layout/Report/ViewReport'));

const ViewReportComponent = (props: any) => {
  return <DynamicComponent {...props} />;
};

export default ViewReportComponent;
