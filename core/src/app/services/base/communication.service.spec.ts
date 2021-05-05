import { TestBed } from "@angular/core/testing";

import { CommunicationService } from "./communication.service";
import { ClipboardService } from "ngx-clipboard";
import { DeviceService } from "./device.service";
import { TranslateService } from "@ngx-translate/core";
import { StorageService } from "./storage.service";
import { ToastController } from "@ionic/angular";
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { File } from "@ionic-native/file/ngx";
import { Observable } from "rxjs";
import { FileTransfer } from "@ionic-native/file-transfer/ngx";
import { HttpClient } from "@angular/common/http";
import { IFeature } from "../classes/types/model";
import { RECORD_TRACK_ID } from "../constants";

const DEF_URL: string = "DEF_URL",
  DEF_DATA: string = "DEF_DATA",
  DEF_OPTIONS: string = "DEF_OPTIONS",
  DEF_RESULT: any = "DEF_RESULT",
  DEF_ERROR: any = "DEF_ERROR",
  DEF_TRANSLATION: string = "DEF_TRANSLATION",
  DEF_SHARE_OPTIONS: any = {
    url: "DEF_SHARE_URL",
    message: "DEF_SHARE_MESSAGE",
    subject: "DEF_SHARE_SUBJECT",
  },
  DEF_EMAIL_MESSAGE: string = "DEF_EMAIL_MESSAGE",
  DEF_EMAIL_SUBJECT: string = "DEF_EMAIL_SUBJECT",
  DEF_EMAIL_TO: Array<string> = ["DEF_EMAIL_TO"],
  DEF_DEST: string = "DEF_DEST",
  DEF_PROGRESS: string = "DEF_PROGRESS",
  DEF_FORMAT: string = "DEF_FORMAT",
  DEF_NAME: string = "DEF_NAME",
  DEF_DOCUMENT_DIRECTORY: string = "DEF_DOCUMENT_DIRECTORY",
  DEF_EXTERNAL_ROOT_DIRECTORY: string = "DEF_EXTERNAL_ROOT_DIRECTORY",
  FEATURE_ID: string = "FEATURE_ID",
  DEF_FEATURE: IFeature = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [0, 0],
    },
    properties: {
      id: FEATURE_ID,
      name: DEF_NAME,
      image: undefined,
    },
  };

describe("CommunicationService", () => {
  let clipboardServiceSpy,
    deviceServiceSpy,
    fileSpy,
    fileTransferSpy,
    httpSpy,
    socialSharingSpy,
    storageServiceSpy,
    toastControllerSpy,
    translateServiceSpy,
    communicationService: CommunicationService;

  beforeEach(() => {
    clipboardServiceSpy = jasmine.createSpyObj("ClipboardService", [
      "copyFromContent",
    ]);
    deviceServiceSpy = jasmine.createSpyObj("DeviceService", [
      "enableExternalStoragePermissions",
    ]);
    fileSpy = jasmine.createSpyObj("File", [
      "checkDir",
      "createDir",
      "writeFile",
    ]);
    fileTransferSpy = jasmine.createSpyObj("FileTransfer", ["create"]);
    httpSpy = jasmine.createSpyObj("HttpClient", ["get", "post"]);
    socialSharingSpy = jasmine.createSpyObj("SocialSharing", [
      "share",
      "shareViaEmail",
    ]);
    storageServiceSpy = jasmine.createSpyObj("StorageService", [
      "getPostQueue",
    ]);
    toastControllerSpy = jasmine.createSpyObj("ToastController", ["create"]);
    translateServiceSpy = jasmine.createSpyObj("TranslateService", ["instant"]);
    TestBed.configureTestingModule({
      providers: [
        CommunicationService,
        { provide: ClipboardService, useValue: clipboardServiceSpy },
        { provide: DeviceService, useValue: deviceServiceSpy },
        { provide: File, useValue: fileSpy },
        { provide: FileTransfer, useValue: fileTransferSpy },
        { provide: HttpClient, useValue: httpSpy },
        { provide: SocialSharing, useValue: socialSharingSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: ToastController, useValue: toastControllerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
    });
    storageServiceSpy.getPostQueue.and.returnValue(Promise.resolve(undefined));
    translateServiceSpy.instant.and.returnValue(DEF_TRANSLATION);
    toastControllerSpy.create.and.returnValue(
      Promise.resolve({
        present: () => {},
        dismiss: () => {
          return Promise.resolve();
        },
      })
    );
    communicationService = TestBed.get(CommunicationService);
  });

  it("should be created", () => {
    expect(communicationService).toBeTruthy();
  });

  describe("get", () => {
    beforeEach(() => {
      storageServiceSpy.getPostQueue.and.callFake(() => {
        return Promise.resolve(undefined);
      });
    });

    it("should resolve when there is no error", (done) => {
      httpSpy.get.and.callFake((url: string, options?: any) => {
        return new Observable((observer) => {
          observer.next(DEF_RESULT);
        });
      });
      communicationService.get(DEF_URL, DEF_OPTIONS).subscribe(
        (result) => {
          expect(httpSpy.get).toHaveBeenCalledTimes(1);
          expect(httpSpy.get).toHaveBeenCalledWith(DEF_URL, DEF_OPTIONS);
          expect(result).toEqual(DEF_RESULT);
          done();
        },
        (err) => {
          fail(err);
          done();
        }
      );
    });

    it("should trigger error when there is an error", (done) => {
      httpSpy.get.and.callFake((url: string, options?: any) => {
        return new Observable((observer) => {
          observer.error(DEF_ERROR);
        });
      });
      communicationService.get(DEF_URL, DEF_OPTIONS).subscribe(
        (result) => {
          fail("should trigger error");
          done();
        },
        (err) => {
          expect(httpSpy.get).toHaveBeenCalledWith(DEF_URL, DEF_OPTIONS);
          expect(httpSpy.get).toHaveBeenCalledTimes(1);
          expect(err).toEqual(DEF_ERROR);
          done();
        }
      );
    });
  });

  describe("post", () => {
    beforeEach(() => {
      storageServiceSpy.getPostQueue.and.callFake(() => {
        return Promise.resolve(undefined);
      });
    });

    it("should resolve when there is no error", (done) => {
      httpSpy.post.and.callFake((url: string, data: any, options?: any) => {
        return new Observable((observer) => {
          observer.next(DEF_RESULT);
        });
      });
      communicationService.post(DEF_URL, DEF_DATA, DEF_OPTIONS).subscribe(
        (result) => {
          expect(httpSpy.post).toHaveBeenCalledTimes(1);
          expect(httpSpy.post).toHaveBeenCalledWith(
            DEF_URL,
            DEF_DATA,
            DEF_OPTIONS
          );
          expect(result).toEqual(DEF_RESULT);
          done();
        },
        (err) => {
          fail(err);
          done();
        }
      );
    });

    it("should trigger error when there is an error", (done) => {
      httpSpy.post.and.callFake((url: string, options?: any) => {
        return new Observable((observer) => {
          observer.error(DEF_ERROR);
        });
      });
      communicationService.post(DEF_URL, DEF_DATA, DEF_OPTIONS).subscribe(
        (result) => {
          fail("should trigger error");
          done();
        },
        (err) => {
          expect(httpSpy.post).toHaveBeenCalledTimes(1);
          expect(httpSpy.post).toHaveBeenCalledWith(
            DEF_URL,
            DEF_DATA,
            DEF_OPTIONS
          );
          expect(err).toEqual(DEF_ERROR);
          done();
        }
      );
    });
  });

  describe("share", () => {
    describe("in browser", () => {
      beforeEach(() => {
        let deviceService = TestBed.get(DeviceService);
        deviceService.isBrowser = true;
      });
      it("should copy the url", (done) => {
        socialSharingSpy.share.and.returnValue(Promise.resolve());
        communicationService.share(DEF_SHARE_OPTIONS).then(
          (res) => {
            expect(clipboardServiceSpy.copyFromContent).toHaveBeenCalledTimes(
              1
            );
            expect(clipboardServiceSpy.copyFromContent).toHaveBeenCalledWith(
              DEF_SHARE_OPTIONS.url
            );
            expect(toastControllerSpy.create).toHaveBeenCalledTimes(1);
            done();
          },
          (err) => {
            fail(err);
            done();
          }
        );
      });
    });
    describe("in device", () => {
      beforeEach(() => {
        let deviceService = TestBed.get(DeviceService);
        deviceService.isBrowser = false;
      });

      it("should call the socialSharing plugin and resolve", (done) => {
        socialSharingSpy.share.and.returnValue(Promise.resolve());
        communicationService.share(DEF_SHARE_OPTIONS).then(
          (res) => {
            expect(clipboardServiceSpy.copyFromContent).toHaveBeenCalledTimes(
              0
            );
            expect(socialSharingSpy.share).toHaveBeenCalledTimes(1);
            expect(socialSharingSpy.share).toHaveBeenCalledWith(
              DEF_SHARE_OPTIONS.message,
              DEF_SHARE_OPTIONS.subject,
              [],
              DEF_SHARE_OPTIONS.url
            );
            done();
          },
          (err) => {
            fail(err);
            done();
          }
        );
      });

      it("should call the socialSharing plugin and reject with the error if something happens", (done) => {
        socialSharingSpy.share.and.returnValue(Promise.reject(DEF_ERROR));
        communicationService.share(DEF_SHARE_OPTIONS).then(
          (res) => {
            fail("it should not resolve");
            done();
          },
          (err) => {
            expect(clipboardServiceSpy.copyFromContent).toHaveBeenCalledTimes(
              0
            );
            expect(socialSharingSpy.share).toHaveBeenCalledTimes(1);
            expect(socialSharingSpy.share).toHaveBeenCalledWith(
              DEF_SHARE_OPTIONS.message,
              DEF_SHARE_OPTIONS.subject,
              [],
              DEF_SHARE_OPTIONS.url
            );
            expect(err).toEqual(DEF_ERROR);
            done();
          }
        );
      });
    });
  });

  describe("sendEmail", () => {
    describe("in browser", () => {
      beforeEach(() => {
        let deviceService = TestBed.get(DeviceService);
        deviceService.isBrowser = true;
        socialSharingSpy.shareViaEmail.and.returnValue(Promise.resolve());
      });
      it("should do nothing", (done) => {
        communicationService
          .sendEmail(DEF_EMAIL_MESSAGE, DEF_EMAIL_SUBJECT, DEF_EMAIL_TO)
          .then(
            (res) => {
              expect(socialSharingSpy.shareViaEmail).not.toHaveBeenCalled();
              done();
            },
            (err) => {
              fail(err);
              done();
            }
          );
      });
    });
    describe("in device", () => {
      beforeEach(() => {
        let deviceService = TestBed.get(DeviceService);
        deviceService.isBrowser = false;
      });

      it("should call the socialSharing plugin and resolve", (done) => {
        socialSharingSpy.shareViaEmail.and.returnValue(Promise.resolve());
        communicationService
          .sendEmail(DEF_EMAIL_MESSAGE, DEF_EMAIL_SUBJECT, DEF_EMAIL_TO)
          .then(
            (res) => {
              expect(socialSharingSpy.shareViaEmail).toHaveBeenCalledTimes(1);
              expect(socialSharingSpy.shareViaEmail).toHaveBeenCalledWith(
                DEF_EMAIL_MESSAGE,
                DEF_EMAIL_SUBJECT,
                DEF_EMAIL_TO
              );
              done();
            },
            (err) => {
              fail(err);
              done();
            }
          );
      });
      it("should call the socialSharing plugin and reject with the error if something happens", (done) => {
        socialSharingSpy.shareViaEmail.and.returnValue(
          Promise.reject(DEF_ERROR)
        );
        communicationService
          .sendEmail(DEF_EMAIL_MESSAGE, DEF_EMAIL_SUBJECT, DEF_EMAIL_TO)
          .then(
            (res) => {
              fail("it should not resolve");
              done();
            },
            (err) => {
              expect(socialSharingSpy.shareViaEmail).toHaveBeenCalledTimes(1);
              expect(socialSharingSpy.shareViaEmail).toHaveBeenCalledWith(
                DEF_EMAIL_MESSAGE,
                DEF_EMAIL_SUBJECT,
                DEF_EMAIL_TO
              );
              expect(err).toEqual(DEF_ERROR);
              done();
            }
          );
      });
    });
  });

  describe("forcePost", () => {});

  describe("downloadFile", () => {
    describe("in browser", () => {
      beforeEach(() => {
        let deviceService = TestBed.get(DeviceService);
        deviceService.isBrowser = true;
      });
      it("should do nothing since there is no filesystem access", (done) => {
        communicationService.downloadFile(DEF_URL, DEF_DEST).subscribe(
          () => {
            fail("it should trigger the complete");
            done();
          },
          (err) => {
            fail(err);
            done();
          },
          () => {
            expect(fileTransferSpy.create).not.toHaveBeenCalled();
            done();
          }
        );
      });
    });

    describe("in device", () => {
      let _onProgress, downloadError: boolean;
      beforeEach(() => {
        let deviceService = TestBed.get(DeviceService);
        deviceService.isBrowser = false;

        fileTransferSpy.create.and.callFake(() => {
          return {
            onProgress: (onProgress) => {
              _onProgress = onProgress;
            },
            download: (url, dest) => {
              if (!downloadError) {
                _onProgress(DEF_PROGRESS);
                return Promise.resolve();
              } else return Promise.reject(DEF_ERROR);
            },
          };
        });
      });
      it("should trigger error if there is an error", (done) => {
        downloadError = true;
        communicationService.downloadFile(DEF_URL, DEF_DEST).subscribe(
          (res) => {
            fail("it should not trigger progress function");
            done();
          },
          (err) => {
            expect(err).toEqual(DEF_ERROR);
            done();
          },
          () => {
            fail("it should not trigger progress function");
            done();
          }
        );
      });
      it("should trigger progress and then complete", (done) => {
        let progressDone: boolean = false;
        downloadError = false;
        communicationService.downloadFile(DEF_URL, DEF_DEST).subscribe(
          (res) => {
            expect(res).toEqual(DEF_PROGRESS);
            expect(fileTransferSpy.create).toHaveBeenCalledTimes(1);
            progressDone = true;
          },
          (err) => {
            fail(err);
            done();
          },
          () => {
            expect(fileTransferSpy.create).toHaveBeenCalledTimes(1);
            expect(progressDone).toBe(true);
            done();
          }
        );
      });
    });
  });

  describe("downloadGeometryFile", () => {
    describe("in browser", () => {
      beforeEach(() => {
        let deviceService = TestBed.get(DeviceService);
        deviceService.isBrowser = true;
      });
      it("should do nothing since there is no filesystem access", (done) => {
        communicationService
          .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
          .subscribe(
            () => {
              fail("it should trigger the complete");
              done();
            },
            (err) => {
              fail(err);
              done();
            },
            () => {
              expect(toastControllerSpy.create).not.toHaveBeenCalled();
              done();
            }
          );
      });
    });

    describe("in android", () => {
      beforeEach(() => {
        let deviceService = TestBed.get(DeviceService),
          file = TestBed.get(File);
        deviceService.isBrowser = false;
        deviceService.isAndroid = true;
        deviceService.isIos = false;
        file.documentsDirectory = DEF_DOCUMENT_DIRECTORY;
        file.externalRootDirectory = DEF_EXTERNAL_ROOT_DIRECTORY;
      });
      describe("for recorded tracks", () => {
        it("if the save directory is already present it should call the download API and resolve correctly", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(true));
          fileSpy.writeFile.and.returnValue(Promise.resolve());
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake((url) => {
            return new Observable((observer) => {
              observer.next(DEF_DATA);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                fail(err);
                done();
              },
              () => {
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(1);
                expect(postSpy).toHaveBeenCalledTimes(1);
                done();
              }
            );
        });
        it("if the save directory is not present it should create the save directory and call the download API and resolve correctly", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(false));
          fileSpy.createDir.and.returnValue(Promise.resolve());
          fileSpy.writeFile.and.returnValue(Promise.resolve());
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.next(DEF_DATA);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                fail(err);
                done();
              },
              () => {
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(1);
                expect(postSpy).toHaveBeenCalledTimes(1);
                done();
              }
            );
        });
        it("if there is a network problem it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve());
          fileSpy.createDir.and.returnValue(Promise.resolve());
          fileSpy.writeFile.and.returnValue(Promise.resolve());
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake((url) => {
            return new Observable((observer) => {
              observer.error(DEF_ERROR);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(postSpy).toHaveBeenCalledTimes(1);
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(0);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(0);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(0);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
        it("if user do not give permission to save the file it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.reject(DEF_ERROR)
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve());
          fileSpy.createDir.and.returnValue(Promise.resolve());
          fileSpy.writeFile.and.returnValue(Promise.resolve());
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake((url) => {
            return new Observable((observer) => {
              observer.next(DEF_DATA);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(postSpy).toHaveBeenCalledTimes(1);
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(0);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(0);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(0);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
        it("if there is a problem creating the save directory it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(false));
          fileSpy.createDir.and.returnValue(Promise.reject(DEF_ERROR));
          fileSpy.writeFile.and.returnValue(Promise.resolve());
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake((url) => {
            return new Observable((observer) => {
              observer.next(DEF_DATA);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(postSpy).toHaveBeenCalledTimes(1);
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(0);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
        it("if there is a problem writing the file it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve());
          fileSpy.createDir.and.returnValue(Promise.resolve());
          fileSpy.writeFile.and.returnValue(Promise.reject(DEF_ERROR));
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake((url) => {
            return new Observable((observer) => {
              observer.next(DEF_DATA);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(postSpy).toHaveBeenCalledTimes(1);
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(1);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
      });
      describe("for existing tracks", () => {
        it("if the save directory is already present it should call the download API and resolve correctly", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(true));
          let downloadFileSpy = spyOn(communicationService, "downloadFile");
          downloadFileSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.complete();
            });
          });

          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                fail(err);
                done();
              },
              () => {
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(downloadFileSpy).toHaveBeenCalledTimes(1);
                done();
              }
            );
        });
        it("if the save directory is not present it should create the save directory and call the download API and resolve correctly", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(false));
          fileSpy.createDir.and.returnValue(Promise.resolve());
          let downloadFileSpy = spyOn(communicationService, "downloadFile");
          downloadFileSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.complete();
            });
          });

          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                fail(err);
                done();
              },
              () => {
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(downloadFileSpy).toHaveBeenCalledTimes(1);
                done();
              }
            );
        });
        it("if there is a network problem it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve());
          fileSpy.createDir.and.returnValue(Promise.resolve());
          let downloadFileSpy = spyOn(communicationService, "downloadFile");
          downloadFileSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.error(DEF_ERROR);
            });
          });

          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(downloadFileSpy).toHaveBeenCalledTimes(1);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
        it("if user do not give permission to save the file it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.reject(DEF_ERROR)
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve());
          fileSpy.createDir.and.returnValue(Promise.resolve());
          let downloadFileSpy = spyOn(communicationService, "downloadFile");
          downloadFileSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.complete();
            });
          });

          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(0);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(0);
                expect(downloadFileSpy).toHaveBeenCalledTimes(0);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
        it("if there is a problem creating the save directory it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(false));
          fileSpy.createDir.and.returnValue(Promise.reject(DEF_ERROR));
          let downloadFileSpy = spyOn(communicationService, "downloadFile");
          downloadFileSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.complete();
            });
          });

          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(1);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(downloadFileSpy).toHaveBeenCalledTimes(0);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
      });
    });

    describe("in ios", () => {
      beforeEach(() => {
        let deviceService = TestBed.get(DeviceService),
          file = TestBed.get(File);
        deviceService.isBrowser = false;
        deviceService.isAndroid = false;
        deviceService.isIos = true;
        file.documentsDirectory = DEF_DOCUMENT_DIRECTORY;
        file.externalRootDirectory = DEF_EXTERNAL_ROOT_DIRECTORY;
      });
      describe("for recorded tracks", () => {
        it("if the save directory is already present it should call the download API and resolve correctly", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(true));
          fileSpy.writeFile.and.returnValue(Promise.resolve());
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake((url) => {
            return new Observable((observer) => {
              observer.next(DEF_DATA);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                fail(err);
                done();
              },
              () => {
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(1);
                expect(postSpy).toHaveBeenCalledTimes(1);
                done();
              }
            );
        });
        it("if the save directory is not present it should create the save directory and call the download API and resolve correctly", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(false));
          fileSpy.createDir.and.returnValue(Promise.resolve());
          fileSpy.writeFile.and.returnValue(Promise.resolve());
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.next(DEF_DATA);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                fail(err);
                done();
              },
              () => {
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(1);
                expect(postSpy).toHaveBeenCalledTimes(1);
                done();
              }
            );
        });
        it("if there is a network problem it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve());
          fileSpy.createDir.and.returnValue(Promise.resolve());
          fileSpy.writeFile.and.returnValue(Promise.resolve());
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake((url) => {
            return new Observable((observer) => {
              observer.error(DEF_ERROR);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(postSpy).toHaveBeenCalledTimes(1);
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(0);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(0);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(0);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
        it("if there is a problem creating the save directory it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(false));
          fileSpy.createDir.and.returnValue(Promise.reject(DEF_ERROR));
          fileSpy.writeFile.and.returnValue(Promise.resolve());
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.next(DEF_DATA);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(postSpy).toHaveBeenCalledTimes(1);
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(0);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
        it("if there is a problem writing the file it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve());
          fileSpy.createDir.and.returnValue(Promise.resolve());
          fileSpy.writeFile.and.returnValue(Promise.reject(DEF_ERROR));
          let postSpy = spyOn(communicationService, "post");
          postSpy.and.callFake((url) => {
            return new Observable((observer) => {
              observer.next(DEF_DATA);
            });
          });

          let feature: IFeature = JSON.parse(JSON.stringify(DEF_FEATURE));
          feature.properties.id = RECORD_TRACK_ID;
          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, feature, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(postSpy).toHaveBeenCalledTimes(1);
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.writeFile).toHaveBeenCalledTimes(1);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
      });
      describe("for existing tracks", () => {
        it("if the save directory is already present it should call the download API and resolve correctly", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(true));
          let downloadFileSpy = spyOn(communicationService, "downloadFile");
          downloadFileSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.complete();
            });
          });

          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                fail(err);
                done();
              },
              () => {
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(downloadFileSpy).toHaveBeenCalledTimes(1);
                done();
              }
            );
        });
        it("if the save directory is not present it should create the save directory and call the download API and resolve correctly", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(false));
          fileSpy.createDir.and.returnValue(Promise.resolve());
          let downloadFileSpy = spyOn(communicationService, "downloadFile");
          downloadFileSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.complete();
            });
          });

          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                fail(err);
                done();
              },
              () => {
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(downloadFileSpy).toHaveBeenCalledTimes(1);
                done();
              }
            );
        });
        it("if there is a network problem it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve());
          fileSpy.createDir.and.returnValue(Promise.resolve());
          let downloadFileSpy = spyOn(communicationService, "downloadFile");
          downloadFileSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.error(DEF_ERROR);
            });
          });

          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(downloadFileSpy).toHaveBeenCalledTimes(1);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
        it("if there is a problem creating the save directory it should reject with the error", (done) => {
          deviceServiceSpy.enableExternalStoragePermissions.and.returnValue(
            Promise.resolve()
          );
          fileSpy.checkDir.and.returnValue(Promise.resolve(false));
          fileSpy.createDir.and.returnValue(Promise.reject(DEF_ERROR));
          let downloadFileSpy = spyOn(communicationService, "downloadFile");
          downloadFileSpy.and.callFake(() => {
            return new Observable((observer) => {
              observer.complete();
            });
          });

          communicationService
            .downloadGeometryFile(DEF_URL, DEF_FORMAT, DEF_FEATURE, DEF_NAME)
            .subscribe(
              () => {
                fail("it should not trigger the progress handler");
                done();
              },
              (err) => {
                expect(err).toBeTruthy();
                expect(
                  deviceServiceSpy.enableExternalStoragePermissions
                ).toHaveBeenCalledTimes(0);
                expect(fileSpy.checkDir).toHaveBeenCalledTimes(1);
                expect(fileSpy.createDir).toHaveBeenCalledTimes(1);
                expect(downloadFileSpy).toHaveBeenCalledTimes(0);
                done();
              },
              () => {
                fail("it should trigger an error");
                done();
              }
            );
        });
      });
    });
  });
});
