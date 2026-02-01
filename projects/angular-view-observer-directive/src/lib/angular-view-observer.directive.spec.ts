import { AngularViewObserverDirective } from './angular-view-observer.directive';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {Component, PLATFORM_ID} from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [AngularViewObserverDirective],
  template: `
    <div id="ancestor" class="ancestor">
      <div viewObserver
           [threshold]="threshold"
           [rootMargin]="rootMargin"
           [ancestorSelector]="ancestorSelector"
           (visibleChange)="onVisibleChange($event)">
        Test Content
      </div>
    </div>
  `
})
class TestComponent {
  threshold: number | number[] = 0.1;
  rootMargin = '0px';
  ancestorSelector?: string;
  isVisible = false;
  onVisibleChange(visible: boolean) {
    this.isVisible = visible;
  }
}

describe('AngularViewObserverDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  let capturedCallback: IntersectionObserverCallback;
  let capturedOptions: IntersectionObserverInit | undefined;
  let lastObserverInstance: any;

  beforeEach(async () => {
    capturedOptions = undefined;
    lastObserverInstance = undefined;

    (window as any).IntersectionObserver = class {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        capturedCallback = callback;
        capturedOptions = options;
        lastObserverInstance = this;
      }
      observe = jasmine.createSpy('observe');
      disconnect = jasmine.createSpy('disconnect');
      unobserve = jasmine.createSpy('unobserve');
      takeRecords = jasmine.createSpy('takeRecords');
      root = null;
      rootMargin = '';
      thresholds = [];
    };

    await TestBed.configureTestingModule({
      imports: [TestComponent, AngularViewObserverDirective],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directiveEl = fixture.debugElement.query(By.directive(AngularViewObserverDirective));
    expect(directiveEl).toBeTruthy();
  });

  it('should initialize IntersectionObserver with default options', () => {
    expect(capturedOptions).toBeDefined();
    expect(capturedOptions?.threshold).toBe(0.1);
    expect(capturedOptions?.rootMargin).toBe('0px');
    expect(capturedOptions?.root).toBeNull();
  });

  it('should update IntersectionObserver when inputs change', () => {
    component.threshold = 0.5;
    component.rootMargin = '10px';
    fixture.detectChanges();

    expect(capturedOptions?.threshold).toBe(0.5);
    expect(capturedOptions?.rootMargin).toBe('10px');
  });

  it('should set root when ancestorSelector is provided', () => {
    component.ancestorSelector = '.ancestor';
    fixture.detectChanges();

    const ancestor = fixture.debugElement.query(By.css('.ancestor')).nativeElement;
    expect(capturedOptions?.root).toBe(ancestor);
  });

  it('should emit visibleChange when observer fires', fakeAsync(() => {
    const entry = { isIntersecting: true } as IntersectionObserverEntry;

    capturedCallback([entry], {} as IntersectionObserver);

    tick(11); // Handle debounceTime(11)
    fixture.detectChanges();

    expect(component.isVisible).toBeTrue();

    const entry2 = { isIntersecting: false } as IntersectionObserverEntry;
    capturedCallback([entry2], {} as IntersectionObserver);
    tick(11);
    fixture.detectChanges();

    expect(component.isVisible).toBeFalse();
  }));

  it('should disconnect observer on destroy', () => {
    const disconnectSpy = lastObserverInstance.disconnect;
    fixture.destroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
