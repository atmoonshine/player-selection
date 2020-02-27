import { Component } from '@angular/core';
import { HeaderService } from 'src/app/core/header.service';
import { BehaviorSubject } from 'rxjs';

type Resolution = '1280 x 720' | '1920 x 1080';

@Component({
    selector: 'app-resolution',
    templateUrl: './resolution.component.html',
    styleUrls: ['./resolution.component.scss']
})
export class ResolutionComponent {
    resolutions = new Array<Resolution>('1280 x 720', '1920 x 1080');

    selectedResolution$ = new BehaviorSubject<Resolution>('1920 x 1080');

    constructor(private headerService: HeaderService) {
        this.headerService.showRewindBack = true;
    }
}
