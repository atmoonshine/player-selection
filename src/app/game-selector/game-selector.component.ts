import { Component, OnDestroy } from '@angular/core';
import {} from '@angular/common';
import { shareReplay, map, tap, takeUntil, skip, skipUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { trigger, style, transition, animate } from '@angular/animations';
import { Subject, timer } from 'rxjs';
import { GamesCollection, Game } from '../shared/models/games-collection';
import { IpcService } from '../core/ipc.service';
import { GamepadService } from '../core/gamepad.service';
import { HeaderService } from '../core/header.service';
import { VirtualKeys } from '../core/virtual-keys';

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
export class GameSelectorComponent implements OnDestroy {
    ngOnDestroy$ = new Subject<void>();

    games$ = this.http.get<GamesCollection>('assets/games.json').pipe(
        map(collection => collection.games),
        shareReplay(1)
    );

    constructor(
        private http: HttpClient,
        private router: Router,
        private ipc: IpcService,
        private gamepadService: GamepadService,
        private headerService: HeaderService
    ) {
        this.headerService.showASelect = true;
        this.headerService.showRewindBack = false;

        this.gamepadService.gamepadButtonPressed$
            .pipe(
                takeUntil(this.ngOnDestroy$),
                skipUntil(timer(2000)), // skip to avoid the button A from page transition
                tap(({ gamepad, button }) => {
                    switch (button) {
                        case VirtualKeys.A:
                            const anchor = document.activeElement as HTMLElement;
                            if (anchor && anchor.click) {
                                anchor.click();
                            }
                            break;
                    }
                })
            )
            .subscribe();
    }

    onGameClick(game: Game, event?: Event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        switch (game.command.type) {
            case 'ipc':
                const [channel] = game.command.arguments;
                this.ipc.send(channel, game);
                break;
            case 'route':
                const [route] = game.command.arguments;
                this.router.navigate([route]);
                break;
            default:
        }
    }

    ngOnDestroy() {
        this.ngOnDestroy$.next();
        this.ngOnDestroy$.complete();
    }
}
