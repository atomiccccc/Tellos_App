import { DeliveryMethod } from "@shopify/shopify-api";

export default {
  CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        const payload = JSON.parse(body);
        console.log("Received customer data request webhook:", payload);
      },
    },
  CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        const payload = JSON.parse(body);
        console.log("Received customer data redact webhook:", payload);
      },
    },
  SHOP_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/api/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        const payload = JSON.parse(body);
        console.log("Received shop data redact webhook:", payload);
      },
    },
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks/app-uninstall",
    callback: async (topic, shop) => {
      // Make HTTP request to the specified API endpoint
      try {
          const response = await fetch(`https://tellos-xyz.link/shopify/uninstall?shop=${shop}`);
          
          if (!response.ok) {
            throw new Error('Failed to hit the API endpoint');
          }else{
            return res.sendStatus(200);
          }
        } catch (error) {
          console.error("Error hitting API endpoint:", error);
        }
    },
  },
};
