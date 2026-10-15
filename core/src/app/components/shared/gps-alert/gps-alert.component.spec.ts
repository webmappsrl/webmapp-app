import {Pipe, PipeTransform} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';
import {DeviceService} from '@wm-core/services/device.service';
import {GpsAlertKind, GpsAlertService} from 'src/app/services/gps-alert.service';
import {GpsAlertComponent} from './gps-alert.component';

/** Sostituto di `wmtrans`: il pipe vero richiede le traduzioni in DI. */
@Pipe({name: 'wmtrans', standalone: true})
class FakeTransPipe implements PipeTransform {
  /**
   * Restituisce la chiave così com'è.
   * @param v chiave di traduzione
   * @returns la chiave
   */
  transform(v: string): string {
    return v;
  }
}

/** Trasformazione dell'avviso di segnale debole nel badge (oc:8766). */
describe('GpsAlertComponent', () => {
  let fixture: ComponentFixture<GpsAlertComponent>;
  let cmp: GpsAlertComponent;
  let alert$: BehaviorSubject<GpsAlertKind | null>;
  let svc: jasmine.SpyObj<GpsAlertService>;
  let anchor: HTMLElement;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    alert$ = new BehaviorSubject<GpsAlertKind | null>(null);
    svc = jasmine.createSpyObj<GpsAlertService>('GpsAlertService', ['collapse', 'dismiss', 'openSettings'], {
      alert$: alert$.asObservable(),
    });
    anchor = document.createElement('div');
    Object.assign(anchor.style, {position: 'fixed', right: '20px', bottom: '120px', width: '22px', height: '22px'});
    document.body.appendChild(anchor);
    await TestBed.configureTestingModule({
      imports: [GpsAlertComponent],
      providers: [
        {provide: GpsAlertService, useValue: svc},
        {provide: DeviceService, useValue: {isAppMobile: false}},
      ],
    })
      .overrideComponent(GpsAlertComponent, {set: {imports: [CommonModule, FakeTransPipe]}})
      .compileComponents();
    fixture = TestBed.createComponent(GpsAlertComponent);
    document.body.appendChild(fixture.nativeElement);
    cmp = fixture.componentInstance;
    cmp.anchor = anchor;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    anchor.remove();
    TestBed.resetTestingModule();
  });

  /**
   * Mostra l'avviso di segnale debole e porta a termine l'animazione d'ingresso: in Chrome
   * headless senza focus le animazioni non avanzano da sole.
   */
  function showPoor(): HTMLElement {
    alert$.next('poor');
    const card = fixture.nativeElement.querySelector('.webmapp-gps-alert') as HTMLElement;
    card.getAnimations().forEach(a => a.finish());
    return card;
  }

  it('la scheda non salta di lato quando comincia la trasformazione', () => {
    const card = showPoor();
    const before = card.getBoundingClientRect().left;
    (cmp as any)._toBadge();
    expect(Math.abs(card.getBoundingClientRect().left - before)).toBeLessThan(2);
  });

  it('con il bottone della posizione nascosto la scheda sfuma invece di volare', async () => {
    anchor.style.display = 'none';
    const card = showPoor();
    const done = (cmp as any)._toBadge();
    expect(card.style.left).toBe('');
    card.getAnimations().forEach(a => a.finish());
    await done;
    expect(svc.collapse).toHaveBeenCalled();
  });

  it('una dissolvenza annullata non trasforma in badge un avviso arrivato dopo', async () => {
    anchor.style.display = 'none';
    showPoor();
    const done = (cmp as any)._toBadge();
    // l'episodio cambia durante la dissolvenza
    alert$.next(null);
    await done;
    expect(svc.collapse).not.toHaveBeenCalled();
  });

  it("l'avviso di ricerca si può chiudere", () => {
    alert$.next('searching');
    const close = fixture.nativeElement.querySelector('.webmapp-gps-alert-actions button') as HTMLButtonElement;
    expect(close).not.toBeNull();
    close.click();
    expect(svc.dismiss).toHaveBeenCalled();
  });
});
