const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 5000;
const uuid = require('uuid').v4;

const protobuf = require('./protocol/protobuf.js');
const { Action, ActionReverse } = require('./Definition.js');

// 提供靜態文件（index.html）
// app.use(express.static(path.join(__dirname, 'public')));

// console.log('WebSocket server is running, protobuf is:', protobuf);
console.log('WebSocket server is running');

// 房間管理 (key: roomId, value: array of players)
const rooms = {};
const checkRooms = {};
let intervalId = setInterval(generateHealthBuff, 1000);

wss.on('connection', (ws) => {

  ws.uuid = uuid();
  console.log("uuid:", ws.uuid);
  // let intervalId = setInterval(generateHealthBuff, 1000);

  let response = null;
  let encodedResponse = null;
  let finalResponse = null;
  let assignedRoom = null;
  let decodedJoinMsg = null;
  let decodedMoveMsg = null;
  let isPlayerDead = false;

  console.log('A new client connected');

  ws.on('message', (message) => {
    if (Buffer.isBuffer(message)) {
      try {
        // 解析封包前綴action
        const actionLength = 4; //action長度固定為4
        const actionBuffer = message.subarray(0, actionLength);
        // 解析封包主要內容body
        const bodyBuffer = message.subarray(actionLength);

        let action = actionBuffer.toString();
        console.log("收到 action:", ActionReverse[action]);

        switch (action) {
          case Action.Join:
            // 解析封包body
            decodedJoinMsg = protobuf.protobuf.Join.decode(bodyBuffer);
            console.log('Join message:', decodedJoinMsg);



            //加入房間機制
            let roomId = findOrCreateRoom(ws, decodedJoinMsg.ID);
            // 設定值
            decodedJoinMsg.ID = ws.uuid;
            decodedJoinMsg.GameState = rooms[roomId]["state"];
            decodedJoinMsg.AllPlayers = rooms[roomId]["playersID"];
            // 建立回應封包
            response = protobuf.protobuf.Join.create(decodedJoinMsg);

            assignedRoom = roomId;

            encodedResponse = protobuf.protobuf.Join.encode(response).finish();
            // 將action轉為Uint8Array
            let responseActionBuffer = Buffer.from(action, 'utf8');
            // 合併action和body(encodedResponse)
            finalResponse = Buffer.concat([responseActionBuffer, encodedResponse]);
            break;
          case Action.Move:
            // 解析封包body
            decodedMoveMsg = protobuf.protobuf.Move.decode(bodyBuffer);
            console.log('Move message:', decodedMoveMsg);

            // decodedMoveMsg.FirstRequest = decodedJoinMsg; //將另一個類別設定進來
            decodedMoveMsg.ID = ws.uuid;
            response = protobuf.protobuf.Move.create(decodedMoveMsg);
            // response.FirstRequest = decodedJoinMsg;
            encodedResponse = protobuf.protobuf.Move.encode(response).finish();
            let responseMoveBuffer = Buffer.from(action, 'utf8');
            // 合併action和body(encodedResponse)
            finalResponse = Buffer.concat([responseMoveBuffer, encodedResponse]);
            console.log("Move Final info:", response);

            break;
          case Action.Stop:
            decodedStopMsg = protobuf.protobuf.Stop.decode(bodyBuffer);
            console.log('Stop message:', decodedStopMsg);
            decodedStopMsg.ID = ws.uuid;
            response = protobuf.protobuf.Stop.create(decodedStopMsg);
            // response.FirstRequest = decodedJoinMsg;
            encodedResponse = protobuf.protobuf.Stop.encode(response).finish();
            let responseStopBuffer = Buffer.from(action, 'utf8');
            // 合併action和body(encodedResponse)
            finalResponse = Buffer.concat([responseStopBuffer, encodedResponse]);
            break;
          case Action.Jump:
            decodedJumpMsg = protobuf.protobuf.Jump.decode(bodyBuffer);
            console.log('Jump message:', decodedJumpMsg);
            decodedJumpMsg.ID = ws.uuid;
            response = protobuf.protobuf.Jump.create(decodedJumpMsg);
            // response.FirstRequest = decodedJoinMsg;
            encodedResponse = protobuf.protobuf.Jump.encode(response).finish();
            let responseJumpBuffer = Buffer.from(action, 'utf8');
            // 合併action和body(encodedResponse)
            finalResponse = Buffer.concat([responseJumpBuffer, encodedResponse]);
            break;
          case Action.PositionInfo:
            decodedPositionInfoMsg = protobuf.protobuf.PositionInfo.decode(bodyBuffer);
            console.log('PositionInfo message:', decodedPositionInfoMsg);
            // decodedPositionInfoMsg.ID = ws.uuid;
            response = protobuf.protobuf.PositionInfo.create(decodedPositionInfoMsg);
            // response.FirstRequest = decodedJoinMsg;
            encodedResponse = protobuf.protobuf.PositionInfo.encode(response).finish();
            let responsePositionInfoBuffer = Buffer.from(action, 'utf8');
            // 合併action和body(encodedResponse)
            finalResponse = Buffer.concat([responsePositionInfoBuffer, encodedResponse]);
            break;
          case Action.Attack:
            decodedAttackMsg = protobuf.protobuf.Attack.decode(bodyBuffer);
            console.log('Attack message:', decodedAttackMsg);
            decodedAttackMsg.ID = ws.uuid;
            response = protobuf.protobuf.Attack.create(decodedAttackMsg);
            // response.FirstRequest = decodedJoinMsg;
            encodedResponse = protobuf.protobuf.Attack.encode(response).finish();
            let responseAttackBuffer = Buffer.from(action, 'utf8');
            // 合併action和body(encodedResponse)
            finalResponse = Buffer.concat([responseAttackBuffer, encodedResponse]);
            break;
          case Action.Die:
            decodedDieMsg = protobuf.protobuf.Die.decode(bodyBuffer);
            console.log('Die message:', decodedDieMsg);
            isPlayerDead = true;
            decodedDieMsg.ID = ws.uuid;
            response = protobuf.protobuf.Die.create(decodedDieMsg);

            encodedResponse = protobuf.protobuf.Die.encode(response).finish();
            let responseDieBuffer = Buffer.from(action, 'utf8');
            // 合併action和body(encodedResponse)
            finalResponse = Buffer.concat([responseDieBuffer, encodedResponse]);
            break;
          case Action.Damage:
            decodedDamageMsg = protobuf.protobuf.Damage.decode(bodyBuffer);
            console.log('Damage message:', decodedDamageMsg);
            decodedDamageMsg.ID = ws.uuid;
            response = protobuf.protobuf.Damage.create(decodedDamageMsg);
            // response.FirstRequest = decodedJoinMsg;
            encodedResponse = protobuf.protobuf.Damage.encode(response).finish();
            let responseDamageBuffer = Buffer.from(action, 'utf8');
            // 合併action和body(encodedResponse)
            finalResponse = Buffer.concat([responseDamageBuffer, encodedResponse]);
            break;
          default:
            console.error("未處理封包:", action);
            break;
        }

        if (assignedRoom) {
          broadcastToRoom(assignedRoom, finalResponse);
          if (isPlayerDead) {
            deleteRoom(assignedRoom);
            isPlayerDead = false;
          }
        }

        // 廣播訊息給所有已連接的客戶端
        /* wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            // client.send(`Server received: ${message}`);
            client.send(finalResponse);
          }
        }); */

      } catch (error) {
        console.error('Decode error:', error);
      }
    } else {
      // 若收到的是文字訊息，則直接處理
      console.log('Received text message:', message);
    }
  });

  ws.on('close', () => {
    console.log('A client disconnected');

    if (assignedRoom) {
      removePlayerFromRoom(assignedRoom, ws);
      checkPlayerOfRoom(assignedRoom, ws);
      /* if (rooms[assignedRoom].length == 1) {
        if (checkRooms[assignedRoom]) {
          clearInterval(checkRooms[assignedRoom]);
          delete checkRooms[assignedRoom];
          console.log(`檢查房間: ${Object.keys(checkRooms).length}`);
          console.log("倒數五秒後讓玩家離線");
        }
      } */


    }
    // if (intervalId) {
    //   clearInterval(intervalId);
    // }
  });
});

function findOrCreateRoom(ws, playerId) {
  // 尋找尚未滿的房間
  /* for (let roomId in rooms) {
    if (rooms[roomId].length < 2) {
      rooms[roomId].push(ws);
      console.log(`加入房間: ${JSON.stringify(rooms)}`);
      let intervalId = setInterval(() => { console.log("check players is arrived two.") }, 1000);

      checkRooms[roomId] = intervalId;
      console.log(`檢查房間: ${Object.keys(checkRooms).length}`);
      return roomId;
    }
  } */

  // 沒有空房間，創建新房間
  /* let newRoomId = `room-${Object.keys(rooms).length + 1}`;
  rooms[newRoomId] = [ws];
  console.log(`建立房間: ${JSON.stringify(rooms)}`);
  return newRoomId; */

  // 尋找尚未滿的房間
  for (let roomId in rooms) {
    if (rooms[roomId]["playersID"].length < 2) {
      rooms[roomId]["playersID"].push(ws.uuid);
      rooms[roomId]["state"] = "start";
      rooms[roomId]["playersWS"].push(ws);
      console.log(`加入房間: ${JSON.stringify(rooms)}`);
      return roomId;
    }
  }

  // 沒有空房間，創建新房間
  let newRoomId = `room-${Object.keys(rooms).length + 1}`;
  rooms[newRoomId] = { state: "wait", playersID: [ws.uuid], playersWS: [ws] };
  console.log(`建立房間: ${JSON.stringify(rooms)}`);
  for (let roomId in rooms) {
    if (rooms[roomId]["playersID"].length < 2) {
      console.log(`房間人數: ${JSON.stringify(rooms[roomId]["playersID"])}`);
    }
  }
  return newRoomId;
}

function removePlayerFromRoom(roomId, ws) {
  /* if (rooms[roomId]) {
    rooms[roomId] = rooms[roomId].filter(client => client !== ws);
    if (rooms[roomId].length === 0) {
      delete rooms[roomId]; // 移除空房間
    }
  } */
  if (rooms[roomId]) {
    rooms[roomId]["playersID"] = rooms[roomId]["playersID"].filter(client => client !== ws.uuid);

    if (rooms[roomId]["playersID"].length === 0) {
      delete rooms[roomId]; // 移除空房間
      console.log(`玩家已離線: ${JSON.stringify(rooms)}`);
    }
  }
}

function checkPlayerOfRoom(roomId) {
  if (rooms[roomId]) {
    if (rooms[roomId]["state"] == "start") {
      if (rooms[roomId]["playersID"].length == 1) {
        console.log("房間只剩一個玩家 通知前端並且倒數五秒後強制回到菜單");
        delete rooms[roomId]; // 移除房間
        console.log(`目前房間: ${JSON.stringify(rooms)}`);
      }
    }
  }
}

function deleteRoom(roomId) {
  if (rooms[roomId]) {
    if (rooms[roomId]["state"] == "start") {
      console.log("其中一個玩家已死亡 通知前端並且倒數五秒後強制回到菜單");
      delete rooms[roomId]; // 移除房間
      console.log(`目前房間: ${JSON.stringify(rooms)}`);
    }
  }
}

function broadcastToRoom(roomId, message) {
  /* if (rooms[roomId]) {
    rooms[roomId].forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } */
  if (rooms[roomId]) {
    rooms[roomId]["playersWS"].forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

function generateHealthBuff() {
  // console.log("generate health buff", Object.keys(rooms).length);
  if (Object.keys(rooms).length == 0) return;
  for (let roomId in rooms) {
    if (rooms[roomId]["state"] == "start") {
      console.log(`${roomId}房間已開始遊戲`);
      let response = protobuf.protobuf.Damage.create({
        ID: "player1",       // 這裡可以放玩家的 ID，例如 ws.uuid
        DamagePower: 50      // 這裡設定造成的傷害數值
      });
      let encodedResponse = protobuf.protobuf.Damage.encode(response).finish();
      let action = '8000';
      let responseDamageBuffer = Buffer.from(action, 'utf8');
      // 合併action和body(encodedResponse)
      let finalResponse = Buffer.concat([responseDamageBuffer, encodedResponse]);
      rooms[roomId]["playersWS"].forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(finalResponse);
        }
      })
    } else {
      console.log(`${roomId}等待中`);
    }
  }
}

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});