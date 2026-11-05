import {CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {isLogged} from '@wm-core/store/auth/auth.selectors';
import {AlertController} from '@ionic/angular';
import {of} from 'rxjs';
import {AuthService} from '@wm-core/store/auth/auth.service';
import {LangService} from '@wm-core/localization/lang.service';
import {WmProfileDeleteButtonComponent} from '@wm-core/shared/profile-delete-button/profile-delete-button.component';
import {LogoutService} from 'src/app/services/logout.service';
import {ProfileAccountTabComponent} from './profile-account-tab.component';

/** Traduzione finta: restituisce la chiave. */
@Pipe({name: 'wmtrans', standalone: true})
class FakeTransPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('ProfileAccountTabComponent (oc:8169)', () => {
  let fixture: ComponentFixture<ProfileAccountTabComponent>;
  let store: MockStore;
  let logout: jasmine.SpyObj<LogoutService>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    logout = jasmine.createSpyObj('LogoutService', ['confirmLogout']);
    logout.confirmLogout.and.resolveTo(true);
    auth = jasmine.createSpyObj('AuthService', ['showPrivacyAgreeAlert']);
    auth.showPrivacyAgreeAlert.and.returnValue(of(null));
    await TestBed.configureTestingModule({
      imports: [CommonModule, FakeTransPipe],
      declarations: [ProfileAccountTabComponent, WmProfileDeleteButtonComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        provideMockStore({selectors: [{selector: isLogged, value: true}]}),
        {provide: LogoutService, useValue: logout},
        {provide: AuthService, useValue: auth},
        {provide: AlertController, useValue: jasmine.createSpyObj('AlertController', ['create'])},
        {provide: LangService, useValue: {instant: (k: string) => k}},
      ],
    }).compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ProfileAccountTabComponent);
  });

  afterEach(() => {
    store.resetSelectors();
    TestBed.resetTestingModule();
  });

  /** @returns i titoli delle sezioni nell'ordine */
  function sections(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.webmapp-profile-account-section-title')).map(
      (el: any) => el.textContent.trim(),
    );
  }

  it('da loggato: download, privacy e sessione, in quest\'ordine', () => {
    fixture.detectChanges();

    expect(sections()).toEqual(['Download', 'Privacy', 'Sessione']);
    expect(fixture.nativeElement.querySelector('wm-profile-data')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.webmapp-profile-account-privacy')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.webmapp-profile-account-logout')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.webmapp-profile-account-delete')).not.toBeNull();
  });

  it('le azioni sono voci di elenco con la freccia, non bottoni', () => {
    fixture.detectChanges();

    const rows = ['privacy', 'logout', 'delete'].map(k =>
      fixture.nativeElement.querySelector(`.webmapp-profile-account-${k}`),
    );
    rows.forEach(row => {
      expect(row.tagName).toBe('ION-ITEM');
      expect(row.hasAttribute('detail')).toBeTrue();
    });
    expect(fixture.nativeElement.querySelector('wm-privacy-agree-button')).toBeNull();
    expect((fixture.nativeElement.querySelector('wm-profile-delete-button') as HTMLElement).hidden).toBeTrue();
  });

  it('da non loggato: solo i download', () => {
    store.overrideSelector(isLogged, false);
    store.refreshState();
    fixture.detectChanges();

    expect(sections()).toEqual(['Download']);
    expect(fixture.nativeElement.querySelector('.webmapp-profile-account-logout')).toBeNull();
    expect(fixture.nativeElement.querySelector('.webmapp-profile-account-delete')).toBeNull();
    expect(fixture.nativeElement.querySelector('.webmapp-profile-account-privacy')).toBeNull();
  });

  it('«Esci» chiede conferma con il servizio di uscita', () => {
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.webmapp-profile-account-logout') as HTMLElement).click();

    expect(logout.confirmLogout).toHaveBeenCalled();
  });

  it('«Modifica consenso dati» apre l\'alert del consenso di wm-core', () => {
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.webmapp-profile-account-privacy') as HTMLElement).click();

    expect(auth.showPrivacyAgreeAlert).toHaveBeenCalled();
  });

  it('«Elimina account» apre l\'alert di eliminazione di wm-core', () => {
    const alert = spyOn(WmProfileDeleteButtonComponent.prototype, 'deleteUserAlert');
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.webmapp-profile-account-delete') as HTMLElement).click();

    expect(alert).toHaveBeenCalled();
  });
});
