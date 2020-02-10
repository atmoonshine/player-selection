import { Component } from '@angular/core';
import {} from '@angular/common';
import { shareReplay, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { GamesCollection, Game } from 'src/app/models/games-collection';
import { Router } from '@angular/router';

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

    constructor(private http: HttpClient, private router: Router) {}

    onGameClick(game: Game, event?: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (game.platform === 'COINOPS') {
            // TODO: Launch Coinops
        } else if (game.platform === 'Controller Select') {
            this.router.navigate(['/controller-select']);
        }
    }
}
