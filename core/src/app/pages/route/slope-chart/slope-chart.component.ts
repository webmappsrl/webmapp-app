import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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

  /**
   * Calculate all the chart values and trigger the chart representation
   */
  private _setChart() {
    if (!!this._chartCanvas && !!this.route) {
      let surfaceValues: {
          [id: string]: Array<number>;
        } = {},
        slopeValues: Array<[number, number]> = [],
        labels: Array<number> = [],
        steps: number = 50,
        trackLength: number = 0,
        currentDistance: number = 0,
        previousLocation: ILocation,
        currentLocation: ILocation,
        maxAlt: number = undefined,
        minAlt: number = undefined,
        usedSurfaces: Array<ESlopeChartSurface> = [];

      for (let i in ESlopeChartSurface) {
        surfaceValues[ESlopeChartSurface[i]] = [];
      }

      this._chartValues = [];

      labels.push(0);

      let surface = Object.values(ESlopeChartSurface)[0];
      surfaceValues = this._setSurfaceValue(
        surface,
        this.route.geometry.coordinates[0][2],
        surfaceValues
      );
      if (!usedSurfaces.includes(surface)) usedSurfaces.push(surface);
      slopeValues.push([
        this.route.geometry.coordinates[0][2],
        Math.round(Math.random() * 15),
      ]);

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
              currentLocation.altitude - previousLocation.altitude,
            longitude: number =
              previousLocation.longitude +
              (deltaLongitude * difference) / localDistance,
            latitude: number =
              previousLocation.latitude +
              (deltaLatitude * difference) / localDistance,
            altitude: number = Math.round(
              previousLocation.altitude +
                (deltaAltitude * difference) / localDistance
            ),
            surface =
              Object.values(ESlopeChartSurface)[
                Math.round(step / 10) %
                  (Object.keys(ESlopeChartSurface).length - 2)
              ],
            slope: number = Math.round(Math.random() * 15);

          this._chartValues.push(new CLocation(longitude, latitude));

          surfaceValues = this._setSurfaceValue(
            surface,
            altitude,
            surfaceValues
          );
          if (!usedSurfaces.includes(surface)) usedSurfaces.push(surface);
          slopeValues.push([altitude, slope]);

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
      surfaceValues = this._setSurfaceValue(
        surface,
        this.route.geometry.coordinates[
          this.route.geometry.coordinates.length - 1
        ][2],
        surfaceValues
      );
      if (!usedSurfaces.includes(surface)) usedSurfaces.push(surface);
      slopeValues.push([
        this.route.geometry.coordinates[
          this.route.geometry.coordinates.length - 1
        ][2],
        slopeValues[slopeValues.length - 1][1] +
          Math.round(Math.random() * 1) -
          0.5,
      ]);

      labels.push(parseFloat((trackLength / 1000).toFixed(1)));

      //   if (this._chart) this._chart.destroy();

      let keys: Array<string> = Object.keys(surfaceValues);
      this.surfaces = [];
      for (let i = 0; i < keys.length; i++) {
        if (!usedSurfaces.includes(<ESlopeChartSurface>keys[i]))
          delete surfaceValues[keys[i]];
        else {
          this.surfaces.push({
            id: <ESlopeChartSurface>keys[i],
            backgroundColor: SLOPE_CHART_SURFACE[keys[i]].backgroundColor,
          });
        }
      }

      this._createChart(labels, surfaceValues, slopeValues);
    }
  }

  /**
   * Set the surface value on a specific surface
   *
   * @param surface the surface type
   * @param value the value
   * @param values the current values
   * @returns
   */
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

  /**
   * Return a chart.js dataset for a surface
   *
   * @param values the chart values
   * @param surface the surface type
   * @returns
   */
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
      // borderWidth: 3,
      // borderCapStyle: "butt",
      // borderDash: [30, 30],
      // borderDashOffset: 0.0,
      // borderJoinStyle: "miter",
      pointRadius: 0,
      data: values,
      spanGaps: false,
    };
  }

  /**
   * Return an RGB color for the given slope percentage value
   *
   * @param value the slope percentage value
   * @returns
   */
  private _getSlopeGradientColor(value: number): string {
    let easy: [number, number, number] = [8, 217, 4],
      medium: [number, number, number] = [255, 223, 10],
      hard: [number, number, number] = [196, 30, 4],
      min: [number, number, number],
      max: [number, number, number],
      proportion: number = 0;

    if (value <= 0) {
      min = easy;
      max = easy;
    } else if (value < 7.5) {
      min = easy;
      max = medium;
      proportion = value / 7.5;
    } else if (value < 15) {
      min = medium;
      max = hard;
      proportion = (value - 7.5) / 7.5;
    } else {
      min = hard;
      max = hard;
      proportion = 1;
    }

    let result: [string, string, string] = ['0', '0', '0'];

    result[0] = Math.abs(
      Math.round(min[0] + (max[0] - min[0]) * proportion)
    ).toString(16);
    result[1] = Math.abs(
      Math.round(min[1] + (max[1] - min[1]) * proportion)
    ).toString(16);
    result[2] = Math.abs(
      Math.round(min[2] + (max[2] - min[2]) * proportion)
    ).toString(16);

    return (
      '#' +
      (result[0].length < 2 ? '0' : '') +
      result[0] +
      (result[1].length < 2 ? '0' : '') +
      result[1] +
      (result[2].length < 2 ? '0' : '') +
      result[2]
    );
  }

  /**
   * Return a chart.js dataset for the slope values
   *
   * @param slopeValues the chart slope values as Array<[chartValue, slopePercentage]>
   * @returns
   */
  private _getSlopeChartSlopeDataset(
    slopeValues: Array<[number, number]>
  ): Array<ChartDataset<'line', any>> {
    let values: Array<number> = slopeValues.map((value) => value[0]),
      slopes: Array<number> = slopeValues.map((value) => value[1]);

    return [
      {
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.3,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            // This case happens on initial chart load
            return null;
          }

          let gradient = ctx.createLinearGradient(
            chartArea.left,
            0,
            chartArea.right,
            0
          );

          for (let i in slopes) {
            gradient.addColorStop(
              parseInt(i) / slopes.length,
              this._getSlopeGradientColor(slopes[i])
            );
          }

          return gradient;
        },
        borderWidth: 3,
        pointRadius: 0,
        data: values,
        spanGaps: false,
      },
      {
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 0.3,
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 8,
        pointRadius: 0,
        data: values,
        spanGaps: false,
      },
    ];
  }

  /**
   * Create the chart
   *
   * @param labels the chart labels
   * @param surfaceValues the surface values
   * @param slopeValues the slope values
   */
  private _createChart(
    labels: Array<number>,
    surfaceValues: { [id: string]: Array<number> },
    slopeValues: Array<[number, number]>
  ) {
    if (this._chartCanvas) {
      let surfaceDatasets: Array<ChartDataset> = [];

      for (let i in surfaceValues) {
        surfaceDatasets.push(
          this._getSlopeChartSurfaceDataset(
            surfaceValues[i],
            <ESlopeChartSurface>i
          )
        );
      }

      this._chart = new Chart(this._chartCanvas, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            ...this._getSlopeChartSlopeDataset(slopeValues),
            ...surfaceDatasets,
          ],
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
        },
      });
    }
  }
}
