const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetsRouter = express.Router({mergeParams: true});

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

timesheetsRouter.get('/', (req,res,next) => {

  /* callback of get */
  db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.employee.id}`, (err, timesheets) => {
    /* callback of db.get*/
    if (err) {
      next(err);
    } else {
      res.status(200).json({timesheets: timesheets});
    };
  });
});


timesheetsRouter.post('/', (req,res,next) => {

  /* callback of post */
  if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date || !req.employee.id) {
    res.status(400).send();
  } else {
    db.run("INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)",
    {
      $hours: req.body.timesheet.hours,
      $rate: req.body.timesheet.rate,
      $date: req.body.timesheet.date,
      $employeeId: req.employee.id
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) => {

          /* callback of db.get */
          if (err) {
            next(err);
          } else {
            res.status(201).json({timesheet: timesheet});
          };
        });
      };
    });
  };
});


timesheetsRouter.param('timesheetId', (req,res,next,timesheetId) => {

  /* callback of param */
  db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (err, timesheetById) => {

    /* callback of db.get */
    if (err) {
      next(err);
    } else if (timesheetById) {
      req.timesheet = timesheetById;
      next();
    } else {
      res.status(404).send();
    };
  });
});


timesheetsRouter.put('/:timesheetId', (req,res,next) => {

  /* callback of put */
  if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date || !req.employee.id || !req.timesheet.id) {
    res.status(400).send();
  } else {
    db.run("UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId",
    {
      $hours: req.body.timesheet.hours,
      $rate: req.body.timesheet.rate,
      $date: req.body.timesheet.date,
      $employeeId: req.employee.id,
      $timesheetId: req.timesheet.id
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Timesheet WHERE id = ${req.timesheet.id}`, (err, timesheet) => {

          /* callback of db.run */
          if (err) {
            next(err);
          } else {
            res.status(200).json({timesheet: timesheet});
          };
        });
      };
    });
  };
});


timesheetsRouter.delete(`/:timesheetId`, (req,res,next) => {

  /* callback from delete */
  db.run(`DELETE FROM Timesheet WHERE id = ${req.timesheet.id}`, (err) => {

    /* callback of db.run */
    if (err) {
      next(err);
    } else {
      res.status(204).send()
    };
  });
});

module.exports = timesheetsRouter;
