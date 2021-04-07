import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { PersonsModule } from './persons/persons.component';
import { MaterialModule } from '@face-recognition-editor/material';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    PersonsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
