import { Injectable } from '@angular/core';
import { interval, Subject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { VirtualKeys } from './virtual-keys';
import { VirtualKeyService } from './virtual-key.service';

import { NgZone } from '@angular/core';

function enterZone(zone: NgZone) {
    return <T>(source: Observable<T>) =>
        new Observable<T>(observer =>
            source.subscribe({
                next: x => zone.run(() => observer.next(x)),
                error: err => observer.error(err),
                complete: () => observer.complete()
            })
        );
}

@Injectable({ providedIn: 'root' })
export class GamepadService {
    private readonly minAxisChange = 0.5;

    private scanTimer$ = interval(100).pipe(
        tap(() => {
            const gamepads = navigator.getGamepads();

            for (const gamepad of gamepads) {
                if (!gamepad) return;

                for (const entry of Object.entries(gamepad.buttons)) {
                    if (entry[1].pressed) {
                        this.gamepadButtonPressedSubject$.next({
                            gamepad,
                            button: this.keyService.xboxButtonToVirtualKey(parseInt(entry[0], 10))
                        });

                        return;
                    }
                }

                // if no buttons pressed, see if the axes have moved, to simplify lets just find the absolute max
                let maxEntry: [string, number] | undefined;
                let currentMax = 0;

                for (const entry of Object.entries(gamepad.axes)) {
                    const abs = Math.abs(entry[1]);

                    if (abs > this.minAxisChange && abs > currentMax) {
                        maxEntry = entry;
                        currentMax = abs;
                    }
                }

                if (!maxEntry) return;

                const [axis, value] = maxEntry;

                // 0: left thumbstick x
                // 1: left thumbstick y
                // 2: right thumbstick x
                // 3: right thumbstick y

                if (axis === '0' || axis === '2') {
                    if (value < -this.minAxisChange) {
                        this.gamepadButtonPressedSubject$.next({ gamepad, button: VirtualKeys.Left });
                        return;
                    }
                    if (value > this.minAxisChange) {
                        this.gamepadButtonPressedSubject$.next({ gamepad, button: VirtualKeys.Right });
                        return;
                    }
                } else if (axis === '1' || axis === '3') {
                    if (value < -this.minAxisChange) {
                        this.gamepadButtonPressedSubject$.next({ gamepad, button: VirtualKeys.Up });
                        return;
                    }
                    if (value > this.minAxisChange) {
                        this.gamepadButtonPressedSubject$.next({ gamepad, button: VirtualKeys.Down });
                        return;
                    }
                }
            }
        })
    );

    private gamepadButtonPressedSubject$ = new Subject<{ gamepad: Gamepad; button: VirtualKeys }>();
    gamepadButtonPressed$ = this.gamepadButtonPressedSubject$.asObservable().pipe(enterZone(this.zone));

    constructor(private keyService: VirtualKeyService, private zone: NgZone) {}

    initialize() {
        this.scanTimer$.subscribe();
    }
}
