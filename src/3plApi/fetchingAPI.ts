import axios from "axios";
import separateOffSiteInventory from "../utils/inventory/separateOffSiteInventory.js";
import { fetchStockDetailAllPages } from "./PageLogic/fetchStockDetailsPage.js";
import { access } from "fs";
import { fetchCustomerDetailAllPages } from "./PageLogic/fetchCustomerDetailsPage.js";
import extractCustomerDetails from "../utils/customers/extractCutomerDetails.js";
import { checkToken } from "./tokenHandler.js";
import { updateReplenishmentFlags } from "../services/replenishmentService.js";
import { fetchOrderDetailsAllPages } from "./PageLogic/fetchOrderDetailsPage.js";
import separateOffSiteInventoryForCapacity from "../utils/inventory/separateOffSiteInventoryForCapacity.js";
import { fetchAndCacheSkuInfoData } from "../services/fetchAndCacheService.js";
import { SkuQtyMap } from "../utils/skuInfo/convertSkutoQtyMap.js";
import { response } from "express";

export interface Token {
  access_token: string;
}

const authKey: string = process.env.AUTH_KEY as string;
const tpl: string = process.env.TPL as string;
const userLoginId: string = process.env.USER_LOGIN_ID as string;

let apiCallCount = 0;
const maxApiCallsPerDay = 5000;
let lastResetTime = Date.now();

const fetchEndpoint = async (url, accessToken) => {
  const headers = {
    Host: "secure-wms.com",
    "Content-Type": "application/hal+json; charset=utf-8",
    Accept: "application/hal+json",
    Authorization: `Bearer ${accessToken}`,
    "Accept-Language": "en-US,en;q=0.8",
  };

  // Reset the counter if it's a new day
  if (Date.now() - lastResetTime > 24 * 60 * 60 * 1000) {
    apiCallCount = 0;
    lastResetTime = Date.now();
  }

  if (apiCallCount >= maxApiCallsPerDay) {
    console.error("API call limit reached for today");
    throw new Error("API call limit reached for today");
  }

  try {
    const response = await axios.get(url, { headers });
    if (response.headers.etag) {
      response.data.etag = response.headers.etag;
    }
    apiCallCount += 1;
    console.log("Total API calls today", apiCallCount);
    return response.data;
  } catch (error) {
    console.error("Error fetching endpoint:", error);
    throw error;
  }
};

const fetchAndProcessStorageData = async (accessToken, customerId) => {
  try {
    const result = await fetchStockDetailAllPages(accessToken, customerId);
    // console.log("FETCHED ALL DATA", result)
    return separateOffSiteInventory(result);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const fetchAllCustomerNames = async (accessToken) => {
  try {
    const result = await fetchCustomerDetailAllPages(accessToken);
    // console.log("FETCHED ALL DATA")
    return extractCustomerDetails(result);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const fetchAndUpdateFlagsByClient = async (customerId) => {
  const token: Token = await checkToken(authKey, tpl, userLoginId);
  const accessToken: string = token.access_token;
  const result = await fetchAndProcessStorageData(accessToken, customerId);

  await updateReplenishmentFlags(result.detail, customerId);
  console.log("Updated replenishment data for client ID:", customerId);
};

const fetchOrdersShippedByDateRange = async (
  accessToken,
  startDate,
  endDate,
  concurrency
) => {
  try {
    const result = await fetchOrderDetailsAllPages(
      accessToken,
      startDate,
      endDate,
      concurrency
    );
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const fetchAndProcessStorageDataCapacity = async (accessToken, customerId) => {
  try {
    const result = await fetchStockDetailAllPages(accessToken, customerId);
    // console.log("FETCHED ALL DATA", result)
    const SkuInfoData: SkuQtyMap = await fetchAndCacheSkuInfoData();
    return separateOffSiteInventoryForCapacity(result, SkuInfoData);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const fetchAndUpdateFlagsAndCalcCapacityUtilizationByClient = async (
  customerId
) => {
  const token: Token = await checkToken(authKey, tpl, userLoginId);
  const accessToken: string = token.access_token;
  const result = await fetchAndProcessStorageDataCapacity(
    accessToken,
    customerId
  );

  await updateReplenishmentFlags(result.detail, customerId);
  console.log("Updated replenishment data for client ID:", customerId);
};

// New

const getOrder = async (orderId: string) => {
  const token: Token = await checkToken(authKey, tpl, userLoginId);
  const accessToken: string = token.access_token;
  const order = await _getOrder(accessToken, orderId);
  return _getOrder(accessToken, orderId);
};

const _getOrder = async (accessToken: Object, orderId: string) => {
  const url = `https://secure-wms.com/orders/${orderId}?detail=Contacts,OrderItems&itemdetail=AllocationsWithDetail`;
  return fetchEndpoint(url, accessToken);
};

const putOrderItem = async (
  orderId: string,
  itemId: string,
  etag: string,
  payload: object
) => {
  const token: Token = await checkToken(authKey, tpl, userLoginId);
  const accessToken: string = token.access_token;
  return await _putOrderItem(accessToken, orderId, itemId, etag, payload);
};

const _putOrderItem = async (
  accessToken: Object,
  orderId: string,
  itemId: string,
  etag: string,
  payload: Object
) => {
  // Reset the counter if it's a new day
  if (Date.now() - lastResetTime > 24 * 60 * 60 * 1000) {
    apiCallCount = 0;
    lastResetTime = Date.now();
  }
  if (apiCallCount >= maxApiCallsPerDay) {
    console.error("API call limit reached for today");
    throw new Error("API call limit reached for today");
  }

  const config = {
    method: "put",
    maxBodyLength: Infinity,
    url: `https://secure-wms.com/orders/${orderId}/items/${itemId}`,
    headers: {
      Host: "secure-wms.com",
      "Content-Type": "application/hal+json; charset=utf-8",
      Accept: "application/hal+json",
      "Accept-Language": "en-US,en;q=0.8",
      Authorization: `Bearer ${accessToken}`,
      "If-Match": etag,
    },
    data: JSON.stringify(payload),
  };

  axios(config)
    .then((response) => {
      apiCallCount += 1;
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching endpoint:", error.message);
      console.log(JSON.stringify(error));
      return error;
    });
};

export {
  fetchAndProcessStorageData,
  fetchEndpoint,
  fetchAllCustomerNames,
  fetchAndUpdateFlagsByClient,
  fetchOrdersShippedByDateRange,
  fetchAndProcessStorageDataCapacity,
  fetchAndUpdateFlagsAndCalcCapacityUtilizationByClient,
  putOrderItem,
  getOrder,
};
