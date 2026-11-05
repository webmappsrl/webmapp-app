import {CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonModule} from '@angular/common';
import {BehaviorSubject} from 'rxjs';
import {DiaryService} from '@wm-core/diaries/diary.service';
import {Diary, DiariesStatus} from '@wm-core/diaries/diary.model';
import {ProfileDiaryTabComponent} from './profile-diary-tab.component';

/** Traduzione finta: restituisce la chiave. */
@Pipe({name: 'wmtrans', standalone: true})
class FakeTransPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

/**
 * Diario di prova.
 * @param id id del diario
 * @param layerId id del cammino
 * @param name nome del cammino
 * @param updatedAt data dell'ultima modifica
 * @returns il diario
 */
function diary(id: number, layerId: number, name: string, updatedAt: string): Diary {
  return {
    id,
    uuid: `u${id}`,
    layer: {id: layerId, name},
    ecTrack: null,
    description: 'testo',
    createdAt: updatedAt,
    updatedAt,
    photos: [],
    ugcTrackIds: [],
    publicationConsent: false,
  };
}

describe('ProfileDiaryTabComponent', () => {
  let fixture: ComponentFixture<ProfileDiaryTabComponent>;
  let list$: BehaviorSubject<Diary[]>;
  let status$: BehaviorSubject<DiariesStatus>;

  beforeEach(async () => {
    list$ = new BehaviorSubject<Diary[]>([]);
    status$ = new BehaviorSubject<DiariesStatus>('active');
    await TestBed.configureTestingModule({
      imports: [CommonModule, FakeTransPipe],
      declarations: [ProfileDiaryTabComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: DiaryService,
          useValue: {diaries$: () => list$.asObservable(), status$: () => status$.asObservable()},
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileDiaryTabComponent);
  });

  /** @returns le sezioni dei diari rese */
  function sections(): any[] {
    return Array.from(fixture.nativeElement.querySelectorAll('wm-diaries-section'));
  }

  it('raggruppa i diari per cammino, il più recente per primo', () => {
    list$.next([
      diary(1, 3, 'Via degli Dei', '2026-05-01T10:00:00Z'),
      diary(2, 5, 'Cammino di Santa Barbara', '2026-06-01T10:00:00Z'),
      diary(3, 3, 'Via degli Dei', '2026-04-01T10:00:00Z'),
    ]);
    fixture.detectChanges();

    const rendered = sections();
    expect(rendered.length).toBe(2);
    expect(rendered.map(s => s.layerId)).toEqual([5, 3]);
    expect(rendered.map(s => s.title)).toEqual(['Cammino di Santa Barbara', 'Via degli Dei']);
    expect(rendered.every(s => s.getAttribute('layout') === 'list' && s.showCreate === false)).toBeTrue();
  });

  it('senza diari mostra il messaggio vuoto', () => {
    fixture.detectChanges();

    expect(sections().length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Non hai ancora scritto nessun diario');
  });

  it('mentre carica non mostra il messaggio vuoto', () => {
    status$.next('loading');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Non hai ancora scritto nessun diario');
  });
});
