import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

/**
 * Dove finisce in verticale l'elemento visibile della plancia di registrazione — la plancia aperta
 * o la linguetta — perché l'avviso GPS possa comparire subito sotto. Plancia e avviso non sono
 * imparentati nel template della mappa: la plancia scrive, l'avviso legge.
 */
@Injectable({providedIn: 'root'})
export class RecorderPanelLayoutService {
  private readonly _panelBottom$ = new BehaviorSubject<number | null>(null);

  /** Bordo inferiore in px, coordinate del viewport; `null` senza registrazione attiva. */
  readonly panelBottom$: Observable<number | null> = this._panelBottom$.pipe(distinctUntilChanged());

  /**
   * Pubblica il bordo inferiore dell'elemento visibile della plancia.
   * @param bottom bordo in px nel viewport, `null` se la plancia non è visibile
   */
  setPanelBottom(bottom: number | null): void {
    this._panelBottom$.next(bottom);
  }
}
