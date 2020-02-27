import { Injectable } from '@angular/core';
import { VirtualKeyService } from './virtual-key.service';

import { fromEvent, EMPTY, BehaviorSubject, interval, merge, Subject } from 'rxjs';
import { tap, catchError, withLatestFrom, filter, map, pluck } from 'rxjs/operators';
import { Focusable } from '../shared/focusable.directive';
import { GamepadService } from './gamepad.service';
import { VirtualKeys } from './virtual-keys';

interface Line {
    start: Point;
    end: Point;
}

interface Point {
    x: number;
    y: number;
}

interface SlopeIntercepts {
    lo: number;
    hi: number;
}

export class Frustum {
    nearLine: Line = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
    farLine: Line = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };

    constructor(public direction: VirtualKeys, private currentCR: ClientRect) {
        const containerCR = {
            left: currentCR.left - window.innerWidth,
            right: currentCR.right + window.innerWidth,
            top: currentCR.top - window.innerHeight,
            bottom: currentCR.bottom + window.innerHeight,
            width: currentCR.width + 2 * window.innerWidth,
            height: currentCR.height + 2 * window.innerHeight
        } as ClientRect;

        switch (direction) {
            case VirtualKeys.Up:
                this.nearLine = { start: { x: currentCR.left, y: currentCR.top }, end: { x: currentCR.right, y: currentCR.top } };
                this.farLine = {
                    start: { x: 0.5 * (currentCR.top - containerCR.top) + currentCR.right, y: containerCR.top },
                    end: { x: -0.5 * (currentCR.top - containerCR.top) + currentCR.left, y: containerCR.top }
                };
                break;
            case VirtualKeys.Right:
                this.nearLine = { start: { x: currentCR.right, y: currentCR.top }, end: { x: currentCR.right, y: currentCR.bottom } };
                this.farLine = {
                    start: { x: containerCR.right, y: 0.5 * (containerCR.right - currentCR.right) + currentCR.bottom },
                    end: { x: containerCR.right, y: -0.5 * (containerCR.right - currentCR.right) + currentCR.top }
                };
                break;
            case VirtualKeys.Down:
                this.nearLine = { start: { x: currentCR.right, y: currentCR.bottom }, end: { x: currentCR.left, y: currentCR.bottom } };
                this.farLine = {
                    start: { x: -0.5 * (containerCR.bottom - currentCR.bottom) + currentCR.left, y: containerCR.bottom },
                    end: { x: 0.5 * (containerCR.bottom - currentCR.bottom) + currentCR.right, y: containerCR.bottom }
                };
                break;
            case VirtualKeys.Left:
                this.nearLine = { start: { x: currentCR.left, y: currentCR.bottom }, end: { x: currentCR.left, y: currentCR.top } };
                this.farLine = {
                    start: { x: containerCR.left, y: -0.5 * (currentCR.left - containerCR.left) + currentCR.top },
                    end: { x: containerCR.left, y: 0.5 * (currentCR.left - containerCR.left) + currentCR.bottom }
                };
                break;
        }
    }

    private getSlopIntercepts(dist: number, lo: number, hi: number): SlopeIntercepts {
        // the value here can be tweaked to allow "angled" movements
        return { lo: -dist / 0.05 + lo, hi: dist / 0.05 + hi } as SlopeIntercepts;
    }

    public isInFrustum(candidateCR: ClientRect): boolean {
        switch (this.direction) {
            case VirtualKeys.Right:
                if (candidateCR.left >= this.currentCR.right) {
                    const dist = candidateCR.left - this.currentCR.right;
                    const points = this.getSlopIntercepts(dist, this.currentCR.top, this.currentCR.bottom);
                    if (candidateCR.top >= points.lo && candidateCR.top <= points.hi) return true;
                    if (candidateCR.bottom >= points.lo && candidateCR.bottom <= points.hi) return true;
                    if (candidateCR.top < points.lo && candidateCR.bottom > points.hi) return true;
                }
                return false;
            case VirtualKeys.Left:
                if (candidateCR.right <= this.currentCR.left) {
                    const dist = candidateCR.right - this.currentCR.left;
                    const points = this.getSlopIntercepts(dist, this.currentCR.top, this.currentCR.bottom);
                    if (candidateCR.top >= points.lo && candidateCR.top <= points.hi) return true;
                    if (candidateCR.bottom >= points.lo && candidateCR.bottom <= points.hi) return true;
                    if (candidateCR.top < points.lo && candidateCR.bottom > points.hi) return true;
                }
                return false;
            case VirtualKeys.Up:
                if (candidateCR.bottom <= this.currentCR.top) {
                    const dist = candidateCR.bottom - this.currentCR.top;
                    const points = this.getSlopIntercepts(dist, this.currentCR.left, this.currentCR.right);
                    if (candidateCR.left >= points.lo && candidateCR.left <= points.hi) return true;
                    if (candidateCR.right >= points.lo && candidateCR.right <= points.hi) return true;
                    if (candidateCR.left < points.lo && candidateCR.right > points.hi) return true;
                }
                return false;
            case VirtualKeys.Down:
                if (candidateCR.top >= this.currentCR.bottom) {
                    const dist = candidateCR.top - this.currentCR.bottom;
                    const points = this.getSlopIntercepts(dist, this.currentCR.left, this.currentCR.right);
                    if (candidateCR.left >= points.lo && candidateCR.left <= points.hi) return true;
                    if (candidateCR.right >= points.lo && candidateCR.right <= points.hi) return true;
                    if (candidateCR.left < points.lo && candidateCR.right > points.hi) return true;
                }
                return false;
        }
        return false;
    }
}

@Injectable({ providedIn: 'root' })
export class FocusService {
    private focusableElements = new Map<string, Focusable>();

    disabled$ = new BehaviorSubject(false);

    closeRequested$ = new Subject<void>();

    keyDown$ = merge(
        fromEvent<KeyboardEvent>(window, 'keydown').pipe(
            map(event => {
                console.log({event});
                let direction = this.keyService.eventToVirtualKey(event);

                const validDirections = [VirtualKeys.Up, VirtualKeys.Down, VirtualKeys.Left, VirtualKeys.Right, VirtualKeys.Back];

                if (!validDirections.includes(direction)) direction = VirtualKeys.Unknown;

                if (!event.defaultPrevented && direction !== VirtualKeys.Unknown) event.preventDefault();

                return direction;
            })
        ),
        this.gamepadService.gamepadButtonPressed$.pipe(pluck('button'))
    ).pipe(
        withLatestFrom(this.disabled$),
        filter(([virtualKey, disabled]) => virtualKey !== VirtualKeys.Unknown && !disabled),
        tap(([direction, disabled]) => {
            if (direction === VirtualKeys.Back) {
                this.closeRequested$.next();
                return;
            }

            const activeElementPath = document.activeElement?.attributes.getNamedItem('focusPath')?.value;

            console.log({activeElementPath});
            console.log(this.focusableElements.size);
            if (!activeElementPath && this.focusableElements.size) {
                (this.focusableElements.values().next().value as Focusable).element.focus();
            } else if (activeElementPath) {
                // tslint:disable-next-line: no-non-null-assertion
                const activeFocusable = this.focusableElements.get(activeElementPath)!;
                const sourceRect = activeFocusable.element.getBoundingClientRect();
                const frustum = new Frustum(direction, sourceRect);

                const candidates = new Array<Focusable>();

                this.focusableElements.forEach(focusableElement => {
                    if (
                        focusableElement.element !== activeFocusable.element &&
                        frustum.isInFrustum(focusableElement.element.getBoundingClientRect())
                    ) {
                        candidates.push(focusableElement);
                    }
                });

                console.log({candidates});

                const distList = candidates.map(candidate => {
                    const destCR = candidate.element.getBoundingClientRect();
                    const diffX = destCR.left - sourceRect.left + (destCR.width - sourceRect.width) / 2;
                    const diffY = destCR.top - sourceRect.top + (destCR.height - sourceRect.height) / 2;
                    const centerDistSq = diffX * diffX + diffY * diffY;
                    return { candidate, edgeDist: this.determineDistance(sourceRect, destCR), centerDist: centerDistSq };
                });

                if (!distList.length) return;

                const target = distList.reduce((best, current) => {
                    if (current.edgeDist < best.edgeDist) {
                        return current;
                    } else if (current.edgeDist === best.edgeDist) {
                        if (current.centerDist < best.centerDist) {
                            return current;
                        }
                    }
                    return best;
                });

                target.candidate.element.focus();
            }
        }),
        catchError(err => EMPTY)
    );

    constructor(private keyService: VirtualKeyService, private gamepadService: GamepadService) {
        this.keyDown$.subscribe();
    }

    initialize() {
        console.log('focus service active');
    }

    addFocusableElement(focusable: Focusable) {
        this.focusableElements.set(focusable.focusPath, focusable);
    }

    removeFocusableElement(focusable: Focusable) {
        this.focusableElements.delete(focusable.focusPath);
    }

    private determineDistance(sourceRect: ClientRect, destRect: ClientRect): number {
        const diff = {
            left: sourceRect.left - destRect.right,
            top: sourceRect.top - destRect.bottom,
            right: sourceRect.right - destRect.left,
            bottom: sourceRect.bottom - destRect.top
        } as ClientRect;

        const calcDistSq = (x: number, y: number) => x * x + y * y;

        if (diff.left > 0) {
            if (diff.top > 0) return calcDistSq(diff.left, diff.top);
            if (diff.bottom >= 0) return calcDistSq(diff.left, 0);
            return calcDistSq(diff.left, diff.bottom);
        } else if (diff.right >= 0) {
            if (diff.top > 0) return calcDistSq(diff.top, 0);
            if (diff.bottom >= 0) return 0;
            return calcDistSq(diff.bottom, 0);
        } else {
            if (diff.top > 0) return calcDistSq(diff.right, diff.top);
            if (diff.bottom >= 0) return calcDistSq(diff.right, 0);
            return calcDistSq(diff.right, diff.bottom);
        }
    }
}
