import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1>404</h1>
      <p>Page nahi mila.</p>
      <Link to="/" className="btn btn-dark">Home par jao</Link>
    </div>
  );
}
