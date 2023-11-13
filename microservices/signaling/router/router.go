package router

import (
	"screenshare/signaling/messaging"
	"screenshare/signaling/middleware"
	redisWrapper "screenshare/signaling/redis"

	"github.com/gin-gonic/gin"
)

var (
	hubs  = make(map[string]*messaging.Hub)
	redis = redisWrapper.InitRedis()
)

func StartRouter() {
	router := gin.New()
	router.Use(middleware.CORSMiddleware())
	router.Use(gin.Logger())
	v1 := router.Group("/signaling")
	{
		createRoom(v1)
		createWebsocketRoute(v1)
	}
	router.Run(":8080")
}
