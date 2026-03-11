import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonText,
} from '@ionic/angular/standalone';
import { checkmarkCircle } from 'ionicons/icons';

@Component({
  selector: 'app-success',
  standalone: true,
  templateUrl: './success.page.html',
  styleUrls: ['success.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonText,
  ],
})
export class SuccessPage implements OnInit {
  paymentStatus: string = 'success';
  ticketId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    // Obtener parámetros de la URL de Stripe
    this.route.queryParams.subscribe((params) => {
      this.paymentStatus = params['redirect_status'] || 'success';
      this.ticketId = params['ticketId'] || null;
    });
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
