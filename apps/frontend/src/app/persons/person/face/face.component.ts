import {
  Component,
  ElementRef,
  Inject,
  Input,
  NgModule,
  OnInit,
} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { Face, Person } from '@face-recognition-editor/data';
import { MaterialModule } from '@face-recognition-editor/material';
import { PersonService } from '../person.service';

export interface DialogData {
  face: Face;
  faceSourceUrl: string;
}
export interface DialogDeleteData {
  person_name: string;
  face: Face;
  faceUrl: string;
}

@Component({
  selector: 'face-recognition-editor-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.css'],
})
export class FaceComponent implements OnInit {
  @Input() person: Person;
  @Input() face: Face;

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _personService: PersonService
  ) {}

  ngOnInit(): void {}

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
        case '':
          break;
        default:
          console.error("Wrong parameter from Dialog");
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
    return (this.imageHeight * this.data.face.top) / this.data.face.height;
  }
  getFaceHeight() {
    if (!this.imageHeight) {
      return 0;
    }
    return (
      (this.imageHeight * (this.data.face.bottom - this.data.face.top)) /
      this.data.face.height
    );
  }
  getFaceLeft() {
    if (!this.imageWidth) {
      return 0;
    }
    return (this.imageWidth * this.data.face.left) / this.data.face.width;
  }
  getFaceWidth() {
    if (!this.imageWidth) {
      return 0;
    }
    return (
      (this.imageWidth * (this.data.face.right - this.data.face.left)) /
      this.data.face.width
    );
  }
}

@Component({
  selector: 'face-recognition-editor-face-delete-dialog',
  templateUrl: 'face.component.delete.dialog.html',
  styleUrls: ['./face.component.css'],
})
export class FaceComponentDeleteDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogDeleteData) {}

  ngOnInit() {}
}

@NgModule({
  imports: [BrowserModule, MaterialModule],
  declarations: [FaceComponent, FaceComponentDialog, FaceComponentDeleteDialog],
  providers: [
    //PersonService
  ],
  exports: [FaceComponent],
})
export class FaceModule {}
