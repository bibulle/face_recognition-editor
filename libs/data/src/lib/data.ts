export class Person {
  id: string;
  name: string;
  summary: boolean;
  private validated: Face[] = [];
  private toValidate: Face[] = [];

  constructor(name: string) {
    this.name = name;

    this.id = encodeURIComponent(name);
    this.summary = true;
  }

  setValidated(validated: Face[]) {
    this.validated = validated;
    this.summary = false;
  }
  setToValidate(toValidate: Face[]) {
    this.toValidate = toValidate;
    this.summary = false;
  }
  getValidated(): Face[] {
    return this.validated;
  }
  getToValidate(): Face[] {
    return this.toValidate;
  }

  fill(p: Person) {
    this.id = p.id;
    this.name = p.name;
    this.summary = p.summary;
    this.toValidate = p.toValidate;
    this.validated = p.validated;
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
 