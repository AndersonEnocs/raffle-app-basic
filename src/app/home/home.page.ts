import { Component, computed, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonChip,
  IonLabel,
  IonInput,
  IonModal,
  IonItem,
  IonList,
  IonBadge,
} from '@ionic/angular/standalone';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    NgIf,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonText,
    IonChip,
    IonLabel,
    IonInput,
    IonModal,
    IonItem,
    IonList,
    IonBadge,
  ],
})
export class HomePage {
  readonly coursePrice = 20;

  readonly stats = {
    total: 3000,
    vendidos: 300,
    disponibles: 2700,
  };

  readonly galleryImages: string[] = [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
    'https://images.unsplash.com/photo-1542362567-b07e54306153?w=800',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
  ];

  /** Índice actual del slider (hero y modal comparten lógica). */
  readonly currentSlideIndex = signal(0);

  /** Para swipe táctil: inicio del gesto. */
  private touchStartX = 0;
  private touchStartY = 0;

  readonly isGalleryOpen = signal(false);
  readonly isPurchaseOpen = signal(false);
  readonly isAllNumbersOpen = signal(false);
  readonly isOrderOpen = signal(false);

  readonly isAdminLoginOpen = signal(false);
  readonly isAdminDashboardOpen = signal(false);
  readonly isPlayersModalOpen = signal(false);

  readonly orderName = signal('');
  readonly orderPhone = signal('');

  readonly adminPassword = signal('');
  readonly adminAuthError = signal('');
  readonly isAdminAuthenticated = signal(false);

  /** Página actual en "Ver todos los números" (1-based). */
  readonly allNumbersPage = signal(1);

  readonly searchNumber = signal<string>('');

  /** Cada número guarda si fue reservado por el sistema o elegido por el usuario. */
  readonly selectedNumbers = signal<
    Array<{ value: number; type: 'system' | 'user' }>
  >([]);

  readonly players: Array<{
    id: number;
    name: string;
    phone: string;
    order: string;
    status: 'Completed' | 'Pending';
  }> = [
    {
      id: 1,
      name: 'Iver Jimenez',
      phone: '14076078028',
      order: '128234',
      status: 'Completed',
    },
    {
      id: 2,
      name: 'Yannis',
      phone: '7867974221',
      order: '128202',
      status: 'Completed',
    },
    {
      id: 3,
      name: 'Amauri Rodriguez Rodriguez',
      phone: '2818983525',
      order: '128244',
      status: 'Completed',
    },
    {
      id: 4,
      name: 'Charly',
      phone: '2398217940',
      order: '128236',
      status: 'Completed',
    },
    {
      id: 5,
      name: 'Oscar',
      phone: '+1 (645) 223-9179',
      order: '128224',
      status: 'Completed',
    },
    {
      id: 6,
      name: 'Regino Pérez',
      phone: '7862525943',
      order: '128194',
      status: 'Completed',
    },
    {
      id: 7,
      name: 'Juan Iazo',
      phone: '2022704658',
      order: '128231',
      status: 'Completed',
    },
    {
      id: 8,
      name: 'Roque',
      phone: '7869731357',
      order: '128230',
      status: 'Completed',
    },
    {
      id: 9,
      name: 'Ernestomdiaz',
      phone: '+1 (813) 475-0481',
      order: '128170',
      status: 'Completed',
    },
  ];

  readonly importe = computed(
    () => this.selectedNumbers().length * this.coursePrice,
  );

  /** Líneas del pedido para la tabla: cada número + línea "Curso × N". */
  readonly orderLines = computed(() => {
    const entries = this.selectedNumbers();
    const lines: Array<{ label: string; subtotal: number }> = [];
    entries.forEach((e) => {
      lines.push({ label: `${e.value} × 1`, subtotal: 0 });
    });
    if (entries.length > 0) {
      lines.push({
        label: `Curso × ${entries.length}`,
        subtotal: entries.length * this.coursePrice,
      });
    }
    return lines;
  });

  onAdminClick(): void {
    if (this.isAdminAuthenticated()) {
      this.isAdminDashboardOpen.set(true);
      return;
    }
    this.openAdminLogin();
  }

  openAdminLogin(): void {
    this.adminPassword.set('');
    this.adminAuthError.set('');
    this.isAdminLoginOpen.set(true);
  }

  closeAdminLogin(): void {
    this.isAdminLoginOpen.set(false);
  }

  submitAdminLogin(): void {
    const value = (this.adminPassword() ?? '').trim();
    if (value === 'curso2026') {
      this.isAdminAuthenticated.set(true);
      this.adminAuthError.set('');
      this.isAdminLoginOpen.set(false);
      this.isAdminDashboardOpen.set(true);
      return;
    }

    this.adminAuthError.set('Contraseña incorrecta. Intenta de nuevo.');
  }

  closeAdminDashboard(): void {
    this.isAdminDashboardOpen.set(false);
  }

  logoutAdmin(): void {
    this.isAdminAuthenticated.set(false);
    this.isAdminDashboardOpen.set(false);
  }

  openPlayersModal(): void {
    this.isPlayersModalOpen.set(true);
  }

  closePlayersModal(): void {
    this.isPlayersModalOpen.set(false);
  }

  /** Números vendidos/no disponibles: simulados (1 hasta stats.vendidos). */
  isNumberAvailable(n: number): boolean {
    return n > this.stats.vendidos;
  }

  /** Tamaño de página y total de páginas para la grilla de números. */
  readonly allNumbersPerPage = 100;
  readonly allNumbersTotalPages = computed(() =>
    Math.ceil(this.stats.total / this.allNumbersPerPage),
  );

  /** Números a mostrar en la página actual. */
  readonly numbersForCurrentPage = computed(() => {
    const page = this.allNumbersPage();
    const start = (page - 1) * this.allNumbersPerPage + 1;
    const end = Math.min(start + this.allNumbersPerPage - 1, this.stats.total);
    const list: number[] = [];
    for (let i = start; i <= end; i++) list.push(i);
    return list;
  });

  openAllNumbers(): void {
    this.isAllNumbersOpen.set(true);
    this.allNumbersPage.set(1);
  }

  closeAllNumbers(): void {
    this.isAllNumbersOpen.set(false);
  }

  allNumbersPrevPage(): void {
    this.allNumbersPage.update((p) => Math.max(1, p - 1));
  }

  allNumbersNextPage(): void {
    this.allNumbersPage.update((p) =>
      Math.min(this.allNumbersTotalPages(), p + 1),
    );
  }

  /** Añadir número desde la grilla (solo si está disponible y no está ya elegido). */
  addNumberFromGrid(n: number): void {
    if (!this.isNumberAvailable(n)) return;
    const values = this.selectedNumbers().map((e) => e.value);
    if (values.includes(n)) return;
    this.selectedNumbers.update((entries) =>
      [...entries, { value: n, type: 'user' as const }].sort(
        (a, b) => a.value - b.value,
      ),
    );
  }

  isNumberSelected(n: number): boolean {
    return this.selectedNumbers().map((e) => e.value).includes(n);
  }

  toggleGallery(open: boolean): void {
    this.isGalleryOpen.set(open);
    if (open) {
      this.currentSlideIndex.set(0);
    }
  }

  get totalSlides(): number {
    return this.galleryImages.length;
  }

  goToSlide(index: number): void {
    const n = this.totalSlides;
    const i = ((index % n) + n) % n;
    this.currentSlideIndex.set(i);
  }

  nextSlide(): void {
    this.goToSlide(this.currentSlideIndex() + 1);
  }

  prevSlide(): void {
    this.goToSlide(this.currentSlideIndex() - 1);
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].pageX;
    this.touchStartY = e.changedTouches[0].pageY;
  }

  onTouchEnd(e: TouchEvent): void {
    const endX = e.changedTouches[0].pageX;
    const endY = e.changedTouches[0].pageY;
    const dx = endX - this.touchStartX;
    const dy = endY - this.touchStartY;
    const minSwipe = 50;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
      if (dx > 0) this.prevSlide();
      else this.nextSlide();
    }
  }

  togglePurchase(open: boolean): void {
    this.isPurchaseOpen.set(open);
  }

  onSearchConfirm(): void {
    const value = Number(this.searchNumber());

    if (!Number.isFinite(value) || value <= 0 || value > this.stats.total) {
      return;
    }

    const values = this.selectedNumbers().map((e) => e.value);
    if (!values.includes(value)) {
      this.selectedNumbers.update((entries) =>
        [...entries, { value, type: 'user' as const }].sort((a, b) => a.value - b.value),
      );
    }
  }

  pickRandomNumber(): void {
    const max = this.stats.total;
    const taken = new Set(this.selectedNumbers().map((e) => e.value));

    if (taken.size >= max) {
      return;
    }

    let candidate = 0;
    do {
      candidate = Math.floor(Math.random() * max) + 1;
    } while (taken.has(candidate));

    this.selectedNumbers.update((entries) =>
      [...entries, { value: candidate, type: 'system' as const }].sort((a, b) => a.value - b.value),
    );
  }

  clearNumbers(): void {
    this.selectedNumbers.set([]);
    this.searchNumber.set('');
  }

  openOrder(): void {
    this.isOrderOpen.set(true);
  }

  closeOrder(): void {
    this.isOrderOpen.set(false);
  }

  payWithStripe(): void {
    // Placeholder: aquí integrarías Stripe (Checkout Session, etc.)
    console.log('Pagar con Stripe', {
      name: this.orderName(),
      phone: this.orderPhone(),
      total: this.importe(),
    });
  }
}
