import { Injectable } from '@angular/core';

export interface PokemonLocal {
  id: number;
  nombre: string;
  altura: number;
  peso: number;
  tipos: string;
  imagen: string;
}

@Injectable({ providedIn: 'root' })
export class RegistroService {
  private clave = 'pokemones_locales';

  listar(): PokemonLocal[] {
    return JSON.parse(localStorage.getItem(this.clave) || '[]');
  }

  propios(): PokemonLocal[] {
    return this.listar().filter((p) => p.id >= 1000);
  }

  obtener(id: number): PokemonLocal | undefined {
    return this.listar().find((p) => p.id === id);
  }

  guardar(p: PokemonLocal) {
    const lista = this.listar();
    const i = lista.findIndex((x) => x.id === p.id);
    if (i >= 0) {
      lista[i] = p;
    } else {
      lista.push(p);
    }
    localStorage.setItem(this.clave, JSON.stringify(lista));
  }

  eliminar(id: number) {
    const lista = this.listar().filter((p) => p.id !== id);
    localStorage.setItem(this.clave, JSON.stringify(lista));
  }

  nuevoId(): number {
    const ids = this.listar().map((p) => p.id);
    return Math.max(999, ...ids) + 1;
  }
}