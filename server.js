const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const supabase = createClient(
  'https://tcupaxaimxnkbkovmowk.supabase.co',
  'sb_publishable_DVPz6bE5xBCa4x-70zUOHg_3rwZNTCI'
);

app.use(express.static('public'));
app.use(express.json());

wss.on('connection', (ws) => {
  // console.log('🟢 WebSocket client connected');

  ws.on('close', () => {
    // console.log('🔴 WebSocket client disconnected');
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/ranking', (req, res) => {
  res.sendFile(__dirname + '/public/ranking.html');
});

app.post('/rankedit', async (req, res) => {
  const rankingData = req.body;

  await supabase.from('rankings').delete().neq('id', 0); // 모든 row 삭제용 트릭

  try {
    const { error } = await supabase.from('rankings').insert([
      {
        shooting: rankingData.shooting,
        bean: rankingData.bean,
      },
    ]);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        // console.log('sent');
        client.send(JSON.stringify({ type: 'reload' }));
      }
    });

    if (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Supabase 저장 실패',
      });
    }

    res.json({
      success: true,
      message: '랭킹 데이터 Supabase 저장 완료',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: '서버 오류',
    });
  }
});

app.get('/giveranking', async (req, res) => {
  try {
    const { data, error } = await supabase.from('rankings').select('*');

    if (error) {
      console.error(error);
      return res.status(500).json({ success: false });
    }

    res.json({
      success: true,
      ranking: data[0], // shooting / bean
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

server.listen(PORT, () => {
  console.log('server is listening');
});
