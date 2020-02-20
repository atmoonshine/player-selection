import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { GamepadService } from '../core/gamepad.service';
import { HeaderService } from '../core/header.service';
import { IpcService } from '../core/ipc.service';
import { VirtualKeys } from '../core/virtual-keys';

class Player {
    gamepad: Gamepad | null = null;
    constructor(public playerNumber: number, public key: VirtualKeys, public isReady = false) {}
}

@Component({
    selector: 'app-controller-select',
    templateUrl: './controller-select.component.html',
    styleUrls: ['./controller-select.component.scss'],
    animations: [
        trigger('enterRemoveTrigger', [
            transition(':enter', [
                style({ transform: 'translateY(100px)', opacity: 0 }),
                animate('1s', style({ transform: 'translateY(0)', opacity: 1 }))
            ])
        ])
    ]
})
export class ControllerSelectComponent implements OnDestroy {
    ngOnDestroy$ = new Subject<void>();

    players = new Array<Player>(
        new Player(1, VirtualKeys.A),
        new Player(2, VirtualKeys.B),
        new Player(3, VirtualKeys.X),
        new Player(4, VirtualKeys.Y)
    );

    constructor(
        private gamepadService: GamepadService,
        private headerService: HeaderService,
        private router: Router,
        private ipc: IpcService
    ) {
        this.headerService.showASelect = false;
        this.headerService.showRewindBack = true;

        this.gamepadService.gamepadButtonPressed$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(({ gamepad, button }) => {
            if (button === VirtualKeys.Back) {
                this.router.navigate(['/games']);
                return;
            }
        });
    }

    ngOnDestroy(): void {
        // send change players on page exit
        this.ipc.send('change-players', this.players);
        this.ngOnDestroy$.next();
        this.ngOnDestroy$.complete();
    }

    assignGamepadToPlayer(player: Player, gamepad: Gamepad | null) {
        player.isReady = true;
        player.gamepad = gamepad;

        if (gamepad) console.log(`Player ${player.playerNumber} is connected to gamepad ${gamepad.index}`);
        if (!gamepad) console.log(`Player ${player.playerNumber} is connected to the keyboard`);
    }
}
