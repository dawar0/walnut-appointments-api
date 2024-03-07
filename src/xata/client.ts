import { BaseClient } from '@xata.io/client';

export const getXataClient = () => {
  if (!process.env.XATA_API_KEY) {
    throw new Error('XATA_API_KEY not set');
  }

  if (!process.env.XATA_DB_URL) {
    throw new Error('XATA_DB_URL not set');
  }
  const xata = new BaseClient({
    databaseURL: process.env.XATA_DB_URL,
    apiKey: process.env.XATA_API_KEY,
    branch: process.env.XATA_BRANCH || 'main',
  });
  return xata;
};
