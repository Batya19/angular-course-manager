import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, CommonModule, RouterLink, AsyncPipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  userRole$: Observable<string | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.userRole$ = this.authService.userRole$;
  }

  ngOnInit(): void { }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}