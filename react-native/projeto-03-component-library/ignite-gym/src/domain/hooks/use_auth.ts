import { AuthContext } from "@/presentation/contexts/Auth";
import { useContext } from "react";

export function useAuth() {
  return useContext(AuthContext);
}
