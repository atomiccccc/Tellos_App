import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-01";
import crypto from "crypto";

const secret = "eacbafb4858faaf809ffb9c8472e2972";

const DB_PATH = `${process.cwd()}/database.sqlite`;

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopify = shopifyApp({
  api: {
    isEmbeddedApp: false,
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: billingConfig, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new SQLiteSessionStorage(DB_PATH),
});


// Middleware to validate payload using HMAC
function validatePayload(req, res, next) {
  const sigHeaderName = "X-Signature-SHA256";

  if (req.get(sigHeaderName)) {
    const sig = Buffer.from(req.get(sigHeaderName) || "", "utf8");
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(
      hmac.update(JSON.stringify(req.body)).digest("hex"),
      "utf8"
    );

    if (!crypto.timingSafeEqual(digest, sig)) {
      return res.status(401).send({
        message: `Request body digest did not match ${sigHeaderName}`,
      });
    }
  }

  return next();
}
shopify.use(validatePayload);

export default shopify;
