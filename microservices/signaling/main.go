package main

import (
	"bytes"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

func main() {
	router := gin.Default()
	v1 := router.Group("/v1")
	{
		v1.GET("/ping", func(c *gin.Context) {
			c.String(200, "pong")
		})

		//same thing
		// auth := v1.Group("/ping")
		// auth.GET("", func(c *gin.Context) {
		// 	c.String(200, "pongasdasd")
		// })

	}
	router.GET("/ws", func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			return
		}
		defer conn.Close()
		i := 0
		for {
			i++
			conn.WriteMessage(websocket.TextMessage, []byte("New message (#"+strconv.Itoa(i)+")"))

			//Readmessage is a blocking function
			_, message, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					fmt.Printf("error: %v", err)
				}
				break
			}
			message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
			fmt.Println(string(message))
			time.Sleep(time.Second)
		}
	})
	router.Run("localhost:8080")
}
