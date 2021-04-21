import {
  Component,
  HostListener,
  Inject,
  NgModule,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Progress } from '@face-recognition-editor/data';
import { MaterialModule } from '@face-recognition-editor/material';
import { PersonService } from '../persons/person/person.service';
import { ProgressService } from './progress.service';
import { MdePopoverTrigger } from '@material-extended/mde';
import { DeltaDatePipe } from '../pipes/delta-date.pipe';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'face-recognition-editor-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css'],
})
export class ProgressComponent implements OnInit {
  progress: Progress = new Progress();

  dialogRef: any;

  constructor(
    public dialog: MatDialog,
    private _progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this._progressService.getSortObservable().subscribe((p) => {
      this.progress.countImagesCurrent=p.countImagesCurrent;
      this.progress.countImagesMax=p.countImagesMax;
      this.progress.countImagesTotal=p.countImagesTotal;
      this.progress.nameImageCurrent=p.nameImageCurrent;
      this.progress.nameImageMax=p.nameImageMax;
      this.progress.newFacesCount=p.newFacesCount;
      this.progress.newFaces=p.newFaces;
      this.progress.newFacesName=p.newFacesName
      this.progress.newFacesValidated=p.newFacesValidated;
      this.progress.lastStartTime=p.lastStartTime;

      // if (!this.dialogRef) this.showDialog();
    });
  }

  @HostListener('click', ['$event'])
  showDialog() {
    // console.log('showDialog ' + this.person.id + ' ' + this.face);
    this.dialogRef = this.dialog.open(ProgressComponentDialog, {
      data: this.progress,
    });
  }
}

/* ------------------------ 
    Main Dialog (source image)
   ------------------------ */
@Component({
  selector: 'face-recognition-editor-progress-dialog',
  templateUrl: 'progress.component.dialog.html',
  styleUrls: ['./progress.component.css'],
})
export class ProgressComponentDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public progress: Progress,
    private _personService: PersonService
  ) {}

  ngOnInit() {}

  onClose() {}

  onLoad() {}

  getETA(): Date {
    if (this.progress.countImagesCurrent === 0) {
      return new Date(8640000000000000);
    }
    if (this.progress.countImagesTotal === 0) {
      return new Date();
    }
    let now = new Date().getTime();
    let deltaMilli =
      (now - this.progress.lastStartTime.getTime()) /
      this.progress.countImagesCurrent;
    let etaMilli =
      now +
      (this.progress.countImagesTotal - this.progress.countImagesCurrent) *
        deltaMilli;
    return new Date(etaMilli);
  }
  getImageUrl(url: string) {
    return this._personService.getFaceSrcUrl(encodeURIComponent(url));
  }
  getFaceUrl() {
    return this._personService.getFaceUrl(encodeURIComponent(this.progress.newFacesName),this.progress.newFacesValidated, encodeURIComponent(this.progress.newFaces));
  }
  
}

@NgModule({
  imports: [BrowserModule, MaterialModule],
  declarations: [ProgressComponent, ProgressComponentDialog, DeltaDatePipe],
  providers: [ProgressService],
  exports: [ProgressComponent],
})
export class ProgressModule {}
