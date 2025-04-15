const express = require("express");
const router = express.Router();

const lastOfArray = require("../../utils/lastOfArray");

const authenticateToken = require("../../middleware/authenticateToken");
const roles = require("../../constants/roles");
const snowflake = require("../../utils/snowflake");

const jwt = require('jsonwebtoken');

router.post('/change-synced', authenticateToken, async (req, res) => {
  const { characterIds } = req.body;

  if (!characterIds) {
    return res.status(400).json({ synced_characters: req.user.syncedCharacters });
  }

  await req.prisma.user.update({
    where: { id: req.user.id },
    data: {
      synced_characters: characterIds,
    },
  });

  // generate a new token with updated synced characters
  const updatedAccessToken = jwt.sign(
    {
      ...req.user,
      id: req.user.id.toString(), // Convert BigInt to string
      password: undefined, // Remove password from token payload
      synced_characters: characterIds, // Update synced characters in token payload
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );

  res.setHeader('Authorization', `Bearer ${updatedAccessToken}`);

  res.status(200).json({ synced_characters: characterIds });
})

// pull new changes from the database
router.get('/pull', authenticateToken, async (req, res) => {
  const { batchSize } = req.query;

  const id = BigInt(req.query.id || 0);
  const updatedAt = new Date(req.query.updatedAt);

  let documents = []; // initialize documents as an empty array

  if (req.user.role === roles.FREE) {
    // grab list of synced characters.
    documents = await req.prisma.character.findMany({
      where: {
        AND: [
          {
            local_id: {
              in: req.user.synced_characters,
            },
          },
          {
            OR: [
              {
                updatedAt: {
                  gt: updatedAt,
                },
              },
              {
                AND: [
                  {
                    updatedAt: updatedAt,
                  },
                  {
                    id: {
                      gt: id,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      orderBy: [
        {
          updatedAt: "asc",
        },
        {
          id: "asc",
        },
      ],
      take: parseInt(batchSize, 10) || 10,
    });
  } else {
    documents = await req.prisma.$transaction(async (tx) => {
      return tx.character.findMany({
        where: {
          OR: [
            {
              updatedAt: {
                gt: updatedAt,
              },
            },
            {
              AND: [
                {
                  updatedAt: updatedAt,
                },
                {
                  id: {
                    gt: id,
                  },
                },
              ],
            },
          ],
        },
        orderBy: [
          {
            updatedAt: "asc",
          },
          {
            id: "asc",
          },
        ],
        take: parseInt(batchSize, 10),
      });
    });
  }

  const newCheckpoint =
    documents.length === 0
      ? { id: id.toString(), updatedAt }
      : {
          id: lastOfArray(documents).id.toString(),
          updatedAt: lastOfArray(documents).updatedAt,
        };

  console.log(documents);

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ documents: documents.map(c => ({ ...c, id: c.id.toString(), user_id: c.user_id.toString() })), checkpoint: newCheckpoint }));
});

// push changes to the database
router.post("/push", authenticateToken, async (req, res) => {
  const changeRows = req.body;
  const conflicts = [];

  // Use Prisma transaction for atomic operations
  await req.prisma.$transaction(async (tx) => {
    // Process all changes in parallel for better performance
    await Promise.all(
      changeRows.map(async (changeRow) => {
        if (req.user.role === roles.FREE && !req.user.synced_characters.includes(changeRow.local_id))
          return

        const realMasterState = await tx.character.findFirst({
          where: {
            local_id: changeRow.local_id,
            user_id: req.user.id,
          },
        });

        // This check was here in rxdb but I don't know how we would ever hit this case.
        // const isMissingLocally = (realMasterState && (changeRow.lastSyncedAt === undefined))
        const wasUpdatedRemotely = (realMasterState && realMasterState.updatedAt > changeRow.updatedAt)

        if (wasUpdatedRemotely) {
          // If the local state is missing or the remote state has been updated, we have a conflict
          conflicts.push(realMasterState);
        } else {
          const newDocumentState = {
            ...changeRow,
            data: {},
            createdAt: new Date(changeRow.createdAt),
            updatedAt: new Date(changeRow.updatedAt),
          };

          // Batch update/create operation
          await tx.character.upsert({
            where: {
              local_id_user_id: {
                local_id: changeRow.local_id,
                user_id: req.user.id,
              },
            },
            update: newDocumentState,
            create: {
              ...newDocumentState,
              id: snowflake.getUniqueID()
            },
          });
        }
      })
    );
  });

  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(conflicts));
});

module.exports = router;
