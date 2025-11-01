import { Injectable } from '@angular/core';
import apiClient from '../utils/api.util';

export interface Sitio {
  _id: string;
  code: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class SitiosService {
  private baseUrl = '/sitios';

  async getSitios(): Promise<Sitio[] | undefined> {
    try {
      console.log('SitiosService: Making request to:', this.baseUrl);
      const res = await apiClient.get<Sitio[]>(this.baseUrl);
      console.log('SitiosService: Response received:', res.data);
      return res.data;
    } catch (error) {
      console.error('SitiosService: Error fetching sitios:', error);
      return undefined;
    }
  }
}
