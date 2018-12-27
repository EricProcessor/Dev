"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AAD_1 = require("./AAD");
const Logger_1 = require("./Logger");
const MEEServices = require("./MEEServices");
const environment_1 = require("./core/environment");
const MeeReceiptsTable_1 = require("./MeeReceiptsTable");
const StorageConfig_1 = require("./StorageConfig");
const request = require("request");
const uuid = require('uuid');
const btoa = require("btoa");
const moment = require('moment');
const productId = 'CFQ7TTC0K5DR';
const enterpriseAgreementSkuId = '0002';
const directSkuId = '0001';
const invoiceSkuId = '0004';
const promoSkuId = '0005';
const throwOnStoreErrors = !environment_1.Environment.isProduction();
// Dev: We need to make a repository to get these tables, for now we are including it globally like we do in server.ts
let receiptsTable = new MeeReceiptsTable_1.ReceiptsTable(StorageConfig_1.StorageConfig.getReceiptsTableSettings());
/*
    Some History and context around the license Manager:
        We currently implement our own calls to the store and graph to get license information. This should technically be a store api, but
    due to cost of implementation we do it on our side.

    Soft Bundle - Can reassign individual licesnses to differnt issues.

    Nov 2016 - When MEE launched we started we sold the product stand alone through commercial direct and VL (EES - Enrollment for Education Solutions) - Inventory managed by store.

    January 2017 - Store started accepting invoice for MEE - (invoice sku id = 0004)

    June 2017 - We launched standalone minecraft offer in CSP (Cloud Service Provider) - Channel through partner center  - Inventory managed by store.

    July 2017 - Win10 Education Devices can redeem MEE. This offer has ended. Was managed in store. (Promo Sku ID = 0005)

    October 2017 - Minecraft included in M365 A3 A5 "Soft Bundle" in EES. Minecraft piece is managed in store. Store doesn't tell us if its M365 or not.

    Early 2018 - M365 A3 A5 launched hard bundles in CSP - Inventory lives in AAD and managed through Admin Center.

    Early 2019 (TBD) - Querying AAD to see who has A3 A5 to attempt the soft budnle stuff.

 */
function EnsureUserIsLicensed(user, existingUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = { isLicensed: false };
        try {
            // see if user has an assigned M365 plan (Soft Bundle) - Checks graph for assignedPlan and *service plans* underneath.
            result = yield EnsureUserHasM365AssignedPlan(user);
        }
        catch (e) {
            yield Logger_1.logActivity('m365-license-check-failure', user.tenantId, user.unique_name, e);
            // try other checks
        }
        if (!result.isLicensed) {
            try {
                // Checks the inferred license for the Hard Bundle relaunch in Feb 2019. 
                result = yield InferLicenseFromO365Bundle(user);
            }
            catch (e) {
                yield Logger_1.logActivity('free-minecraft-license-failure', user.tenantId, user.unique_name, e);
            }
        }
        if (!result.isLicensed && existingUserId) {
            try {
                // Checks Ipad reciept
                result = yield EnsureUserHasPurchaseReceipt(existingUserId);
            }
            catch (e) {
                yield Logger_1.logActivity('receipt-check-failure', user.tenantId, user.unique_name, e);
                // try the store license check
            }
        }
        try {
            if (!result.isLicensed) {
                // Check onestore for a license and try to auto assign it if the have it enabled.
                result = yield EnsureUserIsLicensedCore(user);
            }
            return { licenseInfo: result, hitError: false };
        }
        catch (e) {
            if (throwOnStoreErrors) {
                throw e;
            }
            else {
                yield Logger_1.logActivity('license-check-fail-open', user.tenantId, user.unique_name, e);
                return { licenseInfo: { isLicensed: true, licenseType: "error" }, hitError: true };
            }
        }
    });
}
exports.EnsureUserIsLicensed = EnsureUserIsLicensed;
function EnsureUserIsLicensedCore(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let storeAccessToken = yield AAD_1.getOnBehalfOfToken(user, 'https://onestore.microsoft.com');
        let correlationVector = createCorrelationVector();
        let licenseInfo = yield getIsUserCurrentlyLicensed(storeAccessToken, correlationVector, user);
        if (licenseInfo.isLicensed) {
            return licenseInfo;
        }
        else {
            if (!user.tenancyInfo.isManaged) {
                // viral tenants cannot have seats assigned, so don't bother trying
                yield Logger_1.logActivityVerbose('seat-assignment-viralskip', user.tenantId, user.unique_name, {});
                return { isLicensed: false };
            }
            let wasPurchaseSuccesssful;
            correlationVector = incrementCorrelationVector(correlationVector);
            let skuAvailabilities = yield getSkuAvailabilities(storeAccessToken, correlationVector);
            // zeroth try to assign a license for promo sku
            let promoAvailabilityId = getAvailabilityIdForSku(promoSkuId, skuAvailabilities);
            correlationVector = incrementCorrelationVector(correlationVector);
            wasPurchaseSuccesssful = yield attemptPurchaseForSkuAvailability(user, promoSkuId, promoAvailabilityId, storeAccessToken, correlationVector);
            if (wasPurchaseSuccesssful.isLicensed) {
                return wasPurchaseSuccesssful;
            }
            // first try to assign a license for EA sku
            let enterpriseAgreementAvailabilityId = getAvailabilityIdForSku(enterpriseAgreementSkuId, skuAvailabilities);
            correlationVector = incrementCorrelationVector(correlationVector);
            wasPurchaseSuccesssful = yield attemptPurchaseForSkuAvailability(user, enterpriseAgreementSkuId, enterpriseAgreementAvailabilityId, storeAccessToken, correlationVector);
            if (wasPurchaseSuccesssful.isLicensed) {
                return wasPurchaseSuccesssful;
            }
            // second try to assign a license for Invoice sku
            let invoiceAvailabilityId = getAvailabilityIdForSku(invoiceSkuId, skuAvailabilities);
            correlationVector = incrementCorrelationVector(correlationVector);
            wasPurchaseSuccesssful = yield attemptPurchaseForSkuAvailability(user, invoiceSkuId, invoiceAvailabilityId, storeAccessToken, correlationVector);
            if (wasPurchaseSuccesssful.isLicensed) {
                return wasPurchaseSuccesssful;
            }
            // third try Direct sku
            try {
                let directAvailabilityId = getAvailabilityIdForSku(directSkuId, skuAvailabilities);
                correlationVector = incrementCorrelationVector(correlationVector);
                wasPurchaseSuccesssful = yield attemptPurchaseForSkuAvailability(user, directSkuId, directAvailabilityId, storeAccessToken, correlationVector);
                if (wasPurchaseSuccesssful.isLicensed) {
                    return wasPurchaseSuccesssful;
                }
            }
            catch (e) {
                // Swallowing exception. We don't currently enumerate the seat block id's to find a seat. This will throw till we fix it.
                // In these cases we will fallback to a trial experience.
                yield Logger_1.logActivity('seat-assignment-0001-failure', user.tenantId, user.unique_name, e);
            }
            return { isLicensed: false };
        }
    });
}
function createCorrelationVector() {
    let rawBuffer = new Array(16);
    uuid.v4(null, rawBuffer, 0);
    let cvBase = btoa(rawBuffer).substring(0, 12);
    // if we  just created it then we'll assume it's the first in the "chain"
    let correlationVector = cvBase + ".1";
    return correlationVector;
}
function incrementCorrelationVector(correlationVector) {
    if (correlationVector) {
        var lastDotIndex = correlationVector.lastIndexOf(".");
        if (lastDotIndex === -1) {
            // no existing extension present, add one
            correlationVector = correlationVector + ".1";
        }
        else {
            var prefix = correlationVector.substring(0, lastDotIndex);
            var currentIndexString = correlationVector.substring(lastDotIndex + 1);
            var nextIndex = 1;
            if (currentIndexString.length != undefined && currentIndexString.length > 0) {
                var parsedCurrentIndex = parseInt(currentIndexString);
                if (Number.isInteger(parsedCurrentIndex)) {
                    nextIndex = parsedCurrentIndex + 1;
                }
            }
            correlationVector = prefix + "." + nextIndex.toString();
        }
    }
    return correlationVector;
}
function getIsUserCurrentlyLicensed(storeAccessToken, correlationVector, user) {
    return __awaiter(this, void 0, void 0, function* () {
        var _ = require("underscore");
        return new Promise(function (resolve, reject) {
            try {
                let collectionQueryBody = {
                    "additionalItemTypes": [],
                    "beneficiaries": [
                        {
                            "identityType": "aad",
                            "identityValue": `${storeAccessToken}`,
                            "localTicketReference": ""
                        }
                    ],
                    "modifiedAfter": null,
                    "entitlementFilters": [],
                    "expandSatisfyingItems": true,
                    "includeDuplicates": true,
                    "includeRelationship": null,
                    "productSkuIds": [
                        {
                            "productId": productId,
                            "skuId": directSkuId
                        },
                        {
                            "productId": productId,
                            "skuId": enterpriseAgreementSkuId
                        },
                        {
                            "productId": productId,
                            "skuId": invoiceSkuId
                        },
                        {
                            "productId": productId,
                            "skuId": promoSkuId
                        }
                    ],
                    "validityType": "Valid"
                };
                var success = false;
                let startTime = Date.now();
                request({
                    uri: `https://collections.mp.microsoft.com/v7.0/collections/query`,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'MS-CV': correlationVector,
                        'Authorization': `Bearer ${storeAccessToken}`
                    },
                    body: JSON.stringify(collectionQueryBody)
                }, function (error, response, body) {
                    let duration = Date.now() - startTime;
                    success = true;
                    MEEServices.trackDependency("collections.mp.microsoft.com/query", "query", duration, success);
                    if (error) {
                        reject(error);
                    }
                    else {
                        try {
                            let queryResponse = JSON.parse(body);
                            if (!queryResponse.items) {
                                Logger_1.logActivity('license-query-failure', user.tenantId, user.unique_name, body);
                                throw Error("Bad collections/query response: " + body);
                            }
                            if (queryResponse.items.length > 0) {
                                var result = _.pluck(queryResponse.items, 'skuId');
                                let skuId = (result) ? result : "unknown";
                                let licenseType = `license-query-licenced-${skuId}`;
                                Logger_1.logActivityVerbose(licenseType, user.tenantId, user.unique_name, body);
                                resolve({ isLicensed: true, licenseType: licenseType });
                            }
                            else {
                                Logger_1.logActivityVerbose('license-query-nolicence', user.tenantId, user.unique_name, body);
                                resolve({ isLicensed: false });
                            }
                        }
                        catch (error) {
                            reject(error);
                        }
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
function getAvailabilityIdForSku(skuId, skuAvailabilities) {
    for (let displaySkuAvailability of skuAvailabilities) {
        for (let availability of displaySkuAvailability.Availabilities) {
            let now = new Date();
            if (availability.SkuId === skuId &&
                availability.Markets.indexOf("NEUTRAL") >= 0 &&
                new Date(availability.Conditions.StartDate) < now &&
                new Date(availability.Conditions.EndDate) > now) {
                return availability.AvailabilityId;
            }
        }
    }
    // todo: ask Mando - if availability is not found, should i consider this 'no inventory'?
    // maybe it's not catostraphic?
    throw Error("bad availability data: " + JSON.stringify(skuAvailabilities));
}
function getSkuAvailabilities(storeAccessToken, correlationVector) {
    return __awaiter(this, void 0, void 0, function* () {
        let host = 'displaycatalog.md.mp.microsoft.com';
        let path = `/v7/products/${productId}?fieldsTemplate=Details&catalogId=4&market=NEUTRAL&languages=en-US`;
        let uri = `https://${host}${path}`;
        return new Promise(function (resolve, reject) {
            try {
                var success = false;
                let startTime = Date.now();
                request({
                    uri: uri,
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${storeAccessToken}`,
                        'MS-Contract-Version': 5,
                        'MS-CV': correlationVector
                    }
                }, function (error, response, body) {
                    let duration = Date.now() - startTime;
                    success = true;
                    MEEServices.trackDependency("displaycatalog.md.mp.microsoft.com/v7/products", "products", duration, success);
                    if (error) {
                        reject(error);
                    }
                    else {
                        let productInfo = JSON.parse(body);
                        if (!productInfo.Product) {
                            reject("bad displaycatalog payload: " + body);
                        }
                        else {
                            resolve(productInfo.Product.DisplaySkuAvailabilities);
                        }
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
function attemptPurchaseForSkuAvailability(user, skuId, availabilityId, storeAccessToken, correlationVector) {
    return __awaiter(this, void 0, void 0, function* () {
        let orderId = uuid.v4();
        let orderRequestBody = {
            "clientContext": {
                "client": "Minecraft EducationEdition Service",
            },
            "items": [
                {
                    "availabilityId": `${availabilityId}`,
                    "beneficiary": {
                        "identityType": "aad",
                        "identityValue": `${user.oid}`,
                        "organization": {
                            "identityType": "Tenant",
                            "identityValue": `${user.tenantId}`
                        }
                    },
                    "productId": `${productId}`,
                    "quantity": 1,
                    "seatBlockId": '00000000000000000000000000000000',
                    "skuId": `${skuId}`
                }
            ],
            "language": "EN-US",
            "market": "NEUTRAL",
            "orderId": `${orderId}`,
            "orderState": "Purchased",
        };
        let host = 'purchase.md.mp.microsoft.com';
        let userId = encodeURIComponent('aad:' + user.oid);
        let path = `v7.0/users/${userId}/orders`;
        let uri = `https://${host}/${path}`;
        yield Logger_1.logActivityVerbose(`seat-assignment-attempt-${skuId}`, user.tenantId, user.unique_name, JSON.stringify(orderRequestBody));
        return new Promise(function (resolve, reject) {
            try {
                var success = false;
                let startTime = Date.now();
                request({
                    uri: uri,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'MS-CV': correlationVector,
                        'Authorization': `Bearer ${storeAccessToken}`
                    },
                    body: JSON.stringify(orderRequestBody)
                }, function (error, response, body) {
                    let duration = Date.now() - startTime;
                    success = true;
                    MEEServices.trackDependency("purchase.md.mp.microsoft.com/orders", skuId, duration, success);
                    if (error) {
                        reject(error);
                    }
                    else {
                        let orderResponse = JSON.parse(body);
                        if (orderResponse.innererror) {
                            if (orderResponse.innererror.code === 'InventoryNeverAugmented' ||
                                orderResponse.innererror.code === 'NoSeatsLeft' ||
                                orderResponse.innererror.code === 'SeatClaimNotAllowedForInventory') {
                                Logger_1.logActivityVerbose('seat-assignment-noinventory-a', user.tenantId, user.unique_name, `CV ${correlationVector}:` + body);
                                resolve({ isLicensed: false });
                            }
                            else {
                                reject("failed order attempt: " + body);
                            }
                        }
                        else {
                            if (orderResponse.orderId === orderId) {
                                if (orderResponse.orderLineItems &&
                                    orderResponse.orderLineItems.length > 0 &&
                                    orderResponse.orderLineItems[0].fulfillmentState === 'Fulfilled') {
                                    let billingState = orderResponse.orderLineItems[0].billingState;
                                    Logger_1.logActivityVerbose(`seat-assignment-${skuId}-${billingState}`, user.tenantId, user.unique_name, `CV ${correlationVector}:` + body);
                                    resolve({ isLicensed: true, licenseType: `seat-assignment-${skuId}-${billingState}` });
                                }
                                else {
                                    Logger_1.logActivityVerbose('seat-assignment-noinventory-b', user.tenantId, user.unique_name, `CV ${correlationVector}:` + body);
                                    resolve({ isLicensed: false });
                                }
                            }
                            else {
                                Logger_1.logActivity('seat-assignment-failure', user.tenantId, user.unique_name, `CV ${correlationVector}:` + body);
                                reject("failed order attempt2 " + `CV ${correlationVector}:` + body);
                            }
                        }
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
function HasEnabledPlan(body) {
    var _ = require("underscore");
    var plans = JSON.parse(body);
    let enabledPlan = { enabled: false };
    // Sample response from 'https://graph.microsoft.com/v1.0/users/${user.unique_name}?$select=assignedPlans',
    // {
    //     "assignedPlans": [
    //         ...
    //         {
    //             "assignedDateTime": "2018-01-10T07:24:45Z",
    //             "capabilityStatus": "Enabled",
    //             "service": "MinecraftEducationEditionServices",
    //             "servicePlanId": "4c246bbc-f513-4311-beff-eba54c353256"
    //         },
    //         ...
    //     ]
    // }
    _.filter(plans.assignedPlans, function (plan) {
        // console.log(`servicePlanId: ${plan.servicePlanId}  service: ${plan.service}  capabilityStatus: ${plan.capabilityStatus} details: ${JSON.stringify(plan)}`);
        if (plan.servicePlanId === "4c246bbc-f513-4311-beff-eba54c353256" || plan.servicePlanId === "35973fbf-367b-49c4-aca4-717817774146") { // see http://commoffertool
            enabledPlan.enabled = true;
            enabledPlan.servicePlan = plan.servicePlanId;
            return true;
        }
        else {
            return false;
        }
    });
    return enabledPlan;
}
exports.HasEnabledPlan = HasEnabledPlan;
function InferLicenseFromO365Bundle(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let accessToken = yield AAD_1.getOnBehalfOfToken(user, 'https://graph.microsoft.com');
        return new Promise((resolve, reject) => {
            try {
                if (user.tenancyInfo && user.tenancyInfo.enableFreeMinecraftLicenses) {
                    let hasO365A3License = false;
                    let hasO365A5License = false;
                    request({
                        uri: 'https://graph.microsoft.com/v1.0/me?$select=assignedLicenses',
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    }, function (error, response, body) {
                        if (error) {
                            reject(error);
                        }
                        else {
                            try {
                                var _ = require("underscore");
                                let licesnses = JSON.parse(body);
                                // Make sure the user has an O365 licesnse.
                                _.filter(licesnses.assignedLicenses, (license) => {
                                    // Check for O365 License. The store also likes to check the Enterprise Mobility Security Product, but we don't care.
                                    if (license.skuId === "e578b273-6db4-4691-bba0-8d691f4da603" || license.skuId === "98b6e773-24d4-4c0d-a968-6e787a1f8204") {
                                        hasO365A3License = true;
                                    }
                                    else if (license.skuId === "ee656612-49fa-43e5-b67e-cb1fdf7699df" || license.skuId === "a4585165-0533-458a-97e3-c400570268c4") {
                                        hasO365A5License = true;
                                    }
                                });
                                if (hasO365A3License || hasO365A5License) {
                                    resolve({ isLicensed: true, licenseType: hasO365A5License ? "O365-A5License" : "O365-A3License" });
                                }
                                else {
                                    resolve({ isLicensed: false });
                                }
                            }
                            catch (e) {
                                reject(e);
                            }
                        }
                    });
                }
                else {
                    resolve({ isLicensed: false });
                }
            }
            catch (err) {
                console.log(err);
                reject(err);
            }
        });
    });
}
function EnsureUserHasM365AssignedPlan(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let accessToken = yield AAD_1.getOnBehalfOfToken(user, 'https://graph.microsoft.com');
        return new Promise(function (resolve, reject) {
            try {
                var success = false;
                let startTime = Date.now();
                request({
                    uri: 'https://graph.microsoft.com/v1.0/me?$select=assignedPlans',
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }, function (error, response, body) {
                    let duration = Date.now() - startTime;
                    success = true;
                    MEEServices.trackDependency("graph.microsoft.com/v1.0/users", "assignedPlans", duration, success);
                    if (error) {
                        reject(error);
                    }
                    else {
                        try {
                            let hasPlan = HasEnabledPlan(body);
                            if (hasPlan.enabled) {
                                Logger_1.logActivityVerbose('graph.microsoft.com-assignedplans-enabled', user.tenantId, user.unique_name, body);
                                resolve({ isLicensed: true, licenseType: `assignedplan-${hasPlan.servicePlan}` });
                            }
                            else {
                                Logger_1.logActivityVerbose('graph.microsoft.com-assignedplans-noplan', user.tenantId, user.unique_name, body);
                                resolve({ isLicensed: false });
                            }
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
function EnsureUserHasPurchaseReceipt(existingUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            try {
                receiptsTable.getAllWithAnonimizedOid(existingUserId).then((result) => {
                    if (result.length > 0) {
                        if (result.some((val) => !moment(val.expirationDate).isBefore())) {
                            resolve({ isLicensed: true, licenseType: "iapreceipt" });
                        }
                        else {
                            // expired receipt
                            resolve({ isLicensed: false });
                        }
                    }
                    else {
                        // empty array returned (no receipt)
                        resolve({ isLicensed: false });
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    });
}
//# sourceMappingURL=LicenseManager.js.map