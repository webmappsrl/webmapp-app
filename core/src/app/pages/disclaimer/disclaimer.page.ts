import {Component, OnInit} from '@angular/core';
import {ConfigService} from 'src/app/services/config.service';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.page.html',
  styleUrls: ['./disclaimer.page.scss'],
})
export class DisclaimerPage implements OnInit {
  public appNameObj = '';

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.appNameObj = this.configService.appName;
  }
}
