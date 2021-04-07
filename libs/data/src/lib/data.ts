export class Person {
  id: string;
  name: string;
  validated: Face[] = [];
  toValidate: Face[] = [];

  constructor(name: string) {
    this.name = name;

    this.id = encodeURIComponent(name);
  }
}

export class Face {
  url: string;

  sourceUrl: string;
  top: number;
  right: number;
  left: number;
  bottom: number;
  width: number;
  height: number;

  constructor(url: string) {
    this.url = encodeURIComponent(url);
  }
}
 