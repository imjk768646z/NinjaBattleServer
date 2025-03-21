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

console.log('WebSocket server is running');

const rooms = {}; // 房間管理 (key: roomId, value: player's information)
const aiBehaviorTree = {}; // AI行為
const minimumTime = 1000; //ms
// let intervalId = setInterval(generateHealthBuff, Math.floor(Math.random() * minimumTime) + minimumTime); //不定時產生補血包(待遊戲完善後再開啟)
let isPositive = true;

const protoMap = {
  [Action.Move]: protobuf.protobuf.Move,
  [Action.Stop]: protobuf.protobuf.Stop,
  [Action.Jump]: protobuf.protobuf.Jump,
  [Action.PositionInfo]: protobuf.protobuf.PositionInfo,
  [Action.Attack]: protobuf.protobuf.Attack,
  [Action.Die]: protobuf.protobuf.Die,
  [Action.Damage]: protobuf.protobuf.Damage,
  [Action.HealthGet]: protobuf.protobuf.HealthGet
};

wss.on('connection', (ws) => {
  ws.uuid = uuid();
  console.log('A new client connected, uuid:', ws.uuid);
  // let intervalId = setInterval(generateHealthBuff, 1000);
  let assignedRoom = null;

  ws.on('message', (message) => {
    if (Buffer.isBuffer(message)) {
      try {
        // 解析封包前綴action
        const actionLength = 4; //action長度固定為4
        const action = message.subarray(0, actionLength).toString();
        // 解析封包主要內容body
        const bodyBuffer = message.subarray(actionLength);
        let finalResponse = null;

        if (action === Action.Join) { //Join需要特殊處理
          const joinMsg = protobuf.protobuf.Join.decode(bodyBuffer);
          console.log(`[Packet Action]:${ActionReverse[action]} \n[Packet Body]:${JSON.stringify(joinMsg)}`);

          if (joinMsg.IsQuit) { // 玩家取消配對，退出房間
            deleteRoom(assignedRoom);
            assignedRoom = null;
            return;
          } else {             // 建立或進入房間
            // const roomId = findOrCreateRoom(ws, joinMsg.ID);
            const roomId = createRoom(ws); //for single player
            joinMsg.ID = ws.uuid;
            joinMsg.GameState = rooms[roomId].state;
            joinMsg.AllPlayers = rooms[roomId].playersID;
            assignedRoom = roomId;
          }
          finalResponse = createFinalResponse(action, joinMsg, protobuf.protobuf.Join);
        } else {                      //Join以外的處理
          finalResponse = handleAction(ws, action, bodyBuffer);
        }

        if (assignedRoom && finalResponse) {
          broadcastToRoom(assignedRoom, finalResponse);
          // 其中一名玩家死亡則移除房間
          if (action === Action.Die) {
            deleteRoom(assignedRoom);
          }
        }

      } catch (error) {
        console.error('Decode error:', error);
      }
    } else {
      // 若收到的是文字訊息，則直接處理
      console.log('Received text message:', message);
    }
  });

  ws.on('close', () => {
    console.log('A client disconnected, uuid:', ws.uuid);
    if (assignedRoom) {
      removePlayerFromRoom(assignedRoom, ws);
      checkPlayerOfRoom(assignedRoom);
    }
  });
});

// 建立回應封包共用函式
function createFinalResponse(action, msg, proto) {
  const response = proto.create(msg);
  const encodedResponse = proto.encode(response).finish();
  const actionBuffer = Buffer.from(action, 'utf8');
  return Buffer.concat([actionBuffer, encodedResponse]);
}

// 處理Join以外的[action]函式
function handleAction(ws, action, bodyBuffer) {
  const proto = protoMap[action];
  if (!proto) {
    console.error("未處理的 action:", action);
    return null;
  }
  const msg = proto.decode(bodyBuffer);
  // console.log(`[Packet Action]:${ActionReverse[action]} \n[Packet Body]:${JSON.stringify(msg)}`);
  // 除了PositionInfo以外都加入uuid
  /* if (action !== Action.PositionInfo || action !== Action.Damage) {
    msg.ID = ws.uuid;
  } */
  return createFinalResponse(action, msg, proto);
}

function findOrCreateRoom(ws, playerId) {
  // 尋找尚未滿的房間
  for (let roomId in rooms) {
    if (rooms[roomId].playersID.length < 2) {
      rooms[roomId].playersID.push(ws.uuid);
      rooms[roomId].state = "start";
      rooms[roomId].playersWS.push(ws);
      console.log(`加入房間: ${roomId} 所有玩家: ${rooms[roomId].playersID}`);
      return roomId;
    }
  }

  // 沒有空房間，建立新房間
  let newRoomId = `room-${Object.keys(rooms).length + 1}`;
  rooms[newRoomId] = { state: "wait", playersID: [ws.uuid], playersWS: [ws] };
  console.log(`建立房間: ${newRoomId}`);
  for (let roomId in rooms) {
    if (rooms[roomId].playersID.length < 2) {
      console.log(`房間名稱: ${roomId} 玩家: ${JSON.stringify(rooms[roomId].playersID)}`);
    }
  }
  return newRoomId;
}

function createRoom(ws) {
  let newRoomId = `room-${Object.keys(rooms).length + 1}`;
  const aiId = `AI-${uuid()}`;
  rooms[newRoomId] = {
    state: "start",
    playersID: [ws.uuid, aiId],
    playersWS: [ws],
    aiTimeout: []
  };

  console.log(`建立房間: ${newRoomId}`);
  aiBehaviorTree[aiId] = createAIScript(newRoomId, aiId);
  return newRoomId;
}

function createAIScript(roomId, aiId) {
  const script = [
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 2500 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 1800 },
    { action: Action.Jump, data: {}, delay: 1000 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 1000 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: true }, delay: 400 },
    { action: Action.Jump, data: {}, delay: 1000 },
    { action: Action.Stop, data: { IsStopGoRight: true }, delay: 1000 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 200 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 500 },
    { action: Action.Move, data: { IsGoRight: true }, delay: 300 },
    { action: Action.Jump, data: {}, delay: 900 },
    { action: Action.Stop, data: { IsStopGoRight: true }, delay: 1000 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 200 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 200 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: true }, delay: 200 },
    { action: Action.Jump, data: {}, delay: 900 },
    { action: Action.Stop, data: { IsStopGoRight: true }, delay: 200 },
    { action: Action.Jump, data: {}, delay: 500 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 200 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 200 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: true }, delay: 100 },
    { action: Action.Jump, data: {}, delay: 1500 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: true }, delay: 3300 },
    { action: Action.Jump, data: {}, delay: 800 },
    { action: Action.Stop, data: { IsStopGoRight: true }, delay: 200 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 100 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 100 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: true }, delay: 200 },
    { action: Action.Jump, data: {}, delay: 800 },
    { action: Action.Stop, data: { IsStopGoRight: true }, delay: 100 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 100 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 100 },
    { action: Action.Attack, data: {}, delay: 600 },
    { action: Action.Attack, data: {}, delay: 800 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 700 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 500 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 200 },
    { action: Action.Jump, data: {}, delay: 850 },
    { action: Action.Jump, data: {}, delay: 1000 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 500 },
    { action: Action.Jump, data: {}, delay: 500 },
    { action: Action.Attack, data: {}, delay: 1000 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 200 },
    { action: Action.Jump, data: {}, delay: 1000 },
    { action: Action.Attack, data: {}, delay: 1000 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 600 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 3800 },
    { action: Action.Jump, data: {}, delay: 1000 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 100 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: false }, delay: 500 },
    { action: Action.Jump, data: {}, delay: 800 },
    { action: Action.Stop, data: { IsStopGoRight: false }, delay: 500 },
    { action: Action.Move, data: { IsGoRight: true }, delay: 100 },
    { action: Action.Stop, data: { IsStopGoRight: true }, delay: 500 },
    { action: Action.Attack, data: {}, delay: 500 },
    { action: Action.Move, data: { IsGoRight: true }, delay: 100 },
    { action: Action.Jump, data: {}, delay: 800 },
    { action: Action.Attack, data: {}, delay: 1000 },
    { action: Action.Attack, data: {}, delay: 1000 },
    { action: Action.Attack, data: {}, delay: 1000 },
    { action: Action.Stop, data: { IsStopGoRight: true }, delay: 100 },
    { action: Action.Move, data: { IsGoRight: true }, delay: 3250 },
    { action: Action.Stop, data: { IsStopGoRight: true }, delay: 500 },
  ];

  let index = 0;

  function executeNextAction() {
    if (!rooms[roomId] || !rooms[roomId].playersID.includes(aiId)) {
      return;
    }

    const step = script[index];
    index = (index + 1) % script.length;

    const proto = protoMap[step.action];
    if (!proto) return;

    const msg = proto.create({ ...step.data, ID: aiId });
    const encodedResponse = proto.encode(msg).finish();
    const actionBuffer = Buffer.from(step.action, 'utf8');
    const finalResponse = Buffer.concat([actionBuffer, encodedResponse]);

    broadcastToRoom(roomId, finalResponse);
    const timeoutID = setTimeout(executeNextAction, step.delay);
    rooms[roomId].aiTimeout.push(timeoutID);
  }

  const initTimeoutID = setTimeout(executeNextAction, 2000); //延遲兩秒才開始執行腳本
  rooms[roomId].aiTimeout.push(initTimeoutID);
}

function removePlayerFromRoom(roomId, ws) {
  if (rooms[roomId]) {
    rooms[roomId].playersID = rooms[roomId].playersID.filter(client => client !== ws.uuid);
    rooms[roomId].playersWS = rooms[roomId].playersWS.filter(client => client !== ws);
    if (rooms[roomId].playersID.length === 0) {
      delete rooms[roomId]; // 移除空房間
    }
  }
}

function checkPlayerOfRoom(roomId) {
  if (rooms[roomId]) {
    if (rooms[roomId].state == "start") {
      if (rooms[roomId].playersID.length == 1) { //房間僅剩一個玩家
        // 通知前端其中一名玩家已斷線 強制退出遊戲
        const errorMsg = { ErrorMsg: "Disconnect" };
        let response = protobuf.protobuf.Error.create(errorMsg);
        let encodedResponse = protobuf.protobuf.Error.encode(response).finish();
        let responseErrorBuffer = Buffer.from(Action.Error, 'utf8');
        let finalResponse = Buffer.concat([responseErrorBuffer, encodedResponse]);
        broadcastToRoom(roomId, finalResponse);
        delete rooms[roomId]; // 移除房間
        // console.log(`目前房間: ${JSON.stringify(rooms)}`);
      }
    }
  }
}

function deleteRoom(roomId) {
  if (rooms[roomId]) {
    // 房間人數未滿兩人，而玩家取消配對
    if (rooms[roomId].state == "wait" && rooms[roomId].playersID.length < 2) {
      delete rooms[roomId]; // 移除房間
      assignedRoom = null;
      // console.log(`目前房間: ${JSON.stringify(rooms)}`);
      return;
    }

    // 其中一名玩家已死亡，通知前端結束遊戲
    if (rooms[roomId].state == "start") {
      rooms[roomId].aiTimeout.forEach(t => clearTimeout(t));
      delete rooms[roomId].aiTimeout;
      delete rooms[roomId]; // 移除房間
      assignedRoom = null;
      // console.log(`目前房間: ${JSON.stringify(rooms)}`);
    }
  }
}

function broadcastToRoom(roomId, message) {
  if (rooms[roomId]) {
    rooms[roomId].playersWS.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

function generateHealthBuff() {
  if (Object.keys(rooms).length == 0) return;

  let healthBuffPosition;
  let spawnRange = 630;
  if (isPositive) { healthBuffPosition = { X: Math.floor(Math.random() * spawnRange), Y: 0 } }
  else { healthBuffPosition = { X: -(Math.floor(Math.random() * spawnRange)), Y: 0 } }
  isPositive = !isPositive;
  for (let roomId in rooms) {
    if (rooms[roomId].state == "start") {
      console.log(`${roomId}房間已開始遊戲`);
      let response = protobuf.protobuf.HealthBuff.create(healthBuffPosition);
      let encodedResponse = protobuf.protobuf.HealthBuff.encode(response).finish();
      let responseHealthBuffBuffer = Buffer.from(Action.HealthBuff, 'utf8');
      // 合併action和body(encodedResponse)
      let finalResponse = Buffer.concat([responseHealthBuffBuffer, encodedResponse]);
      rooms[roomId].playersWS.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(finalResponse);
        }
      })
    }
  }
}

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});