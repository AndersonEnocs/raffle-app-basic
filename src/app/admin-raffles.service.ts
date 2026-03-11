import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { AdminAuthService } from './admin-auth.service';

export interface CreateRaffleRequest {
  title: string;
  description?: string;
  price: number;
  totalTickets: number;
  images: File[];
}

interface CreateRaffleResponse {
  statusCode: number;
  message: string;
  data?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class AdminRafflesService {
  private readonly http = inject(HttpClient);
  private readonly adminAuth = inject(AdminAuthService);

  private readonly apiBaseUrl =
    (environment as any).apiBaseUrl ?? 'http://localhost:3000';

  async createRaffle(payload: CreateRaffleRequest): Promise<CreateRaffleResponse> {
    const token = this.adminAuth.token();
    if (!token) {
      throw new Error('No autorizado. Inicia sesión como administrador.');
    }

    const form = new FormData();
    form.append('title', payload.title);
    if (payload.description?.trim()) {
      form.append('description', payload.description.trim());
    }
    form.append('price', String(payload.price));
    form.append('totalTickets', String(payload.totalTickets));
    payload.images.forEach((file) => form.append('images', file, file.name));

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return await firstValueFrom(
      this.http.post<CreateRaffleResponse>(
        `${this.apiBaseUrl}/admin/raffles`,
        form,
        { headers },
      ),
    );
  }
}

