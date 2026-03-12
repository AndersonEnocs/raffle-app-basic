import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, map } from 'rxjs';
import { environment } from '../environments/environment';

export interface RaffleResponse {
  statusCode: number;
  message: string;
  data: Raffle;
}

export interface Raffle {
  _id: string;
  title: string;
  description: string;
  price: number;
  totalTickets: number;
  ticketsAvailable: number; // Nuevo campo real
  ticketsSold: number;      // Nuevo campo real
  takenNumbers: number[];   // Nuevo campo real
  images: string[];
  status?: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface TicketsInfo {
  totalTickets: number;
  availableNumbers: number[];
}

// Interfaz para la respuesta de Stripe
export interface StripeCheckoutResponse {
  ticketId: string;
  checkoutUrl: string;
  totalAmount: number;
  currency: string;
}

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = (environment as any).apiBaseUrl ?? 'http://localhost:3000';

  async getLatestRaffle(): Promise<Raffle> {
    try {
      const response = await firstValueFrom(
        this.http.get<RaffleResponse>(`${this.apiBaseUrl}/raffles/latest`)
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  getRaffleById(id: number): Observable<Raffle> {
    return this.http.get<RaffleResponse>(`${this.apiBaseUrl}/raffles/${id}`).pipe(
      map((response) => response.data)
    );
  }

  getAllRaffles(): Observable<Raffle[]> {
    return this.http.get<Raffle[]>(`${this.apiBaseUrl}/raffles`);
  }

  async createStripeCheckoutSession(numbers: number[], name: string, phone: string, raffleId: string): Promise<StripeCheckoutResponse> {
    const body = { numbers, name, phone };
    return firstValueFrom(
      this.http.post<StripeCheckoutResponse>(`${this.apiBaseUrl}/tickets/${raffleId}/purchase`, body)
    );
  }

  getTicketsInfo(raffleId: string): Observable<TicketsInfo> {
    return this.http.get<TicketsInfo>(`${this.apiBaseUrl}/tickets/${raffleId}/tickets-info`);
  }
}