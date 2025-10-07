// components/PublicRoute.tsx
import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../../stores/useUser";

type PublicRouteProps = {
  children: ReactNode;
};

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { userName } = useUser();

  if (userName) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PublicRoute;
