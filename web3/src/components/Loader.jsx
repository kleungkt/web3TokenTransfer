import { Spinner } from "react-bootstrap";
const Loader = () => (
<Spinner animation="border" role="status" className="Loader">
  <span className="visually-hidden">Loading...</span>
</Spinner>
);

export default Loader;
