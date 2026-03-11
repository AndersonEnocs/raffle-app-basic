import { Component, OnInit, computed, signal } from '@angular/core';
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
import { AdminAuthService } from '../admin-auth.service';
import { AdminRafflesService } from '../admin-raffles.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Raffle, RaffleService, TicketsInfo, PurchaseRequest } from '../public-raffle.service';
import { firstValueFrom } from 'rxjs';

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
export class HomePage implements OnInit {
  constructor(
    private readonly adminAuth: AdminAuthService,
    private readonly adminRaffles: AdminRafflesService,
    private readonly raffleService: RaffleService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
  ) {}

  readonly raffleData = signal<Raffle | null>(null);
  readonly loading = signal<boolean>(false);
  readonly hasRaffle = signal<boolean>(true);

  readonly coursePrice = computed(() => this.raffleData()?.price ?? 20);

  // Getters for template use to avoid signal type issues
  getRaffleTitle(): string {
    return this.raffleData()?.title ?? 'Rifa Premium Truck 441';
  }

  getRaffleDescription(): string {
    return this.raffleData()?.description ?? 'Aprovecha tu rifa: curso exclusivo y participación en el sorteo de vehículos de alta gama. El ganador elige el vehículo de su preferencia entre los premios disponibles.';
  }

  getCoursePriceValue(): number {
    return this.coursePrice();
  }

  getStatsTotal(): number {
    return this.stats().total;
  }

  getStatsVendidos(): number {
    return this.stats().vendidos;
  }

  getStatsDisponibles(): number {
    return this.stats().disponibles;
  }

  readonly stats = computed(() => {
    const raffle = this.raffleData();
    const total = raffle?.totalTickets ?? 3000;
    const vendidos = raffle?.ticketsSold ?? 0;
    const disponibles = raffle?.ticketsAvailable ?? (total - vendidos);
    return {
      total,
      vendidos,
      disponibles,
    };
  });

  readonly galleryImages = computed(() => this.raffleData()?.images ?? []);

  readonly currentSlideIndex = signal(0);

  private touchStartX = 0;
  private touchStartY = 0;

  readonly isGalleryOpen = signal(false);
  readonly isPurchaseOpen = signal(false);
  readonly isAllNumbersOpen = signal(false);
  readonly isOrderOpen = signal(false);

  readonly isAdminLoginOpen = signal(false);
  readonly isAdminDashboardOpen = signal(false);
  readonly isPlayersModalOpen = signal(false);
  readonly isCreateRaffleOpen = signal(false);

  readonly orderName = signal('');
  readonly orderPhone = signal('');

  readonly adminPassword = signal('');

  readonly isAdminAuthenticated = computed(
    () => this.adminAuth.isAuthenticated(),
  );

  readonly adminAuthError = computed(() => this.adminAuth.error() ?? '');

  readonly isAdminLoading = computed(() => this.adminAuth.isLoading());

  readonly raffleTitle = signal('');
  readonly raffleDescription = signal('');
  readonly raffleTicketPrice = signal<number>(this.coursePrice());
  readonly raffleTotalTickets = signal<number>(3000);
  readonly raffleImages = signal<File[]>([]);
  readonly createRaffleError = signal('');
  readonly isCreateRaffleLoading = signal(false);
  readonly isProcessingPayment = signal(false);

  readonly allNumbersPage = signal(1);

  readonly availableNumbers = signal<Set<number>>(new Set());

  readonly searchNumber = signal<string>('');

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
    () => this.selectedNumbers().length * this.coursePrice(),
  );

  readonly orderLines = computed(() => {
    const entries = this.selectedNumbers();
    const lines: Array<{ label: string; subtotal: number }> = [];
    entries.forEach((e) => {
      lines.push({
        label: `Número ${e.value}`,
        subtotal: this.coursePrice(),
      });
    });
    if (entries.length > 0) {
      lines.push({
        label: `Curso × ${entries.length}`,
        subtotal: entries.length * this.coursePrice(),
      });
    }
    return lines;
  });

  ngOnInit() {
    this.loadLatestRaffle();
  }

  async loadLatestRaffle() {
    this.loading.set(true);

    const loading = await this.loadingCtrl.create({
      message: 'Cargando rifa...',
    });
    await loading.present();

    try {
      const data = await firstValueFrom(this.raffleService.getLatestRaffle());

      if (data && data._id) {
        this.raffleData.set(data);
        this.hasRaffle.set(true);
      } else {
        this.raffleData.set(null);
        this.hasRaffle.set(false);
      }
    } catch {
      this.raffleData.set(null);
      this.hasRaffle.set(false);
    } finally {
      this.loading.set(false);
      await loading.dismiss();
    }
  }

  onAdminClick(): void {
    if (this.isAdminAuthenticated()) {
      this.isAdminDashboardOpen.set(true);
    } else {
      this.openAdminLogin();
    }
  }

  openAdminLogin(): void {
    this.adminPassword.set('');
    this.adminAuth.clearError();
    this.isAdminLoginOpen.set(true);
  }

  closeAdminLogin(): void {
    this.isAdminLoginOpen.set(false);
  }

  async submitAdminLogin(): Promise<void> {
    await this.adminAuth.login(this.adminPassword());
    if (this.isAdminAuthenticated()) {
      this.closeAdminLogin();
      this.isAdminDashboardOpen.set(true);
    }
  }

  closeAdminDashboard(): void {
    this.isAdminDashboardOpen.set(false);
  }

  logoutAdmin(): void {
    this.adminAuth.logout();
    this.closeAdminDashboard();
  }

  openPlayersModal(): void {
    this.isPlayersModalOpen.set(true);
  }

  closePlayersModal(): void {
    this.isPlayersModalOpen.set(false);
  }

  openCreateRaffleModal(): void {
    this.raffleTitle.set('');
    this.raffleDescription.set('');
    this.raffleTicketPrice.set(this.coursePrice());
    this.raffleTotalTickets.set(this.stats().total);
    this.raffleImages.set([]);
    this.createRaffleError.set('');
    this.isCreateRaffleOpen.set(true);
  }

  closeCreateRaffleModal(): void {
    this.isCreateRaffleOpen.set(false);
  }

  onRaffleImagesSelected(files: FileList | null): void {
    if (files) {
      this.raffleImages.set(Array.from(files));
    }
  }

  async submitCreateRaffle(): Promise<void> {
    this.isCreateRaffleLoading.set(true);
    this.createRaffleError.set('');
    try {
      await this.adminRaffles.createRaffle({
        title: this.raffleTitle(),
        description: this.raffleDescription(),
        price: this.raffleTicketPrice(),
        totalTickets: this.raffleTotalTickets(),
        images: this.raffleImages(),
      });
      this.closeCreateRaffleModal();
      // Cargar la rifa recién creada automáticamente
      await this.loadLatestRaffle();
    } catch (error) {
      this.createRaffleError.set('Error al crear la rifa');
    } finally {
      this.isCreateRaffleLoading.set(false);
    }
  }

  isNumberAvailable(n: number): boolean {
    const availableSet = this.availableNumbers();
    if (availableSet.size > 0) {
      return availableSet.has(n);
    }
    return n > this.stats().vendidos;
  }

  readonly allNumbersPerPage = 1000;
  readonly allNumbersTotalPages = computed(() =>
    Math.ceil(this.stats().total / this.allNumbersPerPage),
  );

  readonly numbersForCurrentPage = computed(() => {
    const start = (this.allNumbersPage() - 1) * this.allNumbersPerPage + 1;
    const end = Math.min(start + this.allNumbersPerPage - 1, this.stats().total);
    const numbers = [];
    for (let i = start; i <= end; i++) {
      numbers.push(i);
    }
    return numbers;
  });

  async openAllNumbers(): Promise<void> {
    this.allNumbersPage.set(1);

    const raffle = this.raffleData();
    if (!raffle?._id) {
      this.isAllNumbersOpen.set(true);
      return;
    }

    // Si el API ya devuelve takenNumbers, usarlos directamente
    if (raffle.takenNumbers && raffle.takenNumbers.length > 0) {
      // Crear set de todos los números disponibles (los que NO están en takenNumbers)
      const total = raffle.totalTickets;
      const takenSet = new Set(raffle.takenNumbers);
      const available: number[] = [];
      
      for (let i = 1; i <= total; i++) {
        if (!takenSet.has(i)) {
          available.push(i);
        }
      }
      
      this.availableNumbers.set(new Set(available));
    } else {
      // Si no hay takenNumbers, intentar obtenerlos del endpoint
      try {
        const ticketsInfo: TicketsInfo = await firstValueFrom(
          this.raffleService.getTicketsInfo(raffle._id),
        );
        this.availableNumbers.set(new Set(ticketsInfo.availableNumbers));
      } catch (error) {
        // Silenciar error, usar valores por defecto
      }
    }

    this.isAllNumbersOpen.set(true);
  }

  closeAllNumbers(): void {
    this.isAllNumbersOpen.set(false);
  }

  allNumbersPrevPage(): void {
    if (this.allNumbersPage() > 1) {
      this.allNumbersPage.update((p) => p - 1);
    }
  }

  allNumbersNextPage(): void {
    if (this.allNumbersPage() < this.allNumbersTotalPages()) {
      this.allNumbersPage.update((p) => p + 1);
    }
  }

  addNumberFromGrid(n: number): void {
    if (this.isNumberAvailable(n) && !this.isNumberSelected(n)) {
      this.selectedNumbers.update((nums) => [
        ...nums,
        { value: n, type: 'user' },
      ]);
    }
  }

  isNumberSelected(n: number): boolean {
    return this.selectedNumbers().some((num) => num.value === n);
  }

  toggleGallery(open: boolean): void {
    this.isGalleryOpen.set(open);
    if (open) {
      this.currentSlideIndex.set(0);
    }
  }

  get totalSlides(): number {
    return this.galleryImages().length;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex.set(index);
  }

  nextSlide(): void {
    this.currentSlideIndex.update((i) =>
      i < this.totalSlides - 1 ? i + 1 : 0,
    );
  }

  prevSlide(): void {
    this.currentSlideIndex.update((i) =>
      i > 0 ? i - 1 : this.totalSlides - 1,
    );
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  }

  onTouchEnd(e: TouchEvent): void {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - this.touchStartX;
    const deltaY = touchEndY - this.touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        this.prevSlide();
      } else {
        this.nextSlide();
      }
    }
  }

  togglePurchase(open: boolean): void {
    this.isPurchaseOpen.set(open);
  }

  onSearchConfirm(): void {
    const num = parseInt(this.searchNumber(), 10);
    if (num >= 1 && num <= this.stats().total && this.isNumberAvailable(num)) {
      this.selectedNumbers.update((nums) => [
        ...nums,
        { value: num, type: 'user' },
      ]);
      this.searchNumber.set('');
    }
  }

  pickRandomNumber(): void {
    const available = [];
    for (let i = 1; i <= this.stats().total; i++) {
      if (this.isNumberAvailable(i) && !this.isNumberSelected(i)) {
        available.push(i);
      }
    }
    if (available.length > 0) {
      const random = available[Math.floor(Math.random() * available.length)];
      this.selectedNumbers.update((nums) => [
        ...nums,
        { value: random, type: 'system' },
      ]);
    }
  }

  clearNumbers(): void {
    this.selectedNumbers.set([]);
  }

  openOrder(): void {
    this.isOrderOpen.set(true);
  }

  closeOrder(): void {
    this.isOrderOpen.set(false);
  }

  async payWithStripe(): Promise<void> {
    // Evitar múltiples clics
    if (this.isProcessingPayment()) {
      return;
    }

    this.isProcessingPayment.set(true);

    const raffle = this.raffleData();
    const raffleId = raffle?._id;

    if (!raffleId) {
      this.isProcessingPayment.set(false);
      const toast = await this.toastCtrl.create({
        message: 'Error: No se pudo identificar la rifa.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
      return;
    }

    const name = this.orderName().trim();
    const phone = this.orderPhone().trim();
    const numbers = this.selectedNumbers().map((n) => n.value);

    if (!name || !phone) {
      this.isProcessingPayment.set(false);
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa tu nombre y teléfono.',
        duration: 3000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    if (numbers.length === 0) {
      this.isProcessingPayment.set(false);
      const toast = await this.toastCtrl.create({
        message: 'Selecciona al menos un número.',
        duration: 3000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Procesando pago...',
    });
    await loading.present();

    try {
      const response = await firstValueFrom(
        this.raffleService.purchaseTickets(raffleId, {
          name,
          phone,
          numbers,
        }),
      );

      const checkoutUrl = response?.checkoutUrl;

      if (checkoutUrl) {
        // Redireccionar al checkout de Stripe
        window.location.href = checkoutUrl;
      } else {
        this.isProcessingPayment.set(false);
        const toast = await this.toastCtrl.create({
          message: 'Error al obtener el enlace de pago.',
          duration: 3000,
          color: 'danger',
        });
        await toast.present();
      }
    } catch (error: any) {
      this.isProcessingPayment.set(false);
      const message =
        error?.error?.message || 'Error al procesar el pago. Intenta de nuevo.';
      const toast = await this.toastCtrl.create({
        message,
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      this.isProcessingPayment.set(false);
      await loading.dismiss();
    }
  }
}