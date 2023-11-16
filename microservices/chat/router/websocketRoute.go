package router

import (
	"screenshare/chat/chat"

	"github.com/gin-gonic/gin"
)

func websocketRoute(group *gin.RouterGroup) {
	group.GET("/ws", func(c *gin.Context) {
		roomId := c.Query("roomId")
		userId := c.Query("user")

		chat.ServeWS(c, redis, postgresDB, roomId, userId)
	})

}
