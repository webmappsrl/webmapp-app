import {ChangeDetectionStrategy, Component, ViewEncapsulation, inject} from '@angular/core';
import {Observable, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {DiaryService} from '@wm-core/diaries/diary.service';
import {Diary} from '@wm-core/diaries/diary.model';

/** Cammino con almeno un diario dell'utente. */
export interface ProfileDiaryGroup {
  layerId: number;
  title: string;
}

/** Stato del tab: i gruppi e se mostrare il messaggio vuoto. */
interface ProfileDiaryTabVm {
  groups: ProfileDiaryGroup[];
  empty: boolean;
}

/**
 * Raggruppa i diari per cammino, in ordine di diario più recente.
 *
 * @param list Diari dell'utente.
 * @returns Un gruppo per cammino.
 */
export function diaryGroups(list: Diary[]): ProfileDiaryGroup[] {
  const latest = new Map<number, {title: string; at: number}>();
  for (const diary of list ?? []) {
    const at = new Date(diary.updatedAt ?? diary.createdAt).getTime();
    const current = latest.get(diary.layer.id);
    if (!current || at > current.at) latest.set(diary.layer.id, {title: diary.layer.name, at});
  }
  return Array.from(latest.entries())
    .sort((a, b) => b[1].at - a[1].at)
    .map(([layerId, {title}]) => ({layerId, title}));
}

/**
 * Tab «Il mio diario» del profilo, solo camminiditalia (oc:8169): i diari dell'utente, una
 * sezione per cammino. Dichiarato in `ProfileDiaryTabModule`, importato solo da
 * `profile-routing.module.camminiditalia.ts` (`fileReplacements`): questo file non importa
 * `WmCoreModule`, che sotto Karma non si carica.
 */
@Component({
  standalone: false,
  selector: 'webmapp-profile-diary-tab',
  templateUrl: './profile-diary-tab.component.html',
  styleUrls: ['./profile-diary-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ProfileDiaryTabComponent {
  private _diarySvc = inject(DiaryService);

  readonly vm$: Observable<ProfileDiaryTabVm> = combineLatest([
    this._diarySvc.diaries$(),
    this._diarySvc.status$(),
  ]).pipe(
    map(([list, status]) => {
      const groups = diaryGroups(list);
      return {groups, empty: groups.length === 0 && status === 'active'};
    }),
  );

  /**
   * Chiave stabile per l'elenco dei gruppi.
   *
   * @param _ Indice.
   * @param group Gruppo.
   * @returns L'id del cammino.
   */
  trackByLayer(_: number, group: ProfileDiaryGroup): number {
    return group.layerId;
  }
}
