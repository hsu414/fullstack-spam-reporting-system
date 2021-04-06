import 'jasmine';
import Server from './server';
import supertest from 'supertest';
import { doesNotMatch } from 'assert';
import  mockfs from 'mock-fs';
import fs from 'fs';
import path from 'path';

describe('Server:', () => {
    const server: Server= new Server();
    let request;
    const testData = {
        'size': 25,
        'nextOffset': '00240010065245504f525412001011c347a7223a4b6f8b26e492474873c1f07fffffe6f07fffffe6a3539452cd1fbcc586b66baa8f01a76c0004',
        'elements': [
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
        }]
    };


    beforeEach(() => {
        request = supertest(server.server);
        spyOn(console,'log').and.callFake(()=>{});
    });
    afterAll(() => {
        server.listen.close();
    });


    describe('GET /', () => {
        it('should get status 200 and text "Server is running..." when GET succeeds', async() => {
            const res = await request.get('/');
            expect(res.status).toBe(200);
            expect(res.text).toBe('Server is running...');

        });

    });
    describe('GET /reports', () => {
        afterEach(() => {
            mockfs.restore();
          });
        it('should get status 200 and reports elements when GET succeeds', async() => {
            // arrange
            mockReportStorage(testData);
            // act
            const res = await request.get('/reports');
            // assert
            expect(res.status).toBe(200);
            expect(res.body.length).toEqual(3);
            expect(res.body).toEqual(testData.elements);
        });

    });
    describe('POST /reports', () => {
        let data;
        afterEach(() => {
            mockfs.restore();
          });
        it('should get status 200 and add report element when POST succeeds', async() => {
            // arrange
            mockReportStorage(testData);
            const dataPath = './reports.json';
            const newReport: any = {
                source: 'REPORT',
                state: 'OPEN',
                payload: {
                    source: 'REPORT',
                    reportType: 'INFRINGES_PROPERTY',
                }
            };

            data = fs.readFileSync(dataPath, 'utf8');
            // assert report length: 3
            expect(JSON.parse(data).elements.length).toEqual(3);
            // act: POST
            const res = await request.post('/reports').send(newReport);
            data = fs.readFileSync(dataPath, 'utf8');

            // assert: succeess status code & report length:4
            expect(res.status).toBe(200);
            expect(JSON.parse(data).elements.length).toEqual(4);
            expect(JSON.parse(data).elements[3]).toEqual(jasmine.objectContaining(newReport));

        });
    });
    describe('PATCH /reports/:reportsId', () => {
        let data;
        afterEach(() => {
            mockfs.restore();
          });
        it('should get status 200 and update report element when PATCH succeeds', async() => {
            // arrange
            mockReportStorage(testData);
            const dataPath = './reports.json';
            const id = testData.elements[0].id;
            const url= '/reports/'+ id;
            const updatedReport = testData.elements[0];
            updatedReport.state= 'BLOCKED';

            // assert: report before updated
            data = fs.readFileSync(dataPath, 'utf8');
            expect(JSON.parse(data).elements[0].state).toEqual('OPEN');


            // act: PATCH request
            const res = await request.patch(url).send({state: 'BLOCKED'}).set({'Content-Type': 'application/json'});

            // assert: succeess status code
            expect(res.status).toBe(200);
            expect(JSON.parse(res.text).message).toEqual(`Update report: ${id} Successfully`);

            // assert: element is updated
            data = fs.readFileSync(dataPath, 'utf8');
            expect(JSON.parse(data).elements[0].id).toEqual(testData.elements[0].id);
            expect(JSON.parse(data).elements[0]).toEqual(updatedReport);
            expect(JSON.parse(data).elements[0].state).toEqual('BLOCKED');


        });
        it('should get status 404 and update report id does not exist', async() => {
            // arrange
            mockReportStorage(testData);
            const id = '1234567';
            const url= '/reports/'+ id;

            // act: PATCH request
            const res = await request.patch(url).send({state: 'BLOCKED'}).set({'Content-Type': 'application/json'});

            // assert: succeess status code
            expect(res.status).toBe(404);
            expect(JSON.parse(res.text).message).toEqual(`Report: ${id} does not exist\n`);
        });
    });
    describe('PUT /reports', () => {
        let data;
        afterEach(() => {
            mockfs.restore();
          });
        it('should get status 200 and replace report element when PUT succeeds', async() => {
            // arrange
            mockReportStorage(testData);
            const id = testData.elements[1].id;
            const url= '/reports/'+ id;
            const dataPath = './reports.json';
            const updatedObject = { id, 'ticketState': 'CLOSED'};

            // assert before request
            data = fs.readFileSync(dataPath, 'utf8');
            expect(JSON.parse(data).elements[1].ticketState).toBeUndefined();

            // act: PUT request
            const res = await request.put(url).send({ ticketState: 'CLOSED'});
            data = fs.readFileSync(dataPath, 'utf8');

            // assert: succeess status code & update
            expect(res.status).toBe(200);
            expect(JSON.parse(res.text).message).toEqual(`Update report: ${id} Successfully`);
            expect(JSON.parse(data).elements[1].id).toEqual(testData.elements[1].id);
            expect(JSON.parse(data).elements[1]).toEqual(updatedObject);


        });
        it('should get status 404 when report id does not exist', async() => {
            // arrange
            mockReportStorage(testData);
            const id = '1234567';
            const url= '/reports/'+ id;

            // act: PUT request
            const res = await request.put(url).send({ ticketState: 'CLOSED'});


            // assert: succeess status code & update
            expect(res.status).toBe(404);
            expect(JSON.parse(res.text).message).toEqual(`Report: ${id} does not exist\n`);

        });
    });
});

function mockReportStorage(testData) {
    mockfs({
        'reports.json': mockfs.file({
        content: JSON.stringify(testData),
        }),
        'node_modules': mockfs.load(path.resolve(__dirname, './../node_modules'))
    });
}
