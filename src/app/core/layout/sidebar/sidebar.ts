import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}


@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
    protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', path: '/' },
    { label: 'Tasks', icon: '✅', path: '/tasks' },
    { label: 'Calendar', icon: '📅', path: '/calendar' },
    { label: 'Analytics', icon: '📈', path: '/analytics' },
    { label: 'Team', icon: '👥', path: '/team' },
    { label: 'Settings', icon: '⚙️', path: '/settings' },
  ];
}
