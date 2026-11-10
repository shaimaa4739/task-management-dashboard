import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatCard } from '../../models/dashboard.model';

@Component({
  selector: 'app-stats-summary',
  templateUrl: './stats-summary.html',
  styleUrl: './stats-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsSummary {
  readonly stats = input.required<StatCard[]>();
}