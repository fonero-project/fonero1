// @flow
import axios from "axios";

export const FNODATA_URL_TESTNET = "https://testnet.fnodata.org/api";
export const FNODATA_URL_MAINNET = "https://explorer.fnodata.org/api";

const GET = (path) => {
  return axios.get(path);
};

export const getTreasuryInfo = (daURL, treasuryAddress) => GET(daURL + "/address/" + treasuryAddress + "/totals");
