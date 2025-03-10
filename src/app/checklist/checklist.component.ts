import { Component, computed, effect, inject, signal } from '@angular/core';
import { ChecklistService } from '../shared/data-access/checklist.service';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChecklistHeaderComponent } from './ui/checklist-header.component'; 
import { ChecklistItemService } from './data-access/checklist-item.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ChecklistItem } from '../shared/interfaces/checklist-item';
import { ModalComponent } from '../shared/ui/modal.component';
import { FormModalComponent } from '../shared/ui/form-modal.component';
import { ChecklistItemListComponent } from './ui/checklist-item-list.component';

@Component({
  selector: 'app-checklist',
  imports: [ChecklistHeaderComponent, ModalComponent, FormModalComponent, ChecklistItemListComponent],
  template: `
    @if (checklist(); as checklist) {
      <app-checklist-header 
        [checklist]="checklist" 
        (addItem)="checklistItemBeingEdited.set({})" 
        (reset)="checklistItemService.reset$.next($event)"
      />
      <app-checklist-item-list 
        [checklistItems]="checklistItems()"
        (toggle)="checklistItemService.toggle$.next($event)" 
        (delete)="checklistItemService.remove$.next($event)"
        (edit)="checklistItemBeingEdited.set($event)"
      />
    }
    <app-modal [isOpen]="!!checklistItemBeingEdited()">
        <ng-template>
          <app-form-modal
            title="Create item"
            [formGroup]="checklistItemForm"
            (save)="
              checklistItemBeingEdited()?.id ? 
                checklistItemService.edit$.next({
                  id: checklistItemBeingEdited()!.id!,
                  data: checklistItemForm.getRawValue()
                })
              : checklistItemService.add$.next({
                  item: checklistItemForm.getRawValue(),
                  checklistId: checklist()?.id!,
                })
            "
            (close)="checklistItemBeingEdited.set(null)"
          />
        </ng-template>
      </app-modal>
  `,
  styles: ``
})
export default class ChecklistComponent {
  checklistService = inject(ChecklistService)
  checklistItemService = inject(ChecklistItemService)
  route = inject(ActivatedRoute)
  formBuilder = inject(FormBuilder)

  checklistItemBeingEdited = signal<Partial<ChecklistItem> | null>(null)

  params = toSignal(this.route.paramMap)

  checklist = computed(() => 
    this.checklistService.checklists().find(c => c.id === this.params()?.get('id')))

  checklistItems = computed(() => 
    this.checklistItemService.checklistItems().filter(item => item.checklistId === this.checklist()?.id))

  checklistItemForm = this.formBuilder.nonNullable.group({
    title: ['', Validators.required],
  })

  constructor() {
    effect(() => {
      const checklistItem = this.checklistItemBeingEdited();

      if(!checklistItem) {
        this.checklistItemForm.reset();
      }
      else{
        this.checklistItemForm.patchValue(
          {
            ...this.checklistItemForm,
            ...checklistItem
          }
        )
      }
    })
  }
}
