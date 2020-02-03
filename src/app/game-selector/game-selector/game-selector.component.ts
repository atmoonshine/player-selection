import { Component } from '@angular/core';
import {} from '@angular/common';
import { shareReplay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { GamesCollection } from 'src/app/models/games-collection';

@Component({
    selector: 'app-game-selector',
    templateUrl: './game-selector.component.html',
    styleUrls: ['./game-selector.component.scss']
})
export class GameSelectorComponent {
    games$ = this.http.get<GamesCollection>('assets/games.json').pipe(
        map(collection => collection.games),
        shareReplay(1)
    );

    constructor(private http: HttpClient) {}
}
