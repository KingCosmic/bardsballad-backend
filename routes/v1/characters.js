const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const lastOfArray = require('../../utils/lastOfArray')

const authenticateToken = require('../../middleware/authenticateToken')

const prisma = new PrismaClient();

// pull new changes from the database
router.get('/pull', authenticateToken, async (req, res) => {
  const { id, updatedAt, batchSize } = req.query

  if (req.user.role === 'free') {
    return res.status(403).send('You are not allowed to use this feature')
  }

  const updatedAtData = new Date(updatedAt);

  const documents = await prisma.$transaction(async (tx) => {
    return tx.character.findMany({
      where: {
        OR: [
          {
            updatedAt: {
              gt: updatedAtData
            }
          },
          {
            AND: [
              {
                updatedAt: updatedAtData
              },
              {
                id: {
                  gt: id
                }
              }
            ]
          }
        ]
      },
      orderBy: [
        {
          updatedAt: 'asc'
        },
        {
          id: 'asc'
        }
      ],
      take: parseInt(batchSize, 10)
    });
  });

  const newCheckpoint = documents.length === 0
    ? { id, updatedAt }
    : { id: lastOfArray(documents).id, updatedAt: lastOfArray(documents).updatedAt };

  console.log(documents)

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ documents, checkpoint: newCheckpoint }));
});

// push changes to the database
router.post('/push', authenticateToken, async (req, res) => {
  const changeRows = req.body;
  const conflicts = [];

  if (req.user.role === 'free') {
    return res.status(403).send('You are not allowed to use this feature')
  }

  // Use Prisma transaction for atomic operations
  await prisma.$transaction(async (tx) => {
    // Process all changes in parallel for better performance
    await Promise.all(changeRows.map(async (changeRow) => {
      const realMasterState = await tx.character.findFirst({
        where: {
          id: changeRow.newDocumentState.id
        }
      });

      if (
        realMasterState && !changeRow.assumedMasterState ||
        (
          realMasterState && changeRow.assumedMasterState &&
          realMasterState.updatedAt !== changeRow.assumedMasterState.updatedAt
        )
      ) {
        conflicts.push(realMasterState);
      } else {
        const newDocumentState = {
          ...changeRow.newDocumentState,
          data: {},
          createdAt: new Date(changeRow.newDocumentState.createdAt),
          updatedAt: new Date(changeRow.newDocumentState.updatedAt),
          isDeleted: changeRow.newDocumentState._deleted,
        }
        delete newDocumentState['_deleted']

        // Batch update/create operation
        await tx.character.upsert({
          where: {
            id: changeRow.newDocumentState.id,
          },
          update: newDocumentState,
          create: newDocumentState
        });
      }
    }));
  });

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(conflicts));
});

module.exports = router;