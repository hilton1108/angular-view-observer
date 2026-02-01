# AngularViewObserverDirective

A powerful and lightweight Angular directive for detecting element visibility using the Intersection Observer API. Built with Angular 17+ and standalone support.

## Features

- ✅ **Intersection Observer API** - Efficiently detect when elements enter or leave the viewport
- ✅ **Standalone Directive** - Works seamlessly with Angular's new standalone API
- ✅ **Debounced Events** - Built-in debouncing to prevent excessive event emissions
- ✅ **Custom Root Element** - Observe visibility relative to any ancestor element
- ✅ **Custom Callbacks** - Execute custom logic when elements become visible/hidden
- ✅ **Configurable Threshold** - Set custom visibility thresholds
- ✅ **TypeScript Support** - Fully typed with excellent IDE support
- ✅ **Lightweight** - Minimal dependencies, optimized for production

## Requirements

- **Angular**: >= 17.0.0
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 or **yarn** >= 1.22.0

## Installation

```bash
npm install angular-view-observer-directive
```

or with yarn:

```bash
yarn add angular-view-observer-directive
```

## Quick Start

### 1. Import the Directive

The directive is standalone, so you can import it directly in your component:

```typescript
import { Component } from '@angular/core';
import { AngularViewObserverDirective } from 'angular-view-observer-directive';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [AngularViewObserverDirective],
  template: `
    <div viewObserver (visibleChange)="onVisibilityChange($event)">
      I am visible when this div enters the viewport!
    </div>
  `
})
export class ExampleComponent {
  onVisibilityChange(isVisible: boolean) {
    console.log('Element is visible:', isVisible);
  }
}
```

### 2. Use in Traditional Modules

For non-standalone components, import the directive in your module:

```typescript
import { NgModule } from '@angular/core';
import { AngularViewObserverDirective } from 'angular-view-observer-directive';

@NgModule({
  imports: [AngularViewObserverDirective],
  // ... your other imports
})
export class YourModule { }
```

## Usage Examples

### Basic Visibility Detection

```typescript
@Component({
  selector: 'app-lazy-load',
  standalone: true,
  imports: [AngularViewObserverDirective],
  template: `
    <img 
      viewObserver 
      (visibleChange)="onImageVisible($event)"
      [src]="imageUrl" 
      alt="Lazy loaded image"
    />
  `
})
export class LazyLoadComponent {
  imageUrl = '';

  onImageVisible(isVisible: boolean) {
    if (isVisible) {
      this.imageUrl = 'https://example.com/image.jpg';
    }
  }
}
```

### Custom Threshold

Track visibility with a custom threshold (0 = element must be fully visible, 1 = any part visible):

```typescript
<div 
  viewObserver 
  [threshold]="0.5"
  (visibleChange)="onVisibilityChange($event)"
>
  Content here
</div>
```

### Observe Relative to Ancestor

Observe element visibility relative to a specific scrollable ancestor:

```typescript
<div class="scrollable-container" style="overflow-y: auto; height: 500px;">
  <div 
    viewObserver 
    ancestorSelector=".scrollable-container"
    (visibleChange)="onVisibilityChange($event)"
  >
    Element visibility in scrollable container
  </div>
</div>
```

### Custom Observer Callback

Execute custom logic with full access to IntersectionObserverEntry:

```typescript
@Component({
  selector: 'app-advanced',
  standalone: true,
  imports: [AngularViewObserverDirective],
  template: `
    <div 
      viewObserver 
      [observerCallback]="customCallback"
      (visibleChange)="onVisibilityChange($event)"
    >
      Advanced observation
    </div>
  `
})
export class AdvancedComponent {
  customCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach(entry => {
      console.log('Intersection Ratio:', entry.intersectionRatio);
      console.log('Bounding Client Rect:', entry.boundingClientRect);
    });
  };

  onVisibilityChange(isVisible: boolean) {
    console.log('Visibility changed:', isVisible);
  }
}
```

### Complex Example: Infinite Scroll

```typescript
@Component({
  selector: 'app-infinite-scroll',
  standalone: true,
  imports: [CommonModule, AngularViewObserverDirective],
  template: `
    <div class="items-list">
      <div *ngFor="let item of items">{{ item.name }}</div>
    </div>
    <div 
      viewObserver 
      (visibleChange)="onLoadMoreVisible($event)"
      class="load-more-trigger"
    >
      Load more...
    </div>
  `
})
export class InfiniteScrollComponent implements OnInit {
  items: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadItems();
  }

  onLoadMoreVisible(isVisible: boolean) {
    if (isVisible) {
      this.loadItems();
    }
  }

  private loadItems() {
    this.apiService.getItems().subscribe(newItems => {
      this.items = [...this.items, ...newItems];
    });
  }
}
```

## API Reference

### Directive: `viewObserver`

#### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `threshold` | `number` | `0.1` | Visibility threshold (0-1). Determines what percentage of the element must be visible. |
| `ancestorSelector` | `string` | `undefined` | CSS selector for the scrollable ancestor element to use as the observation root. |
| `observerCallback` | `Function` | `undefined` | Custom callback function executed when visibility changes. Receives `(entries, observer)`. |

#### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `visibleChange` | `boolean` | Emitted when the element's visibility state changes. Debounced by 11ms. |

## Performance Considerations

- **Debouncing**: The directive debounces visibility events by 11ms to prevent excessive change detection cycles
- **Automatic Cleanup**: The directive automatically disconnects the IntersectionObserver when the component is destroyed
- **No Memory Leaks**: Uses Angular's `DestroyRef` and `takeUntilDestroyed` for proper cleanup

## Browser Support

Works with all modern browsers that support the [Intersection Observer API](https://caniuse.com/intersection-observer):

- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 15+

For older browsers, consider using a [polyfill](https://github.com/w3c/IntersectionObserver/tree/main/polyfill).

## Development

### Build

Build the library:

```bash
ng build angular-view-observer-directive
```

The build artifacts will be stored in the `dist/angular-view-observer-directive/` directory.

### Running Unit Tests

Execute the unit test suite via Karma:

```bash
ng test angular-view-observer-directive
```

### Running Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This library is open source and available under the MIT License.

## Changelog

### Version 1.0.0
- Initial release
- Standalone directive support
- Angular 17+ compatibility

## Further Resources

- [Angular Documentation](https://angular.io)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Angular CLI Overview](https://angular.io/cli)

