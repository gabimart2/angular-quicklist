import { Injectable, computed, effect, signal, inject } from '@angular/core';
import { AddChecklist, Checklist } from '../interfaces/checklist';
import { Subject, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './storage.service';


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

  private state = signal<ChecklistState>({
    checklists: [],
    loaded: false,
    error: null
  })

  private checklistsLoaded$ = this.storageService.loadChecklists();


  checklists = computed(() => this.state().checklists)
  loaded = computed(() => this.state().loaded)

  add$ = new Subject<AddChecklist>()
  
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
  }
}
