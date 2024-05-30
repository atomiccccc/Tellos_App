import { DeliveryMethod } from "@shopify/shopify-api";
import crypto from 'crypto';
import 'dotenv/config';
import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function verifyShopifyWebhooks(req, res, next) {

  const hmac = req.query.hmac;

  if (!hmac) {
    return res.status(401).send("Webhook must originate from Shopify!");
  }
  const genHash = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(JSON.stringify(req.body))
    .digest("base64");

  if (genHash !== hmac) {
    return res.status(401).send("Couldn't verify incoming Webhook request!");
  }

next();

}

export default {
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks/app-uninstall",
    callback: async (topic, shop) => {
      // Make HTTP request to the specified API endpoint
      try {
          const response = await fetch(process.env.TELLOS_API_BASE_URL+`shopify/uninstall?shop=${shop}`);
          console.log(response);

          // Query the database to check if a charge ID exists for the provided host
          const db = await open({
            filename: "./database.sqlite",
            driver: sqlite3.Database,
          });

          const accessToken = await db.get("SELECT accessToken FROM shopify_sessions WHERE shop = ?", [shop]);
          const metafieldID = await db.get("SELECT metafieldID FROM shopify_sessions WHERE shop = ?", [shop]);
          await db.close();

          // if (!response.ok) {
          //   throw new Error('Failed to hit the API endpoint');
          // }

          const myHeaders = new Headers();
          myHeaders.append("X-Shopify-Access-Token", accessToken);

          const requestOptions = {
            method: "DELETE",
            headers: myHeaders,
            redirect: "follow"
          };

          fetch("https://"+shop+"/admin/api/2024-04/metafields/"+metafieldID+".json", requestOptions)
            .then((response) => response.text())
            .then((result) => console.log(result))
            .catch((error) => console.error(error));

          // delete script from database api function
          // storeJs(shop)
        } catch (error) {
          console.error("Error hitting API endpoint:", error);
        }
    },
  },
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    verifyShopifyWebhooks,
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("Received customer data request webhook:", payload);
      res.sendStatus(200);
    },
  },
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    verifyShopifyWebhooks,
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("Received customer data redact webhook:", payload);
      res.sendStatus(200);
    },
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    verifyShopifyWebhooks,
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      console.log("Received shop data redact webhook:", payload);
      res.sendStatus(200);
    },
  },
};
