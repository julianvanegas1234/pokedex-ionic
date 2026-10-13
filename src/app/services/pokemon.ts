import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private url = 'https://pokeapi.co/api/v2/pokemon';

  constructor(private http: HttpClient) {}

  getListado() {
    return this.http.get<any>(`${this.url}?limit=151`);
  }

  getDetalle(id: number) {
    return this.http.get<any>(`${this.url}/${id}`);
  }
}