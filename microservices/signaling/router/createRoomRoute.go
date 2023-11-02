package router

import (
	"fmt"
	messaging "screenshare/signaling/clients"
	redisWrapper "screenshare/signaling/redis"

	"github.com/gin-gonic/gin"
)

func createRroom(group *gin.RouterGroup) {
	group.POST("/createRoom", func(c *gin.Context) {
		roomId := c.PostForm("roomId")
		if _, exists := hubs[roomId]; exists {
			c.String(208, "already exists")
			return
		}

		hub := messaging.NewHub(roomId, &hubs, redis)
		go hub.Run()
		hubs[roomId] = hub

		mapping := make(map[string]string)
		mapping["test"] = "test123"

		redisWrapper.AddKey(redis, roomId, mapping)
		fmt.Println(roomId, "at hub ", hub, " total there are ", len(hubs), " hubs")
		c.String(200, roomId)
	})

	group.GET("/ping", func(c *gin.Context) {
		c.String(200, "pong")
	})

}
