import { Component, input, output } from '@angular/core';
import { Checklist, RemoveChecklist } from '../../shared/interfaces/checklist';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-checklist-header',
  imports: [RouterLink],
  template: `
    <header>
      <a routerLink="/home">Back</a>
      <h1>
        {{ checklist().title }}
      </h1>
      <button (click)="addItem.emit()">Add item</button>
      <button (click)="reset.emit(checklist().id)">Reset</button>
    </header>
  `,
  styles: ``
})
export class ChecklistHeaderComponent {
  checklist = input.required<Checklist>()
  addItem = output<void>()
  reset = output<RemoveChecklist>()
}
