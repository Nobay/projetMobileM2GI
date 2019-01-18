import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoItemPage } from './todo-item.page';

describe('TodoItemPage', () => {
  let component: TodoItemPage;
  let fixture: ComponentFixture<TodoItemPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TodoItemPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TodoItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
