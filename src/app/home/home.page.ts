import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, AlertController } from '@ionic/angular';
import { PokemonService } from '../services/pokemon';
import { PokemonLocal, RegistroService } from '../services/registro';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, RouterLink],
})
export class HomePage implements OnInit, ViewWillEnter {
  pokemonesApi: any[] = [];
  pokemones: any[] = [];
  locales: PokemonLocal[] = [];
  busqueda = '';

  constructor(
    private pokemonService: PokemonService,
    private registro: RegistroService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.pokemonService.getListado().subscribe((resp) => {
      this.pokemonesApi = resp.results.map((p: any, i: number) => ({
        id: i + 1,
        nombre: p.name,
      }));
      this.actualizar();
    });
  }

  ionViewWillEnter() {
    this.actualizar();
  }

  private coincide(id: number, nombre: string): boolean {
    const q = this.busqueda.trim().toLowerCase().replace('#', '');
    if (!q) return true;
    const num = ('000' + id).slice(-3);
    return nombre.toLowerCase().includes(q) || String(id).includes(q) || num.includes(q);
  }

  get pokemonesFiltrados() {
    return this.pokemones.filter((p) => this.coincide(p.id, p.nombre));
  }

  get localesFiltrados() {
    return this.locales.filter((l) => this.coincide(l.id, l.nombre));
  }

  buscar(texto: string) {
    this.busqueda = texto;
    this.cdr.markForCheck();
  }

  actualizar() {
    this.locales = this.registro.propios();
    const editados = this.registro.listar();
    this.pokemones = this.pokemonesApi.map((p) => {
      const ed = editados.find((e) => e.id === p.id);
      return {
        id: p.id,
        nombre: ed ? ed.nombre : p.nombre,
        editado: !!ed,
        imagen:
          ed && ed.imagen
            ? ed.imagen
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`,
      };
    });
    this.cdr.markForCheck();
  }

  nuevo() {
    this.router.navigate(['/formulario']);
  }

  irAr() {
    this.router.navigate(['/ar']);
  }

  editar(id: number) {
    this.router.navigate(['/formulario', id]);
  }

  async eliminar(p: PokemonLocal) {
    const alerta = await this.alertCtrl.create({
      header: 'Eliminar',
      message: `¿Eliminar a ${p.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.registro.eliminar(p.id);
            this.actualizar();
          },
        },
      ],
    });
    await alerta.present();
  }

  async restaurar(id: number) {
    const alerta = await this.alertCtrl.create({
      header: 'Restaurar',
      message: '¿Volver a los datos originales de este Pokémon?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Restaurar',
          handler: () => {
            this.registro.eliminar(id);
            this.actualizar();
          },
        },
      ],
    });
    await alerta.present();
  }
}