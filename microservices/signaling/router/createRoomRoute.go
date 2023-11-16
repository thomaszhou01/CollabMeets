package router

import (
	"log"
	"screenshare/signaling/messaging"
	"strings"

	"github.com/gin-gonic/gin"
)

func createRoom(group *gin.RouterGroup) {
	group.POST("/createRoom", func(c *gin.Context) {
		roomId := c.PostForm("roomId")
		if _, exists := hubs[roomId]; exists {
			keys := ""
			for k := range hubs[roomId].Clients {
				keys = k.ClientId + " " + keys
			}

			c.String(208, strings.TrimRight(keys, " "))
			return
		}

		hub := messaging.NewHub(roomId, &hubs, redis)
		go hub.Run()
		hubs[roomId] = hub

		redis.Publish(c, "createRoom", roomId)
		log.Println(roomId, "at hub ", hub, " total there are ", len(hubs), " hubs")
		c.String(200, roomId)
	})

	group.GET("/ping", func(c *gin.Context) {
		c.String(200, "pong")
	})

}
