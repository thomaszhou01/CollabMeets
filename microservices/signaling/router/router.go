package router

import (
	messaging "screenshare/signaling/clients"
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
	v1 := router.Group("/v1")
	{
		createRroom(v1)
	}
	// redisWrapper.Test(redis)
	router.GET("/ws", WebsocketRoute)
	router.Run(":8080")
}
