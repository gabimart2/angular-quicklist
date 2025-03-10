import { Component, input, output } from '@angular/core';
import { Checklist, RemoveChecklist, EditChecklist } from '../../shared/interfaces/checklist';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-checklist-list',
  imports: [RouterLink],
  template: `
    <ul>
      @for (checklist of checklists(); track checklist.id) {
        <li>
          <a [routerLink]="['/checklist', checklist.id]">
            {{ checklist.title }}
          </a>
          <button (click)="edit.emit(checklist)">Edit</button>
          <button (click)="delete.emit(checklist.id)">Delete</button> 
        </li>
      }
      @empty {
        <p>Click the add button to create your first checklist!</p>
      }
    </ul>
  `,
  styles: ``
})
export class CheckListComponent {
  checklists = input.required<Checklist[]>()
  delete = output<RemoveChecklist>()
  edit = output<Checklist>()
}
