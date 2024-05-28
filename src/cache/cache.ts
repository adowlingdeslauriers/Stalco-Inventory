// cache.js
import NodeCache from "node-cache";
// Initialize cache with a standard time-to-live (TTL) of 1 hour (3600 seconds)
export const cache = new NodeCache({ stdTTL: 86400 });


