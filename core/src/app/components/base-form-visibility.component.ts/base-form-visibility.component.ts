import {ChangeDetectorRef, ElementRef} from '@angular/core';
import {IonContent} from '@ionic/angular';
import {UntypedFormGroup} from '@angular/forms';
import {BehaviorSubject, from} from 'rxjs';
import {take, tap} from 'rxjs/operators';

export abstract class BaseFormVisibilityComponent {
  abstract ionContent: IonContent;
  abstract formContainer: ElementRef;

  formGroup: UntypedFormGroup;
  seeAllForm$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(protected _cdr: ChangeDetectorRef) {}

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

  private _initializeFormVisibility(): void {
    // Usato perchè il cambiamento della form non è immediato, attendo che la form sia
    // renderizzata nel DOM
    requestAnimationFrame(() => {
      this._checkFormVisibility();
      this._setupScrollListener();
    });
  }

  setFormGroup(formGroup: UntypedFormGroup): void {
    this.formGroup = formGroup;
    this._initializeFormVisibility();
  }
}
