import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HttpService } from './http.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';

describe('HttpService', () => {
  let service: HttpService;
  const testData =  [
    {
        'id': '0103e005-b762-485f-8f7e-722019d4f302',
        'source': 'REPORT',
        'sourceIdentityId': '6750b4d5-4cb5-45f0-8b60-61be2072cce2',
        'reference': {
            'referenceId': '6706b3ba-bf36-4ad4-9b9d-4ebf4f4e2429',
            'referenceType': 'REPORT'
        },
        'state': 'OPEN',
        'payload': {
            'source': 'REPORT',
            'reportType': 'SPAM',
            'message': null,
            'reportId': '6706b3ba-bf36-4ad4-9b9d-4ebf4f4e2429',
        },
        'created': '2017-10-02T16:09:04.258Z'
    },
    {
        'id': '01322891-c5cb-4ac5-90d4-3c4224f40ba2',
        'source': 'REPORT',
        'sourceIdentityId': 'd0ba4c4a-39da-4d2c-8934-80652da104fe',
        'reference': {
            'referenceId': '130debb9-cb13-49eb-881e-86fd3244639c',
            'referenceType': 'REPORT'
        },
        'state': 'OPEN',
        'payload': {
            'source': 'REPORT',
            'reportType': 'SPAM',
            'message': null,
            'reportId': '130debb9-cb13-49eb-881e-86fd3244639c',
        },
        'created': '2017-10-30T14:34:06.569Z'
    },
    {
        'id': '015bfeed-34a5-492d-bf4e-51a9afffe1ea',
        'source': 'REPORT',
        'sourceIdentityId': '4bd630eb-4b36-4038-aa8e-e58c4025de1f',
        'state': 'OPEN',
        'payload': {
            'source': 'REPORT',
            'reportType': 'INFRINGES_PROPERTY',
            'message': 'it\'s a hippo!',
            'reportId': '7274d582-9a1e-42bd-aa0f-f563904bfbab',
            'referenceResourceId': '1573590e-f4bc-4cf4-82af-378a83fea5ab',
            'referenceResourceType': 'POST'
        }
    }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      });
    service = TestBed.inject(HttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET reports when getReports() is called',
      inject(
        [HttpTestingController, HttpService], (httpMock: HttpTestingController, httpService: HttpService) => {

      httpService.getReports().subscribe((event: any) => {
        switch (event.type) {
          case HttpEventType.Response:
            expect(event.body.length).toBe(3);
            expect(event.body).toEqual(testData);
        }
      });

      const mockReq = httpMock.expectOne(httpService.rootURL);

      expect(mockReq.request.method).toBe('GET');
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(testData);

      httpMock.verify();
  }));
  it('should PUT "ticketState": "closed" when requestTicketClosed() is called',
    inject(
      [HttpTestingController, HttpService], (httpMock: HttpTestingController, httpService: HttpService) => {

      httpService.requestTicketClosed(testData[0].id).subscribe((event: any ) => {
        switch (event.type) {
          case HttpEventType.Response:
            expect(event.body.ticketState).toEqual('CLOSED');
        }
      });
      const url = httpService.rootURL + '/' + testData[0].id;

      const mockReq = httpMock.expectOne(url);

      expect(mockReq.request.method).toBe('PUT');
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(testData);

      httpMock.verify();
  }));
  it('should PATCH "state": "blocked" when requestTicketBlockOrUnblock("blocked") is called',
    inject(
      [HttpTestingController, HttpService], (httpMock: HttpTestingController, httpService: HttpService) => {

      httpService.requestTicketBlockOrUnblock(testData[0].id, 'BLOCKED').subscribe((event: any ) => {
        switch (event.type) {
          case HttpEventType.Response:
            expect(event.body.state).toEqual('BLOCKED');
        }
      });
      const url = httpService.rootURL + '/' + testData[0].id;

      const mockReq = httpMock.expectOne(url);

      expect(mockReq.request.method).toBe('PATCH');
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(testData[0]);

      httpMock.verify();
  }));
  it('should PATCH "state": "unblocked" when requestTicketBlockOrUnblock("unblocked") is called',
    inject(
      [HttpTestingController, HttpService], (httpMock: HttpTestingController, httpService: HttpService) => {

      httpService.requestTicketBlockOrUnblock(testData[0].id, 'UNBLOCKED').subscribe((event: any ) => {
        switch (event.type) {
          case HttpEventType.Response:
            expect(event.body.state).toEqual('UNBLOCKED');
        }
      });
      const url = httpService.rootURL + '/' + testData[0].id;

      const mockReq = httpMock.expectOne(url);

      expect(mockReq.request.method).toBe('PATCH');
      expect(mockReq.request.responseType).toEqual('json');
      mockReq.flush(testData[0]);

      httpMock.verify();
}));

});
