import { Component } from '@angular/core';
import {} from '@angular/common';
import { shareReplay, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { GamesCollection, Game } from 'src/app/models/games-collection';
import { Router } from '@angular/router';
import { HeaderService } from '../header.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-game-selector',
    templateUrl: './game-selector.component.html',
    styleUrls: ['./game-selector.component.scss'],
    animations: [
        trigger('enterRemoveTrigger', [
            transition(':enter', [
                style({ transform: 'translateY(100px)', opacity: 0 }),
                animate('1s', style({ transform: 'translateY(0)', opacity: 1 }))
            ])
        ])
    ]
})
export class GameSelectorComponent {
    games$ = this.http.get<GamesCollection>('assets/games.json').pipe(
        map(collection => collection.games),
        tap(() => window.setTimeout(() => document.getElementsByTagName('a')[0].focus())),
        shareReplay(1)
    );

    constructor(private http: HttpClient, private router: Router, private headerService: HeaderService) {
        this.headerService.showASelect = true;
        this.headerService.showRewindBack = false;
    }

    onGameClick(game: Game, event?: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (game.platform === 'COINOPS') {
            // TODO: Launch Coinops
            location.href = 'ms-calculator://';
        } else if (game.platform === 'Controller Select') {
            this.router.navigate(['/controller-select']);
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
