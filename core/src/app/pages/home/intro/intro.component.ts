import {Component, OnInit} from '@angular/core';
import {MenuController, NavController} from '@ionic/angular';
import {ConfigService} from 'src/app/services/config.service';

@Component({
  selector: 'webmapp-home-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent implements OnInit {
  public title = 'webmapp';

  constructor(
    private menu: MenuController,
    private configService: ConfigService,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    this.title = this.configService.appName;
  }

  menuOpen() {
    this.menu.enable(true, 'appMenu');
    this.menu.open('appMenu');
  }

  goTo(pageName: string) {
    console.log('------- ~ IntroComponent ~ goTo ~ pageName', pageName);
    this.navCtrl.navigateForward(pageName);
  }
}
