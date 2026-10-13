import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, ViewDidEnter, ViewWillLeave } from '@ionic/angular';

interface PokeAR {
  id: number;
  az: number;      // dirección horizontal fija en el mundo (grados)
  el: number;      // altura fija en el mundo (grados)
  x: number;       // posición en pantalla (%)
  y: number;
  visible: boolean;
}

@Component({
  selector: 'app-ar',
  templateUrl: './ar.page.html',
  standalone: true,
  imports: [IonContent],
})
export class ArPage implements ViewDidEnter, ViewWillLeave {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;

  pokes: PokeAR[] = [];
  error = '';
  sensor = false;

  private stream: MediaStream | null = null;
  private heading = 0;
  private pitch = 0;
  private dragOffset = 0;
  private lastX = 0;
  private arrastrando = false;
  private activa = false;
  private usaAbsoluto = false;

  private readonly FOV_H = 55;
  private readonly FOV_V = 75;

  private hRel = (e: Event) => this.onOrientation(e as DeviceOrientationEvent, false);
  private hAbs = (e: Event) => this.onOrientation(e as DeviceOrientationEvent, true);

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  async ionViewDidEnter() {
    this.activa = true;
    this.sortear();
    window.addEventListener('deviceorientation', this.hRel);
    window.addEventListener('deviceorientationabsolute', this.hAbs);
    await this.iniciarCamara();
  }

  ionViewWillLeave() {
    this.activa = false;
    window.removeEventListener('deviceorientation', this.hRel);
    window.removeEventListener('deviceorientationabsolute', this.hAbs);
    this.apagarCamara();
  }

  async iniciarCamara() {
    this.error = '';
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      const video = this.videoRef.nativeElement;
      video.srcObject = this.stream;
      await video.play();
    } catch (e) {
      this.error = 'No se pudo abrir la cámara. Revisa el permiso del navegador.';
    }
    this.refrescar();
  }

  apagarCamara() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  // Elige 5 Pokémon y los reparte en un arco amplio, a distintas alturas
  sortear() {
    const ids = new Set<number>();
    while (ids.size < 5) ids.add(1 + Math.floor(Math.random() * 151));
    const offsets = [-100, -50, 0, 50, 100];
    const alturas = [8, -10, 4, -8, 10];
    const base = this.heading + this.dragOffset;
    this.pokes = [...ids].map((id, i) => ({
      id,
      az: this.norm360(base + offsets[i] + (Math.random() * 10 - 5)),
      el: this.pitch + alturas[i] + (Math.random() * 6 - 3),
      x: 50,
      y: 50,
      visible: false,
    }));
    this.actualizar();
  }

  private onOrientation(e: DeviceOrientationEvent, absoluto: boolean) {
    if (e.alpha === null || e.alpha === undefined) return;

    // Si llegan eventos absolutos, ignoramos los normales
    if (absoluto) this.usaAbsoluto = true;
    if (!absoluto && this.usaAbsoluto) return;

    const rawHeading = this.norm360(360 - e.alpha);
    const rawPitch = Math.max(-90, Math.min(90, (e.beta ?? 90) - 90));

    if (!this.sensor) {
      this.sensor = true;
      this.heading = rawHeading;
      this.pitch = rawPitch;
      this.dragOffset = 0;
      this.sortear();
      return;
    }

    const diff = this.norm180(rawHeading - this.heading);
    this.heading = this.norm360(this.heading + diff * 0.3);
    this.pitch += (rawPitch - this.pitch) * 0.3;
    this.actualizar();
  }

  private actualizar() {
    const h = this.heading + this.dragOffset;
    for (const p of this.pokes) {
      const diff = this.norm180(p.az - h);
      p.x = 50 + (diff / this.FOV_H) * 100;
      p.y = 50 + ((this.pitch - p.el) / this.FOV_V) * 100;
      p.visible = Math.abs(p.x - 50) < 75 && Math.abs(p.y - 50) < 75;
    }
    this.refrescar();
  }

  private refrescar() {
    if (this.activa) this.cdr.detectChanges();
  }

  // Simulación con dedo/mouse (solo cuando no hay sensor)
  onDown(ev: PointerEvent) {
    this.arrastrando = true;
    this.lastX = ev.clientX;
  }
  onMove(ev: PointerEvent) {
    if (!this.arrastrando || this.sensor) return;
    this.dragOffset -= (ev.clientX - this.lastX) * 0.2;
    this.lastX = ev.clientX;
    this.actualizar();
  }
  onUp() {
    this.arrastrando = false;
  }

  abrir(id: number) {
    this.router.navigate(['/detalle', id]);
  }

  volver() {
    this.router.navigate(['/home']);
  }

  img(id: number) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }

  private norm360(a: number) {
    return ((a % 360) + 360) % 360;
  }
  private norm180(a: number) {
    const n = this.norm360(a);
    return n > 180 ? n - 360 : n;
  }
}