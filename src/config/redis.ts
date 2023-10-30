import { createClient } from 'redis';

export const EXP = 60; 

const redis = createClient({
  url: process.env.REDIS_URL,
});

(async () => {
  console.log('Connecting to Redis...');
  const conected = await redis.connect();
  if(conected) return console.log('redis coneccted')
})();

export default redis;