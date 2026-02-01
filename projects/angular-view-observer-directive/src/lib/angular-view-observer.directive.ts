import {DestroyRef, Directive, effect, ElementRef, inject, input, output} from '@angular/core';
import {debounceTime, Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Directive({
  selector: '[viewObserver]',
  standalone: true
})
export class AngularViewObserverDirective {

  //#region Injection
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);
  //#endregion

  //#region Inputs and Outputs
  public threshold = input<number>(0.1);
  public ancestorSelector = input<string>();
  public observerCallback = input<Function>();

  public visibleChange = output<boolean>();
  //#endregion

  //#region Properties
  private observer: IntersectionObserver | undefined;
  private observer$ = new Subject<IntersectionObserverEntry>();
  //#endregion

  //#region Constructor
  constructor() {
    this.observer$.asObservable().pipe(
      debounceTime(11),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(entry => {
      this.visibleChange.emit(entry.isIntersecting)
    })

    effect(() => {
      const selector = this.ancestorSelector();
      const callback = this.observerCallback();
      let observerOptions: IntersectionObserverInit = {
        root: null,
        threshold: this.threshold(),
        rootMargin: '0px',
      }
      if (selector) {
        observerOptions.root = this._el.nativeElement.closest(selector);
      }

      this.observer?.disconnect();

      this.observer = new IntersectionObserver((entries, observer) => {
        this.observer$.next(entries[0]);
        if (callback) {
          callback(entries, observer);
        }
      }, observerOptions);

      this.observer.observe(this._el.nativeElement);
    })
  }
  //#endregion
}
