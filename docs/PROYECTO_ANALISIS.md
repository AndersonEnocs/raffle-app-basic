# Análisis Completo del Proyecto Raffle App

## 1. Visión General del Proyecto

### Tipo de Aplicación
- **Framework**: Ionic 8 con Angular 20 (standalone components)
- **Plataforma**: Aplicación web híbrida (PWA)
- **Propósito**: Sistema de rifas de vehículos premium con panel de administración

### Estructura de Archivos Principal

```
raffle-app/
├── src/
│   ├── app/
│   │   ├── home/
│   │   │   ├── home.page.ts       (Lógica principal - 558 líneas)
│   │   │   ├── home.page.html     (Template principal - 836 líneas)
│   │   │   └── home.page.scss     (Estilos - 1215 líneas)
│   │   ├── admin-auth.service.ts  (Autenticación admin)
│   │   ├── admin-raffles.service.ts (Gestión de rifas admin)
│   │   ├── public-raffle.service.ts (Rifas públicas)
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts         (Desarrollo: localhost:3000)
│   │   └── environment.prod.ts    (Producción)
│   ├── theme/
│   │   └── variables.scss         (Paleta de colores)
│   └── global.scss
├── angular.json
├── package.json
└── ionic.config.json
```

---

## 2. Servicios (Backend Communication)

### 2.1 AdminAuthService (`admin-auth.service.ts`)

**Propósito**: Autenticación de administrador

**Métodos**:
- `login(password: string)` - POST a `/admin/auth/login`
- `logout()` - Limpia el token
- `isAuthenticated` - Signal computado

**Señales (Signals)**:
- `token` - Almacena el JWT
- `isLoading` - Estado de carga
- `error` - Mensajes de error
- `isAuthenticated` - Computed (boolean)

**API Endpoint**: `http://localhost:3000/admin/auth/login`

---

### 2.2 AdminRafflesService (`admin-raffles.service.ts`)

**Propósito**: Crear rifas desde el panel de admin

**Métodos**:
- `createRaffle(payload: CreateRaffleRequest)` - POST a `/admin/raffles`

**Payload**:
```typescript
interface CreateRaffleRequest {
  title: string;
  description?: string;
  price: number;
  totalTickets: number;
  images: File[];
}
```

**API Endpoint**: `http://localhost:3000/admin/raffles`
**Headers**: Bearer token de autenticación

---

### 2.3 RaffleService (`public-raffle.service.ts`)

**Propósito**: Obtener información de rifas (público)

**Métodos**:
- `getLatestRaffle()` - Obtiene la rifa más reciente
- `getRaffleById(id: number)` - Obtiene rifa específica
- `getAllRaffles()` - Lista todas las rifas
- `getTicketsInfo(raffleId: string)` - Obtiene números disponibles

**Interfaces**:
```typescript
interface Raffle {
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
}

interface TicketsInfo {
  totalTickets: number;
  availableNumbers: number[];
}
```

---

## 3. Página Principal (HomePage)

### 3.1 Estados (Señales)

**Señales de Rifas**:
- `raffleData` - Datos de la rifa actual
- `soldTickets` - Tickets vendidos
- `galleryImages` - Imágenes del slider
- `currentSlideIndex` - Índice actual del slider

**Señales de Modales**:
- `isGalleryOpen` - Modal de galería
- `isPurchaseOpen` - Modal de compra
- `isAllNumbersOpen` - Modal de todos los números
- `isOrderOpen` - Modal de orden/pago
- `isAdminLoginOpen` - Login admin
- `isAdminDashboardOpen` - Dashboard admin
- `isPlayersModalOpen` - Lista de jugadores
- `isCreateRaffleOpen` - Crear rifa

**Señales de Datos**:
- `selectedNumbers` - Números seleccionados por usuario
- `availableNumbers` - Números disponibles
- `searchNumber` - Búsqueda de número
- `orderName`, `orderPhone` - Datos del cliente
- `adminPassword` - Contraseña admin

**Señales Admin**:
- `raffleTitle`, `raffleDescription` - Nueva rifa
- `raffleTicketPrice`, `raffleTotalTickets` - Precio y total tickets
- `raffleImages` - Imágenes de nueva rifa

---

### 3.2 Métodos Principales

**Carga de Datos**:
- `loadLatestRaffle()` - Carga rifa desde API
- `openAllNumbers()` - Carga números disponibles

**Gestión de Números**:
- `addNumberFromGrid(n)` - Añade número a selección
- `isNumberSelected(n)` - Verifica si está seleccionado
- `isNumberAvailable(n)` - Verifica disponibilidad
- `clearNumbers()` - Limpia selección
- `pickRandomNumber()` - Selección aleatoria

**Slider/Galería**:
- `nextSlide()`, `prevSlide()` - Navegación
- `goToSlide(index)` - Ir a slide específico
- `onTouchStart()`, `onTouchEnd()` - Soporte touch

**Admin**:
- `submitAdminLogin()` - Iniciar sesión
- `logoutAdmin()` - Cerrar sesión
- `submitCreateRaffle()` - Crear rifa

**Pagos**:
- `payWithStripe()` - Procesar pago (placeholder)

---

### 3.3 Plantilla (HTML)

**Secciones Principales**:
1. **Header** - Logo + botón Admin + Badge "Truck 441"
2. **Stats Section** - Tarjetas: Total/Vendidos/Disponibles
3. **Hero Section** - Slider de imágenes + descripción + botones
4. **Footer** - Crédito del desarrollador

**Modales** (7 en total):
1. Galería de premios (slider expandido)
2. Compra de curso (selección de números)
3. Todos los números (grid paginado)
4. Mi orden (formulario + Stripe)
5. Login Admin
6. Dashboard Admin
7. Lista de Jugadores

---

## 4. Sistema de Diseño

### 4.1 Paleta de Colores

```scss
// Colores principales
--color-vibrant-orange: #FF6B35    // Primary CTA
--color-golden-yellow: #F9C74F     // Jackpots/destacados
--color-deep-blue: #2B3A67          // Fondo principal
--color-bone-white: #F8F9FA        // Superficies

// Fondos gradientes
// Header: linear-gradient(90deg, rgba(5,7,18,0.96), rgba(43,58,103,0.98))
// Content: radial-gradient(circle at top left, #394a86 0, #111527 45%, #050712 100%)
```

### 4.2 Componentes Ionic Utilizados

- IonHeader, IonToolbar, IonTitle
- IonContent, IonButtons, IonButton
- IonGrid, IonRow, IonCol
- IonCard, IonCardHeader, IonCardTitle, IonCardContent
- IonText, IonChip, IonLabel
- IonInput, IonModal, IonItem, IonList, IonBadge

---

## 5. Rutas

```typescript
// app.routes.ts
const routes: Routes = [
  { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];
```

**Ruta única**: `/home` (carga lazy del componente HomePage)

---

## 6. Datos de Ejemplo (Hardcoded)

### Jugadores en el sistema:
```typescript
const players = [
  { id: 1, name: 'Iver Jimenez', phone: '14076078028', order: '128234', status: 'Completed' },
  { id: 2, name: 'Yannis', phone: '7867974221', order: '128202', status: 'Completed' },
  // ... más jugadores
];
```

### Datos por defecto:
- **Título**: "Rifa Premium Truck 441"
- **Descripción**: "Aprovecha tu rifa: curso exclusivo y participación en el sorteo de vehículos de alta gama..."
- **Precio**: $20 USD
- **Total Tickets**: 3000

---

## 7. Configuración de Entorno

### Development (`environment.ts`)
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000'
};
```

### Production (`environment.prod.ts`)
- No hay apiBaseUrl definido (usará fallback a localhost:3000)

---

## 8. Puntos de Extensión Identificados

### Funcionalidades Faltantes:
1. **Pago con Stripe** - `payWithStripe()` está vacío
2. **Selección aleatoria** - `pickRandomNumber()` no implementado
3. **Búsqueda de número** - `onSearchConfirm()` no implementado
4. **Persistencia** - No hay localStorage para el token admin
5. **Notificaciones push** - No implementado
6. **Historial de compras** - No hay vista

### Áreas Sensibles:
1. **API** - Depende de `localhost:3000` en desarrollo
2. **Imágenes** - Se suben como File[] pero no hay preview implementado
3. **Validación** - Mínima validación de formularios

---

## 9. Comandos Útiles

```bash
# Desarrollo
npm start          # ng serve
npm run build      # Producción
npm run watch      # Watch mode

# Testing
npm test           # Karma tests
npm run lint       # ESLint
```

---

## 10. Notas Importantes para Modificaciones

1. **Señales de Angular**: El proyecto usa Angular Signals para estado reactivo
2. **Componentes Standalone**: No hay NgModules, todo es standalone
3. **Lazy Loading**: Las páginas se cargan dinámicamente
4. **Estilos**: SCSS con variables CSS personalizadas
5. **Ionic**: Framework UI basado en componentes web

---

*Documento generado para referencia rápida del proyecto Raffle App*
