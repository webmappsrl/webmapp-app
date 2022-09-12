import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ConfigService} from 'src/app/services/config.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.page.html',
  styleUrls: ['./project.page.scss'],
})
export class ProjectPage implements OnInit {
  public innerHtml = '';

  constructor(private configService: ConfigService, public sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.innerHtml = this.configService.project;
  }
}
