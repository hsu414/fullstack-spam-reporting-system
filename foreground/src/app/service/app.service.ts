import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient) { }
  rootURL = '/reports';

  getReports() {
    return this.http.get(this.rootURL);
  }

  requestTicketClosed(reportId: string) {
    const updateObject = { 'ticketState': 'CLOSED'};
    return this.http.put(this.rootURL + '/' + reportId, updateObject, {headers: this.headers});
  }

  requestTicketBlockOrUnblock(reportId: string, state: string) {
    const updateObject = { 'state': state};
    return this.http.patch(this.rootURL + '/' + reportId, updateObject, {headers: this.headers});
  }

  processError(err: any) {
    let message = '';
    if (err.error instanceof ErrorEvent) {
     message = err.error.message;
    } else {
     message = `Error Code: ${err.status}\nMessage: ${err.message}`;
    }
    console.log(message);
    return throwError(message);
 }

}
