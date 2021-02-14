import { addToast, PendingTx, SuccessfulTx } from "../hooks/useToast";

/**
 * @name getReceipt
 *
 * @param {String} hash
 * @param {import("@ethersproject/providers").Provider} library
 */
export default async function getReceipt(hash, library) {
  const { hide: hidePending } = addToast({
    body: <PendingTx hash={hash} />,
    type: "loading",
    hideAfter: 0,
  });

  const receipt = await library.waitForTransaction(hash);

  hidePending();

  if (receipt.status !== 1) {
    throw new Error(receipt.logs[0]);
  }

  addToast({
    body: <SuccessfulTx hash={hash} />,
    type: "success",
  });

  return receipt;
}

