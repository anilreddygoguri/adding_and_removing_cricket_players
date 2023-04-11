const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  const getCricketPlayers = `
    SELECT 
    *
    FROM
   cricket_team
    ORDER BY
    player_id;`;
  const playersArray = await db.all(getCricketPlayers);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//Creating new player API
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `INSERT INTO
    cricket_team(player_name,jersey_number,role)
    VALUES
    ( 
     '${playerName}',
     ${jerseyNumber},
     '${role}'
    );`;
  await db.run(addPlayer);
  response.send("Player Added to Team");
});

//Getting player based on player ID API
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getCricketPlayer = `
    SELECT 
    *
    FROM
   cricket_team
    WHERE
    player_id=${playerId};`;
  const playerArray = await db.get(getCricketPlayer);
  response.send(
    playerArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
// updating player API
app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayer = `UPDATE
    cricket_team
    SET
     player_name='${playerName}',
    jersey_number= ${jerseyNumber},
    role= '${role}'
    WHERE
    player_id=${playerId};
    ;`;
  const dbresponse = await db.run(addPlayer);
  response.send("Player Details Updated");
});
//Deleting player API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.all(deletePlayer);
  response.send("Player Removed");
});
module.exports = app;
