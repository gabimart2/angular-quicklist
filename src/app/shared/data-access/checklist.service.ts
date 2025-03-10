import { Injectable, computed, effect, signal, inject } from '@angular/core';
import { AddChecklist, Checklist, EditChecklist, RemoveChecklist } from '../interfaces/checklist';
import { Subject, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service';
import { ChecklistItemService } from '../../checklist/data-access/checklist-item.service';


export interface ChecklistState {
  checklists: Checklist[];
  loaded: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ChecklistService {

  storageService = inject(StorageService)
  checklistItemService = inject(ChecklistItemService)

  private state = signal<ChecklistState>({
    checklists: [],
    loaded: false,
    error: null
  })

  private checklistsLoaded$ = this.storageService.loadChecklists();


  checklists = computed(() => this.state().checklists)
  loaded = computed(() => this.state().loaded)

  add$ = new Subject<AddChecklist>()
  remove$ = this.checklistItemService.checklistRemoved$;
  edit$ = new Subject<EditChecklist>();
  

  constructor() { 

    effect(() => {
      console.log("Checklists in service: ", this.checklists())
      if (this.loaded()) {
        this.storageService.saveChecklists(this.checklists());
      }
    })

    this.add$.pipe(
      takeUntilDestroyed(),
      tap((data) => console.log("New Checklist: ", data))
    ).subscribe((checklist) => {
      this.state.update((state) => ({
        ...state,
        checklists: [...state.checklists, { ...checklist, id: uuidv4() }]
      }))
    })

    this.checklistsLoaded$.pipe(
      takeUntilDestroyed(),
      tap((checklists) => {
        console.log("Checklists loaded: ", checklists)
      })
    ).subscribe({
      next: (checklists) => {
        this.state.update((state) => ({ 
          ...state, 
          checklists, 
          loaded: true 
        }))
      },
      error: (error) => {
        this.state.update((state) => ({ ...state, error: error }))
      }
    })

    this.remove$.pipe(
      takeUntilDestroyed(),
      tap((data) => console.log("Remove checklist: ", data))
    ).subscribe((checklistId) => {
      this.state.update((state) => ({
        ...state,
        checklists: state.checklists.filter((checklist) => checklist.id !== checklistId)
      }))
    })

    this.edit$.pipe(
      takeUntilDestroyed(),
      tap((data) => console.log("Edit checklist: ", data))
    ).subscribe((editedChecklist) => {
      this.state.update((state) => ({ 
        ...state, 
        checklists: state.checklists.map(checklist => 
          checklist.id === editedChecklist.id ? { ...checklist, ...editedChecklist.data } : checklist) }))
    })
  }
}
