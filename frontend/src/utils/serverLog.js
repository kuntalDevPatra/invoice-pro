import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';

const serverLog = {
  info: (message, data = null) => {
    console.log(`[INFO] ${message}`, data);
    axios.post(API_BASE_URL + 'log', {
      level: 'info',
      message,
      data
    }).catch(() => {}); // Ignore errors
  },
  
  error: (message, data = null) => {
    console.error(`[ERROR] ${message}`, data);
    axios.post(API_BASE_URL + 'log', {
      level: 'error',
      message,
      data
    }).catch(() => {}); // Ignore errors
  },
  
  debug: (message, data = null) => {
    console.log(`[DEBUG] ${message}`, data);
    axios.post(API_BASE_URL + 'log', {
      level: 'debug',
      message,
      data
    }).catch(() => {}); // Ignore errors
  }
};

export default serverLog;