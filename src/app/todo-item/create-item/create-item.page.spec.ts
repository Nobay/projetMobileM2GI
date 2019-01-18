import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateItemPage } from './create-item.page';

describe('CreateItemPage', () => {
  let component: CreateItemPage;
  let fixture: ComponentFixture<CreateItemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateItemPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
