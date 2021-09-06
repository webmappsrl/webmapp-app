import { Component, OnInit } from '@angular/core';
import { GeohubService } from 'src/app/services/geohub.service';

@Component({
  selector: 'webmapp-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {

  public categories = [
    {
      name: 'Panorama',
      icon: 'trekking-outline',
      selected: false
    },
    {
      name: 'Montagna',
      icon: 'ski-outline',
      selected: false
    },
    {
      name: 'Cascate',
      icon: 'horse-outline',
      selected: false
    }
  ];

  public searchstring: string = null;
  public inputInFocus: boolean = false;

  public sliderOptions: any = {
    slidesPerView: 2.8,
  };

  constructor(
    private _geoHubService : GeohubService
  ) { }

  ngOnInit() { }

  select(category) {
    category.selected = !category.selected;
  }

  showResults() {
    return !!this.searchstring && this.inputInFocus;
  }

  inputFocus(inFocus: boolean) {
    this.inputInFocus = inFocus;
  }

  async inputChange(ev) {
    console.log('------- ~ file: search-bar.component.ts ~ line 52 ~ SearchBarComponent ~ inputChange ~ ev', this.searchstring);
    const results = await this._geoHubService.stringSearch(this.searchstring);
  }

}
