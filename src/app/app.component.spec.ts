import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {configureTestSuite} from 'ng-bullet';
import {createComponentFactory, Spectator} from '@ngneat/spectator/jest';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TestBed default', () => {
  describe('AppComponent', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule
        ],
        declarations: [
          AppComponent
        ],
        schemas: [ NO_ERRORS_SCHEMA ],
      }).compileComponents();
    }));

    it('should create the app', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app).toBeTruthy();
    });

    it(`should have as title 'angular-awesome-hello'`, () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app.title).toEqual('angular-awesome-hello');
    });

    it('should render title', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('.title-app').textContent).toContain('My Angular Store');
    });
  });
});

describe('TestBed plus ng-bullet', () => {
  describe('AppComponent', () => {

    configureTestSuite(() => {
      TestBed.configureTestingModule({
        imports: [
          RouterTestingModule
        ],
        declarations: [
          AppComponent
        ],
        schemas: [ NO_ERRORS_SCHEMA ],
      });
    });

    it('should create the app', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app).toBeTruthy();
    });

    it(`should have as title 'angular-awesome-hello'`, () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;
      expect(app.title).toEqual('angular-awesome-hello');
    });

    it('should render title', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector('.title-app').textContent).toContain('My Angular Store');
    });
  });
});

describe('Spectator', () => {
  describe('AppComponent', () => {

    const createComponent = createComponentFactory({
      component: AppComponent,
      imports: [RouterTestingModule],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [],
      declarations: [],
      entryComponents: [],
      componentProviders: [], // Override the component's providers
      mocks: [], // Providers that will automatically be mocked
      componentMocks: [], // Component providers that will automatically be mocked
      detectChanges: false, // Defaults to true
      // declareComponent: false, // Defaults to true
      // disableAnimations: false, // Defaults to true
      shallow: true, // Defaults to false
    });

    let spectator: Spectator<AppComponent>;

    beforeEach(() => spectator = createComponent());

    it('should create the app', () => {
      const app = spectator.component;
      expect(app).toBeTruthy();
    });

    it(`should have as title 'angular-awesome-hello'`, () => {
      const app = spectator.component;
      expect(app.title).toEqual('angular-awesome-hello');
    });

    it('should render title', () => {
      spectator.detectChanges();
      expect(spectator.query('.title-app').textContent).toContain('My Angular Store');
    });
  });
});
