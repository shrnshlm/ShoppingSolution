import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
 selector: 'app-root',
 imports: [
   RouterOutlet, 
   RouterLink, 
   RouterLinkActive  // Add these imports
 ],
 templateUrl: './app.html',
 styleUrl: './app.scss'
})
export class App {
 protected title = 'frontend-angular';
}