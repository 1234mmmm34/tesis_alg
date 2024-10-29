import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresosExtraordinariosComponent } from './ingresos-extraordinarios.component';

describe('IngresosExtraordinariosComponent', () => {
  let component: IngresosExtraordinariosComponent;
  let fixture: ComponentFixture<IngresosExtraordinariosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IngresosExtraordinariosComponent]
    });
    fixture = TestBed.createComponent(IngresosExtraordinariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
