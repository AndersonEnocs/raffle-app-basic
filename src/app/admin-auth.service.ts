import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

interface AdminLoginResponse {
  statusCode: number;
  message: string;
  data?: {
    token?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private readonly http = inject(HttpClient);

  private readonly apiBaseUrl = environment.apiBaseUrl || 'http://localhost:3000';

  readonly token = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.token());

  async login(password: string): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<AdminLoginResponse>(
          `${this.apiBaseUrl}/admin/auth/login`,
          { password },
        ),
      );

      const token = response?.data?.token;
      if (token) {
        this.token.set(token);
        // Opcional: persistir token si luego se usan más endpoints protegidos.
        // localStorage.setItem('admin_token', token);
        return true;
      }

      this.error.set('No se pudo obtener el token de administrador.');
      return false;
    } catch (err: any) {
      const message =
        err?.error?.message ||
        'Error al iniciar sesión. Verifica la contraseña e inténtalo de nuevo.';
      this.error.set(message);
      return false;
    } finally {
      this.isLoading.set(false);
    }
  }

  logout(): void {
    this.token.set(null);
    // localStorage.removeItem('admin_token');
  }

  clearError(): void {
    this.error.set(null);
  }
}

