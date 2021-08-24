import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Chart, ChartDataset, registerables } from 'chart.js';
import { CLocation } from 'src/app/classes/clocation';
import { SLOPE_CHART_SURFACE } from 'src/app/constants/slope-chart';
import { MapService } from 'src/app/services/base/map.service';
import { StatusService } from 'src/app/services/status.service';
import { ESlopeChartSurface } from 'src/app/types/eslope-chart.enum';
import { ILocation } from 'src/app/types/location';
import { IGeojsonFeature } from 'src/app/types/model';

@Component({
  selector: 'webmapp-slope-chart',
  templateUrl: './slope-chart.component.html',
  styleUrls: ['./slope-chart.component.scss'],
})
export class SlopeChartComponent implements OnInit {
  @ViewChild('chartCanvas') set content(content: ElementRef) {
    this._chartCanvas = content.nativeElement;
  }

  private _chartCanvas: any;
  private _chart: Chart;
  private _chartValues: Array<ILocation>;
  public surfaces: Array<{
    id: ESlopeChartSurface;
    backgroundColor: string;
  }> = [];

  public route: IGeojsonFeature;

  constructor(
    private _mapService: MapService,
    private _translateService: TranslateService,
    private _statusService: StatusService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    setTimeout(() => {
      this.route = this._statusService.route;
      this._setChart();
    }, 0);
  }

  private _setChart() {
    if (!!this._chartCanvas && !!this.route) {
      let values: {
          [id: string]: Array<number>;
        } = {},
        labels: Array<number> = [],
        steps: number = 75,
        trackLength: number = 0,
        currentDistance: number = 0,
        previousLocation: ILocation,
        currentLocation: ILocation,
        maxAlt: number = undefined,
        minAlt: number = undefined,
        usedSurfaces: Array<ESlopeChartSurface> = [];

      // steps = Math.max(5, Math.min(800, steps));

      for (let i in ESlopeChartSurface) {
        values[ESlopeChartSurface[i]] = [];
      }

      this._chartValues = [];

      labels.push(0);

      let surface = Object.values(ESlopeChartSurface)[0];
      values = this._setSurfaceValue(
        surface,
        this.route.geometry.coordinates[0][2],
        values
      );
      if (!usedSurfaces.includes(surface)) usedSurfaces.push(surface);

      currentLocation = new CLocation(
        this.route.geometry.coordinates[0][0],
        this.route.geometry.coordinates[0][1],
        this.route.geometry.coordinates[0][2]
      );
      this._chartValues.push(currentLocation);

      for (let i = 1; i < this.route.geometry.coordinates.length; i++) {
        previousLocation = currentLocation;
        currentLocation = new CLocation(
          this.route.geometry.coordinates[i][0],
          this.route.geometry.coordinates[i][1]
        );
        trackLength += this._mapService.getDistanceBetweenPoints(
          previousLocation,
          currentLocation
        );

        if (!maxAlt || maxAlt < currentLocation.altitude)
          maxAlt = currentLocation.altitude;
        if (!minAlt || minAlt > currentLocation.altitude)
          minAlt = currentLocation.altitude;
      }

      let step: number = 1;
      currentLocation = new CLocation(
        this.route.geometry.coordinates[0][0],
        this.route.geometry.coordinates[0][1],
        this.route.geometry.coordinates[0][2]
      );

      for (
        let i = 1;
        i < this.route.geometry.coordinates.length && step < steps;
        i++
      ) {
        previousLocation = currentLocation;
        currentLocation = new CLocation(
          this.route.geometry.coordinates[i][0],
          this.route.geometry.coordinates[i][1],
          this.route.geometry.coordinates[i][2]
        );
        let localDistance: number = this._mapService.getDistanceBetweenPoints(
          previousLocation,
          currentLocation
        );
        currentDistance += localDistance;

        while (currentDistance > (trackLength / steps) * step) {
          let difference: number =
              localDistance - (currentDistance - (trackLength / steps) * step),
            deltaLongitude: number =
              currentLocation.longitude - previousLocation.longitude,
            deltaLatitude: number =
              currentLocation.latitude - previousLocation.latitude,
            deltaAltitude: number =
              currentLocation.altitude - previousLocation.altitude;

          this._chartValues.push(
            new CLocation(
              previousLocation.longitude +
                (deltaLongitude * difference) / localDistance,
              previousLocation.latitude +
                (deltaLatitude * difference) / localDistance
            )
          );

          let surface =
            Object.values(ESlopeChartSurface)[
              Math.round(step / 10) %
                (Object.keys(ESlopeChartSurface).length - 2)
            ];
          values = this._setSurfaceValue(
            surface,
            Math.round(
              previousLocation.altitude +
                (deltaAltitude * difference) / localDistance
            ),
            values
          );
          if (!usedSurfaces.includes(surface)) usedSurfaces.push(surface);
          labels.push(
            parseFloat(((step * trackLength) / (steps * 1000)).toFixed(1))
          );

          step++;
        }
      }

      this._chartValues.push(
        new CLocation(
          this.route.geometry.coordinates[
            this.route.geometry.coordinates.length - 1
          ][0],
          this.route.geometry.coordinates[
            this.route.geometry.coordinates.length - 1
          ][1]
        )
      );
      surface =
        Object.values(ESlopeChartSurface)[
          Math.round(step / 10) % (Object.keys(ESlopeChartSurface).length - 2)
        ];
      values = this._setSurfaceValue(
        surface,
        this.route.geometry.coordinates[
          this.route.geometry.coordinates.length - 1
        ][2],
        values
      );
      if (!usedSurfaces.includes(surface)) usedSurfaces.push(surface);

      labels.push(parseFloat((trackLength / 1000).toFixed(1)));

      //   if (this._chart) this._chart.destroy();

      let keys: Array<string> = Object.keys(values);
      this.surfaces = [];
      for (let i = 0; i < keys.length; i++) {
        if (!usedSurfaces.includes(<ESlopeChartSurface>keys[i]))
          delete values[keys[i]];
        else {
          this.surfaces.push({
            id: <ESlopeChartSurface>keys[i],
            backgroundColor: SLOPE_CHART_SURFACE[keys[i]].backgroundColor,
          });
        }
      }

      this._createChart(labels, values);
    }
  }

  private _setSurfaceValue(
    surface: string,
    value: number,
    values: {
      [id: string]: Array<number>;
    }
  ): {
    [id: string]: Array<number>;
  } {
    let length: number =
      Object.keys(values).length > 0
        ? values[Object.keys(values)[0]].length
        : 0;

    if (length > 0) {
      for (let i in values) {
        if (typeof values[i][values[i].length - 1] === 'number') {
          values[surface][values[surface].length - 1] =
            values[i][values[i].length - 1];
          break;
        }
      }
    }

    for (let i in values) {
      values[i].push(i === surface ? value : null);
    }
    return values;
  }

  private _getSlopeChartSurfaceDataset(
    values: Array<number>,
    surface: ESlopeChartSurface
  ): ChartDataset<'line', any> {
    return {
      // label: this._translateService.instant(
      //   'slopechart.surface.' + surface + '.label'
      // ),
      fill: true,
      cubicInterpolationMode: 'monotone',
      tension: 0.3,
      backgroundColor: SLOPE_CHART_SURFACE[surface].backgroundColor,
      borderColor: 'rgba(255, 199, 132, 0)',
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
    };
  }

  private _createChart(
    labels: Array<number>,
    values: { [id: string]: Array<number> }
  ) {
    if (this._chartCanvas) {
      let surfaceDatasets: Array<ChartDataset> = [];

      for (let i in values) {
        surfaceDatasets.push(
          this._getSlopeChartSurfaceDataset(values[i], <ESlopeChartSurface>i)
        );
      }

      this._chart = new Chart(this._chartCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [...surfaceDatasets],
        },
        options: {
          //   events: ["mousemove", "click", "touchstart", "touchmove"],
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              title: {
                display: false,
                text: 'm',
              },
              grid: {
                display: false,
              },
            },
            x: {
              ticks: {
                maxTicksLimit: 5,
                maxRotation: 0,
              },
              title: {
                display: false,
                text: 'km',
              },
              grid: {
                display: false,
              },
            },
          },
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
        },
      });
    }
  }
}
