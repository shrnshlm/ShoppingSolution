import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalsAdvanced } from './signals-advanced';

describe('SignalsAdvanced', () => {
  let component: SignalsAdvanced;
  let fixture: ComponentFixture<SignalsAdvanced>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalsAdvanced]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalsAdvanced);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
