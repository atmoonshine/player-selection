import { Component, OnDestroy } from '@angular/core';
import {} from '@angular/common';
import { shareReplay, map, tap, finalize, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { GamesCollection, Game } from 'src/app/models/games-collection';
import { Router } from '@angular/router';
import { IpcService } from '../../ipc.service';
import { HeaderService } from '../header.service';
import { trigger, style, transition, animate } from '@angular/animations';
import { GamepadService, XboxButtons } from 'src/gamepad.service';
import { Subject } from 'rxjs';

declare global {
    interface Window {
        SpatialNavigation: any;
    }
}

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
                tap(({ gamepad, button }) => {
                    switch (button) {
                        case XboxButtons.GamepadUp:
                            window.SpatialNavigation.move('up');
                            break;
                        case XboxButtons.GamepadDown:
                            window.SpatialNavigation.move('down');
                            break;
                        case XboxButtons.GamepadLeft:
                            window.SpatialNavigation.move('left');
                            break;
                        case XboxButtons.GamepadRight:
                            window.SpatialNavigation.move('right');
                            break;
                    }
                })
            )
            .subscribe();
    }

    animationComplete() {
        window.SpatialNavigation.init();
        window.SpatialNavigation.add({
            selector: 'a'
        });
        window.SpatialNavigation.makeFocusable();
        window.SpatialNavigation.focus();
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
        window.SpatialNavigation.uninit();
        this.ngOnDestroy$.next();
        this.ngOnDestroy$.complete();
    }
}
