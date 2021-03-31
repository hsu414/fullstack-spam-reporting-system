import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';

import { ReportsComponent } from './reports.component';
import { AppService } from '../service/app.service';
import { Observable, of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;


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
  const mockAppService = jasmine.createSpyObj('AppService', ['getReports', 'requestTicketClosed', 'requestTicketBlockOrUnblock']);

  beforeEach(async () => {
    mockAppService.getReports.and.returnValue(of(testData));
    mockAppService.requestTicketClosed.and.returnValue(of(''));
    mockAppService.requestTicketBlockOrUnblock.and.returnValue(of(''));

    await TestBed.configureTestingModule({
      declarations: [ ReportsComponent ],
      providers: [ { provide: AppService, useValue: mockAppService }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created successfully', () => {
    expect(component).toBeTruthy();
  });
  it('should load only the spam reports', () => {
    expect(component.reports.length).toBe(2);
  });
  it('should block when button is clicked', fakeAsync(() => {
    spyOn(component, 'onBlock');

    // let button = fixture.debugElement.nativeElement.querySelector('button');
    const blockBtn = fixture.debugElement.queryAll(By.css('button'))[0];
    blockBtn.triggerEventHandler('click', null);
    tick();
    fixture.whenStable().then(() => {
      expect(component.onBlock).toHaveBeenCalled();
    });
  }));
  it('should send resolve request when resolve button is clicked', fakeAsync((done: any) => {
    spyOn(component, 'onResolve');
    const resolveBtn = fixture.debugElement.queryAll(By.css('button'))[1];
    resolveBtn.triggerEventHandler('click', null);

    fixture.whenStable().then(() => {
      expect(component.onResolve).toHaveBeenCalled();
    });
  }));
});
