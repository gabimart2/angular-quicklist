import { Component, input, output } from '@angular/core';
import { ChecklistItem, RemoveChecklistItem } from '../../shared/interfaces/checklist-item';

@Component({
  selector: 'app-checklist-item-list',
  imports: [],
  template: `
    <section>
      <ul>
        @for (item of checklistItems(); track item.id){
          <li class="checklist-item">
              <div (click)="toggle.emit(item.id)">
              @if (item.checked){
                <span>✅</span>
              }
              @else {
                <span>❌</span>
              }
                {{ item.title }}
              </div>
              <div>
                <button (click)="edit.emit(item)">Edit</button>
                <button (click)="delete.emit(item.id)">Delete</button>
              </div>
          </li>
        } @empty {
        <div>
          <h2>Add an item</h2>
          <p>Click the add button to add your first item to this quicklist</p>
        </div>
        }
      </ul>
    </section>
  `,
  styles: `

    .checklist-item {
      cursor: pointer;
      user-select: none;
    }
  `
})
export class ChecklistItemListComponent {
  checklistItems = input.required<ChecklistItem[]>();
  toggle = output<RemoveChecklistItem>();
  delete = output<RemoveChecklistItem>();
  edit = output<ChecklistItem>();

}
