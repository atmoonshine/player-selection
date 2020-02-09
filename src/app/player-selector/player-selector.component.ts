import { Component, HostListener } from '@angular/core';
import { GamepadService, XboxButtons } from 'src/gamepad.service';

class Player {
    gamepad: Gamepad | null = null;
    constructor(public playerNumber: number, public key: XboxButtons, public isReady = false) {}
}

@Component({
    selector: 'app-player-selector',
    templateUrl: './player-selector.component.html',
    styleUrls: ['./player-selector.component.scss']
})
export class PlayerSelectorComponent {
    players = new Array<Player>(
        new Player(1, XboxButtons.GamepadA),
        new Player(2, XboxButtons.GamepadB),
        new Player(3, XboxButtons.GamepadX),
        new Player(4, XboxButtons.GamepadY)
    );

    constructor(private gamepadService: GamepadService) {
        this.gamepadService.gamepadButtonPressed$.subscribe(({ gamepad, button }) => {
            if (this.players.some(p => p.gamepad && p.gamepad.index === gamepad.index)) return;
            const player = this.players.find(p => p.key === button);
            if (player) this.assignGamepadToPlayer(player, gamepad);
        });
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        let xboxButton = XboxButtons.Unknown;

        switch (event.key.toLowerCase()) {
            case 'a':
                xboxButton = XboxButtons.GamepadA;
                break;
            case 'b':
                xboxButton = XboxButtons.GamepadB;
                break;
            case 'x':
                xboxButton = XboxButtons.GamepadX;
                break;
            case 'y':
                xboxButton = XboxButtons.GamepadY;
                break;
        }

        if (xboxButton === XboxButtons.Unknown) return;
        const player = this.players.find(p => p.key === xboxButton);

        // here we're faking a controller, so that people with a keyboard can use the app

        // don't let the keyboard bind to more than one user
        if (this.players.some(p => p.isReady && !p.gamepad)) return;

        if (player) this.assignGamepadToPlayer(player, null);
    }

    assignGamepadToPlayer(player: Player, gamepad: Gamepad | null) {
        player.isReady = true;
        player.gamepad = gamepad;

        if (gamepad) console.log(`Player ${player.playerNumber} is connected to gamepad ${gamepad.index}`);
        if (!gamepad) console.log(`Player ${player.playerNumber} is connected to the keyboard`);
    }
}
