const express = require('express');
const sqlite3 = require('sqlite3');

const employeesRouter = express.Router();
const timesheetsRouter = require('./timesheets');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/', (req,res,next) => {

  /* callback of get */
  db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (err,employees) => {

    /* callback of db.all */
    if (err) {
      next(err);
    } else {
      res.status(200).json({employees: employees});
    };
  });
});


employeesRouter.post('/', (req,res,next) => {

  /* callback of post */
  if (!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
    res.status(400).send();
  } else {
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    db.run("INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $is_current_employee)",
    {
      $name: req.body.employee.name,
      $position: req.body.employee.position,
      $wage: req.body.employee.wage,
      $is_current_employee: isCurrentEmployee
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {

          /* callback of db.run */
          if (err) {
            next(err);
          } else {
            res.status(201).json({employee: employee});
          };
        });
      };
    });
  };
});


employeesRouter.param('employeeId', (req,res,next,employeeId) => {

  /* callback of param */
  db.get(`SELECT * FROM Employee WHERE id = ${employeeId}`, (err, employeeById) => {

    /* callback of db.get */
    if (err) {
      next(err);
    } else if (employeeById) {
      req.employee = employeeById;
      next();
    } else {
      res.status(404).send();
    };
  });
});


employeesRouter.get("/:employeeId", (req,res,next) => {

  /* callback of get */
  res.status(200).json({employee: req.employee});
});


employeesRouter.put("/:employeeId", (req,res,next) => {

  /* callback of put */
  if (!req.body.employee.name || !req.body.employee.position || !req.body.employee.wage) {
    res.status(400).send();
  } else {
    const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    db.run("UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = 1 WHERE id = $employeeId",
    {
      $name: req.body.employee.name,
      $position: req.body.employee.position,
      $wage: req.body.employee.wage,
      $employeeId: req.params.employeeId
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, function(err, employee) {

          /* callback of db.get */
          if (err) {
            next(err);
          } else {
            res.status(200).json({employee: employee});
          };
        });
      };
    });
  };
});


employeesRouter.delete('/:employeeId', (req,res,next) => {

  /* callback of delete */
  db.run("UPDATE Employee SET is_current_employee = 0 WHERE id = $employeeId",
  {
    $employeeId: req.params.employeeId
  },
  function(err) {

    /* callback of db.run */
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({employee: employee});
        };
      });
    };
  });
});

module.exports = employeesRouter;
