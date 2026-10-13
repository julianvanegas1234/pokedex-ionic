import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonItem, IonLabel, IonButton } from '@ionic/angular';
import { PokemonService } from '../services/pokemon';
import { PokemonLocal, RegistroService } from '../services/registro';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.page.html',
  styleUrls: ['./formulario.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonItem, IonLabel, IonButton],
})
export class FormularioPage implements OnInit {
  @Input() id?: string;
  editando = false;
  error = '';
  p: PokemonLocal = { id: 0, nombre: '', altura: 0, peso: 0, tipos: '', imagen: '' };

  constructor(
    private registro: RegistroService,
    private pokemonService: PokemonService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.id) {
      this.p.id = this.registro.nuevoId();
      return;
    }

    const num = Number(this.id);
    this.editando = true;

    const guardado = this.registro.obtener(num);
    if (guardado) {
      this.p = { ...guardado };
      return;
    }

    if (num <= 151) {
      this.pokemonService.getDetalle(num).subscribe((resp) => {
        this.p = {
          id: resp.id,
          nombre: resp.name,
          altura: resp.height / 10,
          peso: resp.weight / 10,
          tipos: resp.types.map((t: any) => t.type.name).join(', '),
          imagen: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${resp.id}.png`,
        };
        this.cdr.markForCheck();
      });
    } else {
      this.error = 'No se encontró ese Pokémon';
    }
  }

  guardar() {
    if (!this.p.nombre.trim()) {
      this.error = 'El nombre es obligatorio';
      return;
    }
    if (!this.p.imagen.trim()) {
      this.p.imagen = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    }
    this.registro.guardar(this.p);
    this.router.navigate(['/home']);
  }
}