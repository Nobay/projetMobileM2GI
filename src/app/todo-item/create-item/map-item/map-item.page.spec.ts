import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapItemPage } from './map-item.page';

describe('MapItemPage', () => {
  let component: MapItemPage;
  let fixture: ComponentFixture<MapItemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapItemPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
