function Error({ statusCode }) {
  return <p style={{color:'white', textAlign:'center', paddingTop:'4rem'}}>{statusCode} — Error</p>;
}
Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
export default Error;
