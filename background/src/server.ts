import express from 'express';
import bodyParser from 'body-parser';
import uuid from 'uuid-random';
import fs from 'fs';


export default class Server {
  public server = express();
  private port = 3800;
  public listen;

  constructor() {
    console.log('start server');
    this.startServer();
  }


  private startServer(){
 
    const dataPath = './reports.json';
    const jsonParser = bodyParser.json();

    this.server.use(bodyParser.json());

    this.listen = this.server.listen(this.port, () => {
      console.log('Server running on port ', this.port);
     });


    // Get METHOD: Main Entry
    this.server.get('/', (req,res) => {
      res.status(200).send('Server is running...');
    });

    // Get METHOD: /reports
    this.server.get('/reports', (req, res, next) => {
      // load the reports from JSON file
      const data = fs.readFileSync(dataPath, 'utf8');
      res.json(JSON.parse(data).elements);
    });

    // POST METHOD: /reports
    this.server.post('/reports',jsonParser, (req, res, next) => {
      // load the reports from JSON file
      fs.readFile(dataPath, 'utf8', (err, data) => {
        // load the report
        const reports = JSON.parse(data);
        // generate a new id
        const id = uuid();
        // update body
        const update = req.body;
        update.id = id;
        // add element
        reports.elements.push(update);

          fs.writeFile(dataPath, JSON.stringify(reports, null, 2), () => {
            // send response success
            res.status(200).json({
              method: req.method,
              message: `Add report: ${id} Successfully`
           });
          });


      });

    });

    // PATCH METHOD: /reports/:reportId
    this.server.patch('/reports/:reportId', jsonParser, (req, res, next) => {
      // load the reports from JSON file
      const data = fs.readFileSync(dataPath, 'utf8');
        // load the report
        const reports = JSON.parse(data);
        // take the id from request
        const id = req.params.reportId;
        // update body
        const updatedReport = req.body;

        // check if the report exist
        const index = reports.elements.findIndex((report: any) => report.id === id);

        // update property (overwrite the property) if it exists
        if(index >= 0){
          Object.keys(updatedReport).forEach((key: any, idx: number) => {

            reports.elements[index][key] = updatedReport[key];

          });

          fs.writeFileSync(dataPath, JSON.stringify(reports, null, 2));
            // send response success
            res.status(200).json({
              method: req.method,
              message: `Update report: ${id} Successfully`,
           });

        }
        else{
          // send error if the report is not found
          res.status(404).json({
            method: req.method,
            message: `Report: ${id} does not exist\n`
          });
        }


    });

    // PUT METHOD: /reports/:reportId
    this.server.put('/reports/:reportId',jsonParser, (req, res, next) => {

      // load the reports from JSON file
      fs.readFile(dataPath, 'utf8', (err, data) => {
        // load the report
        const reports = JSON.parse(data);
        // take the id from request
        const id = req.params.reportId;
        // update body
        const updatedReport = req.body;
        updatedReport.id = id;

        // check if the report exist
        const index = reports.elements.findIndex((report: any) => report.id === id);

        // update element (overwrite the element) if it exists
        if(index >= 0){
          reports.elements[index] = updatedReport;

          fs.writeFile(dataPath, JSON.stringify(reports, null, 2), () => {

            // send response success
            res.status(200).json({
              method: req.method,
              message: `Update report: ${id} Successfully`
           });
         });
        }
        else{ // send error if the report is not found
          res.status(404).json({
            method: req.method,
            message: `Report: ${id} does not exist\n`
         });
       }

      });
    });
  }
}