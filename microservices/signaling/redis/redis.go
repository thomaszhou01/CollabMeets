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

func Test(client *redis.Client) {
	ctx := context.Background()

	err := client.Set(ctx, "foo", "bar123", 0).Err()
	if err != nil {
		panic(err)
	}
	err1 := client.Publish(ctx, "mychannel1", "payload").Err()
	if err1 != nil {
		panic(err1)
	}
}

type Info struct {
	Testgroup int    `json:"testgroup"  redis:"testgroup"`
	Status    string `json:"status" redis:"status"`
}

func AddKey(client *redis.Client, key string, value map[string]string) {
	ctx := context.Background()

	cmd := client.HSet(ctx, key, Info{6, "RUNNING"})
	i, err := cmd.Result()
	if err != nil {
		panic(err)
	}
	fmt.Println(i, err)

	client.LPush(ctx, "allList", "angry")

}
