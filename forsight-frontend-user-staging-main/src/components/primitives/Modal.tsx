import { type ReactNode, forwardRef } from "react";
import Portal from "./Portal";
type ModalProps = {
  children: ReactNode;
  onClose: (event: React.MouseEvent<HTMLDialogElement>) => void;
};

const Modal = forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  { children, onClose },
  ref
) {
  return (
    <Portal>
      <dialog
        className="w-full max-w-md rounded-md p-4 shadow-md backdrop:bg-[rgba(0,0,0,0.75)]"
        ref={ref}
        onClick={onClose}
      >
        {children}
      </dialog>
    </Portal>
  );
});

export default Modal;
