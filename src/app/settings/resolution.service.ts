import { Injectable } from '@angular/core';
import { OverlayRef, Overlay } from '@angular/cdk/overlay';
import { ConfirmResolutionModalComponent } from './confirm-resolution-modal/confirm-resolution-modal.component';
import { BehaviorSubject } from 'rxjs';
import { ComponentPortal } from '@angular/cdk/portal';

export type Resolution = '1280 x 720' | '1920 x 1080';

@Injectable({ providedIn: 'root' })
export class ResolutionService {
    private overlayRef: OverlayRef | undefined;

    resolutions = new Array<Resolution>('1280 x 720', '1920 x 1080');

    requestedResolution$ = new BehaviorSubject<Resolution | undefined>(undefined);
    selectedResolution$ = new BehaviorSubject<Resolution>('1920 x 1080');

    constructor(private overlay: Overlay) {
        this.selectedResolution$.next(window.innerHeight > 720 ? '1920 x 1080' : '1280 x 720');
    }

    changeResolution(resolution: Resolution, component: any) {
        if (resolution === this.selectedResolution$.value) return;
        this.requestedResolution$.next(resolution);

        // TODO: send ipc event

        this.overlayRef = this.overlay.create();
        const confirmResolutionPortal = new ComponentPortal(component);
        this.overlayRef.attach(confirmResolutionPortal);
    }

    onResolutionConfirmed(success: boolean) {
        if (!success) {
            // TODO: revert resolution
        } else if (this.requestedResolution$.value) {
            this.selectedResolution$.next(this.requestedResolution$.value);
        }

        this.requestedResolution$.next(undefined);
        this.overlayRef?.detach();
        this.overlayRef?.dispose();

        window.setTimeout(() => {
            document.getElementById('rez' + this.selectedResolution$.value.split(' x ')[1])?.focus();
        })
    }
}
