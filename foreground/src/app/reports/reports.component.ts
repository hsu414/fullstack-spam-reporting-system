import { Component, OnInit } from '@angular/core';

import { HttpService } from '../service/http.service';
import { takeUntil, take } from 'rxjs/operators';
import { Subject, pipe } from 'rxjs';
import { buttonBlockObject } from './reports.interface';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  constructor(private httpService: HttpService) { }

  title = 'Reports';
  rootURL = '/reports';
  reports: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();

  blockButtons: buttonBlockObject[] = [];


  ngOnInit(): void {
    this.getAllReports();
  }

  OnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getAllReports(): void {
    // Load the reports of SPAM
     this.httpService.getReports().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      console.log('reports: ', res);
      for (const element of res) {
        if (element.payload && element.payload.reportType === 'SPAM') {
          this.reports.push(element);
        }
      }
     });
  }

  onBlock(buttonId: string): void {
    const index = this.reports.findIndex((report: any) => report.id === buttonId);
    if (this.reports[index].state === 'BLOCKED') {
      this.reports[index].state = 'UNBLOCKED';
      this.httpService.requestTicketBlockOrUnblock(buttonId, 'UNBLOCKED')
      .pipe(take(1))
      .subscribe((res) => {
        console.log(res);
      }, (err) => {
        console.log(err);
      });
    } else {
      this.reports[index].state = 'BLOCKED';
      this.httpService.requestTicketBlockOrUnblock(buttonId, 'BLOCKED')
      .pipe(take(1))
      .subscribe((res) => {
        console.log(res);
      }, (err) => {
        console.log(err);
      });
    }
  }

  onResolve(buttonId: string): void {
    this.httpService.requestTicketClosed(buttonId)
    .pipe(take(1))
    .subscribe((res) => {
      console.log(res);
      this.reloadPage();
    }, (error) => {
      console.log(error);
    }
     );
  }

  reloadPage(): void {
    window.location.reload();
  }
}
