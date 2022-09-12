import {Component, OnInit} from '@angular/core';
import {ConfigService} from 'src/app/services/config.service';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.page.html',
  styleUrls: ['./credits.page.scss'],
})
export class CreditsPage implements OnInit {
  public appNameObj = '';

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.appNameObj = this.configService.appName;
  }
}
