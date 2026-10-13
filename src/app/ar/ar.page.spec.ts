import { ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, ViewDidEnter, ViewWillLeave } from '@ionic/angular';

@Component({
  selector: 'app-ar',
  templateUrl: './ar.page.html',
  styleUrls: ['./ar.page.scss'],
  imports: [IonContent],
})
export class ArPage implements ViewDidEnter, ViewWillLeave, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  pokemones: any[] = [];
  error = '';
  private stream: MediaStream | null = null;

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ionViewDidEnter() {
    this.sortear();
    this.encenderCamara();
  }

  ionViewWillLeave() {
    this.apagarCamara();
  }

  ngOnDestroy() {
    this.apagarCamara();
  }

  async encenderCamara() {
    this.error = '';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.error = 'La cámara no está disponible. En el celular necesita HTTPS.';
      this.cdr.markForCheck();
      return;
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      this.video.nativeElement.srcObject = this.stream;
      await this.video.nativeElement.play();
    } catch (e) {
      this.error = 'No se pudo abrir la cámara. Revisa que diste el permiso.';
    }
    this.cdr.markForCheck();
  }

  apagarCamara() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }

  sortear() {
    const ids = new Set<number>();
    while (ids.size < 5) {
      ids.add(Math.floor(Math.random() * 151) + 1);
    }
    const posiciones = [
      { x: 8, y: 14 },
      { x: 58, y: 22 },
      { x: 30, y: 44 },
      { x: 6, y: 62 },
      { x: 55, y: 66 },
    ];
    this.pokemones = Array.from(ids).map((id, i) => ({
      id,
      x: posiciones[i].x,
      y: posiciones[i].y,
      imagen: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    }));
    this.cdr.markForCheck();
  }

  abrir(id: number) {
    this.router.navigate(['/detalle', id]);
  }

  volver() {
    this.router.navigate(['/home']);
  }
}