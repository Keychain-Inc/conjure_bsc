import cogoToast from "cogo-toast";
import { Fragment, useCallback } from "react";
import { getEtherscanLink } from "../lib/utils";

/**
 * @name addToast
 * @param {Object} options
 * @param {any} options.body
 * @param {("success"|"info"|"loading"|"warn"|"error")} options.type
 * @param {Number} options.hideAfter
 */
export const addToast = ({ body, type = "success", hideAfter = 10 }) =>
  cogoToast[type](<Toast body={body} />, {
    position: "bottom-right",
    hideAfter,
    bar: {
      color: "var(--grey)",
      style: "solid",
      size: "1px",
    },
  });

export default function useToast() {
  return useCallback(addToast, []);
}

const Toast = ({ body }) => (
  <span className="">
    {body}
    <style jsx global>{`
      .ct-toast {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: var(--spacing-medium);
        border-radius: 6px;
        border: 1px solid var(--grey);
        background-color: var(--white);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.12);
        color: var(--primary);
        margin: 0px;
        opacity: 1;
        transition: 0.3s all ease-in-out;
        min-height: 48px;
        pointer-events: all;
      }

      .ct-group {
        align-items: center;
      }

      .ct-icon-loading {
        width: 18px;
        height: 18px;
      }

      .ct-icon-loading:after {
        width: 18px;
        height: 18px;
        margin: 0px;
        border-width: 3px;
        border-color: var(--secondary) transparent var(--secondary) transparent;
      }

      .ct-toast.ct-toast-warn svg path,
      .ct-toast.ct-toast-error svg path {
        fill: var(--orange);
      }

      .ct-toast.ct-toast-info svg path {
        fill: var(--light-purple);
      }

      .ct-toast.ct-toast-success svg path {
      }
    `}</style>
  </span>
);

export const PendingTx = ({ hash }) => (
  <Fragment>
    Confirming transaction.{" "}
    <a
      className="underline"
      target="_blank"
      rel="noopener noreferrer"
      href={getEtherscanLink(1, hash, "TRANSACTION")}
    >
      View Tx
    </a>
  </Fragment>
);

export const SuccessfulTx = ({ hash }) => (
  <Fragment>
    Transaction successful.{" "}
    <a
      className="underline"
      target="_blank"
      rel="noopener noreferrer"
      href={getEtherscanLink(1, hash, "TRANSACTION")}
    >
      View Tx
    </a>
  </Fragment>
);
