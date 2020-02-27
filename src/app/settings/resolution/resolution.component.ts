import { Component } from '@angular/core';
import { HeaderService } from 'src/app/core/header.service';
import { ResolutionService, Resolution } from '../resolution.service';
import { ConfirmResolutionModalComponent } from '../confirm-resolution-modal/confirm-resolution-modal.component';

@Component({
    selector: 'app-resolution',
    templateUrl: './resolution.component.html',
    styleUrls: ['./resolution.component.scss']
})
export class ResolutionComponent {
    constructor(private headerService: HeaderService, public resolutionService: ResolutionService) {
        this.headerService.showRewindBack = true;
        this.headerService.showASelect = false;
    }

    open(resolution: Resolution) {
        this.resolutionService.changeResolution(resolution, ConfirmResolutionModalComponent);
    }
}
