import { Component, OnInit, computed, signal } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonText, IonChip, IonLabel, IonInput, IonModal,
  IonItem, IonList, IonBadge,
} from '@ionic/angular/standalone';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../admin-auth.service';
import { AdminRafflesService } from '../admin-raffles.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { Raffle, RaffleService, TicketsInfo } from '../public-raffle.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule, FormsModule, NgFor, NgIf, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonButton, IonGrid, IonRow, IonCol, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonText, IonChip, IonLabel,
    IonInput, IonModal, IonItem, IonList, IonBadge,
  ],
})
export class HomePage implements OnInit {
  constructor(
    private readonly adminAuth: AdminAuthService,
    private readonly adminRaffles: AdminRafflesService,
    private readonly raffleService: RaffleService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
  ) { }

  readonly raffleData = signal<Raffle | null>(null);
  readonly loading = signal<boolean>(false);
  readonly soldTickets = signal<number>(0);

  readonly coursePrice = computed(() => this.raffleData()?.price ?? 20);

  getRaffleTitle(): string { return this.raffleData()?.title ?? 'Rifa Premium Truck 441'; }
  getRaffleDescription(): string { return this.raffleData()?.description ?? 'Aprovecha tu rifa: curso exclusivo y participación en el sorteo de vehículos de alta gama.'; }
  getCoursePriceValue(): number { return this.coursePrice(); }
  getStatsTotal(): number { return this.stats().total; }
  getStatsVendidos(): number { return this.stats().vendidos; }
  getStatsDisponibles(): number { return this.stats().disponibles; }

  readonly stats = computed(() => {
    const total = this.raffleData()?.totalTickets ?? 3000;
    const vendidos = this.soldTickets();
    return { total, vendidos, disponibles: total - vendidos };
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

  readonly isAdminAuthenticated = computed(() => this.adminAuth.isAuthenticated());
  readonly adminAuthError = computed(() => this.adminAuth.error() ?? '');
  readonly isAdminLoading = computed(() => this.adminAuth.isLoading());

  readonly raffleTitle = signal('');
  readonly raffleDescription = signal('');
  readonly raffleTicketPrice = signal<number>(20);
  readonly raffleTotalTickets = signal<number>(3000);
  readonly raffleImages = signal<File[]>([]);
  readonly createRaffleError = signal('');
  readonly isCreateRaffleLoading = signal(false);

  readonly allNumbersPage = signal(1);
  readonly availableNumbers = signal<Set<number>>(new Set());
  readonly searchNumber = signal<string>('');
  readonly selectedNumbers = signal<Array<{ value: number; type: 'system' | 'user' }>>([]);

  readonly players = [
    { id: 1, name: 'Iver Jimenez', phone: '14076078028', order: '128234', status: 'Completed' as const },
  ];

  readonly importe = computed(() => this.selectedNumbers().length * this.coursePrice());

  readonly orderLines = computed(() => {
    const entries = this.selectedNumbers();
    const lines: Array<{ label: string; subtotal: number }> = [];
    entries.forEach((e) => {
      lines.push({ label: `Número ${e.value}`, subtotal: this.coursePrice() });
    });
    if (entries.length > 0) {
      lines.push({ label: `Curso × ${entries.length}`, subtotal: entries.length * this.coursePrice() });
    }
    return lines;
  });

  ngOnInit() {
    this.loadLatestRaffle();
  }

  async loadLatestRaffle() {
    console.log('>>> HOME: INTENTANDO CARGAR LA RIFA LATEST - ENTRO A LA FUNCIÓN');
    this.loading.set(true);
    try {
      console.log('>>> HOME: Esperando datos de service...');
      const data = await this.raffleService.getLatestRaffle();
      console.log('>>> HOME: ÉXITO - Datos recibidos:', data);

      this.raffleData.set(data);
      if (data.soldTickets !== undefined) {
        this.soldTickets.set(data.soldTickets);
      }
    } catch (err: any) {
      console.error('>>> HOME: ERROR CRÍTICO CAPTURADO:', err);
      const toast = await this.toastCtrl.create({
        message: 'Error al cargar la rifa. Verifica tu conexión o backend.',
        duration: 5000,
        color: 'danger'
      });
      await toast.present();
    } finally {
      console.log('>>> HOME: FINALIZÓ la carga (success o error)');
      this.loading.set(false);
    }
  }

  onAdminClick(): void {
    if (this.isAdminAuthenticated()) this.isAdminDashboardOpen.set(true);
    else this.openAdminLogin();
  }

  openAdminLogin(): void {
    this.adminPassword.set('');
    this.adminAuth.clearError();
    this.isAdminLoginOpen.set(true);
  }

  closeAdminLogin(): void { this.isAdminLoginOpen.set(false); }

  async submitAdminLogin(): Promise<void> {
    await this.adminAuth.login(this.adminPassword());
    if (this.isAdminAuthenticated()) {
      this.closeAdminLogin();
      this.isAdminDashboardOpen.set(true);
    }
  }

  closeAdminDashboard(): void { this.isAdminDashboardOpen.set(false); }
  logoutAdmin(): void { this.adminAuth.logout(); this.closeAdminDashboard(); }
  openPlayersModal(): void { this.isPlayersModalOpen.set(true); }
  closePlayersModal(): void { this.isPlayersModalOpen.set(false); }

  openCreateRaffleModal(): void {
    this.raffleTitle.set('');
    this.raffleDescription.set('');
    this.raffleTicketPrice.set(this.coursePrice());
    this.raffleTotalTickets.set(this.stats().total);
    this.raffleImages.set([]);
    this.createRaffleError.set('');
    this.isCreateRaffleOpen.set(true);
  }

  closeCreateRaffleModal(): void { this.isCreateRaffleOpen.set(false); }
  onRaffleImagesSelected(files: FileList | null): void { if (files) this.raffleImages.set(Array.from(files)); }

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
    } catch (error) {
      this.createRaffleError.set('Error al crear la rifa');
    } finally {
      this.isCreateRaffleLoading.set(false);
    }
  }

  isNumberAvailable(n: number): boolean {
    const availableSet = this.availableNumbers();
    return availableSet.size > 0 ? availableSet.has(n) : n > this.soldTickets();
  }

  readonly allNumbersPerPage = 1000;
  readonly allNumbersTotalPages = computed(() => Math.ceil(this.stats().total / this.allNumbersPerPage));

  readonly numbersForCurrentPage = computed(() => {
    const start = (this.allNumbersPage() - 1) * this.allNumbersPerPage + 1;
    const end = Math.min(start + this.allNumbersPerPage - 1, this.stats().total);
    const numbers = [];
    for (let i = start; i <= end; i++) numbers.push(i);
    return numbers;
  });

  async openAllNumbers(): Promise<void> {
    this.allNumbersPage.set(1);
    const raffle = this.raffleData();
    if (!raffle?._id) { this.isAllNumbersOpen.set(true); return; }
    try {
      const ticketsInfo: TicketsInfo = await firstValueFrom(this.raffleService.getTicketsInfo(raffle._id));
      this.availableNumbers.set(new Set(ticketsInfo.availableNumbers));
      this.soldTickets.set(ticketsInfo.totalTickets - ticketsInfo.availableNumbers.length);
    } catch (error) {
      console.error(error);
    }
    this.isAllNumbersOpen.set(true);
  }

  closeAllNumbers(): void { this.isAllNumbersOpen.set(false); }
  allNumbersPrevPage(): void { if (this.allNumbersPage() > 1) this.allNumbersPage.update((p) => p - 1); }
  allNumbersNextPage(): void { if (this.allNumbersPage() < this.allNumbersTotalPages()) this.allNumbersPage.update((p) => p + 1); }

  addNumberFromGrid(n: number): void {
    if (this.isNumberAvailable(n) && !this.isNumberSelected(n)) {
      this.selectedNumbers.update((nums) => [...nums, { value: n, type: 'user' }]);
    }
  }

  isNumberSelected(n: number): boolean { return this.selectedNumbers().some((num) => num.value === n); }
  toggleGallery(open: boolean): void { this.isGalleryOpen.set(open); if (open) this.currentSlideIndex.set(0); }
  get totalSlides(): number { return this.galleryImages().length; }
  goToSlide(index: number): void { this.currentSlideIndex.set(index); }
  nextSlide(): void { this.currentSlideIndex.update((i) => i < this.totalSlides - 1 ? i + 1 : 0); }
  prevSlide(): void { this.currentSlideIndex.update((i) => i > 0 ? i - 1 : this.totalSlides - 1); }

  onTouchStart(e: TouchEvent): void { this.touchStartX = e.touches[0].clientX; this.touchStartY = e.touches[0].clientY; }
  onTouchEnd(e: TouchEvent): void {
    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) this.prevSlide(); else this.nextSlide();
    }
  }

  togglePurchase(open: boolean): void { this.isPurchaseOpen.set(open); }
  onSearchConfirm(): void {
    const num = parseInt(this.searchNumber(), 10);
    if (num >= 1 && num <= this.stats().total && this.isNumberAvailable(num)) {
      this.selectedNumbers.update((nums) => [...nums, { value: num, type: 'user' }]);
      this.searchNumber.set('');
    }
  }

  pickRandomNumber(): void {
    const total = this.stats().total;
    const random = Math.floor(Math.random() * total) + 1;
    if (this.isNumberAvailable(random) && !this.isNumberSelected(random)) {
      this.selectedNumbers.update((nums) => [...nums, { value: random, type: 'system' }]);
    }
  }

  clearNumbers(): void { this.selectedNumbers.set([]); }
  openOrder(): void { this.isOrderOpen.set(true); }
  closeOrder(): void { this.isOrderOpen.set(false); }


  async payWithStripe() {
    try {
      // 1. Obtener el ID de la rifa activa desde el estado del componente
      // Ajusta 'this.currentRaffle()' según como tengas guardado el objeto Raffle
      const activeRaffle = this.raffleData();
      const raffleId = activeRaffle?._id || activeRaffle?.id?.toString();

      if (!raffleId) {
        console.error('No se pudo determinar el ID de la rifa activa.');
        return;
      }

      // 2. Validaciones de formulario
      if (!this.orderName() || !this.orderPhone()) {
        console.error('Nombre y teléfono son obligatorios');
        return;
      }

      // 3. Extraer solo los números
      const numbersArray = this.selectedNumbers().map(item => item.value);

      // 4. Llamada al servicio pasando el ID dinámico
      const response = await this.raffleService.createStripeCheckoutSession(
        numbersArray,
        this.orderName(),
        this.orderPhone(),
        raffleId // ID dinámico y correcto
      );

      // 5. Redirección
      if (response?.checkoutUrl) {
        window.location.href = response.checkoutUrl; // Usar location.href para redirigir, o window.open si prefieres popup
      } else {
        throw new Error('URL de pago no recibida');
      }
    } catch (error) {
      console.error('Error profesional al procesar el pago:', error);
      // Aquí deberías lanzar un toast o alerta de UI al usuario
    }
  }
}