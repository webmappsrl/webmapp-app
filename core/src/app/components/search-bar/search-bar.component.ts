import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GeohubService } from 'src/app/services/geohub.service';
import { StatusService } from 'src/app/services/status.service';
import { PlaceResult, SearchStringResult, TrackResult } from 'src/app/types/map';
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


  @Output() goToBBox: EventEmitter<number[]> = new EventEmitter();
  @Output() searchChange: EventEmitter<any> = new EventEmitter();

  public searchstring: string = null;
  public inputInFocus: boolean = false;

  public results: SearchStringResult = null;

  public sliderOptions: any = {
    slidesPerView: 2.8,
  };

  constructor(
    private _geoHubService: GeohubService,
    private _statusService: StatusService,
    private navCtrl: NavController
  ) { }

  ngOnInit() { }

  select(category) {
    category.selected = !category.selected;
  }

  showResults() {
    return !!this.searchstring && this.inputInFocus;
  }

  inputFocus(inFocus: boolean) {
    setTimeout(() => {
      this.inputInFocus = inFocus;
    }, 250);
  }

  async inputChange(ev) {
    if (this.searchstring) {
      this.results = await this._geoHubService.stringSearch(this.searchstring);
      console.log("------- ~ SearchBarComponent ~ inputChange ~ this.results", this.results);
    }
  }

  selectPlace(place: PlaceResult) {
    console.log('------- ~ file: search-bar.component.ts ~ line 69 ~ SearchBarComponent ~ selectPlace ~ place', place);
    const bbox = place.bbox;    
    this.goToBBox.emit(bbox)
  }

  async selectTrack(track: TrackResult) {
    console.log('------- ~ file: search-bar.component.ts ~ line 69 ~ SearchBarComponent ~ selecttrack ~ track', track);
    const route = await this._geoHubService.getEcTrack(track.id);
    this._statusService.route = route;
    this.navCtrl.navigateForward('route');
  }
  selectFilter(filter) {
    console.log('------- ~ file: search-bar.component.ts ~ line 69 ~ SearchBarComponent ~ selectfilter ~ filter', filter);
    this._statusService.addFilter(filter);
    this.searchChange.emit();
  }

}
