import { Component, effect, inject, signal } from '@angular/core';
import { ModalComponent } from '../shared/ui/modal.component';
import { Checklist } from '../shared/interfaces/checklist';
import { FormModalComponent } from "../shared/ui/form-modal.component";
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { ChecklistService } from '../shared/data-access/checklist.service';
import { CheckListComponent } from './ui/checklist-list.component';


@Component({
  selector: 'app-home',
  imports: [ModalComponent, FormModalComponent, CheckListComponent],
  template: `
     <header>
      <h1>Quicklists</h1>
      <button (click)="checklistBeingEdited.set({})">Add Checklist</button>
    </header>
    <section>
      <h2>Your checklists</h2>
      <app-checklist-list 
        [checklists]="checklistService.checklists()" 
        (delete)="checklistService.remove$.next($event)"
        (edit)="checklistBeingEdited.set($event)"
      />
    </section>
    <app-modal [isOpen]="!!checklistBeingEdited()">
      <ng-template> 
        <app-form-modal 
          [formGroup]="checklistForm "
          [title]="checklistBeingEdited()?.title ?? 'Add Checklist'"
          (save)="
            checklistBeingEdited()?.id ? 
              checklistService.edit$.next({
                id: checklistBeingEdited()!.id!,
                data: checklistForm.getRawValue()
              })
            : checklistService.add$.next(checklistForm.getRawValue()) 
          "
          (close)="checklistBeingEdited.set(null)"
        />  
      </ng-template>    
    </app-modal>
  `,
  styles: [
    `
      ul {
        padding: 0;
        margin: 0;
      }
      li {
        font-size: 1.5em;
        display: flex;
        justify-content: space-between;
        background: var(--color-light);
        list-style-type: none;
        margin-bottom: 1rem;
        padding: 1rem;

        button {
          margin-left: 1rem;
        }
      }
    `,
  ]
})
export default class HomeComponent {

  fb = inject(FormBuilder)
  checklistService = inject(ChecklistService)

  checklistBeingEdited = signal<Partial<Checklist> | null>(null)

  checklistForm  = this.fb.nonNullable.group({
    title: ['', Validators.required] 
  })

  constructor(){
    effect(() => {
      const checklist = this.checklistBeingEdited()

      if(!checklist){
        this.checklistForm.reset()
      }
      else{
        this.checklistForm.patchValue(
          {
            ...this.checklistForm,
            ...checklist
          }
        )
      }
    })
  }
  
}
