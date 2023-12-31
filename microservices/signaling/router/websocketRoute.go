package router

import (
	"log"
	"screenshare/signaling/messaging"

	"github.com/gin-gonic/gin"
)

func createWebsocketRoute(group *gin.RouterGroup) {
	group.GET("/ws", func(c *gin.Context) {
		roomId := c.Query("roomId")
		userId := c.Query("userId")
		hub := hubs[roomId]
		log.Println("Request to connect to"+roomId+"at hub", hub, "from", userId)
		if hub == nil {
			c.String(200, "Room not found")
			return
		}
		messaging.ServeWS(c, hub, userId)
	})
}
