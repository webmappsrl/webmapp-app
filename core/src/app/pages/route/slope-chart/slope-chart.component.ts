import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StatusService } from 'src/app/services/status.service';
import { ILocation } from 'src/app/types/location';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'webmapp-slope-chart',
  templateUrl: './slope-chart.component.html',
  styleUrls: ['./slope-chart.component.scss'],
})
export class SlopeChartComponent implements OnInit {

  @ViewChild("chartCanvas") set content(content: ElementRef) {
    this._chartCanvas = content.nativeElement;
    console.log('------- ~ file: slope-chart.component.ts ~ line 16 ~ SlopeChartComponent ~ @ViewChild ~ this._chartCanvas', this._chartCanvas);

  }

  private _chartCanvas: any;
  private _chart: Chart;
  // private _chartValues: Array<ILocation>;
  // private _feature: IFeature;

  public route: IGeojsonFeature;

  constructor(private _statusService: StatusService) { Chart.register(...registerables); }

  ngOnInit() {
    setTimeout(() => {
      this.route = this._statusService.route;
      this._setChart();
    }, 0);
  }

  private _setChart() {
    // this._mapService.clearTemporaryPois();

    // if (!!this._chartCanvas && !!this._feature) {
    //    let labels: Array<string> = [],
    let values = [];
    let values2 = [];
    //      container = this._chartCanvas,
    // //     steps: number =
    // //       parseInt(
    // //         this._themeService.getCSSProperty("--wm-points-number", container)
    // //       ) || 50,
    // //     trackLength: number = 0,
    // //     currentDistance: number = 0,
    //      previousLocation: ILocation,
    //      currentLocation: ILocation,
    //      maxAlt: number = undefined,
    //      minAlt: number = undefined;

    //   steps = Math.max(5, Math.min(800, steps));

    //   this._chartValues = [];

    //   labels.push("0");
    // values.push(Math.round(this.route.geometry.coordinates[0][2]));
    let idx = 1;
    this.route.geometry.coordinates.forEach(coord => {
      values.push({ x: idx + '', y: (Math.round(idx / 100) % 2 == 0) ? Math.round(coord[2]) : null });
      values2.push({ x: idx + '', y: (Math.round(idx / 100) % 2 == 1) ? Math.round(coord[2]) : null });
      idx++;
    })
    //   currentLocation = new CLocation(
    //     this._feature.geometry.coordinates[0][0],
    //     this._feature.geometry.coordinates[0][1]
    //   );
    //   this._chartValues.push(currentLocation);

    //   for (let i = 1; i < this._feature.geometry.coordinates.length; i++) {
    //     previousLocation = currentLocation;
    //     currentLocation = new CLocation(
    //       this._feature.geometry.coordinates[i][0],
    //       this._feature.geometry.coordinates[i][1]
    //     );
    //     trackLength += this._mapService.getDistanceBetweenPoints(
    //       previousLocation,
    //       currentLocation
    //     );
    //     if (!maxAlt || maxAlt < this._feature.geometry.coordinates[i][2])
    //       maxAlt = this._feature.geometry.coordinates[i][2];
    //     if (!minAlt || minAlt > this._feature.geometry.coordinates[i][2])
    //       minAlt = this._feature.geometry.coordinates[i][2];
    //   }

    //   let step: number = 1;
    //   currentLocation = new CLocation(
    //     this._feature.geometry.coordinates[0][0],
    //     this._feature.geometry.coordinates[0][1],
    //     this._feature.geometry.coordinates[0][2]
    //   );

    //   for (
    //     let i = 1;
    //     i < this._feature.geometry.coordinates.length && step < steps;
    //     i++
    //   ) {
    //     previousLocation = currentLocation;
    //     currentLocation = new CLocation(
    //       this._feature.geometry.coordinates[i][0],
    //       this._feature.geometry.coordinates[i][1],
    //       this._feature.geometry.coordinates[i][2]
    //     );
    //     let localDistance: number = this._mapService.getDistanceBetweenPoints(
    //       previousLocation,
    //       currentLocation
    //     );
    //     currentDistance += localDistance;

    //     while (currentDistance > (trackLength / steps) * step) {
    //       let difference: number =
    //         localDistance - (currentDistance - (trackLength / steps) * step),
    //         deltaLongitude: number =
    //           currentLocation.longitude - previousLocation.longitude,
    //         deltaLatitude: number =
    //           currentLocation.latitude - previousLocation.latitude,
    //         deltaAltitude: number =
    //           currentLocation.altitude - previousLocation.altitude;

    //       this._chartValues.push(
    //         new CLocation(
    //           previousLocation.longitude +
    //           (deltaLongitude * difference) / localDistance,
    //           previousLocation.latitude +
    //           (deltaLatitude * difference) / localDistance
    //         )
    //       );
    //       values.push(
    //         Math.round(
    //           previousLocation.altitude +
    //           (deltaAltitude * difference) / localDistance
    //         )
    //       );
    //       labels.push(((step * trackLength) / (steps * 1000)).toFixed(1));

    //       step++;
    //     }
    //   }

    //   this._chartValues.push(
    //     new CLocation(
    //       this._feature.geometry.coordinates[
    //       this._feature.geometry.coordinates.length - 1
    //       ][0],
    //       this._feature.geometry.coordinates[
    //       this._feature.geometry.coordinates.length - 1
    //       ][1]
    //     )
    //   );
    //   values.push(
    //     Math.round(
    //       this._feature.geometry.coordinates[
    //       this._feature.geometry.coordinates.length - 1
    //       ][2]
    //     )
    //   );
    //   labels.push((trackLength / 1000).toFixed(1));

    //   if (this._chart) this._chart.destroy();

    //   let fillColor: string =
    //     this._themeService.getCSSProperty("--wm-fill-color", container) ||
    //     this._themeService.fade(this._themeService.getPrimaryColor()),
    //     lineColor: string =
    //       this._themeService.getCSSProperty("--wm-line-color", container) ||
    //       this._themeService.getPrimaryColor(),
    //     lineWidth: number =
    //       parseInt(
    //         this._themeService.getCSSProperty("--wm-line-width", container)
    //       ) || 1,
    //     pointBorderColor: string =
    //       this._themeService.getCSSProperty(
    //         "--wm-point-border-color",
    //         container
    //       ) || this._themeService.getPrimaryColor(),
    //     pointFillColor: string =
    //       this._themeService.getCSSProperty(
    //         "--wm-point-fill-color",
    //         container
    //       ) || this._themeService.getPrimaryColor(),
    //     pointHoverBorderColor: string =
    //       this._themeService.getCSSProperty(
    //         "--wm-point-hover-border-color",
    //         container
    //       ) || this._themeService.fade(this._themeService.getPrimaryColor()),
    //     pointHoverFillColor: string =
    //       this._themeService.getCSSProperty(
    //         "--wm-point-hover-fill-color",
    //         container
    //       ) || this._themeService.fade(this._themeService.getPrimaryColor()),
    //     pointRadius: number =
    //       parseInt(
    //         this._themeService.getCSSProperty("--wm-point-radius", container)
    //       ) || 2,
    //     pointHoverRadius: number =
    //       parseInt(
    //         this._themeService.getCSSProperty(
    //           "--wm-point-hover-radius",
    //           container
    //         )
    //       ) || 5,
    //     tooltipBackgroundColor: string =
    //       this._themeService.getCSSProperty(
    //         "--wm-tooltip-background-color",
    //         container
    //       ) || this._themeService.getDarkColor(),
    //     tooltipColor: string =
    //       this._themeService.getCSSProperty("--wm-tooltip-color", container) ||
    //       this._themeService.getLightColor(),
    //     tooltipTitleFontSize: number =
    //       parseInt(
    //         this._themeService.getCSSProperty(
    //           "--wm-tooltip-title-font-size",
    //           container
    //         )
    //       ) || undefined,
    //     tooltipLabelFontSize: number =
    //       parseInt(
    //         this._themeService.getCSSProperty(
    //           "--wm-tooltip-label-font-size",
    //           container
    //         )
    //       ) || undefined,
    //     tooltipBorderColor: string =
    //       this._themeService.getCSSProperty(
    //         "--wm-tooltip-border-color",
    //         container
    //       ) || tooltipBackgroundColor,
    //     tooltipBorderWidth: number =
    //       parseInt(
    //         this._themeService.getCSSProperty(
    //           "--wm-tooltip-border-width",
    //           container
    //         )
    //       ) || 1,
    //     xMaxLines: number =
    //       parseInt(
    //         this._themeService.getCSSProperty("--wm-max-x-values", container)
    //       ) >= 0
    //         ? parseInt(
    //           this._themeService.getCSSProperty(
    //             "--wm-max-x-values",
    //             container
    //           )
    //         )
    //         : 8,
    //     yMaxLines: number =
    //       parseInt(
    //         this._themeService.getCSSProperty("--wm-max-y-values", container)
    //       ) >= 0
    //         ? parseInt(
    //           this._themeService.getCSSProperty(
    //             "--wm-max-y-values",
    //             container
    //           )
    //         )
    //         : undefined,
    //     showGrid: boolean =
    //       parseInt(
    //         this._themeService.getCSSProperty("--wm-hide-grid", container)
    //       ) > 0
    //         ? false
    //         : true;


    // }

    this._createChart(values, values2);
  }

  private _createChart(values, values2) {
    console.log('------- ~ file: slope-chart.component.ts ~ line 310 ~ SlopeChartComponent ~ _createChart ~ values', values);
    if (this._chartCanvas) {

      this._chart = new Chart(this._chartCanvas,
        {
          type: "line",
          data: {
            // labels: labels,
            datasets: [
              {
                label: "fango",
                fill: true,
                cubicInterpolationMode: "monotone",
                // lineTension: 0.3,
                backgroundColor: 'rgba(155, 99, 132, 1)',
                // borderColor: 'rgba(255, 199, 132, 1)',
                // borderWidth: 0,
                // borderCapStyle: "butt",
                // borderDash: [],
                // borderDashOffset: 0.0,
                // borderJoinStyle: "miter",
                pointRadius: 0,
                // pointBorderColor: pointBorderColor,
                // pointBorderWidth: 1,
                // pointBackgroundColor: pointFillColor,
                // pointHoverRadius: pointHoverRadius,
                // pointHoverBorderColor: pointHoverBorderColor,
                // pointHoverBorderWidth: 2,
                // pointHoverBackgroundColor: pointHoverFillColor,
                // pointHitRadius: 10,
                data: values,
                spanGaps: false,
              }, {
                label: "ghiaia",
                fill: true,
                cubicInterpolationMode: "monotone",
                // lineTension: 0.3,
                backgroundColor: 'rgba(255, 99, 32, 1)',
                // borderColor: 'rgba(255, 199, 132, 1)',
                // borderWidth: 0,
                // borderCapStyle: "butt",
                // borderDash: [],
                // borderDashOffset: 0.0,
                // borderJoinStyle: "miter",
                pointRadius: 0,
                // pointBorderColor: pointBorderColor,
                // pointBorderWidth: 1,
                // pointBackgroundColor: pointFillColor,
                // pointHoverRadius: pointHoverRadius,
                // pointHoverBorderColor: pointHoverBorderColor,
                // pointHoverBorderWidth: 2,
                // pointHoverBackgroundColor: pointHoverFillColor,
                // pointHitRadius: 10,
                data: values2,
                spanGaps: false,
              },
            ],
          }//,
          // options: {
          //   events: ["mousemove", "click", "touchstart", "touchmove"],
          //   maintainAspectRatio: false,
          //   legend: {
          //     display: false,
          //   },
          //   scales: {
          //     yAxes: [
          //       {
          //         ticks: {
          //           beginAtZero: false,
          //           suggestedMax: undefined,
          //           suggestedMin: undefined,
          //           maxTicksLimit: yMaxLines,
          //           stepSize: Math.ceil((maxAlt - minAlt) / 700) * 100,
          //         },
          //         scaleLabel: {
          //           display: true,
          //           labelString: "m",
          //           padding: {
          //             top: 0,
          //             left: 0,
          //             right: 0,
          //             bottom: -5,
          //           },
          //         },
          //         gridLines: {
          //           display: showGrid,
          //         },
          //       },
          //     ],
          //     xAxes: [
          //       {
          //         ticks: {
          //           maxTicksLimit: xMaxLines,
          //           maxRotation: 0,
          //         },
          //         scaleLabel: {
          //           display: true,
          //           labelString: "km",
          //           padding: {
          //             top: -5,
          //             left: 0,
          //             right: 0,
          //             bottom: 0,
          //           },
          //         },
          //         gridLines: {
          //           display: showGrid,
          //         },
          //       },
          //     ],
          //   },
          //   tooltips: {
          //     intersect: false,
          //     mode: "index",
          //     backgroundColor: tooltipBackgroundColor,
          //     titleFontColor: tooltipColor,
          //     bodyFontColor: tooltipColor,
          //     footerFontColor: tooltipColor,
          //     titleFontSize: tooltipTitleFontSize,
          //     bodyFontSize: tooltipLabelFontSize,
          //     borderColor: tooltipBorderColor,
          //     borderWidth: tooltipBorderWidth,
          //     callbacks: {
          //       label: (item: ChartTooltipItem, data: ChartData): string => {
          //         if (this._configService.showTooltipLabel()) {
          //           this._mapService.drawTemporaryPoi(
          //             this._chartValues[item.index],
          //             "elevation_poi"
          //           );
          //           return item.xLabel + " km";
          //         } else return undefined;
          //       },
          //       title: (
          //         item: Array<ChartTooltipItem>,
          //         data: ChartData
          //       ): string => {
          //         return item[0].yLabel + " m";
          //       },
          //       labelColor: function (tooltipItem, chart) {
          //         return {
          //           borderColor: pointHoverBorderColor,
          //           backgroundColor: pointHoverFillColor,
          //         };
          //       },
          //     },
          //   },
          // },
        });
    }
  }

}
