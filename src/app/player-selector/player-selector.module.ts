import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerSelectorComponent } from './player-selector.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{ path: 'player-select', component: PlayerSelectorComponent }];

@NgModule({
    declarations: [PlayerSelectorComponent],
    imports: [CommonModule, RouterModule.forChild(routes)]
})
export class PlayerSelectorModule {}
