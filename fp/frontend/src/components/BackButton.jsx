import { useNavigate } from "react-router-dom";

export default function BackButton({ label = "Volver" }) {
  const navigate = useNavigate();
  return (
    <button className="backButton" onClick={() => navigate(-1)}>
      {label}
    </button>
  );
}