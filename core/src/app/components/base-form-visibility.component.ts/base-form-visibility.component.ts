import {ChangeDetectorRef, ElementRef} from '@angular/core';
import {IonContent} from '@ionic/angular';
import {UntypedFormGroup} from '@angular/forms';
import {BehaviorSubject, from} from 'rxjs';
import {take, tap} from 'rxjs/operators';

/**
 * Classe astratta che fornisce funzionalità per monitorare la visibilità di un form
 * all'interno di un contenitore scrollabile di Ionic.
 *
 * Questa classe utilizza RxJS per gestire gli osservabili e determina quando un form
 * è completamente visibile o quando l'utente ha raggiunto il fondo del contenuto.
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-my-form',
 *   template: `
 *     <ion-content #ionContent>
 *       <div #formContainer>
 *         <!-- Il tuo form qui -->
 *       </div>
 *     </ion-content>
 *   `
 * })
 * export class MyFormComponent extends BaseFormVisibilityComponent {
 *   @ViewChild('ionContent', { static: true }) ionContent: IonContent;
 *   @ViewChild('formContainer', { static: true }) formContainer: ElementRef;
 *
 *   ngOnInit() {
 *     const myFormGroup = new FormGroup({});
 *     this.setFormGroup(myFormGroup);
 *
 *     this.seeAllForm$.subscribe(isVisible => {
 *       if (isVisible) {
 *         console.log('Form completamente visibile');
 *       }
 *     });
 *   }
 * }
 * ```
 */
export abstract class BaseFormVisibilityComponent {
  /**
   * Riferimento al componente IonContent di Ionic.
   * Deve essere implementato nelle classi figlie.
   */
  abstract ionContent: IonContent;

  /**
   * Riferimento al contenitore del form.
   * Deve essere implementato nelle classi figlie.
   */
  abstract formContainer: ElementRef;

  /**
   * Il form group da monitorare per la visibilità.
   */
  formGroup: UntypedFormGroup;

  /**
   * Observable che emette `true` quando il form è completamente visibile
   * o quando l'utente ha raggiunto il fondo del contenuto scrollabile.
   *
   * @example
   * ```typescript
   * this.seeAllForm$.subscribe(isVisible => {
   *   this.showSubmitButton = isVisible;
   * });
   * ```
   */
  seeAllForm$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /**
   * Costruttore della classe.
   * @param _cdr - ChangeDetectorRef per forzare il change detection
   */
  constructor(protected _cdr: ChangeDetectorRef) {}

  /**
   * Controlla se il form è completamente visibile o se l'utente è al fondo del contenuto.
   *
   * L'algoritmo di visibilità:
   * 1. Form completamente visibile: `formRect.top >= contentRect.top && formRect.bottom <= contentRect.bottom`
   * 2. Al fondo del contenuto: `scrollTop + contentHeight >= scrollHeight - 1`
   * 3. Condizione finale: `shouldSeeAllForm = isFormFullyVisible || isAtBottom`
   *
   * Se il form diventa visibile, rimuove automaticamente il listener di scroll
   * per ottimizzare le performance.
   */
  private _checkFormVisibility = (): void => {
    if (!this.ionContent || !this.formContainer) {
      return;
    }

    from(this.ionContent.getScrollElement())
      .pipe(
        take(1),
        tap(scrollElement => {
          const contentHeight = scrollElement?.clientHeight;
          const scrollTop = scrollElement?.scrollTop;
          const scrollHeight = scrollElement?.scrollHeight;

          const formElement = (this.formContainer as any)?.el;
          const formRect = formElement?.getBoundingClientRect();
          const contentRect = scrollElement.getBoundingClientRect();

          const isFormFullyVisible =
            formRect?.top >= contentRect?.top && formRect?.bottom <= contentRect?.bottom;
          const isAtBottom = scrollTop + contentHeight >= scrollHeight - 1;
          const shouldSeeAllForm = isFormFullyVisible || isAtBottom;

          if (shouldSeeAllForm) {
            scrollElement.removeEventListener('scroll', this._checkFormVisibility);
          }
          this.seeAllForm$.next(shouldSeeAllForm);
          this._cdr.detectChanges();
        }),
      )
      .subscribe();
  };

  /**
   * Configura il listener per gli eventi di scroll.
   *
   * Aggiunge un event listener per l'evento 'scroll' che chiama
   * `_checkFormVisibility` ogni volta che l'utente scorre il contenuto.
   */
  private _setupScrollListener(): void {
    if (!this.ionContent) {
      return;
    }

    from(this.ionContent.getScrollElement())
      .pipe(
        take(1),
        tap(scrollElement => {
          scrollElement.addEventListener('scroll', this._checkFormVisibility);
        }),
      )
      .subscribe();
  }

  /**
   * Inizializza il monitoraggio della visibilità del form.
   *
   * Utilizza `requestAnimationFrame` per attendere che il form sia
   * completamente renderizzato nel DOM prima di iniziare il monitoraggio.
   * Questo assicura che tutti gli elementi siano disponibili per i calcoli.
   */
  private _initializeFormVisibility(): void {
    // Usato perchè il cambiamento della form non è immediato, attendo che la form sia
    // renderizzata nel DOM
    requestAnimationFrame(() => {
      this._checkFormVisibility();
      this._setupScrollListener();
    });
  }

  /**
   * Inizializza il monitoraggio della visibilità per un form group specifico.
   *
   * Questo metodo deve essere chiamato dopo aver creato il form group
   * per avviare il monitoraggio della visibilità.
   *
   * @param formGroup - Il form group da monitorare per la visibilità
   *
   * @example
   * ```typescript
   * ngOnInit() {
   *   const myFormGroup = new FormGroup({
   *     name: new FormControl(''),
   *     email: new FormControl('')
   *   });
   *   this.setFormGroup(myFormGroup);
   * }
   * ```
   */
  setFormGroup(formGroup: UntypedFormGroup): void {
    this.formGroup = formGroup;
    this._initializeFormVisibility();
  }
}
