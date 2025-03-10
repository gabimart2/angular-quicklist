import { Injectable, computed, effect, inject,  signal } from '@angular/core';
import { AddChecklistItem, ChecklistItem, EditChecklistItem, RemoveChecklistItem } from '../../shared/interfaces/checklist-item';
import { RemoveChecklist } from '../../shared/interfaces/checklist';
import { Subject, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../../shared/data-access/storage.service';

export interface ChecklistItemState {
  checklistItems: ChecklistItem[];
  loaded: boolean;
  error: string | null;
}


@Injectable({
  providedIn: 'root'
})
export class ChecklistItemService {

  storageService = inject(StorageService)

  private state = signal<ChecklistItemState>({
    checklistItems: [],
    loaded: false,
    error: null
  })

  checklistItems = computed(() => this.state().checklistItems)
  loaded = computed(() => this.state().loaded)

  add$ = new Subject<AddChecklistItem>();
  toggle$ = new Subject<RemoveChecklistItem>();
  reset$ = new Subject<RemoveChecklist>();
  remove$ = new Subject<RemoveChecklistItem>();
  edit$ = new Subject<EditChecklistItem>();
  checklistRemoved$ = new Subject<RemoveChecklist>();


  private checklistItemsLoaded$ = this.storageService.loadChecklistItems();


  constructor() { 
    
    effect(() => {
      console.log("Checklist items: ", this.checklistItems())
      if (this.loaded()) {
        this.storageService.saveChecklistItems(this.checklistItems());
      }
    })  


    this.add$.pipe(
      takeUntilDestroyed(),
      tap((data) => console.log("New checklist item: ", data))
    ).subscribe((checklistItem) => {
      this.state.update(state => ({
        ...state,
        checklistItems: [
          ...state.checklistItems, 
          {
            ...checklistItem.item,
            id: uuidv4(),
            checklistId: checklistItem.checklistId,
            checked: false,
          }
        ]
      }))
    })

    this.toggle$.pipe(
      takeUntilDestroyed(),
      tap((data) => console.log("Toggle checklist item: ", data))
    ).subscribe((itemId) => {
      this.state.update(state => ({
        ...state,
        checklistItems: state.checklistItems.map(item => 
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
      }))
    })
    
    this.reset$.pipe(
      takeUntilDestroyed(),
      tap((data) => console.log("Reset checklist: ", data))
    ).subscribe((checklistId) => {
      this.state.update(state => ({
        ...state,
        checklistItems: state.checklistItems.map(item => 
          item.checklistId !== checklistId ? item : { ...item, checked: false }
        )
      }))
    })

    this.checklistItemsLoaded$.pipe(
      takeUntilDestroyed(),
      tap((checklistItems) => {
        console.log("Checklist items loaded: ", checklistItems)
      })
    ).subscribe({
      next: (checklistItems) => {
        this.state.update(state => ({ 
          ...state, 
          checklistItems, 
          loaded: true 
        }))
      },
      error: (error) => {
        this.state.update(state => ({ ...state, error }))
      }
    })

    this.remove$.pipe(
      takeUntilDestroyed(),
      tap((data) => console.log("Delete checklist item: ", data))
    ).subscribe((itemId) => {
      this.state.update(state => ({
        ...state,
        checklistItems: state.checklistItems.filter(item => item.id !== itemId)
      }))
    })

    this.edit$.pipe(
      takeUntilDestroyed(),
      tap((data) => console.log("Edit checklist item: ", data))
    ).subscribe((editedItem) => {
      this.state.update(state => ({
        ...state,
        checklistItems: state.checklistItems.map(item => 
          item.id === editedItem.id ? { ...item, ...editedItem.data } : item
        )
      }))
    })

    this.checklistRemoved$.pipe(
      takeUntilDestroyed(),
      tap((data) => console.log("Checklist removed: ", data))
    ).subscribe((checklistId) => {
      this.state.update(state => ({ 
        ...state, 
        checklistItems: state.checklistItems.filter(item => item.checklistId !== checklistId) 
      }))
    })
    
  }
}
