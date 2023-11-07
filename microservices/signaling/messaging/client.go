package messaging

import (
	"encoding/json"
	"log"
	"net/http"
	"screenshare/signaling/interfaces"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Client struct {
	hub *Hub

	conn *websocket.Conn

	send chan BroadcastMessage

	ClientId string

	isHost bool
}

const (
	writeWait = 10 * time.Second

	pongWait = 60 * time.Second

	pingPeriod = (pongWait * 9) / 10
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

func (c *Client) ReadMessage() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		// message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		var result interfaces.Message
		json.Unmarshal([]byte(message), &result)
		result.User = c.ClientId
		c.hub.broadcast <- BroadcastMessage{c.ClientId, result.Target, result.ActionCode, []byte(result.ActionCode), result}
	}
}

func (c *Client) WriteMessage() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			messageJson, errJson := json.Marshal(message.WebsocketMessage)
			if errJson != nil {
				log.Println(errJson)
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write([]byte(messageJson))

			// if message.Action == "new" {
			// 	c.hub.broadcast <- BroadcastMessage{c.clientId, message.From, "returnNew", []byte(message.From), interfaces.Message{User: c.clientId, ActionCode: "new", Target: message.From, IceCandidates: []interfaces.ICECandidate{}}}
			// }

			//Add queued chat messages to the current websocket message.
			// n := len(c.send)
			// for i := 0; i < n; i++ {
			// 	w.Write(<-c.send)
			// }

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func ServeWS(c *gin.Context, hub *Hub, userId string) {
	upgrader.CheckOrigin = func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		//Add additional connections here
		log.Println(origin)
		// return origin == "http://localhost:8080" || origin == "https://master.d6q2yo3rztn3f.amplifyapp.com/" || origin == ""
		return true
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println(err, "uh oh error")
		return
	}

	client := &Client{hub: hub, conn: conn, send: make(chan BroadcastMessage, 10000), ClientId: userId, isHost: false}
	client.hub.register <- client

	// goroutines
	go client.ReadMessage()
	go client.WriteMessage()
}
