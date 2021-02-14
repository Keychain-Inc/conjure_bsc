import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import chunk from "lodash.chunk";
import prettyBytes from "pretty-bytes";
import {formatEther} from "@ethersproject/units";

dayjs.extend(relativeTime);
dayjs.extend(utc);

/**
 * @name hasLayers
 * @param {Array} layers Array of layers on a parent art object
 * @returns {Boolean}
 */
export const hasLayers = (layers) => (layers.length > 0 ? true : false);

/**
 * @name epochToISO
 *
 * @param {Number} date The epoch date to format into an ISO timestamp.
 */
export const epochToISO = (date) =>
  dayjs.unix(date).utc().format("YYYY-MM-DDTHH:mm:ss");

/**
 * @name epochRelative
 *
 * @param {Number} date
 */
export const epochRelative = (date) => dayjs.unix(date).utc().fromNow();

/**
 * @name epochTimestamp
 * @description Generates a epoch unix timestamp in seconds for the current time.
 */
export const epochTimestamp = () => dayjs().unix();

/**
 * @name formatImageSize
 *
 * @param {String} bytes The size of the image to format
 */
export const formatImageSize = (bytes) => prettyBytes(bytes);

/**
 * @name isLayer
 * @description Filter function to filter out or only include artworks that are or aren't layers.
 *
 * @param {Object} artwork The artwork to test whether it is a layer
 */
export const isLayer = (artwork) =>
  !!artwork["containing-slug"] ? true : false;

export const isOwner = (owner, account) =>
  String(owner.address).toLowerCase() === String(account).toLowerCase();

/**
 * @name formatPrice
 * @description
 *
 * @param {Number|String} amount The amount of denominated currency to display in Fiat
 * @param {Object} priceData The priceData from the "eth-prices" endpoint
 * @param {Enumerator} currency The currency symbol of which to pick from the priceData Object
 */
export const formatPrice = (amount, priceData, currency = "USD") => {
  return Number(amount * priceData).toLocaleString(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  });
};

const ETHERSCAN_PREFIXES = {
  1: "",
  3: "ropsten.",
  4: "rinkeby.",
  5: "goerli.",
  42: "kovan.",
  97: "testnet.",
  56: ""
};

/**
 *
 * @param {Number} networkId
 * @param {String} data
 * @param {("TRANSACTION"|"ADDRESS")} type
 */
export function getEtherscanLink(networkId, data, type) {
  const prefix = `https://${
    ETHERSCAN_PREFIXES[networkId] || ETHERSCAN_PREFIXES[1]
  }bscscan.com`;

  switch (type) {
    case "TRANSACTION": {
      return `${prefix}/tx/${data}`;
    }
    case "ADDRESS":
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

const ETHERSCAN_API_PREFIXES = {
  1: "api",
  4: "api-rinkeby",
};

export function getEtherscanAPIURL(networkId) {
  return `https://${ETHERSCAN_API_PREFIXES[networkId]}.etherscan.io/api`;
}

/**
 * @name formatControlValues
 * @description Converts and chunks into threes the BigNumber array from the getControlToken contract call
 *
 * @param {Array<import("@ethersproject/bignumber").BigNumber>} values
 */
export function formatControlValues(values) {
  return chunk(
    values.map((val) => val.toNumber()),
    3
  );
}

/**
 * @name formatControlsAndValues
 *
 * @param {Array<Array<Number>>} values
 * @param {String|Number} tokenId
 */
export const formatControlsAndValues = (values, tokenId) => (control, i) => ({
  ...control,
  tokenId,
  values: {
    minValue: values[i][0],
    maxValue: values[i][1],
    curValue: values[i][2],
  },
});

/**
 * @name isEmptyObject
 *
 * @param {Object} obj
 *
 * @returns Boolean
 */
export const isEmptyObject = (obj) =>
  Object.keys(obj).length === 0 && obj.constructor === Object ? true : false;

/**
 * @name appenDayDate
 *
 * @param day string
 *
 * @returns String
 */
export const appendDayDate = (day) => {
  if (11 <= parseInt(day) <= 13) return `${day}th`;

  const arr = day.split("");
  const endNum = arr.pop();
  switch (endNum) {
    case "1": {
      arr.push("1st");
      return arr.join("");
    }
    case "2": {
      arr.push("2nd");
      return arr.join("");
    }
    case "3": {
      arr.push("3rd");
      return arr.join("");
    }
    default: {
      arr.push(`${endNum}th`);
      return arr.join("");
    }
  }
};

//get user friendly numbers from wei
//@input raw input from web3
//@output formated string with number of decimals after comma
export function format_friendly(input, decimals)
{
  const temp = formatEther(input);
  const words = temp.split('.');

  const slicer = words[1].slice(0,decimals);
  const returner = words[0] + "." + slicer;

  return returner;
}

export const isMetaMask =
  typeof window !== "undefined" &&
  !!(window.ethereum && window.ethereum.isMetaMask)
    ? true
    : false;

export const isDapper =
  typeof window !== "undefined" &&
  !!(window.ethereum && window.ethereum.isDapper)
    ? true
    : false;
