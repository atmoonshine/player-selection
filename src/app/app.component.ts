import { Component } from '@angular/core';
import { FocusService } from './core/focus.service';
import { GamepadService } from './core/gamepad.service';
import { HeaderService } from './core/header.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(private focusService: FocusService, private gamepadService: GamepadService, public headerService: HeaderService) {
        this.focusService.initialize();
        this.gamepadService.initialize();
    }
}
