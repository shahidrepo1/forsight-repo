import { createPortal } from "react-dom";

function Portal({ children }: { children: React.ReactNode }) {
  const portalRoot = document.getElementById("portal");

  if (!portalRoot) {
    return <div className="bg-white border-2">error in portal</div>;
  }

  return createPortal(<div>{children}</div>, portalRoot);
}
export default Portal;
