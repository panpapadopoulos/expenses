/**
 * Data Service for Expenses
 * Handles communication with the Cloudflare Worker API (/api/data)
 */

import { AppData } from '../types';

const API_URL = '/api/data';

export const EMPTY_DATA: AppData = { expenses: [], categories: [], accounts: [] };

export async function fetchData(): Promise<AppData> {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      if (response.status === 401) {
        window.location.reload();
        throw new Error('Not authenticated');
      }
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return EMPTY_DATA;
  }
}

export async function saveData(data: AppData): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.reload();
        throw new Error('Not authenticated');
      }
      throw new Error(`Failed to save data: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
}
