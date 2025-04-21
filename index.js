import { WebSocketServer } from "ws";
import http from "http"

const server = http.createServer((req,res)=>{
    res.writeHead(200)
    res.end("servidor normal")
});

const wss = new WebSocketServer({
    server:server
})

const connections = new Map();
let waiting = null;

wss.on('connection',(ws,req)=>{
    if(waiting == null){
        waiting = ws;
    console.log("esperando outro jogador")
    ws.send(JSON.stringify({
        player1:"connectado",
        player2:"esperando . . ."
    }))
    } else {
        const gameId = Date.now().toString()
        const game = {
            gameId:gameId,
            player1:waiting,
            player2:ws
        }
        ws.send(JSON.stringify({
            player1:"connectado",
            player2:"connectado"
        }))
        console.log("fim da espera")
        connections.set(game.gameId,game)

        ws.gameId = game.gameId
        waiting.gameId = game.gameId;
        waiting = null;

        console.log("o id da partida é "+ws.gameId)
    }
    
    ws.on('message',data=>{ 

        const game = connections.get(ws.gameId)

        ws === game.player2 &&
        game.player1.send(JSON.stringify({
            message: data.toString()
        }))
        ws === game.player1 &&
        game.player2.send(JSON.stringify({
            message: data.toString()
        }))
    }

    
    )

    ws.on('close',(code,reason)=>{
        connections.delete(ws.gameId)
        if (code === 1000) {
            console.log('Cliente desconectado normalmente.');
        } else {
            console.log(`A conexão com o cliente foi interrompida inesperadamente. Código: ${code}, Motivo: ${reason}`);
        }

    })

})

const port = process.env.PORT || 3102

server.listen(port,'0.0.0.0',()=>{
    console.log(port)
})
