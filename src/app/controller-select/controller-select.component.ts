import { Component, HostListener, OnDestroy } from '@angular/core';
import { GamepadService, XboxButtons } from 'src/gamepad.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { IpcService } from 'src/ipc.service';

class Player {
    gamepad: Gamepad | null = null;
    constructor(public playerNumber: number, public key: XboxButtons, public isReady = false) {}
}

@Component({
    selector: 'app-controller-select',
    templateUrl: './controller-select.component.html',
    styleUrls: ['./controller-select.component.scss']
})
export class ControllerSelectComponent implements OnDestroy {

  ngOnDestroy$ = new Subject<void>();

    players = new Array<Player>(
        new Player(1, XboxButtons.GamepadA),
        new Player(2, XboxButtons.GamepadB),
        new Player(3, XboxButtons.GamepadX),
        new Player(4, XboxButtons.GamepadY)
    );

    constructor(private gamepadService: GamepadService, private router: Router, private ipc: IpcService) {

        this.gamepadService.gamepadButtonPressed$.pipe(
          takeUntil(this.ngOnDestroy$)
          ).subscribe(({ gamepad, button }) => {
            if (button === XboxButtons.GamepadRewind) {

              this.router.navigate(['/games']);
              return;
            }


            if (this.players.some(p => p.gamepad && p.gamepad.index === gamepad.index)) return;
            const player = this.players.find(p => p.key === button);
            if (player) this.assignGamepadToPlayer(player, gamepad);
        });
    }

    ngOnDestroy(): void {
      this.ipc.send('change-players', this.players);
      this.ngOnDestroy$.next();
      this.ngOnDestroy$.complete();
    }

    // @HostListener('window:keydown', ['$event'])
    // onKeyDown(event: KeyboardEvent) {
    //     let xboxButton = XboxButtons.Unknown;

    //     switch (event.key.toLowerCase()) {
    //         case 'a':
    //             xboxButton = XboxButtons.GamepadA;
    //             break;
    //         case 'b':
    //             xboxButton = XboxButtons.GamepadB;
    //             break;
    //         case 'x':
    //             xboxButton = XboxButtons.GamepadX;
    //             break;
    //         case 'y':
    //             xboxButton = XboxButtons.GamepadY;
    //             break;
    //     }

    //     if (xboxButton === XboxButtons.Unknown) return;
    //     const player = this.players.find(p => p.key === xboxButton);

    //     // here we're faking a controller, so that people with a keyboard can use the app

    //     // don't let the keyboard bind to more than one user
    //     if (this.players.some(p => p.isReady && !p.gamepad)) return;

    //     if (player) this.assignGamepadToPlayer(player, null);
    // }

    assignGamepadToPlayer(player: Player, gamepad: Gamepad | null) {
        player.isReady = true;
        player.gamepad = gamepad;

        if (gamepad) console.log(`Player ${player.playerNumber} is connected to gamepad ${gamepad.index}`);
        if (!gamepad) console.log(`Player ${player.playerNumber} is connected to the keyboard`);
    }
}
