import { Component, OnDestroy, HostListener, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { GamepadService } from '../core/gamepad.service';
import { HeaderService } from '../core/header.service';
import { IpcService } from '../core/ipc.service';
import { VirtualKeys } from '../core/virtual-keys';
import { VirtualKeyService } from '../core/virtual-key.service';
import { FocusService } from '../core/focus.service';

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
    VirtualKeys = VirtualKeys;
    ngOnDestroy$ = new Subject<void>();

    debugMessage = '';

    players = new Array<Player>(
        new Player(1, VirtualKeys.A),
        new Player(2, VirtualKeys.B),
        new Player(3, VirtualKeys.X),
        new Player(4, VirtualKeys.Y)
    );

    constructor(
        private keyService: VirtualKeyService,
        private gamepadService: GamepadService,
        private headerService: HeaderService,
        private ipc: IpcService,
        private focusService: FocusService
    ) {
        this.headerService.showASelect = false;
        this.headerService.showRewindBack = true;

        this.focusService.closeRequested$.pipe(takeUntil(this.ngOnDestroy$)).subscribe(() => {
            this.ipc.off('UpdateControllerMap', this.onControllerUpdate);
            this.ipc.send('CloseToReassignControllerAndExit');
        });

        this.ipc.on('UpdateControllerMap', this.onControllerUpdate);
        this.ipc.send('StartToReassignController');
    }

    // @HostListener('window:keydown', ['$event'])
    // onKeyDown(event: KeyboardEvent) {
    //     const key = this.keyService.eventToVirtualKey(event);
    //     const validKeys = [VirtualKeys.A, VirtualKeys.B, VirtualKeys.X, VirtualKeys.Y];
    //     if (!validKeys.includes(key)) return;
    //     const player = this.players.find(p => p.key === key);

    //     // here we're faking a controller, so that people with a keyboard can use the app

    //     // don't let the keyboard bind to more than one user
    //     if (this.players.some(p => p.isReady && !p.gamepad)) return;

    //     if (player) this.assignGamepadToPlayer(player, null);
    // }

    onControllerUpdate = (event: any, message: string) => {
        // [session:user:slot] => [0:0:1]
        this.ipc.send('log', `UI received ${message}`);
        this.debugMessage = message;

        const match = message.match(/\[(\d+):(\d+):(\d+)\]/);
        if (match && match.length === 4) {
            const [_, session, user, slot] = match;
            const userIndex = parseInt(user, 10);
            const playerIndex = parseInt(slot, 10);
            const updatePlayer = this.players[playerIndex];
            this.ipc.send('log', `UI userIndex=${userIndex} playerIndex=${playerIndex}`);
            if (updatePlayer) {
                const logMessage = `Player ${userIndex + 1} is now player ${playerIndex + 1}`;
                updatePlayer.isReady = true;
                this.debugMessage = logMessage;
                this.ipc.send('log', `UI message ${logMessage}`);
            }
        }
    };

    ngOnDestroy(): void {
        this.ngOnDestroy$.next();
        this.ngOnDestroy$.complete();
    }

    // assignGamepadToPlayer(player: Player, gamepad: Gamepad | null) {
    //     player.isReady = true;
    //     player.gamepad = gamepad;

    //     if (gamepad) console.log(`Player ${player.playerNumber} is connected to gamepad ${gamepad.index}`);
    //     if (!gamepad) console.log(`Player ${player.playerNumber} is connected to the keyboard`);
    // }
}
