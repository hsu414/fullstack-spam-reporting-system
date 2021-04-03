import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';

import { ReportsComponent } from './reports.component';
import {  HttpService } from '../service/http.service';
import { Observable, of, throwError } from 'rxjs';
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
  const mockHttpService = jasmine.createSpyObj('HttpService', ['getReports', 'requestTicketClosed', 'requestTicketBlockOrUnblock']);
  beforeEach(async () => {
    // mock functions
    mockHttpService.getReports.and.returnValue(of(testData));
    mockHttpService.requestTicketClosed.and.returnValue(of(''));
    mockHttpService.requestTicketBlockOrUnblock.and.returnValue(of(''));
    console.log = () => {};
    // set up test bed
    await TestBed.configureTestingModule({
      declarations: [ ReportsComponent ],
      providers: [ { provide: HttpService, useValue: mockHttpService }]
    })
    .compileComponents();
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should be created successfully', () => {
    expect(component).toBeTruthy();
  });
  it('should render title "Reports"', () => {
  const compiled = fixture.debugElement.nativeElement;
  expect(compiled.querySelector('h3').textContent).toEqual('Reports');
  });
  it('should load only the spam reports', () => {
    expect(component.reports.length).toBe(2);
  });
  it('should update block state and switch text when BLOCK/UNBLOCK button is clicked', async() => {
    // arrange: spy on the first button and the onBlock function
    const blockBtn = fixture.debugElement.queryAll(By.css('button'))[0];
    const onBlockSpy = spyOn(component, 'onBlock').and.callThrough();

    // assert: button text
    expect(blockBtn.nativeElement.innerText).toEqual('Block');

    // act: click BLOCK button
    blockBtn.triggerEventHandler('click', null);
    fixture.detectChanges();

    // assert: update block state of the first report and switch button text
    await fixture.whenStable();
    expect(onBlockSpy).toHaveBeenCalled();
    expect(mockHttpService.requestTicketBlockOrUnblock).toHaveBeenCalledWith(testData[0].id, 'BLOCKED');
    expect(blockBtn.nativeElement.innerText).toEqual('Unblock');

    // act: click Unblock button
    blockBtn.triggerEventHandler('click', null);
    fixture.detectChanges();

    // assert: update block state of the first report and switch button text
    await fixture.whenStable();
    expect(onBlockSpy).toHaveBeenCalledTimes(2);
    expect(mockHttpService.requestTicketBlockOrUnblock).toHaveBeenCalledWith(testData[0].id, 'UNBLOCKED');
    expect(blockBtn.nativeElement.innerText).toEqual('Block');
  });
  it('should log error when error occurs in onResolve', async() => {
    // arrange
    const blockBtn = fixture.debugElement.queryAll(By.css('button'))[0];
    const logSpy = spyOn(console, 'log');
    const err = new Error('err');
    mockHttpService.requestTicketBlockOrUnblock.and.returnValues(throwError(err), throwError(err));

    // act: click BLOCK button
    blockBtn.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();

    blockBtn.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();

    // assert: log error when error occurs
    expect(logSpy).toHaveBeenCalledWith(err);
  });
  it('should send ticket closed request and reload window when RESOLVE button is clicked', () => {
    // arrange: spy on the resolve button and the onResolve function
    const resolveBtn = fixture.debugElement.queryAll(By.css('button'))[1];
    const onResolveSpy = spyOn(component, 'onResolve').and.callThrough();
    const reloadSpy = spyOn(component, 'reloadPage').and.callFake(() => {});

    // assert: button text
    expect(resolveBtn.nativeElement.innerText).toEqual('Resolve');

    // act: click RESOLVE button
    resolveBtn.triggerEventHandler('click', null);
    fixture.detectChanges();

    // assert: update the state of the first report and reload
    fixture.whenStable().then(() => {
      expect(onResolveSpy).toHaveBeenCalled();
      expect(mockHttpService.requestTicketClosed).toHaveBeenCalledWith(testData[0].id);
      expect(reloadSpy).toHaveBeenCalled();
    });
  });
  it('should log error when error occurs in onResolve', async() => {
    // arrange
    const blockBtn = fixture.debugElement.queryAll(By.css('button'))[1];
    const logSpy = spyOn(console, 'log');
    const err = new Error('err');
    mockHttpService.requestTicketClosed.and.returnValue(throwError(err));

    // act: click BLOCK button
    blockBtn.triggerEventHandler('click', null);
    fixture.detectChanges();
    await fixture.whenStable();

    // assert: log error when error occurs
    expect(logSpy).toHaveBeenCalledWith(err);
  })
  it('should emit event and unsubscribe when destroyed ', () => {
    // arrange spy
    const unsubscribeSpy = spyOn(component.destroy$, 'unsubscribe');
    const emitDestroySpy = spyOn(component.destroy$, 'next');
    // act
    component.OnDestroy();
    // assert
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(emitDestroySpy).toHaveBeenCalledWith(true);
  });

})
