import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function useRole() {
  const location = useLocation();
  const [role, setRole] = useState("")

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    
  }, [location.pathname]);

  return role
}

export default useRole;
