import { Component, NgModule, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '@face-recognition-editor/material';
import { Sort, SortPickerService } from './sort-picker.service';

@Component({
  selector: 'face-recognition-editor-sort-picker',
  templateUrl: './sort-picker.component.html',
  styleUrls: ['./sort-picker.component.css'],
})
export class SortPickerComponent implements OnInit {
  Sort = Sort;
  sort: Sort = Sort.byName;

  constructor(private _sortPicketService: SortPickerService) {
    this._sortPicketService.getSortObservable().subscribe((s) => {
      this.sort = s;
    });
  }

  ngOnInit(): void {}

  getSortLabel(sort): string {
    switch (sort) {
      case Sort.byName:
        return 'Sort by name';
        break;
      case Sort.byCreationDate:
        return 'Older first';
        break;
      case Sort.byCreationDateReverse:
        return 'Older last';
        break;
      case Sort.byModificationDate:
        return 'Modified recently first';
        break;
      case Sort.byModificationDateReverse:
        return 'Modified earlier first';
        break;
      case Sort.byActionNeeded:
        return 'Action needed first';
        break;
      default:
        return 'Error';
        break;
    }
  }

  setSort(sort: Sort) {
    this._sortPicketService.setSort(sort);
  }
}

@NgModule({
  imports: [BrowserModule, MaterialModule],
  declarations: [SortPickerComponent],
  providers: [SortPickerService],
  exports: [SortPickerComponent],
})
export class SortPickerModule {}
