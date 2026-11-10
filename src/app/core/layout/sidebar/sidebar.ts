import { Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TaskForm, TaskFormDialogData } from '../../../features/tasks/components/task-form/task-form';
import { MatDialog } from '@angular/material/dialog';

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
  private readonly dialog = inject(MatDialog);
  
    protected onNewTask(): void {
    this.openTaskForm({ mode: 'create' });
  }

  private openTaskForm(data: TaskFormDialogData): void {
    this.dialog.open(TaskForm, { data, disableClose: true });
  }
}
