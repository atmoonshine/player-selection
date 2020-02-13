import { Component } from '@angular/core';
import { GamepadService } from 'src/gamepad.service';
import { HeaderService } from './header.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(private gamepadService: GamepadService, public headerService: HeaderService) {
        this.gamepadService.initialize();
    }
}
