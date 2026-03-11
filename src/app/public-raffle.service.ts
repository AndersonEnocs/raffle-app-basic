import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class RaffleService {
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl =
    (environment as any).apiBaseUrl ?? 'http://localhost:3000';

  getLatestRaffle(): Observable<Raffle> {
    return this.http.get<RaffleResponse>(`${this.apiBaseUrl}/raffles/latest`).pipe(
      map((response) => response.data)
    );
  }

  getRaffleById(id: number): Observable<Raffle> {
    return this.http.get<RaffleResponse>(`${this.apiBaseUrl}/raffles/${id}`).pipe(
      map((response) => response.data)
    );
  }

  getAllRaffles(): Observable<Raffle[]> {
    return this.http.get<Raffle[]>(`${this.apiBaseUrl}/raffles`);
  }
}
