package chat

import (
	"context"
	"database/sql"
	"log"

	"github.com/redis/go-redis/v9"
)

func QueryUser(userId string, postgres *sql.DB) bool {
	rows, err := postgres.Query("SELECT COUNT(1) FROM users WHERE user_id = $1", userId)
	if err != nil {
		log.Println(err)
	}

	var id int
	rows.Next()
	err = rows.Scan(&id)
	if err != nil {
		log.Println(err)
	}

	if id == 1 {
		return true
	}
	return false
}

func RegisterUser(userId string, username string, postgres *sql.DB) {
	_, err := postgres.Exec("INSERT INTO users (user_id, username) VALUES ($1, $2)", userId, username)
	if err != nil {
		log.Println(err)
	}
}

func QueryRoom(roomId string, postgres *sql.DB) bool {
	rows, err := postgres.Query("SELECT COUNT(1) FROM chats WHERE roomid = $1 AND active = true", roomId)
	if err != nil {
		log.Println(err)
	}

	var id int
	rows.Next()
	err = rows.Scan(&id)
	if err != nil {
		log.Println(err)
	}

	if id == 1 {
		return true
	}
	return false
}

func EnterChatRoom(userId string, chatId string, postgres *sql.DB) {
	rows, err := postgres.Query("SELECT COUNT(1) FROM user_chat WHERE user_id = $1 AND chat_id = $2", userId, chatId)
	if err != nil {
		log.Println(err)
	}

	var id int
	rows.Next()
	err = rows.Scan(&id)
	if err != nil {
		log.Println(err)
	}

	if id == 0 {
		_, err = postgres.Exec("INSERT INTO user_chat (user_id, chat_id) VALUES ($1, $2)", userId, chatId)
		if err != nil {
			log.Println(err)
		}
	}
}

func CreateRoom(context context.Context, postgres *sql.DB, redis *redis.Client) {
	pubsub := redis.Subscribe(context, "createRoom")
	defer pubsub.Close()

	for {
		ch := pubsub.Channel()

		for msg := range ch {
			_, err := postgres.Exec("INSERT INTO chats (roomid, active) VALUES ($1, $2)", msg.Payload, true)
			if err != nil {
				log.Println("create room err", err)
			}
		}
	}
}
