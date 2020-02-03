import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSelectorComponent } from './game-selector/game-selector.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{ path: 'games', component: GameSelectorComponent }];

@NgModule({
    declarations: [GameSelectorComponent],
    imports: [CommonModule, RouterModule.forChild(routes)]
})
export class GameSelectorModule {}
