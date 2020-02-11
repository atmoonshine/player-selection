import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameSelectorModule } from './game-selector/game-selector.module';
import { ControllerSelectModule } from './controller-select/controller-select.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, AppRoutingModule, HttpClientModule, GameSelectorModule, ControllerSelectModule, BrowserAnimationsModule],
    bootstrap: [AppComponent]
})
export class AppModule {}
