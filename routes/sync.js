const express = require('express');
const router = express.Router();

const { lastOfArray } = require('rxdb/plugins/core');
const { Subject } = require('rxjs');
const { db } = require('../db');

// pull new changes from the database
router.get('/pull', async (req, res) => {
  const id = req.query.id;
  const updatedAt = parseFloat(req.query.updatedAt);

  const [documents] = await db.execute('SELECT * FROM ?? WHERE updatedAt > ?', [id, updatedAt]);

  const newCheckpoint = documents.length === 0 ? { id, updatedAt } : { id: documents[documents.length - 1].id, updatedAt: documents[documents.length - 1].updatedAt };

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ documents, checkpoint: newCheckpoint }));
});

// push changes to the database
router.post('/push', async (req, res) => {
  const changeRows = req.body;
  const conflicts = [];
  const event = {
    id: lastEventId++,
    documents: [],
    checkpoint: null
  };

  for (const changeRow of changeRows) {
    const [realMasterState] = await db.execute('SELECT * FROM ?? WHERE id = ?', [changeRow.id]);

    if (realMasterState.length > 0 && !changeRow.assumedMasterState || (
      realMasterState.length > 0 && changeRow.assumedMasterState &&
      realMasterState[0].updatedAt !== changeRow.assumedMasterState.updatedAt
    )) {
      conflicts.push(realMasterState);
    } else {
      await db.execute('INSERT INTO ?? SET ?', [changeRow.newDocumentState]);
      event.documents.push(changeRow.newDocumentState);
      event.checkpoint = { id: changeRow.newDocumentState.id, updatedAt: changeRow.newDocumentState.updatedAt };
    }
  }

  if (event.documents.length > 0) {
    // pullStream?
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(conflicts));
});

module.exports = router; 