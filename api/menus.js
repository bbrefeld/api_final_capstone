const express = require('express');
const sqlite3 = require('sqlite3');

const menusRouter = express.Router();
const menuItemsRouter = require('./menu-items');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req,res,next) => {

  /* callback of get */
  db.all(`SELECT * FROM Menu`, (err,menu) => {

    /* callback of db.all */
    if (err) {
      next(err);
    } else {
      res.status(200).json({menus: menu});
    };
  });
});


menusRouter.post('/', (req,res,next) => {

  /* callback of post */
  if (!req.body.menu.title) {
    res.status(400).send();
  } else {
    db.run("INSERT INTO Menu (title) VALUES ($title)",
    {
      $title: req.body.menu.title,
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {

          /* callback of db.run */
          if (err) {
            next(err);
          } else {
            res.status(201).json({menu: menu});
          };
        });
      };
    });
  };
});


menusRouter.param('menuId', (req,res,next,menuId) => {

  /* callback of param */
  db.get(`SELECT * FROM Menu WHERE id = ${menuId}`, (err, menuById) => {

    /* callback of db.get */
    if (err) {
      next(err);
    } else if (menuById) {
      req.menu = menuById;
      next();
    } else {
      res.status(404).send();
    };
  });
});


menusRouter.get('/:menuId', (req,res,next) => {

  /* callback of get */
  db.get(`SELECT * FROM Menu WHERE id = ${req.menu.id}`, (err, menu) => {

    /* callback of db.run */
    if (err) {
      next(err);
    } else {
      res.status(200).json({menu: menu});
    };
  });
});


menusRouter.put('/:menuId', (req,res,next) => {

  /* callback of put */
  if (!req.body.menu.title) {
    res.status(400).send();
  } else {
    db.run("UPDATE Menu SET title = $title WHERE id = $menuId",
    {
      $title: req.body.menu.title,
      $menuId: req.menu.id
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = ${req.menu.id}`, (err, menu) => {

          /* callback of db.run */
          if (err) {
            next(err);
          } else {
            res.status(200).json({menu: menu});
          };
        });
      };
    });
  };
});


menusRouter.delete(`/:menuId`, (req,res,next) => {

  /* callback from delete */
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.menu.id}`, (err, menuItems) => {

    /* callback of db.run */
    if (err) {
      next(err);
    } else if (menuItems.length > 0) {
      res.status(400).send()
    } else {
      db.run(`DELETE FROM Menu WHERE id = ${req.menu.id}`, (err) => {

        /* callback of db.run */
        if (err) {
          next(err);
        } else {
          res.status(204).send();
        };
      });
    };
  });
});


module.exports = menusRouter;
