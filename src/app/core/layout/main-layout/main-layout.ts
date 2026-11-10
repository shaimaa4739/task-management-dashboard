import { Component } from '@angular/core';
import { ContentLayout } from '../content-layout/content-layout';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';

@Component({
  selector: 'app-main-layout',
  imports: [Header, Sidebar, ContentLayout],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {}
