import { KeyValuePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-modal',
  imports: [ReactiveFormsModule, KeyValuePipe],
  template: `
    <header>
      <h2>{{ title() }}</h2>
      <button (click)="close.emit()">close</button>
    </header>

    <section>
      <form [formGroup]="formGroup()" (ngSubmit)="save.emit(); close.emit()">
        @for (control of formGroup().controls | keyvalue; track control.value) {
          <label [for]="control.key">{{ control.key }}</label>
          <input [formControlName]="control.key" [id]="control.key" type="text" />
        }
        <button type="submit">Save</button>
      </form>
    </section>
  `,
  styles: ``
})
export class FormModalComponent {
  formGroup = input.required<FormGroup>();
  title = input.required<string>();
  save = output<void>();
  close = output<void>();
}
