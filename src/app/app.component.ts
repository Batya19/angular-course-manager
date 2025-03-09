import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule, NavbarComponent]
})
export class AppComponent {
  title = 'online-course-system';
  currentYear = new Date().getFullYear();
}