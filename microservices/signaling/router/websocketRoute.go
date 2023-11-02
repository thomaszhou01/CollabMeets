package router

import (
	"log"
	messaging "screenshare/signaling/clients"

	"github.com/gin-gonic/gin"
)

func WebsocketRoute(c *gin.Context) {
	roomId := c.Query("roomId")
	hub := hubs[roomId]
	log.Println("Request to connect to"+roomId+"at hub", hub)
	if hub == nil {
		c.String(200, "Room not found")
		return
	}
	messaging.ServeWS(hub, c)
}
