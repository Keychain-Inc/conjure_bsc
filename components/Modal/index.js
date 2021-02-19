import { DialogContent, DialogOverlay } from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import classNames from "classnames";
import { Close } from "../icons";

/**
 * @name CloseButton
 * @description Accessible Close button for Modals
 *
 * @param {React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>} props
 */
export const CloseButton = (props) => (
  <button {...props}>
    <VisuallyHidden>Close</VisuallyHidden>
    <span aria-hidden>
      <Close />
    </span>
  </button>
);

export const ModalHeader = ({ title, onDismiss, className }) => {
  const cachedClassNames = classNames(
    className,
    "flex items-center",
    !!title ? "justify-between" : "justify-end"
  );

  return (
    <div className={cachedClassNames}>
      {!!title && (
        <p className="font-bold text-xl text-white leading-none">{title}</p>
      )}
      <CloseButton onClick={onDismiss} />
    </div>
  );
};

export const Modal = ({
  children,
  isOpen,
  onDismiss,
  ariaLabel = "Modal",
  className,
  dangerouslyBypassFocusLock,
  small = false,
  narrow = false,
  tight = false,
  wide = false,
}) => {
  const cachedClassNames = classNames(className, small ? "p-4" : "p-4 sm:p-8", {
    "mw-narrow": narrow,
    "mw-regular": !narrow && !tight,
    "mw-tight": tight,
  });

  return (
    <DialogOverlay
      isOpen={isOpen}
      onDismiss={onDismiss}
      dangerouslyBypassFocusLock={dangerouslyBypassFocusLock}
    >
      <DialogContent className={cachedClassNames} aria-label={ariaLabel}>
        {children}
      </DialogContent>
      <style jsx global>{`
        [data-reach-dialog-overlay] {
          background: hsla(0, 0%, 0%, 0.66);
          position: fixed;
          display: grid;
          padding: 0 1rem 3rem 1rem;
          justify-items: center;
          align-items: end;
          top: 0;
          height: 100%;
          right: 0;
          bottom: 0;
          left: 0;
          overflow: auto;
          z-index: 4;
        }

        [data-reach-dialog-content] {
          width: 100%;
          border-radius: 1rem;
          outline: none;
          background-color: #805ad5;
        }

        .mw-regular {
          max-width: 900px;
        }

        @media screen and (max-width: 831px) {
          .mw-regular {
            max-width: 350px;
          }
        }

        .mw-narrow {
          max-width: 480px;
        }

        .mw-tight {
          max-width: 320px;
        }

        @media screen and (min-width: 32em) {
          [data-reach-dialog-overlay] {
            align-items: center;
          }
        }
      `}</style>
    </DialogOverlay>
  );
};

