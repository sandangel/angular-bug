import {of} from 'rxjs/observable/of';
import {multi, single, test} from './data';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

const domain = [
  '#ec407a',
  '#f44336',
  '#673ab7',
  '#2196f3',
  '#009688',
  '#4caf50',
  '#6d4c41'
];

const shuffle = (first = domain[0], second = domain[1]) => {
  let sortDomain = domain.slice();
  while (sortDomain[0] === first || sortDomain[0] === second) {
    sortDomain = domain.sort(() => Math.random() - 0.5).slice();
  }
  return sortDomain;
};

export interface D3Data {
  name: Date | number;
  value: number;
}

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  show = false;

  envData = [
    {
      xAxisLabel: '時間',
      yAxisLabel: '温度（°C）',
      legendTitle: '温度',
      data: [],
      color: {domain: []},
      unit: '°C'
    },
    {
      xAxisLabel: '時間',
      yAxisLabel: '湿度（%RH）',
      legendTitle: '湿度',
      data: [],
      color: {domain: []},
      unit: '%RH'
    },
    {
      xAxisLabel: '時間',
      yAxisLabel: '気圧（hPa）',
      legendTitle: '気圧',
      data: [],
      color: {domain: []},
      unit: 'hPa'
    }
  ];

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscription = of(test).subscribe(result => {
      if (!result) return;
      if (result.length === 0) return;

      this.refresh();
      let displayName: string;
      const temperatureSeries: D3Data[] = [];
      const humiditySeries: D3Data[] = [];
      const pressureSeries: D3Data[] = [];
      result.forEach(value => {
        const temperature: D3Data = {
          name: new Date(value.time),
          value: value.temperature
        };

        const humidity: D3Data = {
          name: new Date(value.time),
          value: value.humidity
        };

        const pressure: D3Data = {
          name: new Date(value.time),
          value: value.pressure
        };

        if (!displayName) {
          displayName = value.displayName;
        }

        temperatureSeries.push(temperature);
        humiditySeries.push(humidity);
        pressureSeries.push(pressure);
      });
      this.envData[0].data.push({
        name: `${displayName}`,
        series: temperatureSeries
      });
      this.envData[1].data.push({
        name: `${displayName}`,
        series: humiditySeries
      });
      this.envData[2].data.push({
        name: `${displayName}`,
        series: pressureSeries
      });

      this.show = true;
      this.cd.markForCheck();
    });
  }

  refresh() {
    const temp = this.envData[0];
    const humid = this.envData[1];
    const press = this.envData[2];

    [temp, humid, press].forEach(item => (item.data = []));
    temp.color.domain = shuffle();
    humid.color.domain = shuffle(temp.color.domain[0]);
    press.color.domain = shuffle(temp.color.domain[0], humid.color.domain[0]);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
