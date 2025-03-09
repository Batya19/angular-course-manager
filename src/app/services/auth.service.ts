import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, tap } from 'rxjs';

import { AuthResponse, RegisterRequest, LoginRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userIdKey = 'user_id';
  private userRoleKey = 'user_role';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string | null>(this.getUserRole());
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient) { }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(
        tap(response => this.setSession(response))
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: AuthResponse) => {
        this.setSession(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.userRoleKey);
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResult.token);
    localStorage.setItem(this.userIdKey, authResult.userId.toString());
    localStorage.setItem(this.userRoleKey, authResult.role);
    this.isAuthenticatedSubject.next(true);
    this.userRoleSubject.next(authResult.role);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserId(): number | null {
    const id = localStorage.getItem(this.userIdKey);
    return id ? parseInt(id, 10) : null;
  }

  getUserRole(): string | null {
    return localStorage.getItem(this.userRoleKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  isTeacher(): boolean {
    return this.getUserRole() === 'teacher';
  }
}