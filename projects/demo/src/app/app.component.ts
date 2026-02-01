import {Component} from '@angular/core';
import {AngularViewObserverDirective} from "angular-view-observer-directive";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AngularViewObserverDirective
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public handleVisibilityChange(isVisible: boolean): void {
    console.log('Element is visible:', isVisible);
  }
}
