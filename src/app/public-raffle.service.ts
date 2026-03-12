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
  _id?: string;
  id?: number;
  title: string;
  description?: string;
  price: number;
  totalTickets: number;
  soldTickets?: number;
  images: string[];
  status?: 'active' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface TicketsInfo {
  totalTickets: number;
  availableNumbers: number[];
}

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl =
    (environment as any).apiBaseUrl ?? 'http://localhost:3000';

    async getLatestRaffle(): Promise<Raffle> {
      console.log('>>> SERVICE: Iniciando getLatestRaffle con URL:', `${this.apiBaseUrl}/raffles/latest`);
    
      try {
        const response = await firstValueFrom(
          this.http.get<RaffleResponse>(`${this.apiBaseUrl}/raffles/latest`)
        );
        console.log('>>> SERVICE: Respuesta cruda:', response);
        return response.data;
      } catch (err) {
        console.error('>>> SERVICE: Error crudo en http.get:', err);
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

  getTicketsInfo(raffleId: string): Observable<TicketsInfo> {
    return this.http.get<TicketsInfo>(
      `${this.apiBaseUrl}/tickets/${raffleId}/tickets-info`,
    );
  }
}
