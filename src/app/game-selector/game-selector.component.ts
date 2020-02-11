import { Component } from '@angular/core';
import {} from '@angular/common';
import { shareReplay, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { GamesCollection, Game } from 'src/app/models/games-collection';
import { Router } from '@angular/router';
import { IpcService } from '../../ipc.service';
import { newArray } from '@angular/compiler/src/util';

@Component({
    selector: 'app-game-selector',
    templateUrl: './game-selector.component.html',
    styleUrls: ['./game-selector.component.scss']
})
export class GameSelectorComponent {
    games$ = this.http.get<GamesCollection>('assets/games.json').pipe(
        map(collection => collection.games),
        tap(() => window.setTimeout(() => document.getElementsByTagName('a')[0].focus())),
        shareReplay(1)
    );

    constructor(private http: HttpClient, private router: Router, private ipc: IpcService) {}

    onGameClick(game: Game, event?: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        switch (game.command.type) {
          case 'ipc':
              const [ channel ] = game.command.arguments;
              this.ipc.send(channel, game);
              break;
          case 'route':
              const [ route ] = game.command.arguments;
              this.router.navigate([route]);
              break;
          default:

        }
    }

    onGameKeyDown(game: Game, event: KeyboardEvent) {
        if (event.key === 'ArrowRight' && game.platform === 'COINOPS') {
            document.getElementById('Controller Select')?.focus();
            return;
        }

        if (event.key === 'ArrowLeft' && game.platform === 'Controller Select') {
            document.getElementById('COINOPS')?.focus();
            return;
        }
    }
}
