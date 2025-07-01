import {ChangeDetectorRef, ElementRef} from '@angular/core';
import {IonContent} from '@ionic/angular';
import {UntypedFormGroup} from '@angular/forms';
import {BehaviorSubject, from} from 'rxjs';
import {take, tap} from 'rxjs/operators';

/**
 * Abstract class that provides functionality to monitor form visibility
 * within a scrollable Ionic container.
 *
 * This class uses RxJS to handle observables and determines when a form
 * is completely visible or when the user has reached the bottom of the content.
 *
 * @example
 * ```typescript
 * @Component({
 *   selector: 'app-my-form',
 *   template: `
 *     <ion-content #ionContent>
 *       <div #formContainer>
 *         <!-- Your form here -->
 *       </div>
 *     </ion-content>
 *   `
 * })
 * export class MyFormComponent extends BaseSaveComponent {
 *   @ViewChild('ionContent', { static: true }) ionContent: IonContent;
 *   @ViewChild('formContainer', { static: true }) formContainer: ElementRef;
 *
 *   ngOnInit() {
 *     const myFormGroup = new FormGroup({});
 *     this.setFormGroup(myFormGroup);
 *
 *     this.seeAllForm$.subscribe(isVisible => {
 *       if (isVisible) {
 *         console.log('Form completely visible');
 *       }
 *     });
 *   }
 * }
 * ```
 */
export abstract class BaseSaveComponent {
  /**
   * Reference to the Ionic IonContent component.
   * Must be implemented in child classes.
   */
  abstract ionContent: IonContent;

  /**
   * Reference to the form container.
   * Must be implemented in child classes.
   */
  abstract formContainer: ElementRef;

  /**
   * The form group to monitor for visibility.
   */
  formGroup: UntypedFormGroup;

  /**
   * Observable that emits `true` when the form is completely visible
   * or when the user has reached the bottom of the scrollable content.
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
   * Class constructor.
   * @param _cdr - ChangeDetectorRef to force change detection
   */
  constructor(protected _cdr: ChangeDetectorRef) {}

  /**
   * Checks if the form is completely visible or if the user is at the bottom of the content.
   *
   * Visibility algorithm:
   * 1. Form completely visible: `formRect.top >= contentRect.top && formRect.bottom <= contentRect.bottom`
   * 2. At bottom of content: `scrollTop + contentHeight >= scrollHeight - 1`
   * 3. Final condition: `shouldSeeAllForm = isFormFullyVisible || isAtBottom`
   *
   * If the form becomes visible, it automatically removes the scroll listener
   * to optimize performance.
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
   * Sets up the scroll event listener.
   *
   * Adds an event listener for the 'scroll' event that calls
   * `_checkFormVisibility` every time the user scrolls the content.
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
   * Initializes form visibility monitoring.
   *
   * Uses `requestAnimationFrame` to wait for the form to be
   * completely rendered in the DOM before starting monitoring.
   * This ensures that all elements are available for calculations.
   */
  private _initializeFormVisibility(): void {
    // Used because the form change is not immediate, I wait for the form to be
    // rendered in the DOM
    requestAnimationFrame(() => {
      this._checkFormVisibility();
      this._setupScrollListener();
    });
  }

  /**
   * Initializes visibility monitoring for a specific form group.
   *
   * This method must be called after creating the form group
   * to start visibility monitoring.
   *
   * @param formGroup - The form group to monitor for visibility
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
