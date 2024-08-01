import {Share} from '@capacitor/share';
import {AlertController, MenuController, ToastController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {from, Observable} from 'rxjs';
import {switchMap, take} from 'rxjs/operators';
import {Filesystem, Directory, Encoding} from '@capacitor/filesystem';

export abstract class DetailPage {
  constructor(
    protected menuCtrl: MenuController,
    protected alertCtrl: AlertController,
    protected translateSvc: TranslateService,
    protected toastCtrl: ToastController,
  ) {}

  closeMenu(): void {
    this.menuCtrl.close('optionMenu');
  }

  delete(header: string, message: string, confirmHandler: () => void): void {
    from(
      this.alertCtrl.create({
        cssClass: 'my-custom-class',
        header: this.translateSvc.instant(header),
        message: this.translateSvc.instant(message),
        buttons: [
          {
            text: this.translateSvc.instant('cancella'),
            cssClass: 'webmapp-modalconfirm-btn',
            role: 'destructive',
            handler: confirmHandler,
          },
          {
            text: this.translateSvc.instant('annulla'),
            cssClass: 'webmapp-modalconfirm-btn',
            role: 'cancel',
            handler: () => {},
          },
        ],
      }),
    )
      .pipe(
        switchMap(alert => {
          alert.present();
          return from(alert.onWillDismiss());
        }),
        take(1),
      )
      .subscribe(() => {});
  }

  menu(): void {
    this.menuCtrl.enable(true, 'optionMenu');
    this.menuCtrl.open('optionMenu');
  }

  presentToast(message: string): Observable<void> {
    return from(
      this.toastCtrl.create({
        message: this.translateSvc.instant('Waypoint correttamente cancellato'),
        duration: 1500,
        position: 'bottom',
      }),
    ).pipe(switchMap(t => t.present()));
  }

  async saveFileCallback(data, format, input): Promise<void> {
    const name = (input != null && input.title) ?? 'export';
    const fileName = `${name}.${format}`;
    try {
      // Scrivi il file nel filesystem
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data,
        directory: Directory.External,
        encoding: Encoding.UTF8,
      });

      // Prepara il file per la condivisione
      const fileUrl = writeResult.uri;

      // Apri il menu di condivisione
      await Share.share({
        title: `Condividi il file ${fileName}`,
        url: fileUrl,
        dialogTitle: `Condividi il tuo file ${fileName}`,
      });
    } catch (e) {
      console.error("Errore durante l'esportazione e la condivisione:", e);
    }
  }
}
