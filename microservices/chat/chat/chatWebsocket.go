package chat

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/redis/go-redis/v9"
)

type Client struct {
	ctx      context.Context
	redis    *redis.Client
	postgres *sql.DB
	con      *websocket.Conn
	roomId   string
	userId   string
}

type ChatMessage struct {
	UserId   string
	Username string
	Message  string
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func ReadMessage(c *Client) {
	for {
		_, message, err := c.con.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		var result ChatMessage
		json.Unmarshal([]byte(message), &result)

		_, errDB := c.postgres.Exec("INSERT INTO messages (chat_id, user_id, content) VALUES ($1, $2, $3)", c.roomId, result.UserId, result.Message)
		if errDB != nil {
			log.Println(errDB)
		}
		c.redis.Publish(c.ctx, c.roomId, message)
	}
}

func WriteMessage(c *Client) {

	pubsub := c.redis.Subscribe(c.ctx, c.roomId)
	defer pubsub.Close()

	for {
		ch := pubsub.Channel()

		for msg := range ch {
			c.con.WriteMessage(websocket.TextMessage, []byte(msg.Payload))
		}
	}
}

func ServeWS(c *gin.Context, redis *redis.Client, postgres *sql.DB, roomId string, userId string) {
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
	ctx := context.Background()

	client := &Client{ctx: ctx, redis: redis, postgres: postgres, con: conn, roomId: roomId, userId: userId}

	go ReadMessage(client)
	go WriteMessage(client)
}
