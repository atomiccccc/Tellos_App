// webhooks/app-uninstall.js
import { DeliveryMethod } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import fetch from 'node-fetch';

async function addUninstallWebhookHandler() {
  return await shopify.api.webhooks.addHandlers({
    
  });
}

export default addUninstallWebhookHandler;
