const express = require('express');
const sqlite3 = require('sqlite3');
const menuItemsRouter = express.Router({mergeParams: true});

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

menuItemsRouter.get('/', (req,res,next) => {

  /* callback of get */
  db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.menu.id}`, (err, menuItems) => {

    /* callback of db.get */
    if (err) {
      next(err);
    } else {
      res.status(200).json({menuItems: menuItems})
    };
  });
});


menuItemsRouter.post('/', (req,res,next) => {

  /* callback of post */
  if (!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price || !req.menu.id) {
    res.status(400).send();
  } else {
    db.run("INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)",
    {
      $name: req.body.menuItem.name,
      $description: req.body.menuItem.description,
      $inventory: req.body.menuItem.inventory,
      $price: req.body.menuItem.price,
      $menuId: req.menu.id
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) => {

          /* callback of db.get */
          if (err) {
            next(err);
          } else {
            res.status(201).json({menuItem: menuItem});
          };
        });
      };
    });
  };
});


menuItemsRouter.param('menuItemId', (req,res,next,menuItemId) => {

  /* callback of param */
  db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`, (err, menuItemById) => {

    /* callback of db.get */
    if (err) {
      next(err);
    } else if (menuItemById) {
      req.menuItem = menuItemById;
      next();
    } else {
      res.status(404).send();
    };
  });
});


menuItemsRouter.put('/:menuItemId', (req,res,next) => {

  /* callback of put */
  if (!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || !req.body.menuItem.price || !req.menu.id || !req.menuItem.id) {
    res.status(400).send();
  } else {
    db.run("UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $menuItemId",
    {
      $name: req.body.menuItem.name,
      $description: req.body.menuItem.description,
      $inventory: req.body.menuItem.inventory,
      $price: req.body.menuItem.price,
      $menuId: req.menu.id,
      $menuItemId: req.menuItem.id
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE id = ${req.menuItem.id}`, (err, menuItem) => {

          /* callback of db.run */
          if (err) {
            next(err);
          } else {
            res.status(200).json({menuItem: menuItem});
          };
        });
      };
    });
  };
});


menuItemsRouter.delete(`/:menuItemId`, (req,res,next) => {

  /* callback from delete */
  db.run(`DELETE FROM MenuItem WHERE id = ${req.menuItem.id}`, (err) => {

    /* callback of db.run */
    if (err) {
      next(err);
    } else {
      res.status(204).send()
    };
  });
});

module.exports = menuItemsRouter;
