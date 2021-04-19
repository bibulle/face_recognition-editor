import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Person } from '@face-recognition-editor/data';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Sort, SortPickerService } from '../../sort-picker/sort-picker.service';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  constructor(
    private http: HttpClient,
    private _sortPicketService: SortPickerService
  ) {
    this._sortPicketService.getSortObservable().subscribe((s) => {
      PersonService._sort = s;
      this.launchSort();
    });

    if (!PersonService._sortAsked) {
      PersonService._sortAsked = new Subject<void>();
      PersonService._sortAsked.pipe(debounceTime(200)).subscribe({
        next: () => {
          this.sortPersons();
        },
      });
    }
  }

  private static _persons: Person[] = [];
  private static _sortedPerson: Person[] = [];
  private static _sort: Sort;

  private static _sortAsked: Subject<void>;

  fetchAll(): Promise<Person[]> {
    console.time('fetchAll');
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
            if (p.modificationTime < dictNew[p.id].modificationTime) {
              this.fetch(p);
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

        this.launchSort();
        resolve(PersonService._sortedPerson);
        console.timeEnd('fetchAll');
      });
    });
  }

  fetch(person: Person) {
    setTimeout(() => {
      this.http.get<Person>(this.getPersonUrl(person.id)).subscribe((p) => {
        person.fill(p);
        this.launchSort();
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
        this.launchSort();
      });
  }

  validateFace(
    person: Person,
    validated: boolean,
    face_url: string,
    askedValidated: boolean
  ) {
    // console.time('validateFace');
    // console.time('validateFaceReq');
    this.http
      .patch<Person>(this.getFaceUrl(person.id, validated, face_url), {
        validated: askedValidated,
      })
      .subscribe((p) => {
        // console.timeEnd('validateFaceReq');
        person.fill(p);
        this.launchSort();
        // console.timeEnd('validateFace');
      });
  }
  moveFace(
    person: Person,
    validated: boolean,
    face_url: string,
    askedPersonName: string
  ) {
    // console.time('moveFace');
    // console.time('moveFaceReq');
    this.http
      .patch<Person>(this.getFaceUrl(person.id, validated, face_url), {
        personName: askedPersonName,
      })
      .subscribe((p) => {
        // console.timeEnd('moveFaceReq');
        person.fill(p);
        this.fetchAll();
        // console.timeEnd('moveFace');
      });
  }
  deleteFace(person: Person, validated: boolean, face_url: string) {
    this.http
      .delete<Person>(this.getFaceUrl(person.id, validated, face_url))
      .subscribe((p) => {
        person.fill(p);
        this.launchSort();
      });
  }

  launchSort() {
    PersonService._sortAsked.next();
  }
  sortPersons() {
    setTimeout(() => {
      //console.log(`sortPerson() : ${PersonService._sort} ...`);
      // console.time('sortPersons');
      const sorted = [...PersonService._persons].sort((p1, p2) => {
        return this.compare(p1, p2);
      });

      while (PersonService._sortedPerson.length > sorted.length) {
        PersonService._sortedPerson.splice(-1, 1);
      }
      sorted.forEach((p, i) => {
        if (
          !PersonService._sortedPerson[i] ||
          PersonService._sortedPerson[i].id != p.id
        ) {
          PersonService._sortedPerson[i] = p;
        }
      });
      // console.timeEnd('sortPersons');
      //console.log(`sortPerson() : ${PersonService._sort} done`);
    });
  }
  compare(p1: Person, p2: Person): number {
    let ret = 0;
    switch (PersonService._sort) {
      case Sort.byCreationDate:
        ret = p1.creationTime - p2.creationTime;
        break;
      case Sort.byCreationDateReverse:
        ret = p2.modificationTime - p1.modificationTime;
        break;
      case Sort.byModificationDate:
        ret = p2.modificationTime - p1.modificationTime;
        break;
      case Sort.byModificationDateReverse:
        ret = p1.creationTime - p2.creationTime;
        break;
      case Sort.byActionNeeded:
        ret = p2.getToValidate().length - p1.getToValidate().length;
        if (ret == 0) {
          ret -= p1.getValidated().filter((f) => {
            return !f.sourceUrl;
          }).length;
          ret -= p1.getToValidate().filter((f) => {
            return !f.sourceUrl;
          }).length;
          ret += p2.getValidated().filter((f) => {
            return !f.sourceUrl;
          }).length;
          ret += p2.getToValidate().filter((f) => {
            return !f.sourceUrl;
          }).length;
        }
        break;
      case Sort.byName:
      default:
        ret = p1.name
          .toLocaleLowerCase()
          .localeCompare(p2.name.toLocaleLowerCase());
        break;
    }

    if (ret === 0) {
      return p1.id.toLocaleLowerCase().localeCompare(p2.id.toLocaleLowerCase());
    } else {
      return ret;
    }
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
