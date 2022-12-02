import {Directive} from '@angular/core';

@Directive()
export abstract class ResponsivePage {
  headerHeight = 105;
  height = 700;
  maxInfoHeigtDifference = 80;
  maxInfoheight = 850;
  minInfoheight = 350;
  opacity = 1;

  mapHeigth() {
    const mapHeight = this.height - (this.headerHeight + this.maxInfoheight) * (1 - this.opacity);
    const mapPaddingTop = this.headerHeight * (1 - this.opacity);
    const mapPaddingBottom =
      this.maxInfoheight * (1 - this.opacity) + this.minInfoheight * this.opacity;
    let ret = [mapHeight, mapPaddingTop, mapPaddingBottom];
    return ret;
  }
}
