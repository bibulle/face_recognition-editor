import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, NgModule, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Person } from '@face-recognition-editor/data';
import { MaterialModule } from '@face-recognition-editor/material';
import { PersonModule } from './person/person.component';

@Component({
  selector: 'face-recognition-editor-persons',
  templateUrl: './persons.component.html',
  styleUrls: ['./persons.component.less'],
})
export class PersonsComponent implements OnInit {
  persons: Person[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetch();
  }

  // constructor(private http: HttpClient) {
  //   this.fetch();
  // }

  fetch() {
    this.http.get<Person[]>('/api/person').subscribe((t) => {
      this.persons = t
      console.log(this.persons);
    });
  }

  // addTodo() {
  //   this.todos.push({
  //     title: `New todo ${Math.floor(Math.random() * 1000)}`,
  //   });
  // }
}

@NgModule({
  imports: [
    BrowserModule, 
    MaterialModule,
    PersonModule
  ],
  declarations: [
    PersonsComponent
  ],
  providers: [
    // PersonService
  ],
  exports: [
    PersonsComponent
  ]
})
export class PersonsModule {
}