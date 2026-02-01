import {DestroyRef, Directive, effect, ElementRef, inject, input, output, PLATFORM_ID} from '@angular/core';
import {debounceTime, Subject} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {isPlatformBrowser} from "@angular/common";

@Directive({
  selector: '[viewObserver]',
  standalone: true
})
export class AngularViewObserverDirective {

  //#region Injection
  private _el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  //#endregion

  //#region Inputs and Outputs
  public threshold = input<number | number[]>(0.1);
  public rootMargin = input<string>('0px');
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
    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
    });

    this.observer$.asObservable().pipe(
      debounceTime(11),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(entry => {
      this.visibleChange.emit(entry.isIntersecting)
    })

    effect((onCleanup) => {
      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      const selector = this.ancestorSelector();
      const callback = this.observerCallback();
      let observerOptions: IntersectionObserverInit = {
        root: null,
        threshold: this.threshold(),
        rootMargin: this.rootMargin(),
      }
      if (selector) {
        observerOptions.root = this._el.nativeElement.closest(selector);
      }

      const observer = new IntersectionObserver((entries, observer) => {
        this.observer$.next(entries[0]);
        if (callback) {
          callback(entries, observer);
        }
      }, observerOptions);

      observer.observe(this._el.nativeElement);
      this.observer = observer;

      onCleanup(() => {
        observer.disconnect();
      });
    })
  }
  //#endregion
}
