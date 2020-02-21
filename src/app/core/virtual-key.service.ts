import { Injectable } from '@angular/core';
import { VirtualKeys } from './virtual-keys';

@Injectable({ providedIn: 'root' })
export class VirtualKeyService {
    eventToVirtualKey(keyEvent: KeyboardEvent): VirtualKeys {
        // tslint:disable-next-line: deprecation
        switch (keyEvent.keyCode) {
            case 39:
            case 5:
                return VirtualKeys.Right;
            case 37:
            case 4:
                return VirtualKeys.Left;
            case 38:
            case 29460:
                return VirtualKeys.Up;
            case 40:
            case 29461:
                return VirtualKeys.Down;
            case 8:
                return VirtualKeys.Back;
            case 65:
                return VirtualKeys.A;
            case 66:
                return VirtualKeys.B;
            case 88:
                return VirtualKeys.X;
            case 89:
                return VirtualKeys.Y;
            default:
                return VirtualKeys.Unknown;
        }
    }

    xboxButtonToVirtualKey(xboxButtonId: number): VirtualKeys {
        switch (xboxButtonId) {
            case 0:
                return VirtualKeys.A;
            case 1:
                return VirtualKeys.B;
            case 2:
                return VirtualKeys.X;
            case 3:
                return VirtualKeys.Y;
            case 8:
                return VirtualKeys.Back;
            case 12:
                return VirtualKeys.Up;
            case 13:
                return VirtualKeys.Down;
            case 14:
                return VirtualKeys.Left;
            case 15:
                return VirtualKeys.Right;
            default:
                return VirtualKeys.Unknown;
        }
    }
}
