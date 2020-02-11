import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, fromEvent, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

export declare const enum XboxButtons {
    Unknown = -1,
    GamepadA = 0,
    GamepadB = 1,
    GamepadX = 2,
    GamepadY = 3,
    GamepadRewind = 8,
}

@Injectable({ providedIn: 'root' })
export class GamepadService {
    private scanTimer$ = interval(100).pipe(
        tap(() => {
            const gamepads = navigator.getGamepads();

            for (const gamepad of gamepads) {
                if (!gamepad) return;

                for (const entry of Object.entries(gamepad.buttons)) {
                    if (entry[1].pressed) {
                        this.gamepadButtonPressedSubject$.next({ gamepad, button: parseInt(entry[0], 10)});
                    }
                }
            }
        })
    );

    private gamepadButtonPressedSubject$ = new Subject<{ gamepad: Gamepad, button: XboxButtons}>();
    gamepadButtonPressed$ = this.gamepadButtonPressedSubject$.asObservable();

    initialize() {
        this.scanTimer$.subscribe();
    }
}
