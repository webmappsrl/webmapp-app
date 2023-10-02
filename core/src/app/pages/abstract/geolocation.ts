import {Directive, OnDestroy} from '@angular/core';

import {Platform} from '@ionic/angular';
import {BehaviorSubject} from 'rxjs/internal/BehaviorSubject';
import {Subscription} from 'rxjs/internal/Subscription';
import {BackgroundGeolocationPlugin} from '@capacitor-community/background-geolocation';
import {registerPlugin} from '@capacitor/core';
const backgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');
@Directive()
export abstract class GeolocationPage implements OnDestroy {
  private _bgLocSub: Subscription = Subscription.EMPTY;

  centerPositionEvt$: BehaviorSubject<boolean> = new BehaviorSubject<boolean | null>(null);
  currentPosition$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  startRecording$: BehaviorSubject<string> = new BehaviorSubject<string | null>(null);

  constructor(platform: Platform) {
    this.start();
  }

  ngOnDestroy(): void {
    this._bgLocSub.unsubscribe();
  }

  setCurrentLocation(event): void {
    this.currentPosition$.next(event);
  }

  start(): void {
    if (this.startRecording$.value != null) {
      backgroundGeolocation
        .addWatcher(
          {
            backgroundMessage: 'Cancel to prevent battery drain.',
            backgroundTitle: 'Tracking You.',
            requestPermissions: true,
            stale: false,
            distanceFilter: 10,
          },
          (location, error) => {
            if (error) {
              if (error.code === 'NOT_AUTHORIZED') {
                if (
                  window.confirm(
                    'This app needs your location, ' +
                      'but does not have permission.\n\n' +
                      'Open settings now?',
                  )
                ) {
                  backgroundGeolocation.openSettings();
                }
              }
              return console.error(error);
            }
            this.currentPosition$.next(location);

            return console.log(location);
          },
        )
        .then(watcher_id => {
          this.startRecording$.next(watcher_id);
        });
    }
  }

  stop(): void {
    backgroundGeolocation.removeWatcher({
      id: this.startRecording$.value,
    });
    this.startRecording$.next(null);
  }
}
