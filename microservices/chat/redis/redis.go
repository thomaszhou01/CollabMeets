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

	go func() {
		pubsub := client.Subscribe(ctx, "mychannel1")
		defer pubsub.Close()

		for {
			ch := pubsub.Channel()

			for msg := range ch {
				fmt.Println(msg.Channel, msg.Payload)
			}
		}
	}()

	err := client.Publish(ctx, "mychannel1", "payload").Err()
	if err != nil {
		panic(err)
	}
}

type Info struct {
	Testgroup int    `json:"testgroup"  redis:"testgroup"`
	Status    string `json:"status" redis:"status"`
}

func AddKeyHash(client *redis.Client, key string, value []string) bool {
	ctx := context.Background()

	cmd := client.HSet(ctx, key+":test:123", value)
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

	cmd := client.LPush(ctx, "allList", "angry")
	_, err := cmd.Result()
	if err != nil {
		log.Println(err)
		return false
	}
	// fmt.Println(i, err)

	return true
}
