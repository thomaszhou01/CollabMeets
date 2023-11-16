package router

import (
	"context"
	"screenshare/chat/chat"
	"screenshare/chat/middleware"
	"screenshare/chat/postgres"
	redisWrapper "screenshare/chat/redis"

	"github.com/gin-gonic/gin"
)

var (
	redis      = redisWrapper.InitRedis()
	postgresDB = postgres.PostgresInit()
)

func StartRouter(ctx context.Context) {
	router := gin.New()
	router.Use(middleware.CORSMiddleware())
	router.Use(gin.Logger())
	v1 := router.Group("/chat")
	{
		websocketRoute(v1)
		startChat(v1)
	}
	go chat.CreateRoom(ctx, postgresDB, redis)
	router.Run(":8080")
}
