import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecuperacionService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'https://localhost:44397/Usuarios'; 

  actualizarContrasenia(correo: string,contrasenia: string): Observable<string> {
    const url = `${this.apiUrl}/Actualizar_Contrasenia?correo=${correo}&contrasenia=${contrasenia}`;
    return this.http.patch(url, {},{ responseType: 'text' });
  }
}
