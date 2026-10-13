import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/angular';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, RouterLink],
})
export class DetallePage implements OnInit {
  @Input() id!: string;
  pokemon: any = null;

  private api = 'https://pokeapi.co/api/v2';
  private nombresStats: any = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'Ataque Esp.',
    'special-defense': 'Defensa Esp.',
    speed: 'Velocidad',
  };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.http.get<any>(`${this.api}/pokemon/${this.id}`).subscribe((resp) => {
      const stats = resp.stats.map((s: any) => ({
        nombre: this.nombresStats[s.stat.name] || s.stat.name,
        valor: s.base_stat,
        porcentaje: Math.min((s.base_stat / 150) * 100, 100),
      }));

      this.pokemon = {
        id: resp.id,
        nombre: resp.name,
        imagen: resp.sprites.other['official-artwork'].front_default,
        spriteNormal: resp.sprites.front_default,
        spriteShiny: resp.sprites.front_shiny,
        altura: resp.height / 10,
        peso: resp.weight / 10,
        tipos: resp.types.map((t: any) => t.type.name),
        habilidades: resp.abilities.map((a: any) => a.ability.name.replace('-', ' ')),
        experiencia: resp.base_experience,
        stats,
        totalStats: stats.reduce((suma: number, s: any) => suma + s.valor, 0),
        totalMovimientos: resp.moves.length,
        movimientos: resp.moves.slice(0, 10).map((m: any) => m.move.name.replace('-', ' ')),
        descripcion: '',
        categoria: '',
        habitat: '',
        generacion: '',
        genero: '',
        captura: 0,
        felicidad: 0,
        gruposHuevo: [],
        color: '',
        debilidades: [],
        evoluciones: [],
      };
      this.cdr.markForCheck();

      this.cargarEspecie(resp.species.url);
      this.cargarDebilidades(resp.types);
    });
  }

  private cargarEspecie(url: string) {
    this.http.get<any>(url).subscribe((esp) => {
      const desc = esp.flavor_text_entries.find((f: any) => f.language.name === 'es');
      const gen = esp.genera.find((g: any) => g.language.name === 'es');
      this.pokemon.descripcion = desc
        ? desc.flavor_text.replace(/[\n\f]/g, ' ')
        : 'Sin descripción en español.';
      this.pokemon.categoria = gen ? gen.genus : '';
      this.pokemon.habitat = esp.habitat ? esp.habitat.name : 'Desconocido';
      this.pokemon.generacion = esp.generation.name.replace('generation-', '').toUpperCase();
      this.pokemon.genero =
        esp.gender_rate === -1
          ? 'Sin género'
          : `♂ ${100 - (esp.gender_rate / 8) * 100}%  ♀ ${(esp.gender_rate / 8) * 100}%`;
      this.pokemon.captura = esp.capture_rate;
      this.pokemon.felicidad = esp.base_happiness;
      this.pokemon.gruposHuevo = esp.egg_groups.map((g: any) => g.name);
      this.pokemon.color = esp.color.name;
      this.cdr.markForCheck();

      this.http.get<any>(esp.evolution_chain.url).subscribe((ev) => {
        const lista: any[] = [];
        this.recorrer(ev.chain, lista);
        this.pokemon.evoluciones = lista.filter((e) => e.id <= 151);
        this.cdr.markForCheck();
      });
    });
  }

  private recorrer(nodo: any, lista: any[]) {
    const id = Number(nodo.species.url.split('/').filter(Boolean).pop());
    lista.push({ id, nombre: nodo.species.name });
    nodo.evolves_to.forEach((n: any) => this.recorrer(n, lista));
  }

  private cargarDebilidades(tipos: any[]) {
    forkJoin(tipos.map((t: any) => this.http.get<any>(t.type.url))).subscribe((resps) => {
      const mult: any = {};
      resps.forEach((r) => {
        const d = r.damage_relations;
        d.double_damage_from.forEach((x: any) => (mult[x.name] = (mult[x.name] ?? 1) * 2));
        d.half_damage_from.forEach((x: any) => (mult[x.name] = (mult[x.name] ?? 1) * 0.5));
        d.no_damage_from.forEach((x: any) => (mult[x.name] = (mult[x.name] ?? 1) * 0));
      });
      this.pokemon.debilidades = Object.keys(mult)
        .filter((k) => mult[k] > 1)
        .map((k) => ({ tipo: k, veces: mult[k] }));
      this.cdr.markForCheck();
    });
  }
}