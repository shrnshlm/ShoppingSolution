import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignalsHttp } from './signals-http';

describe('SignalsHttp', () => {
  let component: SignalsHttp;
  let fixture: ComponentFixture<SignalsHttp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalsHttp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignalsHttp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
