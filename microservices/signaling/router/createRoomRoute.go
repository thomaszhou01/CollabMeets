package router

import (
	"fmt"
	"screenshare/signaling/messaging"
	redisWrapper "screenshare/signaling/redis"
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

		mapping := []string{"hub", "roomId"}
		mapping = append(mapping, "lol")
		mapping = append(mapping, "test")

		redisWrapper.AddKeyHash(redis, roomId, mapping)
		fmt.Println(roomId, "at hub ", hub, " total there are ", len(hubs), " hubs")
		c.String(200, roomId)
	})

	group.GET("/ping", func(c *gin.Context) {
		c.String(200, "pong")
	})

}
