import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/layout/header/header';
import { Sidebar } from './core/layout/sidebar/sidebar';
import { ContentLayout } from './core/layout/content-layout/content-layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, ContentLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('task-management-dashboard');
}
