import {Component, OnDestroy, OnInit} from "@angular/core";
import {Location} from "@angular/common";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import Feature = GeoJSON.Feature;
import {ActivatedRoute, Params} from "@angular/router";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'app-main',
  template: `
    <h4 i18n>
      {ids.length, plural,
        =0 {You have not selected any country yet.}
        =1 {You have selected the following country: }
        other {You have selected the following countries: }
      }
      <span class="country" *ngFor="let country of getCountries(ids)" >{{country}}</span>
      <button *ngIf="ids.length" (click)="ids = []; updateUrl()" i18n>Clear</button>
    </h4>
    <app-map [features]="features" [ids]="ids" (onCountryClick)="updateUrl($event)"></app-map>
  `,
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  ids: string[] = [];
  features: Feature<any>[];
  countries: Country[];
  routeParamsSub: Subscription;

  constructor(private route: ActivatedRoute, private location: Location) {
    // map data, copied from node_modules/world-atlas/world
    d3.json('assets/50m.json', (err1: any, worldData: any) => {
      d3.tsv('assets/50m.tsv', (err2: any, countryData: any) => {
        this.countries = countryData as Country[];
        this.features = topojson.feature(worldData, worldData.objects.countries).features;
        this.features.forEach((d: Feature<any>) => {
          d.properties['name'] = this.countries.filter((c: Country) => d.id === c.iso_n3)[0].name;
        });
      });
    });
  }

  ngOnInit() {
    this.routeParamsSub = this.route.params
      .subscribe((params: Params) => {
        if(params['id']) {
          this.ids = params['id'].split('-');
        }
      });
  }

  updateUrl(id?: string) {
    if(id) {
      const idPos = this.ids.indexOf(id);
      if(idPos === -1) {
        this.ids.push(id);
      } else {
        this.ids.splice(idPos, 1);
      }
    }
    this.location.replaceState(`/${this.ids.join('-')}`);
  }

  getCountries(ids: string[]): string[] {
    return this.countries ? this.countries.filter((c: Country) => ids.indexOf(c.iso_n3) !== -1)
      .map((c: Country) => c.name)
      .sort() : [];
  }

  ngOnDestroy(): any {
    if(this.routeParamsSub) {
      this.routeParamsSub.unsubscribe();
    }
  }
}

export interface Country {
  scalerank: string;
  featurecla: string;
  labelrank: string;
  sovereignt: string;
  sov_a3: string;
  adm0_dif: string;
  level: string;
  type: string;
  admin: string;
  adm0_a3: string;
  geou_dif: string;
  geounit: string;
  gu_a3: string;
  su_dif: string;
  subunit: string;
  su_a3: string;
  brk_diff: string;
  name: string;
  name_long: string;
  brk_a3: string;
  brk_name: string;
  brk_group: string;
  abbrev: string;
  postal: string;
  formal_en: string;
  formal_fr: string;
  note_adm0: string;
  note_brk: string;
  name_sort: string;
  name_alt: string;
  mapcolor7: string;
  mapcolor8: string;
  mapcolor9: string;
  mapcolor13: string;
  pop_est: string;
  gdp_md_est: string;
  pop_year: string;
  lastcensus: string;
  gdp_year: string;
  economy: string;
  income_grp: string;
  wikipedia: string;
  fips_10: string;
  iso_a2: string;
  iso_a3: string;
  iso_n3: string;
  un_a3: string;
  wb_a2: string;
  wb_a3: string;
  woe_id: string;
  adm0_a3_is: string;
  adm0_a3_us: string;
  adm0_a3_un: string;
  adm0_a3_wb: string;
  continent: string;
  region_un: string;
  subregion: string;
  region_wb: string;
  name_len: string;
  long_len: string;
  abbrev_len: string;
  tiny: string;
  homepart: string;
}
