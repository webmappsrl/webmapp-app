import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { CommunicationService } from './base/communication.service';
import { DeviceService } from './base/device.service';
import { StorageService } from './base/storage.service';

import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let communicationServiceSpy, deviceServiceSpy, storageServiceSpy;
  let service: ConfigService;

  beforeEach(() => {
    communicationServiceSpy = jasmine.createSpyObj('CommunicationService', [
      'get',
    ]);
    deviceServiceSpy = jasmine.createSpyObj('DeviceService', ['isBrowser']);
    storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'getConfig',
      'setConfig',
    ]);
    TestBed.configureTestingModule({
      providers: [
        { provide: CommunicationService, useValue: communicationServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    });

    service = TestBed.inject(ConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize performing a get request of the new config.json', (done) => {
    communicationServiceSpy.get.and.callFake(
      (url: string, options?: any) =>
        new Observable((observer) => {
          observer.next({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            APP: {
              id: 'it.webmapp.webmapp',
              name: 'Webmapp',
            },
          });
        })
    );
    storageServiceSpy.getConfig.and.callFake(() => Promise.resolve(undefined));
    storageServiceSpy.setConfig.and.callFake(() => Promise.resolve(undefined));
    service.initialize().then(
      () => {
        expect(storageServiceSpy.getConfig).toHaveBeenCalled();
        expect(communicationServiceSpy.get).toHaveBeenCalled();
        done();
      },
      (err) => {
        fail(err);
        done();
      }
    );
  });

  describe('initialize with the default basic config', () => {
    beforeEach(() => {
      communicationServiceSpy.get.and.callFake(
        (url: string, options?: any) =>
          new Observable((observer) => {
            observer.next({
              // eslint-disable-next-line @typescript-eslint/naming-convention
              APP: {
                id: 'it.webmapp.webmapp',
                name: 'Webmapp',
              },
            });
          })
      );
      storageServiceSpy.getConfig.and.callFake(() =>
        Promise.resolve(undefined)
      );
      storageServiceSpy.setConfig.and.callFake(() =>
        Promise.resolve(undefined)
      );
    });

    it('should set the correct app name and id', (done) => {
      service.initialize().then(
        () => {
          expect(service.appId).toBe('it.webmapp.webmapp');
          expect(service.appName).toBe('Webmapp');
          expect(service.defaultLanguage).toBe('it');
          const available = service.availableLanguages;
          expect(available).toHaveSize(1);
          expect(available).toEqual(['it']);
          done();
        },
        (err) => {
          fail(err);
          done();
        }
      );
    });
  });
});
