import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Person } from '@face-recognition-editor/data';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  constructor(private http: HttpClient) {}

  private static _persons: Person[] = [];

  fetchAll(): Promise<Person[]> {
    return new Promise<Person[]>((resolve, reject) => {
      this.http.get<Person[]>(this.getPersonUrl()).subscribe((t) => {
        // get real persons
        const newPersons = t.map((p) => {
          const p1 = new Person(p.name);
          p1.fill(p);
          return p1;
        });
        // fill the new with the old one
        let dictNew: { [id: string]: Person } = Object.assign(
          {},
          ...newPersons.map((p) => ({ [p.id]: p }))
        );
        let dictOld: { [id: string]: Person } = Object.assign(
          {},
          ...PersonService._persons.map((p) => ({ [p.id]: p }))
        );

        // update old one
        const toBeDeleted: number[] = [];
        PersonService._persons.forEach((p, i) => {
          if (dictNew[p.id]) {
            if (!p.summary && dictNew[p.id].summary) {
              this.fetch(p);
            } else {
              p.fill(dictNew[p.id]);
            }
          } else {
            toBeDeleted.push(i);
          }
        });
        

        // delete non-existing
        toBeDeleted.sort().reverse();
        toBeDeleted.forEach((i) => {
          PersonService._persons.splice(i, 1);
        });

        // add new one
        newPersons.forEach((p, i) => {
          if (!dictOld[p.id]) {
            PersonService._persons.push(p);
          }
        });

        PersonService._persons.sort((p1, p2) => {
          if (p1.name === 'ignore') {
            return 1;
          } else if (p2.name === 'ignore') {
            return -1;
          } else {
            return p1.name.localeCompare(p2.name);
          }
        });

        resolve(PersonService._persons);
      });
    });
  }

  fetch(person: Person) {
    setTimeout(() => {
      this.http.get<Person>(this.getPersonUrl(person.id)).subscribe((p) => {
        person.fill(p);
      });
    });
  }

  getPersonsName(): string[] {
    return PersonService._persons
      .map((p) => p.name)
      .sort((s1, s2) => {
        if (s1 === 'ignore') {
          return 1;
        } else if (s2 === 'ignore') {
          return -1;
        } else {
          return s1.localeCompare(s2);
        }
      });
  }

  updateName(person: Person, name: String) {
    this.http
      .patch<Person>(this.getPersonUrl(person.id), {
        name: name,
      })
      .subscribe((p) => {
        person.fill(p);
      });
  }

  validateFace(
    person: Person,
    validated: boolean,
    face_url: string,
    askedValidated: boolean
  ) {
    this.http
      .patch<Person>(this.getFaceUrl(person.id, validated, face_url), {
        validated: askedValidated,
      })
      .subscribe((p) => {
        person.fill(p);
      });
  }
  moveFace(
    person: Person,
    validated: boolean,
    face_url: string,
    askedPersonName: string
  ) {
    this.http
      .patch<Person>(this.getFaceUrl(person.id, validated, face_url), {
        personName: askedPersonName,
      })
      .subscribe((p) => {
        person.fill(p);
        this.fetchAll();
      });
  }
  deleteFace(person: Person, validated: boolean, face_url: string) {
    this.http
      .delete<Person>(this.getFaceUrl(person.id, validated, face_url))
      .subscribe((p) => {
        person.fill(p);
      });
  }

  getPersonUrl(person_id?: string): string {
    if (person_id) {
      return `/api/person/${person_id}`;
    } else {
      return `/api/person`;
    }
  }
  getFaceUrl(person_id: string, validated: boolean, face_url: string): string {
    return `/api/person/${person_id}/${
      validated ? 'validated' : 'notvalidated'
    }/${face_url}`;
  }
  getFaceSrcUrl(face_source_url: string): string {
    return `/api/person/face_source/${face_source_url}`;
  }
}
