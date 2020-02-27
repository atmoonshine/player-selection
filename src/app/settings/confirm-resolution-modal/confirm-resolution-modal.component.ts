import { Component, ElementRef, ViewChild } from '@angular/core';
import { ResolutionService } from '../resolution.service';
import { combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Component({
    selector: 'app-confirm-resolution-modal',
    templateUrl: './confirm-resolution-modal.component.html',
    styleUrls: ['./confirm-resolution-modal.component.scss']
})
export class ConfirmResolutionModalComponent {
    @ViewChild('confirmButton') confirmButton: ElementRef<HTMLButtonElement> | undefined;
    
    titleText$ = combineLatest([this.resolutionService.requestedResolution$, this.resolutionService.selectedResolution$]).pipe(
        map(([requested, selected]) => {
            if (!requested) return '';
            return `Please confirm that the screen has switched from ${selected.split(' x ')[1]}p to ${
                requested.split(' x ')[1]
            }p resolution.`;
        })
    );

    confirmText$ = this.resolutionService.requestedResolution$.pipe(
        map(requested => {
            if (!requested) return '';
            return `The screen is now ${requested.split(' x ')[1]}p.`;
        }),
        tap(() => window.setTimeout(() => this.confirmButton?.nativeElement.focus()))
    );

    constructor(public resolutionService: ResolutionService) {}
}
