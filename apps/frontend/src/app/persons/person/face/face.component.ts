import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'fre-face',
  templateUrl: './face.component.html',
  styleUrls: ['./face.component.css']
})
export class FaceComponent implements OnInit {
  @Input() person_id: string;
  @Input() face: string;

  constructor() { }

  ngOnInit(): void {
  }

}
