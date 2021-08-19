import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'webmapp-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {

  public categories= [
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

  public sliderOptions: any = {
    slidesPerView: 3.5,
  };

  constructor() { }

  ngOnInit() { }

  select(category) {
    category.selected = !category.selected;
  }

}
