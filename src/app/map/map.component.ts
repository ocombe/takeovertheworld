import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import 'rxjs/add/observable/fromEvent';
import {throttle} from 'lodash';
import {ActivatedRoute, Params, Router} from "@angular/router";
import Feature = GeoJSON.Feature;

@Component({
  selector: 'app-map',
  styleUrls: ['map.component.scss'],
  template: `
    <svg #svg>
      <svg:g #plotArea [attr.transform]="transform"/>
    </svg>
    <div class="tooltip" [hidden]="!showTooltip" #tooltip></div>
  `
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('svg') _svg: ElementRef;
  @ViewChild('plotArea') _plotArea: ElementRef;
  @ViewChild('tooltip') _tooltip: ElementRef;
  svg: d3.Selection<any, any, any, any>;
  plotArea: d3.Selection<any, any, any, any>;
  tooltip: d3.Selection<any, any, any, any>;
  showTooltip = false;
  projection: any;
  path: any;
  zoom: any;
  width;
  height;
  _features: Feature<any>[];
  transform: any;
  onResizeSub: Subscription;

  @Output() onCountryClick = new EventEmitter<string>();
  @Input() ids: string[];
  @Input() set features(features: Feature<any>[]) {
    this._features = features;
    // width defined = view is init
    if(this.width) {
      this.draw(features);
    }
  };

  constructor(private element: ElementRef) {
    this.onResizeSub = Observable.fromEvent(window, 'resize', null, null)
      .subscribe(throttle(() => {
        this.computeSizes();
        this.draw(this._features);
      }, 150, {trailing: true}).bind(this));
  }

  ngAfterViewInit() {
    this.svg = d3.select(this._svg.nativeElement);
    this.plotArea = d3.select(this._plotArea.nativeElement);
    this.tooltip = d3.select(this._tooltip.nativeElement);

    this.projection = d3.geoMercator()
      .center([0, 20])
      .rotate([-10, 0]);

    this.path = d3.geoPath();
    this.computeSizes();

    if(this._features) {
      this.draw(this._features);
    }

    // zoom
    this.zoom = d3.zoom()
      .scaleExtent([1, 9])
      .on('zoom', this.zoomed.bind(this));
  }

  zoomed() {
    this.transform = d3.event.transform;
  }

  computeSizes() {
    this.width = this.element.nativeElement.offsetWidth;
    this.height = this.width / 2;
    this.svg.attr('width', this.width)
      .attr('height', this.height);
  }

  draw(features: Feature<any>[]) {
    this.projection.translate([this.width / 2, this.height / 2])
      .scale(this.width / 2 / Math.PI);

    this.path.projection(this.projection);

    this.zoom.translateExtent([[0, 0], [this.width, this.height]]);

    this.svg.call(this.zoom);

    const countries = this.plotArea.selectAll('path')
      .data(features);

    countries
      .enter()
      .append('path')
      .attr('class', 'country')
      .on("mouseover", (datum: any, index: number, nodes: any[]) => {
        const mouse = d3.mouse(nodes[index]);

        this.showTooltip = true;
        this.tooltip
          .style('left', `${mouse[0] + 25}px`)
          .style('top', `${mouse[1] + 25}px`)
          .html(datum.properties.name);
      })
      .on("mouseout", () => this.showTooltip = false)
      .on("click", (datum: any, index: number, nodes: any[]) => {
        d3.select(nodes[index])
          .style("fill", this.ids.indexOf(datum.id) === -1 ? "#5a94ff" : null);
        this.onCountryClick.emit(datum.id);
      })
      .merge(countries)
      .attr('d', this.path)
      .attr("id", (d: any) => d.id)
      .attr("title", (d: any) => d.properties.name)
      .style("fill", (d: any) => this.ids.indexOf(d.id) === -1 ? null : "#5a94ff");
  }

  ngOnDestroy(): any {
    if(this.onResizeSub) {
      this.onResizeSub.unsubscribe();
    }
  }
}
