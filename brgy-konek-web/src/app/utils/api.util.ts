import axios from 'axios';
import CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

const SECRET_KEY = 'brgykonek_secret_key';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function getBaseUrl(): string {
  return environment.baseUrl;
}

export function getApiUrl(): string {
  return environment.apiUrl;
}

export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${environment.baseUrl}${imagePath}`;
}

const apiClient = axios.create({
  baseURL: environment.apiUrl,
  timeout: 60000, // Increased timeout to 60 seconds for live backend
  // Don't set default Content-Type - let axios/browser set it appropriately
});

apiClient.interceptors.request.use((config) => {
  const encryptedToken = localStorage.getItem('accessToken');
  if (encryptedToken) {
    const token = decrypt(encryptedToken);
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient;
