package redisWrapper

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

func InitRedis() *redis.Client {
	if err := godotenv.Load(); err != nil {
		log.Print("No .env file found")
	}
	redisKey, _ := os.LookupEnv("REDIS_KEY")

	opt, err := redis.ParseURL(redisKey)
	if err != nil {
		panic(err)
	} else {
		fmt.Println("redis connected")
	}
	client := redis.NewClient(opt)

	return client
}

func AddKeyHash(client *redis.Client, key string, value []string) bool {
	ctx := context.Background()

	cmd := client.HSet(ctx, key, value)
	_, err := cmd.Result()
	if err != nil {
		log.Println(err)
		return false
	}
	// fmt.Println(i, err)

	return true
}

func AddKeyValue(client *redis.Client, key string, value string) bool {
	ctx := context.Background()

	err := client.Set(ctx, key, value, 0).Err()
	if err != nil {
		log.Println(err)
		return false
	}
	return true
}

func AddKeyList(client *redis.Client, key string, value string) bool {
	ctx := context.Background()

	cmd := client.LPush(ctx, key, value)
	_, err := cmd.Result()
	if err != nil {
		log.Println(err)
		return false
	}
	// fmt.Println(i, err)

	return true
}
