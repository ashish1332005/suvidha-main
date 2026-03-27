/**
 * api/kioskApi.js
 */
const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
async function request(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) {
    const msg = data.errors ? data.errors.map(e => e.msg).join(", ") : data.message || "Something went wrong";
    throw new Error(msg);
  }
  return data;
}
const api = {
  lookupConsumer: (number) => request("GET", `/consumers/${encodeURIComponent(number.trim())}`),
  getHistory: (number) => request("GET", `/consumers/${encodeURIComponent(number)}/history`),
  initiatePayment: ({ consumerNumber, billId, amount, dept, paymentMethod }) =>
    request("POST", "/payments/initiate", { consumerNumber, billId, amount, dept, paymentMethod }),
  checkPaymentStatus: (referenceNo) => request("GET", `/payments/status/${encodeURIComponent(referenceNo)}`),
  confirmPayment: ({ referenceNo, transactionId, status, gatewayResponse }) =>
    request("POST", "/payments/confirm", { referenceNo, transactionId, status, gatewayResponse }),
  getReceipt: (referenceNo) => request("GET", `/payments/receipt/${encodeURIComponent(referenceNo)}`),
  submitComplaint: ({ name, mobile, dept, type, description, consumerNumber }) =>
    request("POST", "/complaints", { name, mobile, dept, type, description, consumerNumber }),
  trackComplaint: (ticketId) => request("GET", `/complaints/${encodeURIComponent(ticketId)}`),
  reportOutage: ({ name, mobile, area, ward, since, dept }) =>
    request("POST", "/outages", { name, mobile, area, ward, since, dept }),
  applyConnection: ({ name, mobile, aadhaar, address, dept, sanctionedLoad, category }) =>
    request("POST", "/connections", { name, mobile, aadhaar, address, dept, sanctionedLoad, category }),
  trackConnection: (appNo) => request("GET", `/connections/${encodeURIComponent(appNo)}`),
  submitService: ({ name, mobile, dept, serviceLabel, description }) =>
    request("POST", "/services", { name, mobile, dept, serviceLabel, description }),

  registerSchemeInterest: ({ name, mobile, scheme, district, village }) =>
    request("POST", "/schemes/interest", { name, mobile, scheme, district, village }),
  trackSchemeInterest: (requestId) =>
    request("GET", `/schemes/interest/${encodeURIComponent(requestId)}`)
};
export default api;