import { Component } from '@angular/core';
import { GamepadService } from 'src/gamepad.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(private gamepadService: GamepadService) {
        this.gamepadService.initialize();
    }
}
