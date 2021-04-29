import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  NgModule,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { Face, Orientation, Person } from '@face-recognition-editor/data';
import { MaterialModule } from '@face-recognition-editor/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PersonService } from '../person.service';

export interface DialogData {
  face: Face;
  faceSourceUrl: string;
}
export interface DialogDeleteData {
  person_name: string;
  face: Face;
  faceUrl: string;
  preset: string;
}

/* ------------------------ 
    Main component
   ------------------------ */
@Component({
  selector: 'face-recognition-editor-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.css'],
})
export class FaceComponent implements OnInit {
  @Input() person: Person;
  @Input() face: Face;
  @ViewChild('input') inputComponent: any;

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _personService: PersonService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {}

  @HostListener('mouseover', ['$event'])
  handleMouseOver(event: MouseEvent) {
    this.inputComponent.nativeElement.focus();
  }

  faceClick() {
    // console.log('faceClick ' + this.person.id + ' ' + this.face);
    if (!this.face.sourceUrl) {
      this._snackBar.open('Image do not exist anymore !!', '', {
        duration: 2000,
      });
      return;
    }
    const dialogRef = this.dialog.open(FaceComponentDialog, {
      data: {
        face: this.face,
        faceSourceUrl: this.getFaceSrcUrl(),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      // console.log('The dialog was closed ' + result);
      switch (result) {
        case 'validateFace':
          this.validateFace();
          break;
        case 'unvalidateFace':
          this.unvalidateFace();
          break;
        case 'deleteFace':
          this.deleteFace();
          break;
        case 'moveFace':
          this.moveFace();
          break;
        case '':
        case undefined:
          break;
        default:
          console.error(`Wrong parameter from Dialog '${result}'`);
          break;
      }
    });
  }

  validateFace(event?: any) {
    // console.log('validateFace');
    if (event) event.stopPropagation();

    this._personService.validateFace(
      this.person,
      this.face.validated,
      this.face.url,
      true
    );
  }
  unvalidateFace(event?: any) {
    // console.log('unvalidateFace');
    if (event) event.stopPropagation();

    this._personService.validateFace(
      this.person,
      this.face.validated,
      this.face.url,
      false
    );
  }
  deleteFace(event?: any) {
    // console.log('deleteFace');
    if (event) event.stopPropagation();

    const dialogRef = this.dialog.open(FaceComponentDeleteDialog, {
      data: {
        face: this.face,
        person_name: this.person.name,
        faceUrl: this.getFaceUrl(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._personService.deleteFace(
          this.person,
          this.face.validated,
          this.face.url
        );
      }
      // console.log('The dialog was closed' + result);
    });
  }
  moveFace(event?: any, preset?: string) {
    console.log('moveFace');
    if (event) event.stopPropagation();

    const dialogRef = this.dialog.open(FaceComponentMoveDialog, {
      data: {
        face: this.face,
        person_name: this.person.name,
        faceUrl: this.getFaceUrl(),
        preset: preset,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`The dialog was closed '${result}'`);
      if (result) {
        this._personService.moveFace(
          this.person,
          this.face.validated,
          this.face.url,
          result
        );
      }
    });
  }
  keyPress(event?: KeyboardEvent) {
    //console.log(`KeyPress(${event.type} ${event.key}) : ${this.face.url}`);
    switch (event.key) {
      case 'd':
        event.stopPropagation();
        this.deleteFace();
        break;
      case 'v':
        event.stopPropagation();
        if (this.face.validated) {
          this.unvalidateFace();
        } else {
          this.validateFace();
        }
        break;
      case 'i':
        event.stopPropagation();
        this.moveFace(undefined, 'ignore');
        break;
      case 'u':
        event.stopPropagation();
        this.moveFace(undefined, 'New unknown');
        break;
      case 'm':
        event.stopPropagation();
        this.moveFace(undefined);
        break;

      default:
        break;
    }
  }

  getFaceUrl() {
    return this._personService.getFaceUrl(
      this.person.id,
      this.face.validated,
      this.face.url
    );
  }
  getFaceSrcUrl() {
    return this._personService.getFaceSrcUrl(this.face.sourceUrl);
  }
}

/* ------------------------ 
    Main Dialog (source image)
   ------------------------ */
@Component({
  selector: 'face-recognition-editor-face-dialog',
  templateUrl: 'face.component.dialog.html',
  styleUrls: ['./face.component.css'],
})
export class FaceComponentDialog {
  imageWidth: number;
  imageHeight: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private hostElement: ElementRef
  ) {}

  ngOnInit() {}

  onClose() {}

  onLoad() {
    let styles = getComputedStyle(
      this.hostElement.nativeElement.querySelector('img')
    );

    this.imageWidth = parseInt(styles.width, 10);
    this.imageHeight = parseInt(styles.height, 10);
  }

  getReadableUrl(encodedUrl: string) {
    return decodeURIComponent(encodedUrl);
  }

  getFaceTop() {
    if (!this.imageHeight) {
      return 0;
    }
    switch (this.data.face.orientation) {
      case Orientation.RightTop:
        return this.imageHeight * (this.data.face.left / this.data.face.width);
      case Orientation.LeftBottom:
        return (
          this.imageHeight * (1 - this.data.face.right / this.data.face.width)
        );
      case Orientation.BottomRight:
        return (
          this.imageHeight * (1 - this.data.face.bottom / this.data.face.height)
        );
      case Orientation.TopLeft:
      default:
        return this.imageHeight * (this.data.face.top / this.data.face.height);
    }
  }
  getFaceHeight() {
    if (!this.imageHeight) {
      return 0;
    }
    switch (this.data.face.orientation) {
      case Orientation.RightTop:
      case Orientation.LeftBottom:
        return (
          this.imageHeight *
          ((this.data.face.right - this.data.face.left) / this.data.face.width)
        );

      case Orientation.BottomRight:
      case Orientation.TopLeft:
      default:
        return (
          this.imageHeight *
          ((this.data.face.bottom - this.data.face.top) / this.data.face.height)
        );
    }
  }
  getFaceLeft() {
    if (!this.imageWidth) {
      return 0;
    }
    switch (this.data.face.orientation) {
      case Orientation.RightTop:
        return (
          this.imageWidth * (1 - this.data.face.bottom / this.data.face.height)
        );
      case Orientation.LeftBottom:
        return this.imageWidth * (this.data.face.top / this.data.face.height);
      case Orientation.BottomRight:
        return (
          this.imageWidth * (1 - this.data.face.right / this.data.face.width)
        );
      case Orientation.TopLeft:
      default:
        return this.imageWidth * (this.data.face.left / this.data.face.width);
    }
  }
  getFaceWidth() {
    if (!this.imageWidth) {
      return 0;
    }
    switch (this.data.face.orientation) {
      case Orientation.RightTop:
      case Orientation.LeftBottom:
        return (
          this.imageHeight *
          ((this.data.face.bottom - this.data.face.top) / this.data.face.height)
        );

      case Orientation.BottomRight:
      case Orientation.TopLeft:
      default:
        return (
          this.imageWidth *
          ((this.data.face.right - this.data.face.left) / this.data.face.width)
        );
    }
  }
}

/* ------------------------ 
    Delete face Dialog
   ------------------------ */
@Component({
  selector: 'face-recognition-editor-face-delete-dialog',
  templateUrl: 'face.component.dialog.delete.html',
  styleUrls: ['./face.component.css'],
})
export class FaceComponentDeleteDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogDeleteData) {}

  ngOnInit() {}
}

/* ------------------------ 
    Move face Dialog
   ------------------------ */
@Component({
  selector: 'face-recognition-editor-face-move-dialog',
  templateUrl: 'face.component.dialog.move.html',
  styleUrls: ['./face.component.css'],
})
export class FaceComponentMoveDialog {
  myControl = new FormControl();
  options: string[] = [];
  filteredOptions: Observable<string[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogDeleteData,
    private _personService: PersonService
  ) {}

  ngOnInit() {
    this.options = this._personService.getPersonsName();

    if (this.data.preset) {
      this.myControl.setValue(this.data.preset);
    }

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(this.data.preset ? this.data.preset : ''),
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) => (name ? this._filter(name) : this.options.slice()))
    );
  }

  displayFn(personName: string): string {
    return personName ? personName : '';
  }

  private _filter(name: string): string[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(
      (option) => option.toLowerCase().indexOf(filterValue) >= 0
    );
  }
}

/* ------------------------ 
    Module
   ------------------------ */
@NgModule({
  imports: [BrowserModule, MaterialModule, FormsModule, ReactiveFormsModule],
  declarations: [
    FaceComponent,
    FaceComponentDialog,
    FaceComponentDeleteDialog,
    FaceComponentMoveDialog,
  ],
  providers: [
    //PersonService
  ],
  exports: [FaceComponent],
})
export class FaceModule {}
