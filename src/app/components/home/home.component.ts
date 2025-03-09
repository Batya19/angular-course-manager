import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  features = [
    {
      icon: 'school',
      title: 'Wide Range of Courses',
      description: 'Access a diverse selection of courses taught by experienced instructors.'
    },
    {
      icon: 'laptop',
      title: 'Learn Anywhere',
      description: 'Study at your own pace, from anywhere, anytime.'
    },
    {
      icon: 'people',
      title: 'Join a Community',
      description: 'Connect with other students and instructors in our learning community.'
    }
  ];
}