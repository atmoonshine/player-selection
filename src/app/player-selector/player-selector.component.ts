import { Component, HostListener } from '@angular/core';

class Player {
    constructor(public playerNumber: number, public key: string, public color: string, public isPrimary = false, public isReady = false) {}
}

@Component({
    selector: 'app-player-selector',
    templateUrl: './player-selector.component.html',
    styleUrls: ['./player-selector.component.scss']
})
export class PlayerSelectorComponent {
    players = new Array<Player>(
        new Player(1, 'A', 'yellow', true),
        new Player(2, 'B', 'blue'),
        new Player(3, 'X', 'green'),
        new Player(4, 'Y', 'red')
    );

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
        const player = this.players.find(p => p.key.toLowerCase() === event.key.toLowerCase());

        if (player) this.onClick(player);
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        const player = this.players.find(p => p.key.toLowerCase() === event.key.toLowerCase());

        if (player) document.getElementsByClassName(player.color)[0].classList.add('is-pushed');
    }

    onClick(player: Player) {
        document.getElementsByClassName(player.color)[0].classList.remove('is-pushed');
        player.isReady = true;
    }
}
