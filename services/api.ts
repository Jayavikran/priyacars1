
import { Car, Partner } from "../types";

const API_BASE = '/api';

export const api = {
  // Partners
  async getPartners(): Promise<Partner[]> {
    const res = await fetch(`${API_BASE}/partners`);
    if (!res.ok) throw new Error('Failed to fetch partners');
    return res.json();
  },
  async createPartner(partner: Partner): Promise<Partner> {
    const res = await fetch(`${API_BASE}/partners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partner),
    });
    return res.json();
  },
  async updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
    const res = await fetch(`${API_BASE}/partners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  async deletePartner(id: string): Promise<void> {
    await fetch(`${API_BASE}/partners/${id}`, { method: 'DELETE' });
  },

  // Cars
  async getCars(): Promise<Car[]> {
    const res = await fetch(`${API_BASE}/cars`);
    if (!res.ok) throw new Error('Failed to fetch cars');
    return res.json();
  },
  async createCar(car: Car): Promise<Car> {
    const res = await fetch(`${API_BASE}/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car),
    });
    return res.json();
  },
  async updateCar(id: string, updates: Partial<Car>): Promise<Car> {
    const res = await fetch(`${API_BASE}/cars/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },
  async deleteCar(id: string): Promise<void> {
    await fetch(`${API_BASE}/cars/${id}`, { method: 'DELETE' });
  }
};
