package router

import (
	"screenshare/chat/chat"

	"github.com/gin-gonic/gin"
)

func chatRoutes(group *gin.RouterGroup) {
	group.GET("/isUser", func(c *gin.Context) {
		userId := c.Query("user")

		res := chat.QueryUser(userId, postgresDB)
		if res {
			c.String(208, "true")
		} else {
			c.String(200, "false")
		}
	})

	group.POST("/registerUser", func(c *gin.Context) {
		userId := c.Query("user")
		username := c.Query("username")

		chat.RegisterUser(userId, username, postgresDB)
	})

	group.GET("/queryRoom", func(c *gin.Context) {
		roomId := c.Query("roomId")

		res := chat.QueryRoom(roomId, postgresDB)
		if res {
			c.String(200, "true")
		} else {
			c.String(200, "false")
		}
	})

	group.POST("/createChatRoom", func(c *gin.Context) {
		roomId := c.Query("roomId")

		res := chat.CreateRoom(roomId, postgresDB)
		if res {
			c.String(200, "created room "+roomId)
		} else {
			c.String(208, "cannot create room"+roomId)
		}
	})

	group.POST("/enterChatRoom", func(c *gin.Context) {
		userId := c.Query("user")
		roomId := c.Query("roomId")

		chat.EnterChatRoom(userId, roomId, postgresDB)
	})

	group.GET("/getUserMessages", func(c *gin.Context) {
		userId := c.Query("user")

		res := chat.GetUserChatMessages(userId, postgresDB)
		c.String(200, res)
	})
}
