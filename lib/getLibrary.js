import { AsyncSendable, Web3Provider } from "@ethersproject/providers";

/**
 * @name getLibrary
 * @description ...
 *
 * @param {AsyncSendable} provider
 */
export default function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 8000;
  return library;
}

