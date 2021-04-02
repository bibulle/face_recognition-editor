import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Person } from '@face-recognition-editor/data';

@Component({
  selector: 'fre-persons',
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
