const path = require('path');
const serverless = require('serverless-http');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../../backend/.env') });

const connectDB = require('../../../backend/config/db');
const createApp = require('../../../backend/createApp');

let dbPromise;
const app = createApp();
const expressHandler = serverless(app);

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!dbPromise) {
    dbPromise = connectDB();
  }
  await dbPromise;

  if (event.path.startsWith('/.netlify/functions/api/')) {
    event.path = `/api/${event.path.split('/.netlify/functions/api/')[1]}`;
  }

  return expressHandler(event, context);
};
