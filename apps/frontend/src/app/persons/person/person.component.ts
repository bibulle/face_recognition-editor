import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Person } from '@face-recognition-editor/data';

@Component({
  selector: 'fre-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css']
})
export class PersonComponent implements OnInit {
  @Input() person: Person;
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetch();
  }

  fetch() {
    this.http.get<Person>(`/api/person/${this.person.id}`).subscribe((p) => {
      this.person = p
      console.log(this.person);
    });
  }

}