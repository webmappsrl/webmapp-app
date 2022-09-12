import {Component, OnInit} from '@angular/core';
import {MenuController} from '@ionic/angular';
import {ConfigService} from 'src/app/services/config.service';

@Component({
  selector: 'webmapp-home-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent implements OnInit {
  public title = 'webmapp';

  constructor(private menu: MenuController, private configService: ConfigService) {}

  ngOnInit() {
    this.title = this.configService.appName;
  }

  menuOpen() {
    console.log('------- ~ IntroComponent ~ menuOpen ~ menuOpen');
    this.menu.enable(true, 'appMenu');
    this.menu.open('appMenu');
  }
}
